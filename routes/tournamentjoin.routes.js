import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  preJoinController,
  confirmPaymentController,
  getTournamentJoinsController,
  cancelJoinController,
  getAllTournamentJoinsController,
} from "../controllers/tournamentjoin.controller.js";

const router = express.Router();

router.post("/join", protect, preJoinController);
router.post("/confirm", protect, confirmPaymentController);
router.get("/tournament/:tournamentId", protect, getTournamentJoinsController);
router.delete("/cancel", protect, cancelJoinController);
router.get("/all-joins", getAllTournamentJoinsController);

export default router;
