import express from "express";

import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  patchUser,
  deleteUser
} from "../controllers/userController.js";

const router = express.Router();

router.get("/", getUsers);
router.get("/:id", getUserById);

router.post("/", createUser);

router.put("/:id", updateUser);
router.patch("/:id", patchUser);

router.delete("/:id", deleteUser);

export default router;