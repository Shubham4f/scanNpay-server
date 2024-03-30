import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: Number,
      required: true,
      unique: true,
    },
    otp: {
      type: Number,
      required: true,
    },
    expiry: {
      type: Date,
      required: true,
    },
    attempts: {
      type: Number,
      default: 3,
    },
  },
  { timestamps: true }
);

const OTP = mongoose.model("OTP", otpSchema);

export default OTP;
