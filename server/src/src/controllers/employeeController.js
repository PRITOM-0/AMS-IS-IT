import Employee from "../models/Employee.js";
import Asset from "../models/Asset.js";


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
      _id: req.params.id
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
    const {createdAt, ...updateData } = req.body;

    updateData.updatedAt = new Date().toISOString();

    const employee = await Employee.findOneAndUpdate(
      { _id: req.params.id },
      updateData,
      {
        returnDocument: "after",
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
    const {createdAt, ...updateData } = req.body;

    updateData.updatedAt = new Date().toISOString();

    const employee = await Employee.findOneAndUpdate(
      { _id: req.params.id },
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
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    // Remove this employee from all assigned assets
    if (Array.isArray(employee.assetlist) && employee.assetlist.length > 0) {
      await Asset.updateMany(
        {
          _id: { $in: employee.assetlist },
          employeeId: employee._id,
        },
        {
          $set: {
            employeeId: null,
            receivedDate: null,
          },
        }
      );
    }

    // Delete employee
    await Employee.findByIdAndDelete(employee._id);

    res.status(200).json({
      message: "Employee deleted successfully",
      employee,
    });
  } catch (error) {
    console.error("Delete employee error:", error);

    res.status(500).json({
      message: "Failed to delete employee",
      error: error.message,
    });
  }
};