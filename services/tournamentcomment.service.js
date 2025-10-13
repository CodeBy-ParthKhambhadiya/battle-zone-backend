import TournamentComment from "../models/tournamentcomment.model.js";

// Add a comment
export const addCommentService = async (tournamentId, userId, message) => {
  const comment = await TournamentComment.create({
    tournament: tournamentId,
    user: userId,
    message,
    replies: [],
  });

  return comment.populate("user", "firstName lastName username email avatarFile");
};

// Get all comments for a tournament
export const getCommentsService = async (tournamentId) => {
  const comments = await TournamentComment.find({ tournament: tournamentId })
    .populate("user", "firstName lastName username email avatarFile")
    .populate("replies.user", "firstName lastName username email avatarFile")
    .sort({ createdAt: 1 }); // oldest first

  return comments;
};

// Reply to a comment
export const replyCommentService = async (commentId, userId, message) => {
  // Find the comment
  const comment = await TournamentComment.findById(commentId);
  if (!comment) throw new Error("Comment not found");

  // Add reply
  comment.replies.push({ user: userId, message });
  await comment.save();

  // Re-query the comment to populate
  const populatedComment = await TournamentComment.findById(commentId)
    .populate("user", "firstName lastName username email avatarFile")
    .populate("replies.user", "firstName lastName username email avatarFile");

  return populatedComment;
};

// Delete comment (only author or organizer)
export const deleteCommentService = async (commentId, userId) => {
  const comment = await TournamentComment.findById(commentId);
  if (!comment) throw new Error("Comment not found");

  if (comment.user !== userId) {
    throw new Error("Unauthorized to delete this comment");
  }

  await comment.deleteOne();
  return { message: "Comment deleted successfully" };
};

export const editCommentService = async (commentId, replyId, userId, newMessage) => {
  const comment = await TournamentComment.findById(commentId);
  if (!comment) throw new Error("Comment not found");

  // Editing a reply
  if (replyId) {
    const reply = comment.replies.id(replyId);
    if (!reply) throw new Error("Reply not found");
    if (reply.user.toString() !== userId.toString()) throw new Error("Unauthorized");

    reply.message = newMessage;
  } 
  // Editing the main comment
  else {
    if (comment.user.toString() !== userId.toString()) throw new Error("Unauthorized");
    comment.message = newMessage;
  }

  await comment.save();

  // Re-populate for response
  const populatedComment = await TournamentComment.findById(commentId)
    .populate("user", "firstName lastName username email avatarFile")
    .populate("replies.user", "firstName lastName username email avatarFile");

  return populatedComment;
};
