import express from "express";
import {
    createTransaction,
    approveTransaction,
    rejectTransaction,
    getUserTransactions,
    getPendingTransactions,
} from "../controllers/transaction.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// USER ROUTES
router.post("/create", protect, createTransaction);
router.get("/my-transactions", protect, getUserTransactions);

// ADMIN ROUTES
router.get("/pending", protect, getPendingTransactions);
router.post("/approve", protect, approveTransaction);
router.post("/reject", protect, rejectTransaction);

export default router;
