const mongoose = require("mongoose");

const maintenanceSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: String, required: true }, // Admin who created this maintenance period
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { collection: "maintenance", versionKey: false }
);

// Create index for efficient date range queries
maintenanceSchema.index({ startDate: 1, endDate: 1, isActive: 1 });

module.exports = mongoose.model("maintenance", maintenanceSchema);