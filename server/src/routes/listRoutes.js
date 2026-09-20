import express from "express";

import {
  getList,
  updateList,
  patchList
} from "../controllers/listController.js";

const router = express.Router();

router.get("/", getList);

router.put("/", updateList);
router.patch("/", patchList);

export default router;