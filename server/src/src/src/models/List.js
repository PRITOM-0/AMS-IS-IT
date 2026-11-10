import mongoose from "mongoose";

const listSchema = new mongoose.Schema(
  {
    company: {
      type: [String],
      default: [],
    },

    Location: {
      type: [String],
      default: [],
    },

    department: {
      type: [String],
      default: [],
    },

    assetStatuses: {
      type: [String],
      default: [],
    },

    surveyStatuses: {
      type: [String],
      default: [],
    },

    taskStatuses: {
      type: [String],
      default: [],
    },

    equipment: {
      type: [String],
      default: [],
    },

    validateEquipments: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    brand: {
      type: [String],
      default: [],
    },
  },
  {
    versionKey: false,
  }
);

export default mongoose.model("List", listSchema);