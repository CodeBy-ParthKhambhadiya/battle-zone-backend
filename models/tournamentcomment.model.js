import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const tournamentCommentSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4,
  },
  tournament: {
    type: String,
    ref: "Tournament",
    required: true,
  },
  user: {
    type: String,
    ref: "User",
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  replies: [
    {
      user: { type: String, ref: "User" },
      message: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

export default mongoose.model("TournamentComment", tournamentCommentSchema);
