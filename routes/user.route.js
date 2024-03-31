import express from "express";
import { balance, details } from "../controllers/user.controller.js";
import { verifyUser } from "../middlewares/verify.js";

const router = express.Router();

router.get("/balance", verifyUser, balance);
router.get("/details/:phoneNumber", verifyUser, details);

export default router;
