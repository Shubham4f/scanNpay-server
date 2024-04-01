import cron from "node-cron";
import Transaction from "../models/transaction.model.js";

const updateProcessingDeposits = () => {
  cron.schedule("*/5 * * * *", () => {
    const filter = {
      type: "deposit",
      status: "processing",
      createdAt: { $lt: new Date(Date.now() - 5 * 60 * 1000) },
    };
    const update = { status: "failed" };
    Transaction.updateMany(filter, update).then((value) => null);
  });
};

const updateProcessingWithdraws = () => {
  cron.schedule("*/10 * * * *", () => {
    const filter = {
      type: "withdraw",
      status: "processing",
      createdAt: { $lt: new Date(Date.now() - 10 * 60 * 1000) },
    };
    const update = { status: "completed", utr: "UTRDEMO12345678910" };
    Transaction.updateMany(filter, update).then((value) => null);
  });
};

const cronJobs = () => {
  updateProcessingDeposits();
  updateProcessingWithdraws();
};

export default cronJobs;
