import express from "express";

import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  patchTask,
  deleteTask
} from "../controllers/taskController.js";

const router = express.Router();

router.get("/", getTasks);
router.get("/:id", getTaskById);

router.post("/", createTask);

router.put("/:id", updateTask);
router.patch("/:id", patchTask);

router.delete("/:id", deleteTask);

export default router;