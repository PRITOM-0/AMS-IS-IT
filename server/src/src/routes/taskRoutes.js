import express from "express";

import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  patchTask,
  deleteTask
} from "../controllers/taskController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/",protect, getTasks);
router.get("/:id",protect, getTaskById);

router.post("/",protect, createTask);

router.put("/:id",protect, updateTask);
router.patch("/:id",protect, patchTask);

router.delete("/:id",protect,authorizeRoles("Admin"), deleteTask);

export default router;