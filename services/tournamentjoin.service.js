import TournamentJoin from "../models/tournamentjoin.modle.js";
import Tournament from "../models/tournament.modle.js";
import User from "../models/user.modle.js";

/**
 * Player requests to join a tournament
 */
export const createTournamentJoinService = async ({ tournamentId, playerId, paymentProof }) => {
  // Check tournament exists
  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) throw new Error("Tournament not found");

  // Check player exists
  const player = await User.findById(playerId);
  if (!player) throw new Error("Player not found");

  // Check if player already joined or has a pending request
  const existingJoin = await TournamentJoin.findOne({ tournament: tournamentId, player: playerId });
  if (existingJoin) throw new Error("Player has already requested to join this tournament");

  // Create join record with status "pending"
  const join = await TournamentJoin.create({
    tournament: tournamentId,
    player: playerId,
    paymentProof: paymentProof || null,
    status: "pending",
  });

  // Increment tournament's preJoined count
  tournament.preJoined += 1;
  await tournament.save();

  return join;
};

export const confirmPaymentService = async (joinId) => {
  // 1️⃣ Find the join record
  const join = await TournamentJoin.findById(joinId);
  if (!join) throw new Error("Join record not found");

  // 2️⃣ Find the tournament
  const tournament = await Tournament.findById(join.tournament);
  if (!tournament) throw new Error("Tournament not found");

  // 3️⃣ Update join record
  join.status = "confirmed";
  join.paymentReceived = true;
  join.paymentConfirmedAt = new Date();
  await join.save();

  // 4️⃣ Update tournament counters
  // Decrement preJoined, increment joinedPlayers
  tournament.preJoined = Math.max(0, tournament.preJoined - 1); // avoid negative
  tournament.joinedPlayers += 1;
  await tournament.save();

  return join;
};


export const getTournamentJoinsService = async (tournamentId) => {
  const result = await TournamentJoin.aggregate([
    { $match: { tournament: tournamentId } },

    {
      $lookup: {
        from: "tournaments",
        localField: "tournament",
        foreignField: "_id",
        as: "tournamentDetails"
      }
    },

    {
      $lookup: {
        from: "users",
        localField: "player",
        foreignField: "_id",
        as: "playerDetails"
      }
    },

    { $unwind: "$tournamentDetails" },
    { $unwind: "$playerDetails" },

    // Merge join-specific fields into playerDetails
    {
      $addFields: {
        "playerDetails.joinStatus": "$status",
        "playerDetails.paymentReceived": "$paymentReceived",
        "playerDetails.paymentProof": "$paymentProof",
        "playerDetails.joinedAt": "$joinedAt",
        "playerDetails.paymentConfirmedAt": "$paymentConfirmedAt",
        "playerDetails.joinId": "$_id" // optional: join record ID
      }
    },

    // Group by tournament to nest players
    {
      $group: {
        _id: "$tournament",
        tournament: { $first: "$tournamentDetails" },
        players: { $push: "$playerDetails" }
      }
    }
  ]);

  if (!result || result.length === 0) throw new Error("Tournament not found");

  return result[0]; // tournament + all players with join info
};

export const cancelJoinService = async (joinId, requesterId, requesterRole) => {
  const join = await TournamentJoin.findById(joinId);
  if (!join) throw new Error("Join record not found");

  if (requesterRole === "PLAYER") {
    // Player can cancel only their own join if still pending
    if (join.player !== requesterId) throw new Error("Unauthorized");
    if (join.status !== "pending") throw new Error("Cannot cancel after confirmation");

    await join.deleteOne();
    return { message: "Join cancelled successfully" };
  }

  if (requesterRole === "ORGANIZER") {
    // Organizer can cancel any join
    await join.deleteOne();
    return { message: "Join cancelled by organizer successfully" };
  }

  throw new Error("Unauthorized");
};