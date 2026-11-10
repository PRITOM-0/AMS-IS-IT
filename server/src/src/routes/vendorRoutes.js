import express from "express";

import {
  getVendors,
  getVendorById,
  createVendor,
  updateVendor,
  patchVendor,
  deleteVendor
} from "../controllers/vendorController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
const router = express.Router();

router.get("/",protect, getVendors);
router.get("/:id",protect, getVendorById);

router.post("/",protect, createVendor);

router.put("/:id",protect, updateVendor);
router.patch("/:id",protect, patchVendor);

router.delete("/:id",protect,authorizeRoles("Admin"), deleteVendor);

export default router;