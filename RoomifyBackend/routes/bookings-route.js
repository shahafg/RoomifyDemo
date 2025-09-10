const express = require("express");
const bookingsRouter = express.Router();
const bookingSchema = require('../models/BookingSchema.js');
const roomSchema = require('../models/roomSchema.js');
const maintenanceSchema = require('../models/maintenance_schema.js');
const AuditService = require('../services/auditService.js'); 

// Helper function to check if booking conflicts with maintenance periods
const checkMaintenanceConflict = async (bookingDate, startTime, endTime) => {
    // Create full datetime objects for the booking
    const bookingStartDateTime = new Date(`${bookingDate}T${startTime}`);
    const bookingEndDateTime = new Date(`${bookingDate}T${endTime}`);
    
    // Check for overlapping active maintenance periods
    const overlappingMaintenance = await maintenanceSchema.find({
        isActive: true,
        $or: [
            // Booking starts during maintenance
            { startDate: { $lte: bookingStartDateTime }, endDate: { $gt: bookingStartDateTime } },
            // Booking ends during maintenance
            { startDate: { $lt: bookingEndDateTime }, endDate: { $gte: bookingEndDateTime } },
            // Booking completely encompasses maintenance period
            { startDate: { $gte: bookingStartDateTime }, endDate: { $lte: bookingEndDateTime } }
        ]
    });
    
    return overlappingMaintenance;
};

// GET all bookings
bookingsRouter.get("/", async (req, res) => {
    try {
        let bookings = await bookingSchema.find({}, { _id: 0 }).sort({ bookingDate: -1, startTime: -1 });
        res.status(200).send(bookings);
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).send({ message: "Error fetching bookings", error: error.message });
    }
});

// GET booking by ID
bookingsRouter.get("/:id", async (req, res) => {
    try {
        const bookingId = parseInt(req.params.id);
        if (isNaN(bookingId)) {
            return res.status(400).send({ message: "Invalid booking ID format" });
        }
        
        const booking = await bookingSchema.findOne({ id: bookingId }, { _id: 0 });
        
        if (!booking) {
            return res.status(404).send({ message: `Booking with ID ${bookingId} not found` });
        }
        
        res.status(200).send(booking);
    } catch (error) {
        console.error(`Error fetching booking ${req.params.id}:`, error);
        res.status(500).send({ message: "Error fetching booking", error: error.message });
    }
});

// GET bookings by room
bookingsRouter.get("/room/:roomId", async (req, res) => {
    try {
        const roomId = parseInt(req.params.roomId);
        if (isNaN(roomId)) {
            return res.status(400).send({ message: "Invalid room ID format" });
        }
        
        const bookings = await bookingSchema.find({ roomId: roomId, status: 'active' }, { _id: 0 })
            .sort({ bookingDate: 1, startTime: 1 });
        
        res.status(200).send(bookings);
    } catch (error) {
        console.error(`Error fetching bookings for room ${req.params.roomId}:`, error);
        res.status(500).send({ message: "Error fetching bookings by room", error: error.message });
    }
});

// GET bookings by date
bookingsRouter.get("/date/:date", async (req, res) => {
    try {
        const dateStr = req.params.date;
        const startDate = new Date(dateStr);
        const endDate = new Date(dateStr);
        endDate.setDate(endDate.getDate() + 1);
        
        const bookings = await bookingSchema.find({ 
            bookingDate: { $gte: startDate, $lt: endDate },
            status: 'active'
        }, { _id: 0 }).sort({ startTime: 1 });
        
        res.status(200).send(bookings);
    } catch (error) {
        console.error(`Error fetching bookings for date ${req.params.date}:`, error);
        res.status(500).send({ message: "Error fetching bookings by date", error: error.message });
    }
});

