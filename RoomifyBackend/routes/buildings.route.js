const express = require("express");
const buildingsRouter = express.Router();
const buildingSchema = require('../models/buildingSchema.js');

// GET all buildings
buildingsRouter.get("/", async (req, res) => {
    try {
        let buildings = await buildingSchema.find({}, { _id: 0 });
        res.status(200).send(buildings);
    } catch (error) {
        console.error("Error fetching buildings:", error);
        res.status(500).send({ message: "Error fetching buildings", error: error.message });
    }
});

// GET building by ID
buildingsRouter.get("/:id", async (req, res) => {
    try {
        const buildingId = parseInt(req.params.id);
        if (isNaN(buildingId)) {
            return res.status(400).send({ message: "Invalid building ID format" });
        }
        
        const building = await buildingSchema.findOne({ id: buildingId }, { _id: 0 });
        
        if (!building) {
            return res.status(404).send({ message: `Building with ID ${buildingId} not found` });
        }
        
        res.status(200).send(building);
    } catch (error) {
        console.error(`Error fetching building ${req.params.id}:`, error);
        res.status(500).send({ message: "Error fetching building", error: error.message });
    }
});

// CREATE new building
buildingsRouter.post("/", async (req, res) => {
    try {
        const buildingData = req.body;
        
        // Check if building with same id already exists
        const existingBuilding = await buildingSchema.findOne({ id: buildingData.id });
        
        if (existingBuilding) {
            return res.status(409).send({ 
                message: "Building with the same ID already exists" 
            });
        }
        
        // Create new building
        const newBuilding = new buildingSchema(buildingData);
        const savedBuilding = await newBuilding.save();
        const buildingResponse = await buildingSchema.findOne({ id: savedBuilding.id }, { _id: 0 });
        res.status(201).send(buildingResponse);
    } catch (error) {
        console.error("Error creating building:", error);
        res.status(500).send({ message: "Error creating building", error: error.message });
    }
});

// UPDATE building
buildingsRouter.put("/:id", async (req, res) => {
    try {
        const buildingId = parseInt(req.params.id);
        if (isNaN(buildingId)) {
            return res.status(400).send({ message: "Invalid building ID format" });
        }
        
        const updateData = req.body;
        
        // Check if building exists
        const existingBuilding = await buildingSchema.findOne({ id: buildingId });
        if (!existingBuilding) {
            return res.status(404).send({ message: `Building with ID ${buildingId} not found` });
        }
        
        // Update building
        await buildingSchema.updateOne({ id: buildingId }, { $set: updateData });
        
        // Return the updated building
        const updatedBuilding = await buildingSchema.findOne({ id: buildingId }, { _id: 0 });
        res.status(200).send(updatedBuilding);
    } catch (error) {
        console.error(`Error updating building ${req.params.id}:`, error);
        res.status(500).send({ message: "Error updating building", error: error.message });
    }
});

// DELETE building
buildingsRouter.delete("/:id", async (req, res) => {
    try {
        const buildingId = parseInt(req.params.id);
        if (isNaN(buildingId)) {
            return res.status(400).send({ message: "Invalid building ID format" });
        }
        
        // Check if building exists
        const existingBuilding = await buildingSchema.findOne({ id: buildingId });
        if (!existingBuilding) {
            return res.status(404).send({ message: `Building with ID ${buildingId} not found` });
        }
        
        // Delete building
        await buildingSchema.deleteOne({ id: buildingId });
        
        res.status(200).send({ message: `Building with ID ${buildingId} successfully deleted` });
    } catch (error) {
        console.error(`Error deleting building ${req.params.id}:`, error);
        res.status(500).send({ message: "Error deleting building", error: error.message });
    }
});

module.exports = buildingsRouter;