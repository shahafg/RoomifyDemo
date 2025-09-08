const mongoose = require("mongoose");

const auditoriumBookingSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, required: true },
    auditoriumId: { type: Number, required: true },
    userId: { type: Number, required: true },
    startTime: { type: String, required: true }, // "09:00"
    endTime: { type: String, required: true },   // "10:00"
    bookingDate: { type: Date, required: true },
    purpose: { type: String, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'confirmed' },
    attendeeCount: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { collection: "auditorium-bookings", versionKey: false }
);

// Critical indexes for conflict detection and performance
auditoriumBookingSchema.index({ 
  auditoriumId: 1, 
  bookingDate: 1, 
  startTime: 1, 
  endTime: 1 
});
auditoriumBookingSchema.index({ bookingDate: 1, status: 1 });
auditoriumBookingSchema.index({ userId: 1, bookingDate: -1 });
auditoriumBookingSchema.index({ auditoriumId: 1, status: 1, bookingDate: 1 });

module.exports = mongoose.model("auditorium-bookings", auditoriumBookingSchema);