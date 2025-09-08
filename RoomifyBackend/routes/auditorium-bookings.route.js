const express = require("express");
const auditoriumBookingsRouter = express.Router();
const auditoriumBookingSchema = require('../models/auditoriumBookingSchema.js');
const auditoriumSchema = require('../models/auditoriumSchema.js');
const auditoriumTimeSlotsSchema = require('../models/auditoriumTimeSlotsSchema.js');

// GET all auditorium bookings
auditoriumBookingsRouter.get("/", async (req, res) => {
    try {
        const bookings = await auditoriumBookingSchema.find({ status: { $ne: 'cancelled' } }, { _id: 0 }).sort({ bookingDate: -1, startTime: 1 });
        res.status(200).send(bookings);
    } catch (error) {
        console.error("Error fetching auditorium bookings:", error);
        res.status(500).send({ message: "Error fetching auditorium bookings", error: error.message });
    }
});

// GET auditorium bookings by user
auditoriumBookingsRouter.get("/user/:userId", async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        if (isNaN(userId)) {
            return res.status(400).send({ message: "Invalid user ID format" });
        }
        
        const bookings = await auditoriumBookingSchema.find({ 
            userId: userId, 
            status: { $ne: 'cancelled' } 
        }, { _id: 0 }).sort({ bookingDate: -1, startTime: 1 });
        
        res.status(200).send(bookings);
    } catch (error) {
        console.error(`Error fetching bookings for user ${req.params.userId}:`, error);
        res.status(500).send({ message: "Error fetching user bookings", error: error.message });
    }
});

