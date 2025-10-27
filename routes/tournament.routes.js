import express from "express";
import {
  createTournamentController,
  getAllTournamentsController,
  getTournamentByIdController,
  updateTournamentController,
  deleteTournamentController,
  updateTournamentAfterStartController,
  getOrganizerTournamentsController,
} from "../controllers/tournament.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Organizer tournaments route FIRST (to avoid conflict with :id)
router.get("/organizer", protect, getOrganizerTournamentsController);

// CRUD routes
router.post("/", protect, createTournamentController);
router.get("/", protect, getAllTournamentsController);
router.get("/:id", protect, getTournamentByIdController);
router.put("/:id", protect, updateTournamentController);
router.delete("/:id", protect, deleteTournamentController);

// Special update route
router.post("/update-after-start", protect, updateTournamentAfterStartController);

export default router;
