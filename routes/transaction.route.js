import express from "express";
import {
  checkout,
  verify,
  transfer,
  withdraw,
  history,
} from "../controllers/transaction.controller.js";
import { verifyUser } from "../middlewares/verify.js";

const router = express.Router();

router.post("/deposit", verifyUser, checkout);
router.post("/verify", verifyUser, verify);
router.post("/transfer", verifyUser, transfer);
router.post("/withdraw", verifyUser, withdraw);
router.get("/history", verifyUser, history);

export default router;
