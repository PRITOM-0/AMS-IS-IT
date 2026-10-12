import mongoose from "mongoose";
import Asset from "../models/Asset.js";
import Reading from "../models/Reading.js";

const PRINTER_EQUIPMENT = new Set([
  "printer",
  "pos printer",
  "photocopier",
  "photocopiers",
]);

const getPeriod = (value) => {
  if (!/^\d{4}-\d{2}$/.test(value || "")) return null;
  const [year, month] = value.split("-").map(Number);
  if (month < 1 || month > 12 || year < 2000) return null;
  return { year, month };
};

export const getReadings = async (req, res) => {
  try {
    const query = {};
    if (req.query.assetId) {
      if (!mongoose.Types.ObjectId.isValid(req.query.assetId)) {
        return res.status(400).json({ message: "Invalid asset ID." });
      }
      query.assetId = req.query.assetId;
    }

    if (req.query.period) {
      const period = getPeriod(req.query.period);
      if (!period) {
        return res.status(400).json({ message: "Period must use YYYY-MM." });
      }
      query.year = period.year;
      query.month = period.month;
    }

    const readings = await Reading.find(query).sort({ year: -1, month: -1 });
    return res.status(200).json(readings);
  } catch (error) {
    console.error("Get readings error:", error);
    return res.status(500).json({ message: "Failed to fetch readings." });
  }
};

export const saveReading = async (req, res) => {
  try {
    const {
      assetId,
      period,
      bwStartReading,
      bwEndReading,
      colorStartReading,
      colorEndReading,
      remarks,
    } = req.body;
    if (!mongoose.Types.ObjectId.isValid(assetId || "")) {
      return res.status(400).json({ message: "A valid asset ID is required." });
    }

    const parsedPeriod = getPeriod(period);
    if (!parsedPeriod) {
      return res.status(400).json({ message: "Period must use YYYY-MM." });
    }

    const counters = {
      bwStartReading: Number(bwStartReading),
      bwEndReading: Number(bwEndReading),
      colorStartReading: Number(colorStartReading),
      colorEndReading: Number(colorEndReading),
    };
    const hasMissingCounter = [
      bwStartReading,
      bwEndReading,
      colorStartReading,
      colorEndReading,
    ].some((value) => value === "" || value === null || value === undefined);
    if (
      hasMissingCounter ||
      Object.values(counters).some(
        (value) => !Number.isFinite(value) || value < 0,
      ) ||
      counters.bwEndReading < counters.bwStartReading ||
      counters.colorEndReading < counters.colorStartReading
    ) {
      return res.status(400).json({
        message:
          "Each end reading must be at least its non-negative start reading.",
      });
    }
    if (remarks !== undefined && typeof remarks !== "string") {
      return res.status(400).json({ message: "Remarks must be text." });
    }
    if (typeof remarks === "string" && remarks.length > 4000) {
      return res
        .status(400)
        .json({ message: "Remarks cannot exceed 4000 characters." });
    }

    const asset = await Asset.findById(assetId);
    if (!asset) return res.status(404).json({ message: "Asset not found." });
    if (
      !PRINTER_EQUIPMENT.has(
        String(asset.equipment || "")
          .trim()
          .toLowerCase(),
      )
    ) {
      return res.status(400).json({
        message: "Monthly readings are only for printers and photocopiers.",
      });
    }

    const snapshotFields = [
      "assetCode",
      "equipment",
      "brand",
      "model",
      "serialNumber",
      "company",
      "location",
      "department",
      "floor",
      "room",
      "status",
    ];
    const assetSnapshot = Object.fromEntries(
      snapshotFields.map((field) => [field, asset[field] || ""]),
    );

    const reading = await Reading.findOneAndUpdate(
      { assetId, year: parsedPeriod.year, month: parsedPeriod.month },
      {
        $set: {
          asset: assetSnapshot,
          ...counters,
          remarks: remarks || "",
        },
      },
      {
        returnDocument: "after",
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    return res.status(200).json(reading);
  } catch (error) {
    console.error("Save reading error:", error);
    return res.status(500).json({ message: "Failed to save reading." });
  }
};

export const deleteReading = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid reading ID." });
    }

    const reading = await Reading.findByIdAndDelete(req.params.id);
    if (!reading) {
      return res.status(404).json({ message: "Monthly reading not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Monthly reading deleted.",
      readingId: reading._id,
    });
  } catch (error) {
    console.error("Delete reading error:", error);
    return res.status(500).json({ message: "Failed to delete reading." });
  }
};
