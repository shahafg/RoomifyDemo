const express = require("express");
const auditoriumsRouter = express.Router();
const auditoriumSchema = require('../models/auditoriumSchema.js');

// GET all auditoriums
auditoriumsRouter.get("/", async (req, res) => {
    try {
        let auditoriums = await auditoriumSchema.find({ isActive: true }, { _id: 0 });
        res.status(200).send(auditoriums);
    } catch (error) {
        console.error("Error fetching auditoriums:", error);
        res.status(500).send({ message: "Error fetching auditoriums", error: error.message });
    }
});

// GET auditorium by ID
auditoriumsRouter.get("/:id", async (req, res) => {
    try {
        const auditoriumId = parseInt(req.params.id);
        if (isNaN(auditoriumId)) {
            return res.status(400).send({ message: "Invalid auditorium ID format" });
        }
        
        const auditorium = await auditoriumSchema.findOne({ id: auditoriumId, isActive: true }, { _id: 0 });
        
        if (!auditorium) {
            return res.status(404).send({ message: `Auditorium with ID ${auditoriumId} not found` });
        }
        
        res.status(200).send(auditorium);
    } catch (error) {
        console.error(`Error fetching auditorium ${req.params.id}:`, error);
        res.status(500).send({ message: "Error fetching auditorium", error: error.message });
    }
});

// GET auditoriums by building
auditoriumsRouter.get("/building/:buildingId", async (req, res) => {
    try {
        const buildingId = parseInt(req.params.buildingId);
        if (isNaN(buildingId)) {
            return res.status(400).send({ message: "Invalid building ID format" });
        }
        
        const auditoriums = await auditoriumSchema.find({ 
            buildingId: buildingId, 
            isActive: true 
        }, { _id: 0 });
        
        if (auditoriums.length === 0) {
            return res.status(404).send({ message: `No auditoriums found in building ${buildingId}` });
        }
        
        res.status(200).send(auditoriums);
    } catch (error) {
        console.error(`Error fetching auditoriums for building ${req.params.buildingId}:`, error);
        res.status(500).send({ message: "Error fetching auditoriums by building", error: error.message });
    }
});

// CREATE new auditorium (admin only - add auth middleware in production)
auditoriumsRouter.post("/", async (req, res) => {
    try {
        const auditoriumData = req.body;
        
        // Check if auditorium with same id already exists
        const existingAuditorium = await auditoriumSchema.findOne({ id: auditoriumData.id });
        
        if (existingAuditorium) {
            return res.status(409).send({ 
                message: "Auditorium with the same ID already exists" 
            });
        }
        
        // Create new auditorium
        const newAuditorium = new auditoriumSchema(auditoriumData);
        const savedAuditorium = await newAuditorium.save();
        const auditoriumResponse = await auditoriumSchema.findOne({ id: savedAuditorium.id }, { _id: 0 });
        res.status(201).send(auditoriumResponse);
    } catch (error) {
        console.error("Error creating auditorium:", error);
        res.status(500).send({ message: "Error creating auditorium", error: error.message });
    }
});

// UPDATE auditorium (admin only - add auth middleware in production)
auditoriumsRouter.put("/:id", async (req, res) => {
    try {
        const auditoriumId = parseInt(req.params.id);
        if (isNaN(auditoriumId)) {
            return res.status(400).send({ message: "Invalid auditorium ID format" });
        }
        
        const updateData = { ...req.body, updatedAt: new Date() };
        
        // Check if auditorium exists
        const existingAuditorium = await auditoriumSchema.findOne({ id: auditoriumId });
        if (!existingAuditorium) {
            return res.status(404).send({ message: `Auditorium with ID ${auditoriumId} not found` });
        }
        
        // Update auditorium
        await auditoriumSchema.updateOne({ id: auditoriumId }, { $set: updateData });
        
        // Return the updated auditorium
        const updatedAuditorium = await auditoriumSchema.findOne({ id: auditoriumId }, { _id: 0 });
        res.status(200).send(updatedAuditorium);
    } catch (error) {
        console.error(`Error updating auditorium ${req.params.id}:`, error);
        res.status(500).send({ message: "Error updating auditorium", error: error.message });
    }
});

// SOFT DELETE auditorium (set isActive to false)
auditoriumsRouter.delete("/:id", async (req, res) => {
    try {
        const auditoriumId = parseInt(req.params.id);
        if (isNaN(auditoriumId)) {
            return res.status(400).send({ message: "Invalid auditorium ID format" });
        }
        
        // Check if auditorium exists
        const existingAuditorium = await auditoriumSchema.findOne({ id: auditoriumId });
        if (!existingAuditorium) {
            return res.status(404).send({ message: `Auditorium with ID ${auditoriumId} not found` });
        }
        
        // Soft delete auditorium
        await auditoriumSchema.updateOne({ id: auditoriumId }, { $set: { isActive: false, updatedAt: new Date() } });
        
        res.status(200).send({ message: `Auditorium with ID ${auditoriumId} successfully deactivated` });
    } catch (error) {
        console.error(`Error deleting auditorium ${req.params.id}:`, error);
        res.status(500).send({ message: "Error deleting auditorium", error: error.message });
    }
});

module.exports = auditoriumsRouter;