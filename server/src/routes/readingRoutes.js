
import express from "express";
import {
  getReadings,
  saveReading,
  updateReading,
  deleteReading,
  getReadingReport,
  exportSinglePrinterReadings,
} from "../controllers/readingController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";


const router = express.Router();

// Export must come before dynamic routes
router.post("/report", protect, getReadingReport);
router.get("/export", protect, exportSinglePrinterReadings);

// Get all monthly readings for an asset
router.get("/:assetId", protect, getReadings);

// Create a monthly reading
router.post("/", protect, saveReading);

// Update a monthly entry by its subdocument _id
router.put("/:id", protect, updateReading);

// Delete a monthly entry by its subdocument _id
router.delete("/:id", protect,authorizeRoles("Admin"),deleteReading);


export default router;
