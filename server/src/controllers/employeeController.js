import Employee from "../models/Employee.js";

const generateEmployeeId = () => {
  return `EMP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

// GET /api/employees
export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().sort({
      createdAt: -1
    });

    res.status(200).json(employees);
  } catch (error) {
    console.error("Get employees error:", error);

    res.status(500).json({
      message: "Failed to fetch employees",
      error: error.message
    });
  }
};

// GET /api/employees/:id
export const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findOne({
      id: req.params.id
    });

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found"
      });
    }

    res.status(200).json(employee);
  } catch (error) {
    console.error("Get employee error:", error);

    res.status(500).json({
      message: "Failed to fetch employee",
      error: error.message
    });
  }
};

// POST /api/employees
export const createEmployee = async (req, res) => {
  try {
    const employee = await Employee.create({
      ...req.body,
      id: req.body.id || generateEmployeeId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assetlist: req.body.assetlist || [],
      assethistory: req.body.assethistory || []
    });

    res.status(201).json(employee);
  } catch (error) {
    console.error("Create employee error:", error);

    res.status(400).json({
      message: "Failed to create employee",
      error: error.message
    });
  }
};

// PUT /api/employees/:id
export const updateEmployee = async (req, res) => {
  try {
    const { id, createdAt, ...updateData } = req.body;

    updateData.updatedAt = new Date().toISOString();

    const employee = await Employee.findOneAndUpdate(
      { id: req.params.id },
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found"
      });
    }

    res.status(200).json(employee);
  } catch (error) {
    console.error("Update employee error:", error);

    res.status(400).json({
      message: "Failed to update employee",
      error: error.message
    });
  }
};

// PATCH /api/employees/:id
export const patchEmployee = async (req, res) => {
  try {
    const { id, createdAt, ...updateData } = req.body;

    updateData.updatedAt = new Date().toISOString();

    const employee = await Employee.findOneAndUpdate(
      { id: req.params.id },
      { $set: updateData },
      {
        new: true,
        runValidators: true
      }
    );

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found"
      });
    }

    res.status(200).json(employee);
  } catch (error) {
    console.error("Patch employee error:", error);

    res.status(400).json({
      message: "Failed to update employee",
      error: error.message
    });
  }
};

// DELETE /api/employees/:id
export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOneAndDelete({
      id: req.params.id
    });

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found"
      });
    }

    res.status(200).json({
      message: "Employee deleted successfully",
      employee
    });
  } catch (error) {
    console.error("Delete employee error:", error);

    res.status(500).json({
      message: "Failed to delete employee",
      error: error.message
    });
  }
};