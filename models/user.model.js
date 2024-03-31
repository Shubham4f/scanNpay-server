import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    sessionId: {
      type: Number,
      required: true,
      default: 0,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    paymentPin: {
      type: String,
      required: true,
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
    },
    merchant: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, optimisticConcurrency: true }
);

const User = mongoose.model("User", userSchema);

export default User;
