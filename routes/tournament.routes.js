import express from "express";
import {
  createTournamentController,
  getAllTournamentsController,
  getTournamentByIdController,
  updateTournamentController,
  deleteTournamentController,
  updateTournamentAfterStartController,
} from "../controllers/tournament.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createTournamentController);
router.get("/", protect, getAllTournamentsController);
router.get("/:id", protect, getTournamentByIdController);
router.put("/:id", protect, updateTournamentController);
router.delete("/:id", protect, deleteTournamentController);
router.post("/update-after-start", protect, updateTournamentAfterStartController);

export default router;
