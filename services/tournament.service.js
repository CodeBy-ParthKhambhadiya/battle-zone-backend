import Tournament from "../models/tournament.modle.js";
import TournamentChat from "../models/tournamentchat.modle.js";
import TournamentJoin from "../models/tournamentjoin.modle.js";
import User from "../models/user.modle.js";
import { sendTournamentCreatedEmail } from "../utils/emailService.js";
import { manageUserNotification } from "../utils/notificationManager.js";

const calculateEntryFee = (prizePool, maxPlayers) => (maxPlayers > 0 ? prizePool / maxPlayers : 0);


export const createTournamentService = async (data, user) => {
  // 1️⃣ Ensure only organizers can create tournaments
  if (user.role !== "ORGANIZER") {
    throw new Error("You must be an organizer to create a tournament");
  }

  // 2️⃣ Prepare tournament data
  const maxPlayers = data.max_players ?? 0;
  const prizePool = data.prize_pool ?? 0;

  const tournamentData = {
    name: data.name ?? "Untitled Tournament",
    description: data.description ?? "",
    organizer_id: user._id,
    game_type: data.game_type ?? "Unknown",
    max_players: maxPlayers || 100,
    entry_fee: calculateEntryFee(prizePool, maxPlayers),
    start_datetime: data.start_datetime ? new Date(data.start_datetime) : new Date(),
    end_datetime: data.end_datetime ? new Date(data.end_datetime) : new Date(),
    status: data.status ?? "UPCOMING",
    prize_pool: prizePool,
    rules: data.rules ?? [],
    roomID: data.roomID ?? null,
    password: data.password ?? null,
  };

  // 3️⃣ Create tournament record
  const tournament = await Tournament.create(tournamentData);

  // 4️⃣ Auto-create tournament chat
  const chat = await TournamentChat.create({
    tournament: tournament._id,
    organizer: user._id,
    messages: [
      {
        sender: user._id,
        message: "Welcome! Ask any questions about this tournament here.",
      },
    ],
  });

  try {
    const players = await User.find({ role: "PLAYER" }).select("_id firstName email");

    if (players.length > 0) {
      // Use Promise.all for concurrent execution
      await Promise.all(
        players.map((player) =>
          manageUserNotification(player._id, {
            category: "TOURNAMENT",
            title: " New Tournament Created!",
            message: `
 A brand new tournament, ${tournament.name}, has just been announced! With a total prize pool of ₹${tournament.prize_pool} and an entry fee of ₹${tournament.entry_fee}, this event promises intense competition and exciting rewards. The tournament kicks off on ${new Date(tournament.start_datetime).toLocaleString()}, so make sure you register early and secure your spot!

Get ready to showcase your skills and compete for glory! 
  `,
            data: {
              tournamentId: tournament._id,
              tournamentName: tournament.name,
              organizer: user.firstName,
            },
          })
        )
      );

      console.log(`✅ Sent notifications to ${players.length} players`);
    } else {
      console.log("⚠️ No players found to notify");
    }
  } catch (err) {
    console.error("❌ Failed to send tournament notifications:", err.message);
  }

  // 6️⃣ Return combined data
  return {
    success: true,
    message: "Tournament created successfully!",
    tournament,
    chat,
  };
};

export const getAllTournamentsService = async () => {
  const tournaments = await Tournament.find().populate("organizer_id");

  // remove password and roomID from each tournament
  // const filteredTournaments = tournaments.map(t => {
  //   const { password, roomID, ...rest } = t.toObject();
  //   return rest;
  // });

  return tournaments;
};


export const getTournamentByIdService = async (_id) => {
  const tournament = await Tournament.findOne({ _id }).populate("organizer_id");
  if (!tournament) throw new Error("Tournament not found");
  return tournament;
};

export const updateTournamentService = async (_id, data, organizerId) => {
  // 1️⃣ Check if the tournament exists
  const existingTournament = await Tournament.findOne({ _id });
  if (!existingTournament) throw new Error("Tournament not found");

  // 2️⃣ Verify the organizer
  if (existingTournament.organizer_id.toString() !== organizerId.toString()) {
    throw new Error("Unauthorized to update this tournament");
  }

  // 3️⃣ Handle numeric values safely
  const maxPlayers = data.max_players ?? existingTournament.max_players;
  const prizePool = data.prize_pool ?? existingTournament.prize_pool;

  // 4️⃣ Prepare update payload
  const updatedData = {
    name: data.name ?? existingTournament.name,
    description: data.description ?? existingTournament.description,
    game_type: data.game_type ?? existingTournament.game_type,
    max_players: maxPlayers,
    prize_pool: prizePool,
    entry_fee: calculateEntryFee(prizePool, maxPlayers),
    start_datetime: data.start_datetime
      ? new Date(data.start_datetime)
      : existingTournament.start_datetime,
    end_datetime: data.end_datetime
      ? new Date(data.end_datetime)
      : existingTournament.end_datetime,
    status: data.status ?? existingTournament.status,
    rules: data.rules ?? existingTournament.rules,

    // 🆕 Add roomID and password update support
    roomID: data.roomID ?? existingTournament.roomID,
    password: data.password ?? existingTournament.password,
  };

  // 5️⃣ Update tournament in DB
  const updatedTournament = await Tournament.findOneAndUpdate(
    { _id },
    updatedData,
    { new: true }
  );

  return updatedTournament;
};


export const deleteTournamentService = async (_id, organizerId) => {

  const existingTournament = await Tournament.findOne({ _id });
  if (!existingTournament) throw new Error("Tournament not found");
  if (existingTournament.organizer_id.toString() !== organizerId.toString()) {
    throw new Error("Unauthorized to delete this tournament");
  }

  const deletedTournament = await Tournament.findOneAndDelete({ _id });
  return deletedTournament;
};

export const updateTournamentAfterStartService = async (tournamentId) => {
  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) throw new Error("Tournament not found");

  const now = new Date();

  if (now < tournament.start_datetime) {
    const diffMs = tournament.start_datetime - now;

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
    const seconds = Math.floor((diffMs / 1000) % 60);

    // Build human-readable message
    const parts = [];
    if (days) parts.push(`${days} day${days > 1 ? "s" : ""}`);
    if (hours) parts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
    if (minutes) parts.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);
    if (seconds) parts.push(`${seconds} second${seconds > 1 ? "s" : ""}`);

    return {
      message: `Tournament starts in ${parts.join(", ")}`,
    };
  }

  const confirmedJoins = await TournamentJoin.countDocuments({
    tournament: tournamentId,
    status: "confirmed",
  });

  tournament.joinedPlayers = confirmedJoins;
  tournament.prize_pool = tournament.entry_fee * confirmedJoins;

  if (tournament.status === "UPCOMING") tournament.status = "ONGOING";

  await tournament.save();
  return {
    message: "Tournament has started",
    tournament,
  };
};

export const getTournamentsByOrganizerService = async (organizerId) => {
  try {
    const tournaments = await Tournament.find({ organizer_id: organizerId }).sort({
      createdAt: -1,
    });
    return tournaments;
  } catch (error) {
    console.error("Error in getTournamentsByOrganizerService:", error);
    throw new Error("Failed to fetch organizer tournaments");
  }
};