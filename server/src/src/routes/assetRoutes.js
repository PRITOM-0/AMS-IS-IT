import express from "express";

import {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  patchAsset,
  deleteAsset
} from "../controllers/assetController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", protect, getAssets);
router.get("/:id", protect, getAssetById);

router.post("/",protect, createAsset);

router.put("/:id",protect, updateAsset);
router.patch("/:id",protect, patchAsset);

router.delete("/:id",protect,authorizeRoles("Admin") ,deleteAsset);

export default router;