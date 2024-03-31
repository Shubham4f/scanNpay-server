import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";

export const balance = async (req, res, next) => {
  try {
    const { id } = req.user;
    const validUser = await User.findById(id, "balance");
    return res.status(200).json({
      balance: validUser.balance,
    });
  } catch (error) {
    return next(error);
  }
};

export const details = async (req, res, next) => {
  try {
    const { phoneNumber } = req.params;
    const validUser = await User.findOne(
      { phoneNumber },
      "phoneNumber firstName lastName merchant"
    );
    if (!validUser) return next(errorHandler(404, "User Not Found."));
    return res.status(200).json({
      phoneNumber: validUser.phoneNumber,
      firstName: validUser.firstName,
      lastName: validUser.lastName,
      merchant: validUser.merchant,
    });
  } catch (error) {
    return next(error);
  }
};
