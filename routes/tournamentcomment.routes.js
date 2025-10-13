import express from "express";
import {
  addCommentController,
  getCommentsController,
  replyCommentController,
  deleteCommentController,
  editCommentController
} from "../controllers/tournamentcomment.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", protect, addCommentController);
router.get("/:tournamentId", protect, getCommentsController);
router.post("/reply", protect, replyCommentController);
router.put("/edit-comment", protect, editCommentController);
router.delete("/", protect, deleteCommentController);

export default router;
