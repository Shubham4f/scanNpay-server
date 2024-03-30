import jwt from "jsonwebtoken";
import OTP from "../models/otp.model.js";
import { errorHandler } from "../utils/error.js";

export const verifyOTP = async (req, res, next) => {
  const { phoneNumber, otp } = req.body;
  try {
    const dbOtp = await OTP.findOne({ phoneNumber });
    if (!dbOtp) return next(errorHandler(410, "Generate a new OTP."));
    if (dbOtp.expiry > new Date()) {
      if (dbOtp.otp == otp) {
        await OTP.findOneAndDelete({ phoneNumber });
        return next();
      } else {
        if (dbOtp.attempts === 1) {
          await OTP.findOneAndDelete({ phoneNumber });
        } else {
          await OTP.findOneAndUpdate(
            { phoneNumber },
            { $inc: { attempts: -1 } }
          );
        }
        return next(errorHandler(401, "Invalid OTP."));
      }
    } else {
      await OTP.findOneAndDelete({ phoneNumber });
      return next(
        errorHandler(
          410,
          "The time limit for the OTP has expired. Please generate a new OTP."
        )
      );
    }
  } catch (error) {
    return next(error);
  }
};

export const verifyUser = (req, res, next) => {
  if (req.headers && req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return next(errorHandler(401, "Invalid access token."));
      req.user = user;
      return next();
    });
  } else {
    return next(errorHandler(401, "No access token."));
  }
};
