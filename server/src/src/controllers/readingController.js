
import mongoose from "mongoose";
import Reading from "../models/Reading.js";
import Asset from "../models/Asset.js";
import XLSX from "xlsx";

const months = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
];

function parseMonth(month, year) {
  if (/^\d{4}-(0[1-9]|1[0-2])$/.test(String(month || ""))) {
    const [y, m] = month.split("-").map(Number);
    return { month: months[m - 1], year: y };
  }

  const index = months.findIndex(
    (m) => m.toLowerCase() === String(month || "").toLowerCase()
  );

  if (index < 0 || !Number.isInteger(Number(year))) return null;

  return { month: months[index], year: Number(year) };
}

function validCounters(data) {
  const keys = ["bwStart", "bwEnd", "colorStart", "colorEnd"];

  return (
    keys.every(
      (key) =>
        data[key] !== "" &&
        data[key] != null &&
        Number.isFinite(Number(data[key])) &&
        Number(data[key]) >= 0
    ) &&
    Number(data.bwEnd) >= Number(data.bwStart) &&
    Number(data.colorEnd) >= Number(data.colorStart)
  );
}

// GET: All monthly readings for an asset
export const getReadings = async (req, res) => {
  try {
    const { assetId } = req.params;

    if (!mongoose.isValidObjectId(assetId)) {
      return res.status(400).json({
        message: "Invalid asset ID.",
      });
    }

    const asset = await Asset.findById(assetId).lean();

    if (!asset) {
      return res.status(404).json({
        message: "Asset not found.",
      });
    }

    const reading = await Reading.findOne({ assetId }).lean();

    const monthOrder = [
      "January", "February", "March", "April",
      "May", "June", "July", "August",
      "September", "October", "November", "December",
    ];

    const monthlyReading = (reading?.monthlyReading || []).sort(
      (a, b) =>
        b.year - a.year ||
        monthOrder.indexOf(b.month) - monthOrder.indexOf(a.month)
    );

    return res.json({
      _id: reading?._id || null,
      assetId: asset,
      monthlyReading,
      createdAt: reading?.createdAt || null,
    });
  } catch (err) {
    console.error("Get readings error:", err);

    return res.status(500).json({
      message: "Failed to fetch readings.",
    });
  }
};

