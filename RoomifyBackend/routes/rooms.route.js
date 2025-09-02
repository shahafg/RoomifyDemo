const express = require("express");
const roomsRouter = express.Router();
const roomSchema = require('../models/roomSchema.js');
const bookingSchema = require('../models/BookingSchema.js');

// GET all rooms
roomsRouter.get("/", async (req, res) => {
    try {
        let rooms = await roomSchema.find({}, { _id: 0 });
        res.status(200).send(rooms);
    } catch (error) {
        console.error("Error fetching rooms:", error);
        res.status(500).send({ message: "Error fetching rooms", error: error.message });
    }
});

// GET room by ID
roomsRouter.get("/:id", async (req, res) => {
    try {
        const roomId = parseInt(req.params.id);
        if (isNaN(roomId)) {
            return res.status(400).send({ message: "Invalid room ID format" });
        }
        
        const room = await roomSchema.findOne({ id: roomId }, { _id: 0 });
        
        if (!room) {
            return res.status(404).send({ message: `Room with ID ${roomId} not found` });
        }
        
        res.status(200).send(room);
    } catch (error) {
        console.error(`Error fetching room ${req.params.id}:`, error);
        res.status(500).send({ message: "Error fetching room", error: error.message });
    }
});

// GET rooms by building
roomsRouter.get("/building/:buildingName", async (req, res) => {
    try {
        const buildingName = req.params.buildingName;
        
        const rooms = await roomSchema.find({ building: buildingName }, { _id: 0 });
        
        if (rooms.length === 0) {
            return res.status(404).send({ message: `No rooms found in building ${buildingName}` });
        }
        
        res.status(200).send(rooms);
    } catch (error) {
        console.error(`Error fetching rooms for building ${req.params.buildingName}:`, error);
        res.status(500).send({ message: "Error fetching rooms by building", error: error.message });
    }
});

// GET rooms by type
roomsRouter.get("/type/:roomType", async (req, res) => {
    try {
        const roomType = req.params.roomType;
        
        const rooms = await roomSchema.find({ type: roomType }, { _id: 0 });
        
        if (rooms.length === 0) {
            return res.status(404).send({ message: `No rooms found with type ${roomType}` });
        }
        
        res.status(200).send(rooms);
    } catch (error) {
        console.error(`Error fetching rooms of type ${req.params.roomType}:`, error);
        res.status(500).send({ message: "Error fetching rooms by type", error: error.message });
    }
});

// GET available rooms
roomsRouter.get("/status/:statusCode", async (req, res) => {
    try {
        const statusCode = parseInt(req.params.statusCode);
        if (isNaN(statusCode)) {
            return res.status(400).send({ message: "Invalid status code format" });
        }
        
        const rooms = await roomSchema.find({ status: statusCode }, { _id: 0 });
        
        res.status(200).send(rooms);
    } catch (error) {
        console.error(`Error fetching rooms with status ${req.params.statusCode}:`, error);
        res.status(500).send({ message: "Error fetching rooms by status", error: error.message });
    }
});

