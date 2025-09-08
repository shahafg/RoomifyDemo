const mongoose = require("mongoose");

const auditoriumSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, required: true },
    name: { type: String, required: true },
    buildingId: { type: Number, required: true }, // reference to buildings
    capacity: { type: Number, required: true },
    features: [{ type: String }], // projectors, sound system, etc.
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { collection: "auditoriums", versionKey: false }
);

// Index for performance
auditoriumSchema.index({ buildingId: 1, isActive: 1 });
auditoriumSchema.index({ isActive: 1, capacity: 1 });

module.exports = mongoose.model("auditoriums", auditoriumSchema);