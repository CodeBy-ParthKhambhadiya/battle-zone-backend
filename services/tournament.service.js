import Tournament from "../models/tournament.modle.js";

const calculateEntryFee = (prizePool, maxPlayers) => (maxPlayers > 0 ? prizePool / maxPlayers : 0);

export const createTournamentService = async (data, user) => {

    if (user.role !== "ORGANIZER") {
        throw new Error("You must be an organizer to create a tournament");
    }

    const maxPlayers = data.max_players ?? 0;
    const prizePool = data.prize_pool ?? 0;

    const tournamentData = {
        name: data.name ?? "Untitled Tournament",
        description: data.description ?? "",
        organizer_id: user._id,
        game_type: data.game_type ?? "Unknown",
        max_players: maxPlayers,
        entry_fee: calculateEntryFee(prizePool, maxPlayers),
        start_datetime: data.start_datetime ? new Date(data.start_datetime) : new Date(),
        end_datetime: data.end_datetime ? new Date(data.end_datetime) : new Date(),
        status: data.status ?? "UPCOMING",
        prize_pool: prizePool,
        rules: data.rules ?? [],
    };

    const tournament = await Tournament.create(tournamentData);
    return tournament;
};

export const getAllTournamentsService = async () => {
    return await Tournament.find().populate("organizer_id");
};

export const getTournamentByIdService = async (_id) => {
    const tournament = await Tournament.findOne({ _id }).populate("organizer_id");
    if (!tournament) throw new Error("Tournament not found");
    return tournament;
};

export const updateTournamentService = async (_id, data, organizerId) => {
  
    const existingTournament = await Tournament.findOne({ _id });
    if (!existingTournament) throw new Error("Tournament not found");
    if (existingTournament.organizer_id.toString() !== organizerId.toString()) {
        throw new Error("Unauthorized to update this tournament");
    }

    const maxPlayers = data.max_players ?? existingTournament.max_players;
    const prizePool = data.prize_pool ?? existingTournament.prize_pool;

    const updatedData = {
        name: data.name ?? existingTournament.name,
        description: data.description ?? existingTournament.description,
        game_type: data.game_type ?? existingTournament.game_type,
        max_players: maxPlayers,
        prize_pool: prizePool,
        entry_fee: calculateEntryFee(prizePool, maxPlayers),
        start_datetime: data.start_datetime ? new Date(data.start_datetime) : existingTournament.start_datetime,
        end_datetime: data.end_datetime ? new Date(data.end_datetime) : existingTournament.end_datetime,
        status: data.status ?? existingTournament.status,
        rules: data.rules ?? existingTournament.rules,
    };
    console.log("🚀 ~ updateTournamentService ~ updatedData:", updatedData)

    const updatedTournament = await Tournament.findOneAndUpdate({ _id }, updatedData, { new: true });
    return updatedTournament;
};

// Delete tournament
export const deleteTournamentService = async (_id, organizerId) => {

    const existingTournament = await Tournament.findOne({ _id });
    if (!existingTournament) throw new Error("Tournament not found");
    if (existingTournament.organizer_id.toString() !== organizerId.toString()) {
        throw new Error("Unauthorized to delete this tournament");
    }

    const deletedTournament = await Tournament.findOneAndDelete({ _id });
    return deletedTournament;
};
