const generateId = () => {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 10)}`;
};

export const createCrudController = (Model) => ({
  // GET /resource
  getAll: async (req, res) => {
    try {
      const data = await Model.find();
      if(Model=="Asset"){
       console.log("Get all data:", data);}
      res.status(200).json(data);
    } catch (error) {
      console.error("Get all error:", error);

      res.status(500).json({
        message: "Failed to fetch data",
        error: error.message,
      });
    }
  },

  // GET /resource/:id
  getOne: async (req, res) => {
    try {
      const data = await Model.findOne({
        id: req.params.id,
      }).lean();

      if (!data) {
        return res.status(404).json({
          message: "Data not found",
        });
      }

      res.status(200).json(data);
    } catch (error) {
      console.error("Get one error:", error);

      res.status(500).json({
        message: "Failed to fetch data",
        error: error.message,
      });
    }
  },

  // POST /resource
  create: async (req, res) => {
    try {
      const data = {
        ...req.body,

        id: req.body.id || generateId(),

        createdAt:
          req.body.createdAt || new Date().toISOString(),

        updatedAt: new Date().toISOString(),
      };

      const created = await Model.create(data);

      res.status(201).json(created);
    } catch (error) {
      console.error("Create error:", error);

      res.status(400).json({
        message: "Failed to create data",
        error: error.message,
      });
    }
  },

  // PUT /resource/:id
  update: async (req, res) => {
    try {
      const updated = await Model.findOneAndUpdate(
        {
          id: req.params.id,
        },
        {
          ...req.body,
          updatedAt: new Date().toISOString(),
        },
        {
          new: true,
          runValidators: true,
        }
      ).lean();

      if (!updated) {
        return res.status(404).json({
          message: "Data not found",
        });
      }

      res.status(200).json(updated);
    } catch (error) {
      console.error("Update error:", error);

      res.status(400).json({
        message: "Failed to update data",
        error: error.message,
      });
    }
  },

  // PATCH /resource/:id
  patch: async (req, res) => {
    try {
      const updated = await Model.findOneAndUpdate(
        {
          id: req.params.id,
        },
        {
          $set: {
            ...req.body,
            updatedAt: new Date().toISOString(),
          },
        },
        {
          new: true,
          runValidators: true,
        }
      ).lean();

      if (!updated) {
        return res.status(404).json({
          message: "Data not found",
        });
      }

      res.status(200).json(updated);
    } catch (error) {
      console.error("Patch error:", error);

      res.status(400).json({
        message: "Failed to update data",
        error: error.message,
      });
    }
  },

  // DELETE /resource/:id
  remove: async (req, res) => {
    try {
      const deleted = await Model.findOneAndDelete({
        id: req.params.id,
      });

      if (!deleted) {
        return res.status(404).json({
          message: "Data not found",
        });
      }

      res.status(200).json(deleted);
    } catch (error) {
      console.error("Delete error:", error);

      res.status(500).json({
        message: "Failed to delete data",
        error: error.message,
      });
    }
  },
});