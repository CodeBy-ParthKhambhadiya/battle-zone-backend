import Transaction from "../models/transaction.modle.js";
import User from "../models/user.modle.js";
import { manageUserNotification } from "../utils/notificationManager.js";


export const createTransaction = async ({
  userId,
  type,
  amount,
  utrNumber,
  userMessage,
}) => {
  // 🧩 Step 1: Validate required fields
  if (!userId || !type || !amount) {
    return {
      success: false,
      message: "Please provide all required fields: type, amount, and user ID.",
    };
  }

  // 🧩 Step 2: Fetch user and current wallet balance
  const user = await User.findById(userId);
  if (!user) {
    return { success: false, message: "User not found. Please log in again." };
  }

  const walletBalance = user.walletBalance || 0;

  // 🧩 Step 3: Handle invalid transaction type
  const validTypes = ["DEPOSIT", "WITHDRAWAL"];
  if (!validTypes.includes(type)) {
    return { success: false, message: "Invalid transaction type." };
  }

  // 🧩 Step 4: Balance check for withdrawals
  if (type === "WITHDRAWAL" && amount > walletBalance) {
    return {
      success: false,
      message: `Insufficient balance. You have ₹${walletBalance.toFixed(
        2
      )}, but attempted to withdraw ₹${amount}.`,
    };
  }

  // 🧩 Step 5: Create the transaction
  const transaction = await Transaction.create({
    userId,
    type,
    amount,
    utrNumber,
    userMessage,
    status: "PENDING",
  });
  if (type === "WITHDRAWAL") {
    // Move the withdrawn amount into pendingPayments directly
    const currentPending = Number(user.pendingPayments) || 0;
    const currentWalletBalance = Number(user.walletBalance) || 0;
    const withdrawAmount = Number(amount);
    user.walletBalance = currentWalletBalance - withdrawAmount;

    user.pendingPayments = currentPending + withdrawAmount;
    await user.save();
  }

  // 🧩 Step 6: Populate the transaction with user info
  const populatedTransaction = await Transaction.findById(transaction._id).populate(
    "userId",
    "firstName lastName username email mobile role avatar isVerified walletBalance"
  );

  // 🧩 Step 7: Compose a clear, user-facing message
  const successMessage =
    type === "DEPOSIT"
      ? `Your deposit request of ₹${amount} has been submitted successfully. Awaiting admin approval.`
      : `Your withdrawal request of ₹${amount} has been submitted successfully. Awaiting admin approval.`;

  await manageUserNotification(user._id.toString(), {
    category: "SYSTEM",
    title:
      type === "DEPOSIT"
        ? " Deposit Request Submitted"
        : " Withdrawal Request Submitted",
    message: successMessage,
    type: "INFO",
    data: { transactionId: transaction._id, amount, status: "PENDING" },
  });
  // 🧩 Step 8: Return structured result
  return {
    success: true,
    message: successMessage,
    data: populatedTransaction,
  };
};

export const approveTransaction = async ({ transactionId, adminId, remark }) => {
  const transaction = await Transaction.findById(transactionId);
  if (!transaction) throw new Error("Transaction not found");

  console.log("🚀 ~ approveTransaction ~ transaction:", transaction)
  if (transaction.status !== "PENDING") throw new Error("Transaction already processed");

  const user = await User.findById(transaction.userId);
  if (!user) throw new Error("User not found");

  // Update wallet balance
  if (transaction.type === "DEPOSIT") {
    user.walletBalance += transaction.amount;
  } else if (transaction.type === "WITHDRAWAL") {
    if (user.pendingPayments < transaction.amount) throw new Error("Insufficient wallet balance");
    user.pendingPayments -= transaction.amount;
  }

  await user.save();

  // Update transaction
  transaction.status = "SUCCESS";
  transaction.remark = remark;
  transaction.approvedBy = adminId;
  await transaction.save();
  const formattedAmount = `₹${transaction.amount.toLocaleString("en-IN")}`;

  await manageUserNotification(user._id.toString(), {
    category: "SYSTEM",
    title:
      transaction.type === "DEPOSIT"
        ? " Deposit Approved"
        : " Withdrawal Approved",
    message:
      transaction.type === "DEPOSIT"
        ? `Your deposit of ${formattedAmount} has been approved and added to your wallet successfully. Please check your account to view the updated balance.`
        : `Your withdrawal of ${formattedAmount} has been approved. The funds will be transferred to your account shortly — please check your account for updates.`,
    type: "SUCCESS",
    data: {
      transactionId,
      amount: transaction.amount,
      status: "SUCCESS",
    },
  });

  return { transaction, walletBalance: user.walletBalance };
};

export const rejectTransaction = async ({ transactionId, adminId, remark }) => {
  const transaction = await Transaction.findById(transactionId);
  console.log("🚀 ~ rejectTransaction ~ transaction:", transaction)
  if (!transaction) throw new Error("Transaction not found");
  const user = await User.findById(transaction.userId);

  if (transaction.status !== "PENDING") throw new Error("Transaction already processed");

  transaction.status = "REJECTED";
  console.log("🚀 ~ rejectTransaction ~ transaction:", transaction)
  transaction.remark = remark;
  transaction.approvedBy = adminId;
  console.log("🚀 ~ rejectTransaction ~ transaction:", transaction)
  const userId = transaction.userId;
  await transaction.save();
  const formattedAmount = `₹${transaction.amount.toLocaleString("en-IN")}`;

  if (transaction.type === "DEPOSIT") {
    // No wallet update for deposit rejection (it was never added)
  } else if (transaction.type === "WITHDRAWAL") {
    const currentPending = Number(user.pendingPayments) || 0;
    const withdrawAmount = Number(transaction.amount);

    // 🪙 Add back to wallet
    user.walletBalance += withdrawAmount;

    // 🔽 Remove from pending payments (ensure not negative)
    user.pendingPayments = Math.max(currentPending - withdrawAmount, 0);

    await user.save();
  }
  await manageUserNotification(userId.toString(), {
    category: "SYSTEM",
    title:
      transaction.type === "DEPOSIT"
        ? " Deposit Rejected"
        : " Withdrawal Rejected",
    message:
      transaction.type === "DEPOSIT"
        ? `Unfortunately, your deposit request of ${formattedAmount} has been rejected. Please check your account or contact our support team at battlezoneofficial.com for more details.`
        : `Unfortunately, your withdrawal request of ${formattedAmount} has been rejected. Please check your account or reach out to our support team at battlezoneofficial.com if you have any questions.`,
    type: "ERROR",
    data: {
      transactionId,
      amount: transaction.amount,
      status: "REJECTED",
    },
  });


  return transaction;
};

export const getUserTransactions = async (userId) => {
  return await Transaction.find({ userId }).sort({ createdAt: -1 });
};

export const getPendingTransactions = async () => {
  return await Transaction.find({ status: "PENDING" }).populate("userId", "firstName lastName email");
};
