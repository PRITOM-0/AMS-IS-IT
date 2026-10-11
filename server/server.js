import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./src/config/db.js";

import assetRoutes from "./src/routes/assetRoutes.js";
import employeeRoutes from "./src/routes/employeeRoutes.js";
import vendorRoutes from "./src/routes/vendorRoutes.js";
import serviceRoutes from "./src/routes/serviceRoutes.js";
import taskRoutes from "./src/routes/taskRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import listRoutes from "./src/routes/listRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import importRoutes from "./src/routes/importRoutes.js"



dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;
const HOST ="localhost";

// ==============================
// DATABASE
// ==============================

await connectDB();

// ==============================
// MIDDLEWARE
// ==============================

app.use(cookieParser());

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(express.json({ limit: "10mb" }));

app.use(
  express.urlencoded({
    extended: true,
  }),
);

// ==============================
// ROOT
// ==============================

app.get("/", (req, res) => {
  res.json({
    message: "AMS IS-IT API is running",
    status: "success",
  });
});

// ==============================
// API ROUTES
// ==============================

app.use("/api/auth", authRoutes);

app.use("/api/assets", assetRoutes);

app.use("/api/employees", employeeRoutes);

app.use("/api/vendors", vendorRoutes);

app.use("/api/services", serviceRoutes);

app.use("/api/tasks", taskRoutes);

app.use("/api/users", userRoutes);

app.use("/api/list", listRoutes);
app.use(
  "/api/import",
  (req, res, next) => {
    console.info("[Import API] Request received", {
      method: req.method,
      url: req.originalUrl,
    });

    res.on("finish", () => {
      console.info("[Import API] Request finished", {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
      });
    });

    next();
  },
  importRoutes
);

// ==============================
// 404
// ==============================

app.use((req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ==============================
// ERROR HANDLER
// ==============================

app.use((error, req, res, next) => {
  console.error("Server error:", error);

  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? error.message : undefined,
  });
});

// ==============================
// START SERVER
// ==============================

app.listen(PORT, HOST, () => {
  console.log("");
  console.log("=================================");
  console.log("         AMS IS-IT API");
  console.log("=================================");
  console.log(`Server : http://${HOST}:${PORT}`);
  console.log(`API    : http://${HOST}:${PORT}/api`);
  console.log("Database: MongoDB Local");
  console.log("=================================");
  console.log("");
});
