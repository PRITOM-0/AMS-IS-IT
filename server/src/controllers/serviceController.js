import Service from "../models/Service.js";

const generateServiceId = () => {
  return `SRV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

// GET /api/services
export const getServices = async (req, res) => {
  try {
    const services = await Service.find().sort({
      createAt: -1
    });

    res.status(200).json(services);
  } catch (error) {
    console.error("Get services error:", error);

    res.status(500).json({
      message: "Failed to fetch services",
      error: error.message
    });
  }
};

// GET /api/services/:id
export const getServiceById = async (req, res) => {
  try {
    const service = await Service.findOne({
      _id: req.params.id
    });

    if (!service) {
      return res.status(404).json({
        message: "Service not found"
      });
    }

    res.status(200).json(service);
  } catch (error) {
    console.error("Get service error:", error);

    res.status(500).json({
      message: "Failed to fetch service",
      error: error.message
    });
  }
};

// POST /api/services
export const createService = async (req, res) => {
  try {
    const now = new Date().toISOString();
    

    const service = await Service.create({
      ...req.body,
      createAt: req.body.createAt || now,
      updateAt: now
    });

    res.status(201).json(service);
  } catch (error) {
    console.error("Create service error:", error);

    res.status(400).json({
      message: "Failed to create service",
      error: error.message
    });
  }
};

// PUT /api/services/:id
export const updateService = async (req, res) => {
  try {
    const {createAt, ...updateData } = req.body;

    updateData.updateAt = new Date().toISOString();

    const service = await Service.findOneAndUpdate(
      { _id: req.params.id },
      updateData,
      {
        returnDocument: "after",
        runValidators: true
      }
    );

    if (!service) {
      return res.status(404).json({
        message: "Service not found"
      });
    }

    res.status(200).json(service);
  } catch (error) {
    console.error("Update service error:", error);

    res.status(400).json({
      message: "Failed to update service",
      error: error.message
    });
  }
};

// PATCH /api/services/:id
export const patchService = async (req, res) => {
  try {
    const { id, createAt, ...updateData } = req.body;

    updateData.updateAt = new Date().toISOString();

    const service = await Service.findOneAndUpdate(
      { id: req.params.id },
      { $set: updateData },
      {
        new: true,
        runValidators: true
      }
    );

    if (!service) {
      return res.status(404).json({
        message: "Service not found"
      });
    }

    res.status(200).json(service);
  } catch (error) {
    console.error("Patch service error:", error);

    res.status(400).json({
      message: "Failed to update service",
      error: error.message
    });
  }
};

// DELETE /api/services/:id
export const deleteService = async (req, res) => {
  try {
    const service = await Service.findOneAndDelete({
      id: req.params.id
    });

    if (!service) {
      return res.status(404).json({
        message: "Service not found"
      });
    }

    res.status(200).json({
      message: "Service deleted successfully",
      service
    });
  } catch (error) {
    console.error("Delete service error:", error);

    res.status(500).json({
      message: "Failed to delete service",
      error: error.message
    });
  }
};