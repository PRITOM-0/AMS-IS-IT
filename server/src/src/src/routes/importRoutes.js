import express from "express";

import {
  importAssetsEmployeesVendors,
} from "../controllers/importController.js";

const router = express.Router();

router.post(
  "/assets-employees-vendors",
  importAssetsEmployeesVendors
);

export default router;