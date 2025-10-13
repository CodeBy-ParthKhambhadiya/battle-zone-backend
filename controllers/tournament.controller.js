import {
    createTournamentService,
    getAllTournamentsService,
    getTournamentByIdService,
    updateTournamentService,
    deleteTournamentService,
    updateTournamentAfterStartService,
} from "../services/tournament.service.js";

export const createTournamentController = async (req, res) => {
  try {
    const user = req.user;

    if (user.role !== "ORGANIZER") {
      return res.status(403).json({
        status: "fail",
        message: "You must be an organizer to create a tournament",
      });
    }

    const { tournament, chat } = await createTournamentService(req.body, user);

    return res.status(201).json({
      status: "success",
      message: "Tournament and chat created successfully!",
      data: {
        tournament,
        chat
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};



export const getAllTournamentsController = async (req, res) => {
    try {
        const tournaments = await getAllTournamentsService();
        return res.status(200).json({
            status: "success",
            data: tournaments,
            message: "Tournament fatched successfully!",

        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
};


export const getTournamentByIdController = async (req, res) => {
    try {
        const tournament = await getTournamentByIdService(req.params.id);
        return res.status(200).json({
            status: "success",
            data: tournament,
            message: `Tournament fetched successfully`,
        });
    } catch (error) {
        return res.status(404).json({
            status: "fail",
            message: error.message,
        });
    }
};


export const updateTournamentController = async (req, res) => {
    try {
        const user = req.user;
        if (!user || user.role !== "ORGANIZER") {
            return res.status(403).json({
                status: "fail",
                message: "You must be an organizer to update a tournament",
            });
        }

        const updatedTournament = await updateTournamentService(
            req.params.id,
            req.body,
            user._id
        );

        return res.status(200).json({
            status: "success",
            message: "Tournament updated successfully",
            data: updatedTournament,
        });
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Failed to update tournament",
            error: error.message,
        });
    }
};

export const deleteTournamentController = async (req, res) => {
    try {
        const user = req.user;
        if (!user || user.role !== "ORGANIZER") {
            return res.status(403).json({
                status: "fail",
                message: "You must be an organizer to delete a tournament",
            });
        }

        const deletedTournament = await deleteTournamentService(req.params.id, user._id);

        return res.status(200).json({
            status: "success",
            message: "Tournament deleted successfully",
            data: deletedTournament,
        });
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Failed to delete tournament",
            error: error.message,
        });
    }
};


export const updateTournamentAfterStartController = async (req, res) => {
  try {
    const { tournamentId } = req.body;

    const result = await updateTournamentAfterStartService(tournamentId);

    if (result.message && !result.tournament) {
      return res.status(200).json({
        success: true,
        message: result.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.tournament,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