// GET room schedule with availability for a specific date
roomsRouter.get("/:id/schedule/:date", async (req, res) => {
    try {
        const roomId = parseInt(req.params.id);
        const date = req.params.date;
        
        if (isNaN(roomId)) {
            return res.status(400).send({ message: "Invalid room ID format" });
        }
        
        // Get room information
        const room = await roomSchema.findOne({ id: roomId }, { _id: 0 });
        if (!room) {
            return res.status(404).send({ message: `Room with ID ${roomId} not found` });
        }
        
        // Get bookings for the specific date
        const requestedDate = new Date(date);
        const startOfDay = new Date(requestedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(requestedDate);
        endOfDay.setHours(23, 59, 59, 999);
        
        const bookings = await bookingSchema.find({
            roomId: roomId,
            bookingDate: { $gte: startOfDay, $lte: endOfDay },
            status: 'active'
        }, { _id: 0 }).sort({ startTime: 1 });
        
        // Generate time slots (8:00 AM to 6:00 PM in 1-hour intervals)
        const timeSlots = [];
        for (let hour = 8; hour <= 18; hour++) {
            const timeString = `${hour.toString().padStart(2, '0')}:00`;
            const endTimeString = `${(hour + 1).toString().padStart(2, '0')}:00`;
            
            // Check if this time slot conflicts with any booking
            const isBooked = bookings.some(booking => {
                const bookingStart = booking.startTime;
                const bookingEnd = booking.endTime;
                
                return (timeString >= bookingStart && timeString < bookingEnd) ||
                       (endTimeString > bookingStart && endTimeString <= bookingEnd) ||
                       (timeString <= bookingStart && endTimeString >= bookingEnd);
            });
            
            timeSlots.push({
                time: timeString,
                endTime: endTimeString,
                available: !isBooked,
                booking: isBooked ? bookings.find(b => 
                    (timeString >= b.startTime && timeString < b.endTime) ||
                    (endTimeString > b.startTime && endTimeString <= b.endTime) ||
                    (timeString <= b.startTime && endTimeString >= b.endTime)
                ) : null
            });
        }
        
        // Get current status
        const currentDate = new Date();
        const isToday = currentDate.toDateString() === requestedDate.toDateString();
        const currentTime = currentDate.toTimeString().slice(0, 5);
        
        let currentStatus = {
            available: room.status === 0,
            nextBooking: null
        };
        
        if (isToday) {
            const upcomingBookings = bookings.filter(b => b.startTime > currentTime);
            if (upcomingBookings.length > 0) {
                currentStatus.nextBooking = upcomingBookings[0];
            }
        }
        
        res.status(200).send({
            room: room,
            date: date,
            timeSlots: timeSlots,
            currentStatus: currentStatus,
            bookings: bookings
        });
        
    } catch (error) {
        console.error(`Error fetching room schedule ${req.params.id}:`, error);
        res.status(500).send({ message: "Error fetching room schedule", error: error.message });
    }
});

// CREATE new room
roomsRouter.post("/", async (req, res) => {
    try {
        const roomData = req.body;
        
        // Check if room with same id already exists
        const existingRoom = await roomSchema.findOne({ id: roomData.id });
        
        if (existingRoom) {
            return res.status(409).send({ 
                message: "Room with the same ID already exists" 
            });
        }
        
        // Create new room
        const newRoom = new roomSchema(roomData);
        const savedRoom = await newRoom.save();
        const roomResponse = await roomSchema.findOne({ id: savedRoom.id }, { _id: 0 });
        res.status(201).send(roomResponse);
    } catch (error) {
        console.error("Error creating room:", error);
        res.status(500).send({ message: "Error creating room", error: error.message });
    }
});

// UPDATE room
roomsRouter.put("/:id", async (req, res) => {
    try {
        const roomId = parseInt(req.params.id);
        if (isNaN(roomId)) {
            return res.status(400).send({ message: "Invalid room ID format" });
        }
        
        const updateData = req.body;
        
        // Check if room exists
        const existingRoom = await roomSchema.findOne({ id: roomId });
        if (!existingRoom) {
            return res.status(404).send({ message: `Room with ID ${roomId} not found` });
        }
        
        // Update room
        await roomSchema.updateOne({ id: roomId }, { $set: updateData });
        
        // Return the updated room
        const updatedRoom = await roomSchema.findOne({ id: roomId }, { _id: 0 });
        res.status(200).send(updatedRoom);
    } catch (error) {
        console.error(`Error updating room ${req.params.id}:`, error);
        res.status(500).send({ message: "Error updating room", error: error.message });
    }
});

// UPDATE room status
roomsRouter.patch("/:id/status", async (req, res) => {
    try {
        const roomId = parseInt(req.params.id);
        if (isNaN(roomId)) {
            return res.status(400).send({ message: "Invalid room ID format" });
        }
        
        const { status } = req.body;
        
        if (status === undefined) {
            return res.status(400).send({ message: "Status is required" });
        }
        
        // Check if room exists
        const existingRoom = await roomSchema.findOne({ id: roomId });
        if (!existingRoom) {
            return res.status(404).send({ message: `Room with ID ${roomId} not found` });
        }
        
        // Update room status
        await roomSchema.updateOne({ id: roomId }, { $set: { status } });
        
        // Return the updated room
        const updatedRoom = await roomSchema.findOne({ id: roomId }, { _id: 0 });
        res.status(200).send(updatedRoom);
    } catch (error) {
        console.error(`Error updating room status ${req.params.id}:`, error);
        res.status(500).send({ message: "Error updating room status", error: error.message });
    }
});

// DELETE room
roomsRouter.delete("/:id", async (req, res) => {
    try {
        const roomId = parseInt(req.params.id);
        if (isNaN(roomId)) {
            return res.status(400).send({ message: "Invalid room ID format" });
        }
        
        // Check if room exists
        const existingRoom = await roomSchema.findOne({ id: roomId });
        if (!existingRoom) {
            return res.status(404).send({ message: `Room with ID ${roomId} not found` });
        }
        
        // Delete room
        await roomSchema.deleteOne({ id: roomId });
        
        res.status(200).send({ message: `Room with ID ${roomId} successfully deleted` });
    } catch (error) {
        console.error(`Error deleting room ${req.params.id}:`, error);
        res.status(500).send({ message: "Error deleting room", error: error.message });
    }
});

module.exports = roomsRouter;