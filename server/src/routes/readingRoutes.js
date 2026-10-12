import express from "express";
import {
  deleteReading,
  getReadings,
  saveReading,
} from "../controllers/readingController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", protect, getReadings);
router.put("/", protect, saveReading);
router.delete("/:id", protect, authorizeRoles("Admin"), deleteReading);

export default router;
