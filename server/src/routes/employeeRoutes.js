import express from "express";

import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  patchEmployee,
  deleteEmployee
} from "../controllers/employeeController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/",protect, getEmployees);
router.get("/:id",protect, getEmployeeById);

router.post("/",protect, createEmployee);

router.put("/:id",protect, updateEmployee);
router.patch("/:id",protect, patchEmployee);

router.delete("/:id",protect,authorizeRoles("Admin"), deleteEmployee);

export default router;