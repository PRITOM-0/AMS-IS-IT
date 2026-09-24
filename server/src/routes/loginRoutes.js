import express from "express";

import {
  loginUser,
  logoutUser,

  usersInfo
} from "../controllers/loginController.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/logout", logoutUser);

router.get("/usersInfo", usersInfo);

export default router;
