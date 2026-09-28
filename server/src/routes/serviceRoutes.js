import express from "express";

import {
  getServices,
  getServiceById,
  createService,
  updateService,
  patchService,
  deleteService
} from "../controllers/serviceController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/",protect, getServices);
router.get("/:id",protect, getServiceById);

router.post("/",protect, createService);

router.put("/:id",protect, updateService);
router.patch("/:id",protect, patchService);

router.delete("/:id",protect,authorizeRoles("Admin"), deleteService);

export default router;