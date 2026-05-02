const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderPublicKey: {
      type: String,
      required: true,
    },
    recipientPublicKey: {
      type: String,
      required: true,
    },
    amount: {
      type: String,
      required: true,
    },
    asset: {
      type: String,
      default: "USDC",
    },
    memo: {
      type: String,
      default: "",
    },
    stellarTxHash: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "submitted", "success", "failed"],
      default: "pending",
    },
    fee: {
      type: String,
      default: "0.00001",
    },
    errorMessage: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
