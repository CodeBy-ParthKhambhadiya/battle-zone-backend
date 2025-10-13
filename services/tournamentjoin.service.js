import TournamentJoin from "../models/tournamentjoin.modle.js";
import Tournament from "../models/tournament.modle.js";
import User from "../models/user.modle.js";

export const createTournamentJoinService = async ({ tournamentId, playerId, paymentProof }) => {
  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) throw new Error("Tournament not found");

  const player = await User.findById(playerId);
  if (!player) throw new Error("Player not found");

  const existingJoin = await TournamentJoin.findOne({ tournament: tournamentId, player: playerId });
  if (existingJoin) throw new Error("Player has already requested to join this tournament");

  const join = await TournamentJoin.create({
    tournament: tournamentId,
    player: playerId,
    paymentProof: paymentProof || null,
    status: "pending",
  });

  tournament.preJoined += 1;
  await tournament.save();

  return join;
};

export const confirmPaymentService = async (joinId) => {
  const join = await TournamentJoin.findById(joinId);
  if (!join) throw new Error("Join record not found");

  const tournament = await Tournament.findById(join.tournament);
  if (!tournament) throw new Error("Tournament not found");

  join.status = "confirmed";
  join.paymentReceived = true;
  join.paymentConfirmedAt = new Date();
  await join.save();

  
  tournament.preJoined = Math.max(0, tournament.preJoined - 1);
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

    {
      $addFields: {
        "playerDetails.joinStatus": "$status",
        "playerDetails.paymentReceived": "$paymentReceived",
        "playerDetails.paymentProof": "$paymentProof",
        "playerDetails.joinedAt": "$joinedAt",
        "playerDetails.paymentConfirmedAt": "$paymentConfirmedAt",
        "playerDetails.joinId": "$_id" 
      }
    },

    {
      $group: {
        _id: "$tournament",
        tournament: { $first: "$tournamentDetails" },
        players: { $push: "$playerDetails" }
      }
    }
  ]);

  if (!result || result.length === 0) throw new Error("Tournament not found");

  return result[0]; 
};

export const cancelJoinService = async (joinId, requesterId, requesterRole) => {
  const join = await TournamentJoin.findById(joinId);
  if (!join) throw new Error("Join record not found");

  if (requesterRole === "PLAYER") {
    if (join.player !== requesterId) throw new Error("Unauthorized");
    if (join.status !== "pending") throw new Error("Cannot cancel after confirmation");

    await join.deleteOne();
    return { message: "Join cancelled successfully" };
  }

  if (requesterRole === "ORGANIZER") {
    await join.deleteOne();
    return { message: "Join cancelled by organizer successfully" };
  }

  throw new Error("Unauthorized");
};