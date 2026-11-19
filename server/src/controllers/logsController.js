
import Log from "../models/Log.js";

// Create Log
export const createLog = async ({
  performar,
  action,
  on,
  employeename = "",
  assetname = "",
  assetcode = "",
  username = "",
  vendorname = "",
}) => {
  await Log.create({
    performar,
    action,
    on,
    employeename,
    assetname,
    assetcode,
    username,
    vendorname,
  });
};

// Get All Logs
export const getLogs = async (req, res) => {
  try {
    const logs = await Log.find().sort({ date: -1 });

    res.status(200).json(logs);
  } catch (error) {
    console.error("Failed to fetch logs:", error);

    res.status(500).json({
      message: "Failed to fetch logs",
      error: error.message,
    });
  }
};
