import express from "express";

import {
  getServices,
  getServiceById,
  createService,
  updateService,
  patchService,
  deleteService
} from "../controllers/serviceController.js";

const router = express.Router();

router.get("/", getServices);
router.get("/:id", getServiceById);

router.post("/", createService);

router.put("/:id", updateService);
router.patch("/:id", patchService);

router.delete("/:id", deleteService);

export default router;