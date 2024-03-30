import User from "../models/user.model.js";
import OTP from "../models/otp.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import { generateOTP } from "../utils/otp.js";
import { sendSMS } from "../utils/communication.js";
import jwt from "jsonwebtoken";
import { accessTokenGenrator, refreshTokenGenrator } from "../utils/token.js";

export const sendOTP = async (req, res, next) => {
  try {
    const { phoneNumber } = req.body;
    const otp = generateOTP(6);
    const expiry = new Date(new Date().getTime() + 5 * 60000);
    const message = `Hello! Your scanNpay OTP is: ${otp}. Use it to verify your identity. Thank you!`;
    const filter = { phoneNumber };
    const update = { otp, expiry };
    const options = { upsert: true };
    await OTP.findOneAndUpdate(filter, update, options);
    sendSMS(phoneNumber, message);
    return res.status(201).json({ expiry });
  } catch (error) {
    return next(error);
  }
};

export const signUp = async (req, res, next) => {
  try {
    const { phoneNumber, firstName, lastName } = req.body;
    const password = bcryptjs.hashSync(req.body.password, 10);
    const paymentPin = bcryptjs.hashSync(req.body.paymentPin.toString(), 10);
    const newUser = new User({
      phoneNumber,
      firstName,
      lastName,
      password,
      paymentPin,
    });
    const validUser = await newUser.save();
    const refreshToken = refreshTokenGenrator(
      validUser._id,
      validUser.sessionId
    );
    const accessToken = accessTokenGenrator(validUser._id, validUser.sessionId);
    return res.status(201).json({
      phoneNumber,
      firstName,
      lastName,
      refreshToken,
      accessToken,
    });
  } catch (error) {
    if (error.code === 11000)
      return next(
        errorHandler(409, "A user with this phone number already exists.")
      );
    else return next(error);
  }
};

export const signIn = async (req, res, next) => {
  try {
    const { phoneNumber, password } = req.body;
    const validUser = await User.findOne({ phoneNumber });
    if (!validUser) return next(errorHandler(401, "Wrong credentials."));
    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) return next(errorHandler(401, "Wrong credentials."));
    validUser.sessionId++;
    await validUser.save();
    const refreshToken = refreshTokenGenrator(
      validUser._id,
      validUser.sessionId
    );
    const accessToken = accessTokenGenrator(validUser._id, validUser.sessionId);
    return res.status(200).json({
      phoneNumber,
      firstName: validUser.firstName,
      lastName: validUser.lastName,
      refreshToken,
      accessToken,
    });
  } catch (error) {
    return next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    if (req.headers && req.headers["x-refresh-token"]) {
      const refreshToken = req.headers["x-refresh-token"];
      jwt.verify(refreshToken, process.env.JWT_SECRET, async (error, user) => {
        if (error) return next(errorHandler(401, "Invalid refresh token."));
        const validUser = await User.findById(user.id, "sessionId");
        if (validUser.sessionId === user.sessionId) {
          const accessToken = accessTokenGenrator(
            validUser._id,
            validUser.sessionId
          );
          res.status(200).json({ accessToken });
        } else {
          return next(errorHandler(401, "Invalid refresh token."));
        }
      });
    } else {
      return next(errorHandler(401, "No refresh token."));
    }
  } catch (error) {
    return next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { phoneNumber } = req.body;
    const validUser = await User.findOne({ phoneNumber });
    if (!validUser) return next(errorHandler(404, "User not found."));
    const password = bcryptjs.hashSync(req.body.password, 10);
    validUser.password = password;
    validUser.sessionId++;
    await validUser.save();
    res.status(200).json({ message: "Password changed." });
  } catch (error) {
    return next(error);
  }
};

export const resetPaymentPin = async (req, res, next) => {
  try {
    const { id } = req.user;
    const paymentPin = bcryptjs.hashSync(req.body.paymentPin.toString(), 10);
    await User.findByIdAndUpdate(id, { paymentPin });
    res.status(200).json({ message: "Payment pin changed." });
  } catch (error) {
    return next(error);
  }
};
