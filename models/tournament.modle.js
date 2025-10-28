import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const tournamentSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    organizer_id: {
      type: String,
      ref: "User",
      required: true,
    },
    game_type: {
      type: String,
      required: true,
    },
    max_players: {
      type: Number,
      required: true,
    },
    entry_fee: {
      type: Number,
      default: 0,
    },
    start_datetime: {
      type: Date,
      required: true,
    },
    end_datetime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"],
      default: "UPCOMING",
    },
    prize_pool: {
      type: Number,
      required: true,
    },
    rules: {
      type: [String],
      default: [],
    },
    preJoined: {
      type: Number,
      default: 0,
    },
    joinedPlayers: {
      type: Number,
      default: 0,
    },

    // 🆕 Added fields
    roomID: {
      type: String,
      default: null, // or you can make it required if you want
    },
    password: {
      type: String,
      default: null, // you can also hash it later if needed
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Tournament", tournamentSchema);
