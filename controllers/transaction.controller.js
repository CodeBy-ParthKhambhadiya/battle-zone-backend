import * as transactionService from "../services/transaction.service.js";

// 🪙 User - Create deposit or withdrawal request
export const createTransaction = async (req, res) => {
  try {
    const { type, amount, utrNumber, userMessage } = req.body;
    const userId = req.user._id; // from auth middleware

    const transaction = await transactionService.createTransaction({
      userId,
      type,
      amount,
      utrNumber,
      userMessage,
    });

    res.status(201).json({
      message: `${type} request submitted successfully`,
      transaction,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ Admin - Approve transaction
export const approveTransaction = async (req, res) => {
  try {
    const { transactionId, remark } = req.body;
    const adminId = req.user._id;

    const result = await transactionService.approveTransaction({
      transactionId,
      adminId,
      remark,
    });

    res.json({
      message: "Transaction approved successfully",
      ...result,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ❌ Admin - Reject transaction
export const rejectTransaction = async (req, res) => {
  try {
    const { transactionId, remark } = req.body;
    const adminId = req.user._id;

    const transaction = await transactionService.rejectTransaction({
      transactionId,
      adminId,
      remark,
    });

    res.json({
      message: "Transaction rejected successfully",
      transaction,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 📜 User - Get all transactions
export const getUserTransactions = async (req, res) => {
  try {
    const userId = req.user._id;
    const transactions = await transactionService.getUserTransactions(userId);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🧾 Admin - Get pending transactions
export const getPendingTransactions = async (req, res) => {
  try {
    const transactions = await transactionService.getPendingTransactions();
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
