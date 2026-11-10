import List from "../models/List.js";

const getOrCreateList = async () => {
  let list = await List.findOne();

  if (!list) {
    list = await List.create({
      company: [],
      Location: [],
      department: [],
      assetStatuses: [],
      surveyStatuses: [],
      taskStatuses: [],
      equipment: [],
      validateEquipments: [],
      brand: []
    });
  }

  return list;
};

// GET /api/list
export const getList = async (req, res) => {
  try {
    const list = await getOrCreateList();

    res.status(200).json(list);
  } catch (error) {
    console.error("Get list error:", error);

    res.status(500).json({
      message: "Failed to fetch list",
      error: error.message
    });
  }
};

// PUT /api/list
export const updateList = async (req, res) => {
  try {
    const list = await getOrCreateList();

    const allowedFields = [
      "company",
      "Location",
      "department",
      "assetStatuses",
      "surveyStatuses",
      "taskStatuses",
      "equipment",
      "validateEquipments",
      "brand"
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        list[field] = req.body[field];
      }
    });

    await list.save();

    res.status(200).json(list);
  } catch (error) {
    console.error("Update list error:", error);

    res.status(400).json({
      message: "Failed to update list",
      error: error.message
    });
  }
};

// PATCH /api/list
export const patchList = async (req, res) => {
  try {
    const list = await getOrCreateList();

    const allowedFields = [
      "company",
      "Location",
      "department",
      "assetStatuses",
      "surveyStatuses",
      "taskStatuses",
      "equipment",
      "validateEquipments",
      "brand"
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        list[field] = req.body[field];
      }
    });

    await list.save();

    res.status(200).json(list);
  } catch (error) {
    console.error("Patch list error:", error);

    res.status(400).json({
      message: "Failed to patch list",
      error: error.message
    });
  }
};