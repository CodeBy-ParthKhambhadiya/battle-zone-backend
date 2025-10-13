import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const tournamentJoinSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4, 
  },
  tournament: {
    type: String,
    ref: "Tournament", 
    required: true,
  },
  player: {
    type: String,
    ref: "User", 
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "done","confirmed"],
    default: "pending",
  },
  paymentReceived: {
    type: Boolean,
    default: false,
  },
  paymentProof: {
    type: String, 
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  paymentConfirmedAt: {
    type: Date,
  },
}, {
  timestamps: true, 
});

tournamentJoinSchema.index({ tournament: 1, player: 1 }, { unique: true });

const TournamentJoin = mongoose.model("TournamentJoin", tournamentJoinSchema);

export default TournamentJoin;
