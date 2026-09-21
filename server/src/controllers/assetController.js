import Asset from "../models/Asset.js";

// GET /api/assets
export const getAssets = async (req, res) => {
  try {
    const assets = await Asset.find().sort({ createdAt: -1 });

    res.status(200).json(assets);
  } catch (error) {
    console.error("Get assets error:", error);

    res.status(500).json({
      message: "Failed to fetch assets",
      error: error.message
    });
  }
};

// GET /api/assets/:id
export const getAssetById = async (req, res) => {
  try {
     
    const asset = await Asset.findOne({
      _id: req.params.id
    });

    if (!asset) {
      return res.status(404).json({
        message: "Asset not found"
      });
    }

    res.status(200).json(asset);
  } catch (error) {
    console.error("Get asset error:", error);

    res.status(500).json({
      message: "Failed to fetch asset",
      error: error.message
    });
  }
};

// POST /api/assets
export const createAsset = async (req, res) => {
  try {
    const assetData = {
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const asset = await Asset.create(assetData);

    res.status(201).json(asset);
  } catch (error) {
    console.error("Create asset error:", error);

    res.status(400).json({
      message: "Failed to create asset",
      error: error.message
    });
  }
};

// PUT /api/assets/:id
export const updateAsset = async (req, res) => {
  try {
    const {_id,createdAt, ...updateData } = req.body;

    updateData.updatedAt = new Date().toISOString();
    
    const asset = await Asset.findOneAndUpdate(
      { _id: req.params.id },
      updateData,
      {
        returnDocument: "after",
        runValidators: true
      }
    );
    

    if (!asset) {
      return res.status(404).json({
        message: "Asset not found"
      });
    }

    res.status(200).json(asset);
  } catch (error) {
    console.error("Update asset error:", error);

    res.status(400).json({
      message: "Failed to update asset",
      error: error.message
    });
  }
};

// PATCH /api/assets/:id
export const patchAsset = async (req, res) => {
  try {
    const { _id, createdAt, ...updateData } = req.body;

    updateData.updatedAt = new Date().toISOString();

    const asset = await Asset.findOneAndUpdate(
      { _id: req.params._id },
      { $set: updateData },
      {
        new: true,
        runValidators: true
      }
    );

    if (!asset) {
      return res.status(404).json({
        message: "Asset not found"
      });
    }

    res.status(200).json(asset);
  } catch (error) {
    console.error("Patch asset error:", error);

    res.status(400).json({
      message: "Failed to update asset",
      error: error.message
    });
  }
};

// DELETE /api/assets/:id
export const deleteAsset = async (req, res) => {
  try {
    const asset = await Asset.findOneAndDelete({
      _id: req.params._id
    });

    if (!asset) {
      return res.status(404).json({
        message: "Asset not found"
      });
    }

    res.status(200).json({
      message: "Asset deleted successfully",
      asset
    });
  } catch (error) {
    console.error("Delete asset error:", error);

    res.status(500).json({
      message: "Failed to delete asset",
      error: error.message
    });
  }
};