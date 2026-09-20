import Task from "../models/Task.js";

const generateTaskId = () => {
  return `TSK-${Date.now()}`;
};

// GET /api/tasks
export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find().sort({
      createdAt: -1
    });

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Get tasks error:", error);

    res.status(500).json({
      message: "Failed to fetch tasks",
      error: error.message
    });
  }
};

// GET /api/tasks/:id
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({
      id: req.params.id
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    res.status(200).json(task);
  } catch (error) {
    console.error("Get task error:", error);

    res.status(500).json({
      message: "Failed to fetch task",
      error: error.message
    });
  }
};

// POST /api/tasks
export const createTask = async (req, res) => {
  try {
    const now = new Date().toISOString();

    const task = await Task.create({
      ...req.body,

      id: req.body.id || generateTaskId(),

      taskId:
        req.body.taskId ||
        `TSK-${Date.now()}`,

      createdAt: req.body.createdAt || now,
      updatedAt: now
    });

    res.status(201).json(task);
  } catch (error) {
    console.error("Create task error:", error);

    res.status(400).json({
      message: "Failed to create task",
      error: error.message
    });
  }
};

// PUT /api/tasks/:id
export const updateTask = async (req, res) => {
  try {
    const {
      id,
      createdAt,
      ...updateData
    } = req.body;

    updateData.updatedAt = new Date().toISOString();

    const task = await Task.findOneAndUpdate(
      { id: req.params.id },
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    res.status(200).json(task);
  } catch (error) {
    console.error("Update task error:", error);

    res.status(400).json({
      message: "Failed to update task",
      error: error.message
    });
  }
};

// PATCH /api/tasks/:id
export const patchTask = async (req, res) => {
  try {
    const {
      id,
      createdAt,
      ...updateData
    } = req.body;

    updateData.updatedAt = new Date().toISOString();

    const task = await Task.findOneAndUpdate(
      { id: req.params.id },
      { $set: updateData },
      {
        new: true,
        runValidators: true
      }
    );

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    res.status(200).json(task);
  } catch (error) {
    console.error("Patch task error:", error);

    res.status(400).json({
      message: "Failed to update task",
      error: error.message
    });
  }
};

// DELETE /api/tasks/:id
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      id: req.params.id
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    res.status(200).json({
      message: "Task deleted successfully",
      task
    });
  } catch (error) {
    console.error("Delete task error:", error);

    res.status(500).json({
      message: "Failed to delete task",
      error: error.message
    });
  }
};