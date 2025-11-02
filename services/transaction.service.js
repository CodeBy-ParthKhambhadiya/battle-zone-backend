import Transaction from "../models/transaction.modle.js";
import User from "../models/user.modle.js";

/**
 * Create a new transaction (deposit or withdrawal)
 */
export const createTransaction = async ({ userId, type, amount, utrNumber, userMessage }) => {
  // Step 1: Create the transaction
  const transaction = await Transaction.create({
    userId,
    type,
    amount,
    utrNumber,
    userMessage,
    status: "PENDING",
  });

  // Step 2: Populate user details inside transaction
  const populatedTransaction = await Transaction.findById(transaction._id)
    .populate("userId", "firstName lastName username email mobile role avatar isVerified");

  // Step 3: Return the populated transaction
  return populatedTransaction;
};
/**
 * Approve a deposit or withdrawal by admin
 */
export const approveTransaction = async ({ transactionId, adminId, remark }) => {
  const transaction = await Transaction.findById(transactionId);
  if (!transaction) throw new Error("Transaction not found");

  if (transaction.status !== "PENDING") throw new Error("Transaction already processed");

  const user = await User.findById(transaction.userId);
  if (!user) throw new Error("User not found");

  // Update wallet balance
  if (transaction.type === "DEPOSIT") {
    user.walletBalance += transaction.amount;
  } else if (transaction.type === "WITHDRAWAL") {
    if (user.walletBalance < transaction.amount) throw new Error("Insufficient wallet balance");
    user.walletBalance -= transaction.amount;
  }

  await user.save();

  // Update transaction
  transaction.status = "SUCCESS";
  transaction.remark = remark;
  transaction.approvedBy = adminId;
  await transaction.save();

  return { transaction, walletBalance: user.walletBalance };
};

/**
 * Reject a pending transaction
 */
export const rejectTransaction = async ({ transactionId, adminId, remark }) => {
  const transaction = await Transaction.findById(transactionId);
  if (!transaction) throw new Error("Transaction not found");

  if (transaction.status !== "PENDING") throw new Error("Transaction already processed");

  transaction.status = "REJECTED";
  transaction.remark = remark;
  transaction.approvedBy = adminId;
  await transaction.save();

  return transaction;
};

/**
 * Get all transactions for a user (history)
 */
export const getUserTransactions = async (userId) => {
  return await Transaction.find({ userId }).sort({ createdAt: -1 });
};

/**
 * Get all pending transactions (for admin dashboard)
 */
export const getPendingTransactions = async () => {
  return await Transaction.find({ status: "PENDING" }).populate("userId", "firstName lastName email");
};
