import TournamentJoin from "../models/tournamentjoin.modle.js";
import Tournament from "../models/tournament.modle.js";

// Create a new join
export const createJoinService = async ({ tournamentId, playerId }) => {
  // 1️⃣ Check if tournament exists
  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) throw new Error("Tournament not found");

  // 2️⃣ Check if player already joined
  const existingJoin = await TournamentJoin.findOne({ tournament: tournamentId, player: playerId });
  if (existingJoin) throw new Error("Player already joined this tournament");

  // 3️⃣ Create the join
  const newJoin = await TournamentJoin.create({ tournament: tournamentId, player: playerId });
  return newJoin;
};

// Update join status and amount paid
export const updateJoinStatusService = async (id, status, amountPaid = 0) => {
  const join = await TournamentJoin.findById(id);
  if (!join) throw new Error("Join record not found");

  join.status = status;
  if (amountPaid) join.amountPaid = amountPaid;

  await join.save();
  return join;
};

// Get all joins for a tournament
export const getTournamentJoinsService = async (tournamentId) => {
  return TournamentJoin.find({ tournament: tournamentId }).populate("player", "firstName lastName email");
};