// Check availability for a specific time slot (updated with maintenance check)
bookingsRouter.post("/check-availability", async (req, res) => {
    try {
        const { roomId, bookingDate, startTime, endTime } = req.body;
        
        if (!roomId || !bookingDate || !startTime || !endTime) {
            return res.status(400).send({ message: "Missing required fields" });
        }
        
        // First check for maintenance conflicts
        const maintenanceConflicts = await checkMaintenanceConflict(bookingDate, startTime, endTime);
        
        if (maintenanceConflicts.length > 0) {
            return res.status(200).send({ 
                available: false,
                conflicts: [],
                maintenanceConflicts: maintenanceConflicts,
                reason: "System is under maintenance during the requested time period"
            });
        }
        
        // Convert date string to Date object for comparison
        const requestedDate = new Date(bookingDate);
        const startOfDay = new Date(requestedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(requestedDate);
        endOfDay.setHours(23, 59, 59, 999);
        
        // Check for overlapping bookings
        const overlappingBookings = await bookingSchema.find({
            roomId: roomId,
            bookingDate: { $gte: startOfDay, $lte: endOfDay },
            status: 'active',
            $or: [
                // New booking starts during existing booking
                { startTime: { $lte: startTime }, endTime: { $gt: startTime } },
                // New booking ends during existing booking
                { startTime: { $lt: endTime }, endTime: { $gte: endTime } },
                // New booking completely encompasses existing booking
                { startTime: { $gte: startTime }, endTime: { $lte: endTime } }
            ]
        });
        
        const isAvailable = overlappingBookings.length === 0;
        
        res.status(200).send({ 
            available: isAvailable,
            conflicts: overlappingBookings,
            maintenanceConflicts: []
        });
    } catch (error) {
        console.error("Error checking availability:", error);
        res.status(500).send({ message: "Error checking availability", error: error.message });
    }
});

// CREATE new booking (updated with maintenance check)
bookingsRouter.post("/", async (req, res) => {
    try {
        const bookingData = req.body;
        
        // Validate required fields
        if (!bookingData.roomId || !bookingData.bookingDate || !bookingData.startTime || 
            !bookingData.endTime || !bookingData.purpose || !bookingData.attendees) {
            return res.status(400).send({ message: "Missing required booking information" });
        }
        
        // Check for maintenance conflicts first
        const maintenanceConflicts = await checkMaintenanceConflict(
            bookingData.bookingDate, 
            bookingData.startTime, 
            bookingData.endTime
        );
        
        if (maintenanceConflicts.length > 0) {
            return res.status(423).send({ // 423 Locked
                message: "Cannot create booking during maintenance period",
                maintenanceConflicts: maintenanceConflicts
            });
        }
        
        // Check if room exists
        const room = await roomSchema.findOne({ id: bookingData.roomId });
        if (!room) {
            return res.status(404).send({ message: `Room with ID ${bookingData.roomId} not found` });
        }
        
        // Check if attendees exceed room capacity
        if (bookingData.attendees > room.capacity) {
            return res.status(400).send({ 
                message: `Number of attendees (${bookingData.attendees}) exceeds room capacity (${room.capacity})` 
            });
        }
        
        // Check availability
        const availabilityCheck = await bookingsRouter.checkAvailabilityInternal(
            bookingData.roomId,
            bookingData.bookingDate,
            bookingData.startTime,
            bookingData.endTime
        );
        
        if (!availabilityCheck.available) {
            return res.status(409).send({ 
                message: "Room is not available for the selected time slot",
                conflicts: availabilityCheck.conflicts
            });
        }
        
        // Generate new booking ID
        const lastBooking = await bookingSchema.findOne().sort({ id: -1 });
        const newId = lastBooking ? lastBooking.id + 1 : 1;
        
        // Create new booking
        const newBooking = new bookingSchema({
            id: newId,
            roomId: bookingData.roomId,
            roomName: room.name,
            building: room.building,
            floor: room.floor,
            bookingDate: new Date(bookingData.bookingDate),
            startTime: bookingData.startTime,
            endTime: bookingData.endTime,
            purpose: bookingData.purpose,
            attendees: bookingData.attendees,
            additionalNotes: bookingData.additionalNotes || '',
            bookedBy: bookingData.bookedBy || 'Anonymous',
            status: 'active'
        });
        
        const savedBooking = await newBooking.save();
        
        // Update room status if booking is for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const bookingDateOnly = new Date(bookingData.bookingDate);
        bookingDateOnly.setHours(0, 0, 0, 0);
        
        if (bookingDateOnly.getTime() === today.getTime()) {
            const currentTime = new Date().toTimeString().slice(0, 5);
            if (currentTime >= bookingData.startTime && currentTime < bookingData.endTime) {
                await roomSchema.updateOne({ id: bookingData.roomId }, { $set: { status: 1 } });
            }
        }
        
        const bookingResponse = await bookingSchema.findOne({ id: savedBooking.id }, { _id: 0 });

        // Log booking creation - extract user from bookedBy field
        const user = { email: bookingData.bookedBy, id: null };
        await AuditService.logBookingAction('CREATE', bookingResponse, user, req);

        res.status(201).send({
            message: "Booking created successfully",
            booking: bookingResponse
        });
    } catch (error) {
        console.error("Error creating booking:", error);
        res.status(500).send({ message: "Error creating booking", error: error.message });
    }
});

// Internal helper function for checking availability (updated with maintenance check)
bookingsRouter.checkAvailabilityInternal = async function(roomId, bookingDate, startTime, endTime) {
    // Check for maintenance conflicts first
    const maintenanceConflicts = await checkMaintenanceConflict(bookingDate, startTime, endTime);
    
    if (maintenanceConflicts.length > 0) {
        return {
            available: false,
            conflicts: [],
            maintenanceConflicts: maintenanceConflicts
        };
    }
    
    const requestedDate = new Date(bookingDate);
    const startOfDay = new Date(requestedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(requestedDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const overlappingBookings = await bookingSchema.find({
        roomId: roomId,
        bookingDate: { $gte: startOfDay, $lte: endOfDay },
        status: 'active',
        $or: [
            { startTime: { $lte: startTime }, endTime: { $gt: startTime } },
            { startTime: { $lt: endTime }, endTime: { $gte: endTime } },
            { startTime: { $gte: startTime }, endTime: { $lte: endTime } }
        ]
    });
    
    return {
        available: overlappingBookings.length === 0,
        conflicts: overlappingBookings,
        maintenanceConflicts: []
    };
};

// UPDATE booking (updated with maintenance check)
bookingsRouter.put("/:id", async (req, res) => {
    try {
        const bookingId = parseInt(req.params.id);
        if (isNaN(bookingId)) {
            return res.status(400).send({ message: "Invalid booking ID format" });
        }
        
        const updateData = req.body;
        
        // Check if booking exists
        const existingBooking = await bookingSchema.findOne({ id: bookingId });
        if (!existingBooking) {
            return res.status(404).send({ message: `Booking with ID ${bookingId} not found` });
        }
        
        // If updating time/date, check for maintenance conflicts and availability
        if (updateData.bookingDate || updateData.startTime || updateData.endTime) {
            const checkDate = updateData.bookingDate || existingBooking.bookingDate.toISOString().split('T')[0];
            const checkStart = updateData.startTime || existingBooking.startTime;
            const checkEnd = updateData.endTime || existingBooking.endTime;
            const checkRoomId = updateData.roomId || existingBooking.roomId;
            
            // Check for maintenance conflicts
            const maintenanceConflicts = await checkMaintenanceConflict(checkDate, checkStart, checkEnd);
            
            if (maintenanceConflicts.length > 0) {
                return res.status(423).send({ 
                    message: "Cannot update booking to a time during maintenance period",
                    maintenanceConflicts: maintenanceConflicts
                });
            }
            
            const availabilityCheck = await bookingsRouter.checkAvailabilityInternal(
                checkRoomId, checkDate, checkStart, checkEnd
            );
            
            // Filter out the current booking from conflicts
            const otherConflicts = availabilityCheck.conflicts.filter(b => b.id !== bookingId);
            
            if (otherConflicts.length > 0) {
                return res.status(409).send({ 
                    message: "Room is not available for the selected time slot",
                    conflicts: otherConflicts
                });
            }
        }
        
        // Store old values for audit
        const oldValues = {
            roomId: existingBooking.roomId,
            roomName: existingBooking.roomName,
            bookingDate: existingBooking.bookingDate,
            startTime: existingBooking.startTime,
            endTime: existingBooking.endTime,
            purpose: existingBooking.purpose,
            status: existingBooking.status
        };

        // Update booking
        await bookingSchema.updateOne({ id: bookingId }, { $set: updateData });
        
        // Return the updated booking
        const updatedBooking = await bookingSchema.findOne({ id: bookingId }, { _id: 0 });

        // Log booking update
        const user = { email: existingBooking.bookedBy, id: null };
        await AuditService.logBookingAction('UPDATE', updatedBooking, user, req, oldValues);

        res.status(200).send(updatedBooking);
    } catch (error) {
        console.error(`Error updating booking ${req.params.id}:`, error);
        res.status(500).send({ message: "Error updating booking", error: error.message });
    }
});

// CANCEL booking (soft delete)
bookingsRouter.delete("/:id", async (req, res) => {
    try {
        const bookingId = parseInt(req.params.id);
        if (isNaN(bookingId)) {
            return res.status(400).send({ message: "Invalid booking ID format" });
        }
        
        // Check if booking exists
        const existingBooking = await bookingSchema.findOne({ id: bookingId });
        if (!existingBooking) {
            return res.status(404).send({ message: `Booking with ID ${bookingId} not found` });
        }
        
        // Update booking status to cancelled instead of deleting
        await bookingSchema.updateOne({ id: bookingId }, { $set: { status: 'cancelled' } });
        
        // If this was today's booking and currently active, update room status
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const bookingDateOnly = new Date(existingBooking.bookingDate);
        bookingDateOnly.setHours(0, 0, 0, 0);
        
        if (bookingDateOnly.getTime() === today.getTime()) {
            const currentTime = new Date().toTimeString().slice(0, 5);
            if (currentTime >= existingBooking.startTime && currentTime < existingBooking.endTime) {
                await roomSchema.updateOne({ id: existingBooking.roomId }, { $set: { status: 0 } });
            }
        }

        // Log booking cancellation
        const user = { email: existingBooking.bookedBy, id: null };
        await AuditService.logBookingAction('DELETE', existingBooking, user, req);
        
        res.status(200).send({ message: `Booking with ID ${bookingId} has been cancelled` });
    } catch (error) {
        console.error(`Error cancelling booking ${req.params.id}:`, error);
        res.status(500).send({ message: "Error cancelling booking", error: error.message });
    }
});

module.exports = bookingsRouter;