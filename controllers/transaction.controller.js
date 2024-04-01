import crypto from "crypto";
import bcryptjs from "bcryptjs";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import Transaction from "../models/transaction.model.js";
import { instance } from "../utils/payemntGateway.js";
import { errorHandler } from "../utils/error.js";

export const checkout = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const { id } = req.user;
    if (amount < 1)
      return next(
        errorHandler(400, "Amount should be greater than rupees one.")
      );
    if (amount > 10000)
      return next(errorHandler(400, "Amount should not exceed 10,000 rupees."));
    const options = {
      amount: Number(amount * 100),
      currency: "INR",
    };
    const order = await instance.orders.create(options);
    const newTransaction = new Transaction({
      type: "deposit",
      senderRef: id,
      receiverRef: id,
      amount,
      status: "processing",
      razorpayOrderId: order.id,
    });
    await newTransaction.save();
    return res.status(201).json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    return next(error);
  }
};

export const verify = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.user;
    const { razorpay_payment_id, razorpay_signature } = req.body;
    const { order_id } = await instance.payments.fetch(razorpay_payment_id);
    const validationString = order_id + "|" + razorpay_payment_id;
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
      .update(validationString)
      .digest("hex");
    if (generatedSignature === razorpay_signature) {
      const filter = {
        status: { $ne: "completed" },
        razorpayOrderId: order_id,
      };
      const update = {
        status: "completed",
        razorpayPaymentId: razorpay_payment_id,
        razorPaysignature: razorpay_signature,
      };
      const options = { new: true };
      const validTransaction = await Transaction.findOneAndUpdate(
        filter,
        update,
        options
      );
      if (!validTransaction) {
        await session.abortTransaction();
        await session.endSession();
        return next(errorHandler(400, "Transaction failed."));
      }
      await User.findByIdAndUpdate(id, {
        $inc: { balance: validTransaction.amount },
        options,
      });
      await session.commitTransaction();
      await session.endSession();
      return res.status(200).json({
        _id: validTransaction._id,
        type: validTransaction.type,
        amount: validTransaction.amount,
        status: validTransaction.status,
        razorpayOrderId: validTransaction.razorpayOrderId,
        createdAt: validTransaction.createdAt,
      });
    } else {
      await session.abortTransaction();
      await session.endSession();
      return next(errorHandler(400, "Transaction failed."));
    }
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    return next(error);
  }
};

export const transfer = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { receiver_id, amount, paymentPin } = req.body;
    const { id, sessionId } = req.user;
    if (amount < 1) {
      await session.abortTransaction();
      await session.endSession();
      return next(
        errorHandler(400, "Amount should be greater than rupees one.")
      );
    }
    if (amount > 10000) {
      await session.abortTransaction();
      await session.endSession();
      return next(errorHandler(400, "Amount should not exceed 10,000 rupees."));
    }
    const validUser = await User.findById(id);
    if (validUser.sessionId !== sessionId) {
      await session.abortTransaction();
      await session.endSession();
      return next(errorHandler(401, "Invalid access token."));
    }
    const validPaymentPin = bcryptjs.compareSync(
      paymentPin.toString(),
      validUser.paymentPin
    );
    if (!validPaymentPin) {
      await session.abortTransaction();
      await session.endSession();
      return next(errorHandler(403, "Wrong payment pin."));
    }
    if (validUser.balance < amount) {
      await session.abortTransaction();
      await session.endSession();
      return next(errorHandler(400, "Insufficient balance."));
    }
    validUser.balance -= amount;
    await validUser.save();
    const update = { $inc: { balance: amount } };
    await User.findByIdAndUpdate(receiver_id, update);
    const newTransaction = new Transaction({
      type: "transfer",
      senderRef: id,
      receiverRef: receiver_id,
      amount,
      status: "completed",
    });
    const validTransaction = await newTransaction.save();
    await session.commitTransaction();
    await session.endSession();
    return res.status(201).json({
      _id: validTransaction._id,
      type: validTransaction.type,
      amount: validTransaction.amount,
      status: validTransaction.status,
      createdAt: validTransaction.createdAt,
    });
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    return next(error);
  }
};

export const withdraw = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { beneficiary, accountNumber, ifsc, amount, paymentPin } = req.body;
    const { id, sessionId } = req.user;
    if (amount < 1) {
      await session.abortTransaction();
      await session.endSession();
      return next(
        errorHandler(400, "Amount should be greater than rupees one.")
      );
    }
    const validUser = await User.findById(id);
    if (validUser.sessionId !== sessionId) {
      await session.abortTransaction();
      await session.endSession();
      return next(errorHandler(401, "Invalid access token."));
    }
    const validPaymentPin = bcryptjs.compareSync(
      paymentPin.toString(),
      validUser.paymentPin
    );
    if (!validPaymentPin) {
      await session.abortTransaction();
      await session.endSession();
      return next(errorHandler(403, "Wrong payment pin."));
    }
    if (validUser.balance < amount) {
      await session.abortTransaction();
      await session.endSession();
      return next(errorHandler(400, "Insufficient balance."));
    }
    validUser.balance -= amount;
    await validUser.save();
    const newTransaction = new Transaction({
      type: "withdraw",
      senderRef: id,
      receiverRef: id,
      amount,
      status: "processing",
      beneficiary,
      accountNumber,
      ifsc,
    });
    const validTransaction = await newTransaction.save();
    await session.commitTransaction();
    await session.endSession();
    return res.status(201).json({
      _id: validTransaction._id,
      type: validTransaction.type,
      amount: validTransaction.amount,
      status: validTransaction.status,
      beneficiary,
      accountNumber,
      ifsc,
      createdAt: validTransaction.createdAt,
    });
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    return next(error);
  }
};

export const history = async (req, res, next) => {
  try {
    const { id } = req.user;
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const skip = (page - 1) * limit;
    const filter = {
      $or: [{ senderRef: id }, { receiverRef: id }],
    };
    const transactions = await Transaction.find(
      filter,
      "-razorpayPaymentId -razorPaysignature"
    )
      .sort({ createdAt: "desc" })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "senderRef",
        select: "phoneNumber firstName lastName merchant",
      })
      .populate({
        path: "receiverRef",
        select: "phoneNumber firstName lastName merchant",
      });
    return res.status(200).json(transactions);
  } catch (error) {
    return next(error);
  }
};
