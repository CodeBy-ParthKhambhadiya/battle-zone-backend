import {
  addCommentService,
  getCommentsService,
  replyCommentService,
  deleteCommentService,
  editCommentService
} from "../services/tournamentcomment.service.js";

export const addCommentController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { tournamentId, message } = req.body;

    const comment = await addCommentService(tournamentId, userId, message);

    res.status(201).json({ success: true, comment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getCommentsController = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const comments = await getCommentsService(tournamentId);

    res.status(200).json({ success: true, comments });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const replyCommentController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { commentId, message } = req.body;
    console.log("🚀 ~ replyCommentController ~ commentId:", commentId)

    const comment = await replyCommentService(commentId, userId, message);
    res.status(200).json({ success: true, comment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteCommentController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { commentId } = req.body;

    const result = await deleteCommentService(commentId, userId);
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
export const editCommentController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { commentId, replyId, newMessage } = req.body;

    const updatedComment = await editCommentService(commentId, replyId, userId, newMessage);

    res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      comment: updatedComment,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
