const mongoose = require("mongoose");

const auditoriumTimeSlotsSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, required: true },
    startTime: { type: String, required: true }, // "09:00"
    endTime: { type: String, required: true },   // "10:00"
    displayName: { type: String, required: true }, // "9:00 AM - 10:00 AM"
    isActive: { type: Boolean, default: true },
    order: { type: Number, required: true } // for sorting time slots
  },
  { collection: "auditorium-time-slots", versionKey: false }
);

// Index for performance
auditoriumTimeSlotsSchema.index({ isActive: 1, order: 1 });

module.exports = mongoose.model("auditorium-time-slots", auditoriumTimeSlotsSchema);