// GET availability for specific auditorium on specific date
auditoriumBookingsRouter.get("/availability/:auditoriumId/:date", async (req, res) => {
    try {
        const auditoriumId = parseInt(req.params.auditoriumId);
        const dateParam = req.params.date;
        
        if (isNaN(auditoriumId)) {
            return res.status(400).send({ message: "Invalid auditorium ID format" });
        }
        
        // Validate auditorium exists
        const auditorium = await auditoriumSchema.findOne({ id: auditoriumId, isActive: true });
        if (!auditorium) {
            return res.status(404).send({ message: `Auditorium with ID ${auditoriumId} not found` });
        }
        
        // Parse date
        const requestedDate = new Date(dateParam);
        const startOfDay = new Date(requestedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(requestedDate);
        endOfDay.setHours(23, 59, 59, 999);
        
        // Get all bookings for this auditorium on this date
        const bookings = await auditoriumBookingSchema.find({
            auditoriumId: auditoriumId,
            bookingDate: { $gte: startOfDay, $lte: endOfDay },
            status: { $in: ['confirmed', 'pending'] }
        }, { _id: 0 }).sort({ startTime: 1 });
        
        // Get available time slots
        const timeSlots = await auditoriumTimeSlotsSchema.find({ isActive: true }, { _id: 0 }).sort({ order: 1 });
        
        // Check availability for each time slot
        const availability = timeSlots.map(slot => {
            const isBooked = bookings.some(booking => {
                // Check for time overlap
                return (slot.startTime >= booking.startTime && slot.startTime < booking.endTime) ||
                       (slot.endTime > booking.startTime && slot.endTime <= booking.endTime) ||
                       (slot.startTime <= booking.startTime && slot.endTime >= booking.endTime);
            });
            
            return {
                timeSlot: slot,
                available: !isBooked,
                booking: isBooked ? bookings.find(b => 
                    (slot.startTime >= b.startTime && slot.startTime < b.endTime) ||
                    (slot.endTime > b.startTime && slot.endTime <= b.endTime) ||
                    (slot.startTime <= b.startTime && slot.endTime >= b.endTime)
                ) : null
            };
        });
        
        res.status(200).send({
            auditorium: auditorium,
            date: dateParam,
            availability: availability,
            bookings: bookings
        });
        
    } catch (error) {
        console.error(`Error fetching availability for auditorium ${req.params.auditoriumId}:`, error);
        res.status(500).send({ message: "Error fetching auditorium availability", error: error.message });
    }
});

// CREATE new auditorium booking
auditoriumBookingsRouter.post("/", async (req, res) => {
    try {
        const bookingData = req.body;
        
        // Validate required fields
        if (!bookingData.auditoriumId || !bookingData.userId || !bookingData.startTime || 
            !bookingData.endTime || !bookingData.bookingDate || !bookingData.purpose) {
            return res.status(400).send({ message: "Missing required booking data" });
        }
        
        // Generate booking ID
        const lastBooking = await auditoriumBookingSchema.findOne({}).sort({ id: -1 }).exec();
        let newId = lastBooking && lastBooking.id ? lastBooking.id + 1 : 1;
        if (isNaN(newId)) {
            newId = 1;
        }
        
        // Validate auditorium exists
        const auditorium = await auditoriumSchema.findOne({ 
            id: bookingData.auditoriumId, 
            isActive: true 
        });
        if (!auditorium) {
            return res.status(404).send({ message: "Auditorium not found" });
        }
        
        // Check for conflicts
        const requestedDate = new Date(bookingData.bookingDate);
        const startOfDay = new Date(requestedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(requestedDate);
        endOfDay.setHours(23, 59, 59, 999);
        
        const conflictingBooking = await auditoriumBookingSchema.findOne({
            auditoriumId: bookingData.auditoriumId,
            bookingDate: { $gte: startOfDay, $lte: endOfDay },
            status: { $in: ['confirmed', 'pending'] },
            $or: [
                {
                    startTime: { $lt: bookingData.endTime },
                    endTime: { $gt: bookingData.startTime }
                }
            ]
        });
        
        if (conflictingBooking) {
            return res.status(409).send({ 
                message: "Time slot is already booked",
                conflictingBooking: conflictingBooking 
            });
        }
        
        // Create new booking
        const newBooking = new auditoriumBookingSchema({
            ...bookingData,
            id: newId,
            bookingDate: new Date(bookingData.bookingDate)
        });
        
        const savedBooking = await newBooking.save();
        const bookingResponse = await auditoriumBookingSchema.findOne({ id: savedBooking.id }, { _id: 0 });
        res.status(201).send(bookingResponse);
        
    } catch (error) {
        console.error("Error creating auditorium booking:", error);
        res.status(500).send({ message: "Error creating auditorium booking", error: error.message });
    }
});

// UPDATE auditorium booking
auditoriumBookingsRouter.put("/:id", async (req, res) => {
    try {
        const bookingId = parseInt(req.params.id);
        if (isNaN(bookingId)) {
            return res.status(400).send({ message: "Invalid booking ID format" });
        }
        
        const updateData = { ...req.body, updatedAt: new Date() };
        
        // Check if booking exists
        const existingBooking = await auditoriumBookingSchema.findOne({ id: bookingId });
        if (!existingBooking) {
            return res.status(404).send({ message: `Booking with ID ${bookingId} not found` });
        }
        
        // If updating time or date, check for conflicts
        if (updateData.startTime || updateData.endTime || updateData.bookingDate) {
            const checkDate = updateData.bookingDate ? new Date(updateData.bookingDate) : existingBooking.bookingDate;
            const checkStartTime = updateData.startTime || existingBooking.startTime;
            const checkEndTime = updateData.endTime || existingBooking.endTime;
            
            const startOfDay = new Date(checkDate);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(checkDate);
            endOfDay.setHours(23, 59, 59, 999);
            
            const conflictingBooking = await auditoriumBookingSchema.findOne({
                id: { $ne: bookingId }, // Exclude current booking
                auditoriumId: existingBooking.auditoriumId,
                bookingDate: { $gte: startOfDay, $lte: endOfDay },
                status: { $in: ['confirmed', 'pending'] },
                $or: [
                    {
                        startTime: { $lt: checkEndTime },
                        endTime: { $gt: checkStartTime }
                    }
                ]
            });
            
            if (conflictingBooking) {
                return res.status(409).send({ 
                    message: "Updated time slot conflicts with existing booking",
                    conflictingBooking: conflictingBooking 
                });
            }
        }
        
        // Update booking
        await auditoriumBookingSchema.updateOne({ id: bookingId }, { $set: updateData });
        
        // Return updated booking
        const updatedBooking = await auditoriumBookingSchema.findOne({ id: bookingId }, { _id: 0 });
        res.status(200).send(updatedBooking);
        
    } catch (error) {
        console.error(`Error updating auditorium booking ${req.params.id}:`, error);
        res.status(500).send({ message: "Error updating auditorium booking", error: error.message });
    }
});

// CANCEL auditorium booking
auditoriumBookingsRouter.patch("/:id/cancel", async (req, res) => {
    try {
        const bookingId = parseInt(req.params.id);
        if (isNaN(bookingId)) {
            return res.status(400).send({ message: "Invalid booking ID format" });
        }
        
        // Check if booking exists
        const existingBooking = await auditoriumBookingSchema.findOne({ id: bookingId });
        if (!existingBooking) {
            return res.status(404).send({ message: `Booking with ID ${bookingId} not found` });
        }
        
        if (existingBooking.status === 'cancelled') {
            return res.status(400).send({ message: "Booking is already cancelled" });
        }
        
        // Cancel booking
        await auditoriumBookingSchema.updateOne(
            { id: bookingId }, 
            { $set: { status: 'cancelled', updatedAt: new Date() } }
        );
        
        const updatedBooking = await auditoriumBookingSchema.findOne({ id: bookingId }, { _id: 0 });
        res.status(200).send(updatedBooking);
        
    } catch (error) {
        console.error(`Error cancelling auditorium booking ${req.params.id}:`, error);
        res.status(500).send({ message: "Error cancelling auditorium booking", error: error.message });
    }
});

// DELETE auditorium booking (hard delete - use with caution)
auditoriumBookingsRouter.delete("/:id", async (req, res) => {
    try {
        const bookingId = parseInt(req.params.id);
        if (isNaN(bookingId)) {
            return res.status(400).send({ message: "Invalid booking ID format" });
        }
        
        // Check if booking exists
        const existingBooking = await auditoriumBookingSchema.findOne({ id: bookingId });
        if (!existingBooking) {
            return res.status(404).send({ message: `Booking with ID ${bookingId} not found` });
        }
        
        // Delete booking
        await auditoriumBookingSchema.deleteOne({ id: bookingId });
        
        res.status(200).send({ message: `Auditorium booking with ID ${bookingId} successfully deleted` });
        
    } catch (error) {
        console.error(`Error deleting auditorium booking ${req.params.id}:`, error);
        res.status(500).send({ message: "Error deleting auditorium booking", error: error.message });
    }
});

module.exports = auditoriumBookingsRouter;