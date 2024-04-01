import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import { errorMiddleware } from "./middlewares/error.js";
import { authRouter, userRouter, transactionRouter } from "./routes/index.js";
import cronJobs from "./utils/crons.js";

dotenv.config();

mongoose
  .connect(process.env.DATABASE)
  .then(() => console.log("Connected to Database."))
  .catch((error) => console.log(error));

const port = process.env.PORT;

const app = express();

app.use(express.json());
app.use(helmet());
app.use(mongoSanitize());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/transaction", transactionRouter);

app.use(errorMiddleware);

cronJobs();

app.listen(port, () => {
  console.log(`Listening on port ${port} => http://localhost:${port}/`);
});
