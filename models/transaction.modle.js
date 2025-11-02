import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const transactionSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    userId: {
      type: String,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["DEPOSIT", "WITHDRAWAL"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    utrNumber: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED", "REJECTED"],
      default: "PENDING",
    },
    userMessage: {
      type: String,
      default: null,
    },
    systemMessage: {
      type: String,
      default: null,
    },
    remark: {
      type: String,
      default: null,
    },
    approvedBy: {
      type: String,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

transactionSchema.pre("save", function (next) {
  if (this.isModified("status") && this.status === "SUCCESS") {
    if (this.type === "DEPOSIT") {
      this.systemMessage = `₹${this.amount} has been added to your account successfully.`;
    } else if (this.type === "WITHDRAWAL") {
      this.systemMessage = `₹${this.amount} has been withdrawn successfully from your account.`;
    }
  }
  next();
});

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
