import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const messageSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4,
  },
  sender: {
    type: String,
    ref: "User",
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
});

const tournamentChatSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    tournament: {
      type: String,
      ref: "Tournament",
      required: true,
      unique: true,
    },
    organizer: {
      type: String,
      ref: "User",
      required: true,
    },
    messages: [messageSchema],
  },
  { timestamps: true }
);

const TournamentChat = mongoose.model("TournamentChat", tournamentChatSchema);
export default TournamentChat;
