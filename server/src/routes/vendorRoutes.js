import express from "express";

import {
  getVendors,
  getVendorById,
  createVendor,
  updateVendor,
  patchVendor,
  deleteVendor
} from "../controllers/vendorController.js";

const router = express.Router();

router.get("/", getVendors);
router.get("/:id", getVendorById);

router.post("/", createVendor);

router.put("/:id", updateVendor);
router.patch("/:id", patchVendor);

router.delete("/:id", deleteVendor);

export default router;