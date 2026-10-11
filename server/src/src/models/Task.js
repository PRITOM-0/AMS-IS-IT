import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    taskId: {
      type: String,
      default: "",
    },
    taskName: {
      type: String,
      default: "",
    },

    createdAt: {
      type: String,
      default: () => new Date().toISOString(),
    },

    updatedAt: {
      type: String,
      default: () => new Date().toISOString(),
    },

    assetId: {
      type: String,
      default: "",
    },

    assetName: {
      type: String,
      default: "",
    },

    assetCode: {
      type: String,
      default: "",
    },

    equipment: {
      type: String,
      default: "",
    },

    username: {
      type: String,
      default: "",
    },

    company: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      default: "",
    },

    complainMode: {
      type: String,
      default: "",
    },

    complainDate: {
      type: String,
      default: "",
    },

    itPersonName: {
      type: String,
      default: "",
    },

    progress: {
      type: String,
      default: "",
    },

    priority: {
      type: String,
      default: "",
    },

    taskStartDate: {
      type: String,
      default: "",
    },

    taskCompleteDate: {
      type: String,
      default: "",
    },

    taskFinishingDate: {
      type: String,
      default: "",
    },

    days: {
      type: Number,
      default: 0,
    },

    timeDuration: {
      type: String,
      default: "",
    },

    reasonForDelay: {
      type: String,
      default: "",
    },

    mainCategory: {
      type: String,
      default: "",
    },

    subCategory: {
      type: String,
      default: "",
    },

    issueSummary: {
      type: String,
      default: "",
    },

    stepInDetails: {
      type: String,
      default: "",
    },
  },
  {
    versionKey: false,
  }
);

export default mongoose.model("Task", taskSchema);