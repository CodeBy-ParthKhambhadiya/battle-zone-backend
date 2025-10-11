import {
  createJoinService,
  updateJoinStatusService,
  getTournamentJoinsService
} from "../services/tournamentjoin.service.js";

// Prejoin: user requests to join
export const preJoinController = async (req, res) => {
  try {
    const { tournamentId } = req.body;

    // Get playerId from the authenticated user
    const playerId = req.user._id;

    // Check if the role is PLAYER
    if (req.user.role !== "PLAYER") {
      return res.status(403).json({ success: false, message: "Only players can join tournaments" });
    }

    console.log("🚀 ~ preJoinController ~ playerId:", playerId);
    console.log("🚀 ~ preJoinController ~ tournamentId:", tournamentId);

    const joinRecord = await createJoinService({ tournamentId, playerId });
    res.status(201).json({ success: true, join: joinRecord });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update join status (joined, pending, complete)
export const updateJoinController = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, amountPaid } = req.body;
    const join = await updateJoinStatusService(id, status, amountPaid);
    res.status(200).json({ success: true, join });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all joins for a tournament
export const getJoinsController = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const joins = await getTournamentJoinsService(tournamentId);
    res.status(200).json({ success: true, joins });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
