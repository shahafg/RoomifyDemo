const express = require("express");
const auditoriumTimeSlotsRouter = express.Router();
const auditoriumTimeSlotsSchema = require('../models/auditoriumTimeSlotsSchema.js');

// GET all active time slots
auditoriumTimeSlotsRouter.get("/", async (req, res) => {
    try {
        const timeSlots = await auditoriumTimeSlotsSchema.find({ isActive: true }, { _id: 0 }).sort({ order: 1 });
        res.status(200).send(timeSlots);
    } catch (error) {
        console.error("Error fetching time slots:", error);
        res.status(500).send({ message: "Error fetching time slots", error: error.message });
    }
});

// GET time slot by ID
auditoriumTimeSlotsRouter.get("/:id", async (req, res) => {
    try {
        const slotId = parseInt(req.params.id);
        if (isNaN(slotId)) {
            return res.status(400).send({ message: "Invalid time slot ID format" });
        }
        
        const timeSlot = await auditoriumTimeSlotsSchema.findOne({ id: slotId }, { _id: 0 });
        
        if (!timeSlot) {
            return res.status(404).send({ message: `Time slot with ID ${slotId} not found` });
        }
        
        res.status(200).send(timeSlot);
    } catch (error) {
        console.error(`Error fetching time slot ${req.params.id}:`, error);
        res.status(500).send({ message: "Error fetching time slot", error: error.message });
    }
});

// CREATE new time slot (admin only)
auditoriumTimeSlotsRouter.post("/", async (req, res) => {
    try {
        const slotData = req.body;
        
        // Check if time slot with same id already exists
        const existingSlot = await auditoriumTimeSlotsSchema.findOne({ id: slotData.id });
        if (existingSlot) {
            return res.status(409).send({ 
                message: "Time slot with the same ID already exists" 
            });
        }
        
        // Create new time slot
        const newTimeSlot = new auditoriumTimeSlotsSchema(slotData);
        const savedTimeSlot = await newTimeSlot.save();
        const slotResponse = await auditoriumTimeSlotsSchema.findOne({ id: savedTimeSlot.id }, { _id: 0 });
        res.status(201).send(slotResponse);
    } catch (error) {
        console.error("Error creating time slot:", error);
        res.status(500).send({ message: "Error creating time slot", error: error.message });
    }
});

// UPDATE time slot (admin only)
auditoriumTimeSlotsRouter.put("/:id", async (req, res) => {
    try {
        const slotId = parseInt(req.params.id);
        if (isNaN(slotId)) {
            return res.status(400).send({ message: "Invalid time slot ID format" });
        }
        
        const updateData = req.body;
        
        // Check if time slot exists
        const existingSlot = await auditoriumTimeSlotsSchema.findOne({ id: slotId });
        if (!existingSlot) {
            return res.status(404).send({ message: `Time slot with ID ${slotId} not found` });
        }
        
        // Update time slot
        await auditoriumTimeSlotsSchema.updateOne({ id: slotId }, { $set: updateData });
        
        // Return updated time slot
        const updatedSlot = await auditoriumTimeSlotsSchema.findOne({ id: slotId }, { _id: 0 });
        res.status(200).send(updatedSlot);
    } catch (error) {
        console.error(`Error updating time slot ${req.params.id}:`, error);
        res.status(500).send({ message: "Error updating time slot", error: error.message });
    }
});

// SOFT DELETE time slot (set isActive to false)
auditoriumTimeSlotsRouter.delete("/:id", async (req, res) => {
    try {
        const slotId = parseInt(req.params.id);
        if (isNaN(slotId)) {
            return res.status(400).send({ message: "Invalid time slot ID format" });
        }
        
        // Check if time slot exists
        const existingSlot = await auditoriumTimeSlotsSchema.findOne({ id: slotId });
        if (!existingSlot) {
            return res.status(404).send({ message: `Time slot with ID ${slotId} not found` });
        }
        
        // Soft delete time slot
        await auditoriumTimeSlotsSchema.updateOne({ id: slotId }, { $set: { isActive: false } });
        
        res.status(200).send({ message: `Time slot with ID ${slotId} successfully deactivated` });
    } catch (error) {
        console.error(`Error deleting time slot ${req.params.id}:`, error);
        res.status(500).send({ message: "Error deleting time slot", error: error.message });
    }
});

module.exports = auditoriumTimeSlotsRouter;