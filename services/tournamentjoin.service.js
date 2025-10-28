import TournamentJoin from "../models/tournamentjoin.modle.js";
import Tournament from "../models/tournament.modle.js";
import User from "../models/user.modle.js";

export const createTournamentJoinService = async ({ tournamentId, playerId, paymentProof }) => {
  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) throw new Error("Tournament not found");

  const player = await User.findById(playerId);
  if (!player) throw new Error("Player not found");

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

  // Check if already confirmed
  if (join.status === "confirmed" && join.paymentReceived === true) {
    return { message: "Payment is already confirmed for this join record." };
  }

  const tournament = await Tournament.findById(join.tournament);
  if (!tournament) throw new Error("Tournament not found");

  // Update join record
  join.status = "confirmed";
  join.paymentReceived = true;
  join.paymentConfirmedAt = new Date();
  await join.save();

  // Update tournament counts
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

  // 🏆 Fetch related tournament
  const tournament = await Tournament.findById(join.tournament);
  if (!tournament) throw new Error("Tournament not found");

  // 🧾 Store data before deletion
  const deletedJoinData = join.toObject();

  // 🧍 For Player Requests
  if (requesterRole === "PLAYER") {
    if (join.player.toString() !== requesterId.toString()) {
      throw new Error("Unauthorized");
    }

    // Player can cancel only if pending (not confirmed)
    if (join.status !== "pending") {
      throw new Error("Cannot cancel after confirmation");
    }

    // 🔽 Decrease preJoined safely
    if (tournament.preJoined > 0) {
      tournament.preJoined -= 1;
    }

    await join.deleteOne();
    await tournament.save();

    return {
      message: "Join cancelled successfully",
      deletedJoin: deletedJoinData,
    };
  }

  // 🧑‍💼 For Organizer Requests
  if (requesterRole === "ORGANIZER") {
    // 🟢 If the player was only pre-joined (pending approval)
    if (join.status === "pending" && tournament.preJoined > 0) {
      tournament.preJoined -= 1;
    }
    // 🟣 If the player was already confirmed
    else if (join.status === "confirmed" && tournament.joinedPlayers > 0) {
      tournament.joinedPlayers -= 1;
    }

    await join.deleteOne();
    await tournament.save();

    return {
      message: `Join cancelled by organizer successfully (${join.status})`,
      deletedJoin: deletedJoinData,
    };
  }

  throw new Error("Unauthorized");
};

export const getAllTournamentJoinsService = async () => {
  const joins = await TournamentJoin.find()
    .populate("player")      // Populate player info
    .populate("tournament")  // Populate tournament info
    .sort({ joinedAt: 1 })   // Sort by join date
    .lean();                 // Convert Mongoose docs to plain objects

  return joins;
};

export const getOrganizerTournamentsWithPendingPlayersService = async (organizerId) => {
  if (!organizerId) {
    throw new Error("Organizer ID is required");
  }

  // 1️⃣ Fetch all tournaments for this organizer
  const tournaments = await Tournament.find({ organizer_id: organizerId })
    .sort({ createdAt: -1 })
    .lean();

  if (!tournaments.length) return [];

  // 2️⃣ Extract tournament IDs
  const tournamentIds = tournaments.map((t) => t._id);

  // 3️⃣ Fetch all joins (both pending + confirmed)
  const joins = await TournamentJoin.find({
    tournament: { $in: tournamentIds },
    status: { $in: ["pending", "confirmed"] },
  })
    .populate("player")
    .lean();

  // 4️⃣ Merge pending + confirmed players into their tournaments
  const tournamentsWithPlayers = tournaments.map((tournament) => {
    const pendingPlayers = joins.filter(
      (join) => join.tournament.toString() === tournament._id.toString() && join.status === "pending"
    );
    const confirmedPlayers = joins.filter(
      (join) => join.tournament.toString() === tournament._id.toString() && join.status === "confirmed"
    );

    return {
      ...tournament,
      pendingPlayers,
      confirmedPlayers,
      joinedPlayersCount: confirmedPlayers.length,
    };
  });

  return tournamentsWithPlayers;
};
