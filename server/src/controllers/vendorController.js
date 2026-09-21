import Vendor from "../models/Vendor.js";

// GET /api/vendors
export const getVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find().sort({
      createdAt: -1
    });

    res.status(200).json(vendors);
  } catch (error) {
    console.error("Get vendors error:", error);

    res.status(500).json({
      message: "Failed to fetch vendors",
      error: error.message
    });
  }
};

// GET /api/vendors/:id
export const getVendorById = async (req, res) => {
  try {
    console.log(req.params);
    const vendor = await Vendor.findOne({
      _id: req.params.id
    });

    if (!vendor) {
      return res.status(404).json({
        message: "Vendor not found"
      });
    }

    res.status(200).json(vendor);
  } catch (error) {
    console.error("Get vendor error:", error);

    res.status(500).json({
      message: "Failed to fetch vendor",
      error: error.message
    });
  }
};

// POST /api/vendors
export const createVendor = async (req, res) => {
  try {
    const vendor = await Vendor.create({
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    res.status(201).json(vendor);
  } catch (error) {
    console.error("Create vendor error:", error);

    res.status(400).json({
      message: "Failed to create vendor",
      error: error.message
    });
  }
};

// PUT /api/vendors/:id
export const updateVendor = async (req, res) => {
  try {
    const { id, createdAt, ...updateData } = req.body;

    updateData.updatedAt = new Date().toISOString();

    const vendor = await Vendor.findOneAndUpdate(
      { _id: req.params.id },
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    if (!vendor) {
      return res.status(404).json({
        message: "Vendor not found"
      });
    }

    res.status(200).json(vendor);
  } catch (error) {
    console.error("Update vendor error:", error);

    res.status(400).json({
      message: "Failed to update vendor",
      error: error.message
    });
  }
};

// PATCH /api/vendors/:id
export const patchVendor = async (req, res) => {
  try {
    const { id, createdAt, ...updateData } = req.body;

    updateData.updatedAt = new Date().toISOString();

    const vendor = await Vendor.findOneAndUpdate(
      { _id: req.params.id },
      { $set: updateData },
      {
        new: true,
        runValidators: true
      }
    );

    if (!vendor) {
      return res.status(404).json({
        message: "Vendor not found"
      });
    }

    res.status(200).json(vendor);
  } catch (error) {
    console.error("Patch vendor error:", error);

    res.status(400).json({
      message: "Failed to update vendor",
      error: error.message
    });
  }
};

// DELETE /api/vendors/:id
export const deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findOneAndDelete({
      _id: req.params.id
    });

    if (!vendor) {
      return res.status(404).json({
        message: "Vendor not found"
      });
    }

    res.status(200).json({
      message: "Vendor deleted successfully",
      vendor
    });
  } catch (error) {
    console.error("Delete vendor error:", error);

    res.status(500).json({
      message: "Failed to delete vendor",
      error: error.message
    });
  }
};