// CREATE: Add a monthly reading
export const saveReading = async (req, res) => {
  try {
    const {
      assetId,
      month,
      year,
      bwStart,
      bwEnd,
      colorStart,
      colorEnd,
      remarks,
    } = req.body;

    const parsed = parseMonth(month, year);

    if (
      !mongoose.isValidObjectId(assetId) ||
      !parsed ||
      !(await Asset.exists({ _id: assetId }))
    ) {
      return res.status(400).json({
        message: "Invalid asset or month/year.",
      });
    }

    if (!validCounters(req.body)) {
      return res.status(400).json({
        message: "Invalid counter values.",
      });
    }

    let reading = await Reading.findOne({ assetId });

    if (
      reading?.monthlyReading.some(
        (r) => r.month === parsed.month && r.year === parsed.year
      )
    ) {
      return res.status(409).json({
        message: "A reading already exists for this month.",
      });
    }

    const entry = {
      ...parsed,
      bwStart: Number(bwStart),
      bwEnd: Number(bwEnd),
      colorStart: Number(colorStart),
      colorEnd: Number(colorEnd),
      remarks: remarks || "",
      date: new Date(),
    };

    if (reading) {
      reading.monthlyReading.push(entry);
      await reading.save();
    } else {
      reading = await Reading.create({
        assetId,
        monthlyReading: [entry],
      });
    }

    res.status(201).json(reading);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE: Update one monthly entry using its subdocument ID
export const updateReading = async (req, res) => {
  try {
    const { id } = req.params;
    const { month, year, bwStart, bwEnd, colorStart, colorEnd, remarks } =
      req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid monthly reading ID." });
    }

    const parsed = parseMonth(month, year);

    if (!parsed || !validCounters(req.body)) {
      return res.status(400).json({
        message: "Please enter a valid month, year, and counter values.",
      });
    }

    const reading = await Reading.findOne({
      "monthlyReading._id": id,
    });

    if (!reading) {
      return res.status(404).json({ message: "Reading not found." });
    }

    const entry = reading.monthlyReading.id(id);

    const duplicate = reading.monthlyReading.some(
      (r) =>
        String(r._id) !== id &&
        r.month === parsed.month &&
        r.year === parsed.year
    );

    if (duplicate) {
      return res.status(409).json({
        message: "A reading already exists for this month.",
      });
    }

    Object.assign(entry, {
      ...parsed,
      bwStart: Number(bwStart),
      bwEnd: Number(bwEnd),
      colorStart: Number(colorStart),
      colorEnd: Number(colorEnd),
      remarks: remarks || "",
    });

    await reading.save();
    res.json(reading);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE: Delete one monthly entry using its subdocument ID
export const deleteReading = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid monthly reading ID." });
    }

    const reading = await Reading.findOne({
      "monthlyReading._id": id,
    });

    if (!reading) {
      return res.status(404).json({ message: "Reading not found." });
    }

    reading.monthlyReading.pull({ _id: id });
    await reading.save();

    res.json({ message: "Monthly reading deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getReadingReport = async (req, res) => {
  try {
    const { from, to, assetIds } = req.body;

    const validMonth = (value) =>
      typeof value === "string" &&
      /^\d{4}-(0[1-9]|1[0-2])$/.test(value);

    if (!validMonth(from) || !validMonth(to) || from > to) {
      return res.status(400).json({
        message: "Invalid From Month or To Month.",
      });
    }

    if (!Array.isArray(assetIds) || assetIds.length === 0) {
      return res.status(400).json({
        message: "No printer assets selected.",
      });
    }

    if (assetIds.some((id) => !mongoose.isValidObjectId(id))) {
      return res.status(400).json({
        message: "Invalid asset ID.",
      });
    }

    // Build selected month list
    const months = [];
    let current = from;

    while (current <= to) {
      const [year, month] = current.split("-").map(Number);

      months.push({
        key: current,
        year,
        month,
        label: new Date(year, month - 1, 1)
          .toLocaleString("en-US", { month: "short" }) +
          ` ${year}`,
      });

      const next = new Date(year, month, 1);
      current =
        `${next.getFullYear()}-${String(
          next.getMonth() + 1,
        ).padStart(2, "0")}`;
    }

    const ids = [...new Set(assetIds.map(String))];

    const [assets, readings] = await Promise.all([
      Asset.find({
        _id: { $in: ids },
      }).lean(),

      Reading.find({
        assetId: { $in: ids },
      }).lean(),
    ]);

    const monthNumbers = {
      january: 1,
      february: 2,
      march: 3,
      april: 4,
      may: 5,
      june: 6,
      july: 7,
      august: 8,
      september: 9,
      october: 10,
      november: 11,
      december: 12,
    };

    // Map readings by asset ID and YYYY-MM
    const readingMap = new Map();

    for (const reading of readings) {
      for (const item of reading.monthlyReading || []) {
        const monthText = String(item.month).trim().toLowerCase();

        const monthNumber =
          monthNumbers[monthText] ||
          ( /^\d{1,2}$/.test(monthText)
            ? Number(monthText)
            : null);

        if (!monthNumber || monthNumber > 12) continue;

        const key =
          `${reading.assetId}-${item.year}-` +
          String(monthNumber).padStart(2, "0");

        readingMap.set(key, item);
      }
    }

    // One Excel row per asset
    const rows = assets.map((asset) => {
      const row = {
        assetCode: asset.assetCode || "",
        brand: asset.brand || "",
        model: asset.model || "",
        company: asset.company || "",
        location: asset.location || "",
        department: asset.department || "",
      };

      for (const month of months) {
        const key = `${asset._id}-${month.key}`;
        const item = readingMap.get(key);
        const label = month.label;

        const bwStart = Number(item?.bwStart ?? 0);
        const bwEnd = Number(item?.bwEnd ?? 0);
        const colorStart = Number(item?.colorStart ?? 0);
        const colorEnd = Number(item?.colorEnd ?? 0);

        row[`${label} B/W Reading (Start-End)`] = item
          ? `${bwStart} - ${bwEnd} (Total: ${bwEnd - bwStart})`
          : "";

        row[`${label} Color Reading (Start-End)`] = item
          ? `${colorStart} - ${colorEnd} (Total: ${colorEnd - colorStart})`
          : "";
      }

      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);

    worksheet["!cols"] = Object.keys(rows[0] || {}).map(
      (heading) => ({
        wch: Math.max(18, heading.length + 2),
      }),
    );

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Printer Reading Report",
    );

    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="printer-reading-${from}-to-${to}.xlsx"`,
    );

    return res.send(buffer);
  } catch (error) {
    console.error("Printer reading report error:", error);

    return res.status(500).json({
      message: "Failed to generate printer reading report.",
    });
  }
};

export const exportSinglePrinterReadings = async (req, res) => {
  try {
    const { assetId, from, to } = req.query;

    if (!mongoose.isValidObjectId(assetId)) {
      return res.status(400).json({
        message: "Invalid asset ID.",
      });
    }

    const validMonth = (value) =>
      typeof value === "string" &&
      /^\d{4}-(0[1-9]|1[0-2])$/.test(value);

    if (!validMonth(from) || !validMonth(to) || from > to) {
      return res.status(400).json({
        message: "Please select a valid From and To month.",
      });
    }

    const asset = await Asset.findById(assetId).lean();

    if (!asset) {
      return res.status(404).json({
        message: "Asset not found.",
      });
    }

    const reading = await Reading.findOne({ assetId }).lean();

    const monthNumbers = {
      january: 1,
      february: 2,
      march: 3,
      april: 4,
      may: 5,
      june: 6,
      july: 7,
      august: 8,
      september: 9,
      october: 10,
      november: 11,
      december: 12,
    };

    const selectedReadings = (reading?.monthlyReading || [])
      .map((item) => {
        const monthText = String(item.month).trim().toLowerCase();

        const monthNumber =
          monthNumbers[monthText] ||
          (/^\d{1,2}$/.test(monthText)
            ? Number(monthText)
            : null);

        if (!monthNumber || monthNumber > 12) return null;

        const key =
          `${item.year}-${String(monthNumber).padStart(2, "0")}`;

        return { item, key };
      })
      .filter(
        (entry) =>
          entry && entry.key >= from && entry.key <= to
      )
      .sort((a, b) => a.key.localeCompare(b.key));

    const rows = selectedReadings.map(({ item, key }) => {
      const bwStart = Number(item.bwStart || 0);
      const bwEnd = Number(item.bwEnd || 0);
      const colorStart = Number(item.colorStart || 0);
      const colorEnd = Number(item.colorEnd || 0);

      return {
        "Asset Code": asset.assetCode || "",
        Brand: asset.brand || "",
        Model: asset.model || "",
        Company: asset.company || "",
        Location: asset.location || "",
        Department: asset.department || "",
        Month: key,
        "B/W Start": bwStart,
        "B/W End": bwEnd,
        "Total B/W": bwEnd - bwStart,
        "Color Start": colorStart,
        "Color End": colorEnd,
        "Total Color": colorEnd - colorStart,
        Remarks: item.remarks || "",
        Date: item.date ? new Date(item.date).toLocaleDateString() : "",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows.length ? rows : [{
      "Asset Code": asset.assetCode || "",
      Brand: asset.brand || "",
      Model: asset.model || "",
      Company: asset.company || "",
      Location: asset.location || "",
      Department: asset.department || "",
      Month: "No readings found for selected period",
    }]);

    worksheet["!cols"] = Object.keys(rows[0] || {}).map((heading) => ({
      wch: Math.max(15, heading.length + 2),
    }));

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Printer Readings"
    );

    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="printer-${asset.assetCode || assetId}-${from}-to-${to}.xlsx"`
    );

    return res.send(buffer);
  } catch (error) {
    console.error("Single printer export error:", error);

    return res.status(500).json({
      message: "Failed to export printer readings.",
    });
  }
};

