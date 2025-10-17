import {
  createTournamentJoinService,
  confirmPaymentService,
  getTournamentJoinsService,
  cancelJoinService,
  getAllTournamentJoinsService,
} from "../services/tournamentjoin.service.js";

export const preJoinController = async (req, res) => {
  try {
    const { tournamentId, playerId, paymentProof } = req.body;
    const join = await createTournamentJoinService({ tournamentId, playerId, paymentProof });

    res.status(201).json({
      success: true,
      message: "Join request created successfully",
      data: join,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const confirmPaymentController = async (req, res) => {
  try {
    const { joinId } = req.body;
    const join = await confirmPaymentService(joinId);

    res.status(200).json({
      success: true,
      message: "Payment confirmed successfully",
      data: join,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getTournamentJoinsController = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const joins = await getTournamentJoinsService(tournamentId);

    res.status(200).json({
      success: true,
      data: joins,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const cancelJoinController = async (req, res) => {
  try {
    const { joinId } = req.body;
    const requesterId = req.user._id;
    const requesterRole = req.user.role;

    const result = await cancelJoinService(joinId, requesterId, requesterRole);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result.deletedJoin, // ✅ include deleted join record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


export const getAllTournamentJoinsController = async (req, res) => {
  try {
    const joins = await getAllTournamentJoinsService();

    res.status(200).json({
      success: true,
      data: joins,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
