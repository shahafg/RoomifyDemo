const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, required: true },
    roomId: { type: Number, required: true },
    roomName: { type: String, required: true },
    building: { type: String, required: true },
    floor: { type: Number, required: true },
    bookingDate: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    purpose: { type: String, required: true },
    attendees: { type: Number, required: true },
    additionalNotes: { type: String },
    bookedBy: { type: String, required: true }, // User who made the booking
    bookedAt: { type: Date, default: Date.now }, // When the booking was created
    status: { 
      type: String, 
      enum: ['active', 'cancelled', 'completed'],
      default: 'active'
    }
  },
  { collection: "bookings", versionKey: false }
);

// Create a compound index to prevent double booking
bookingSchema.index({ roomId: 1, bookingDate: 1, startTime: 1, endTime: 1 });

module.exports = mongoose.model("bookings", bookingSchema);