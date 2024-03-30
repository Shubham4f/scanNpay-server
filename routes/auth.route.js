import express from "express";
import {
  sendOTP,
  signUp,
  signIn,
  refresh,
  resetPassword,
  resetPaymentPin,
} from "../controllers/auth.controller.js";
import { verifyOTP, verifyUser } from "../middlewares/verify.js";

const router = express.Router();

router.post("/otp", sendOTP);
router.post("/signup", verifyOTP, signUp);
router.post("/signin", signIn);
router.get("/refresh", refresh);
router.patch("/reset/password", verifyOTP, resetPassword);
router.patch("/reset/pin", verifyOTP, verifyUser, resetPaymentPin);

export default router;
