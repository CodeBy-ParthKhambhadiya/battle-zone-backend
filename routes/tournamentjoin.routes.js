import express from "express";
import {
  preJoinController,
  updateJoinController,
  getJoinsController
} from "../controllers/tournamentjoin.controller.js";

import { protect } from "../middlewares/auth.middleware.js"; // <-- imported middleware

const router = express.Router();

router.post("/prejoin", protect, preJoinController);

router.put("/update/:id", protect, updateJoinController);

router.get("/:tournamentId", protect, getJoinsController);

export default router;
