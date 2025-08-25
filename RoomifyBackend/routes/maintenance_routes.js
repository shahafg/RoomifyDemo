const express = require("express");
const maintenanceRouter = express.Router();
const maintenanceSchema = require('../models/maintenance_schema.js');
// GET all maintenance periods
maintenanceRouter.get("/", async (req, res) => {
    try {
        let maintenancePeriods = await maintenanceSchema.find({}, { _id: 0 }).sort({ startDate: -1 });
        res.status(200).send(maintenancePeriods);
    } catch (error) {
        console.error("Error fetching maintenance periods:", error);
        res.status(500).send({ message: "Error fetching maintenance periods", error: error.message });
    }
});

// GET active maintenance periods
maintenanceRouter.get("/active", async (req, res) => {
    try {
        const now = new Date();
        let activePeriods = await maintenanceSchema.find({
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now }
        }, { _id: 0 }).sort({ startDate: 1 });
        res.status(200).send(activePeriods);
    } catch (error) {
        console.error("Error fetching active maintenance periods:", error);
        res.status(500).send({ message: "Error fetching active maintenance periods", error: error.message });
    }
});

// GET maintenance period by ID
maintenanceRouter.get("/:id", async (req, res) => {
    try {
        const maintenanceId = parseInt(req.params.id);
        if (isNaN(maintenanceId)) {
            return res.status(400).send({ message: "Invalid maintenance ID format" });
        }
        
        const maintenance = await maintenanceSchema.findOne({ id: maintenanceId }, { _id: 0 });
        
        if (!maintenance) {
            return res.status(404).send({ message: `Maintenance period with ID ${maintenanceId} not found` });
        }
        
        res.status(200).send(maintenance);
    } catch (error) {
        console.error(`Error fetching maintenance period ${req.params.id}:`, error);
        res.status(500).send({ message: "Error fetching maintenance period", error: error.message });
    }
});

// Check if booking is allowed for a specific date/time range
maintenanceRouter.post("/check-booking-allowed", async (req, res) => {
    try {
        const { startDateTime, endDateTime } = req.body;
        
        if (!startDateTime || !endDateTime) {
            return res.status(400).send({ message: "Missing required fields: startDateTime, endDateTime" });
        }
        
        const startDate = new Date(startDateTime);
        const endDate = new Date(endDateTime);
        
        // Check for overlapping active maintenance periods
        const overlappingMaintenance = await maintenanceSchema.find({
            isActive: true,
            $or: [
                // Booking starts during maintenance
                { startDate: { $lte: startDate }, endDate: { $gt: startDate } },
                // Booking ends during maintenance
                { startDate: { $lt: endDate }, endDate: { $gte: endDate } },
                // Booking completely encompasses maintenance period
                { startDate: { $gte: startDate }, endDate: { $lte: endDate } }
            ]
        });
        
        const isAllowed = overlappingMaintenance.length === 0;
        
        res.status(200).send({ 
            allowed: isAllowed,
            maintenancePeriods: overlappingMaintenance 
        });
    } catch (error) {
        console.error("Error checking if booking is allowed:", error);
        res.status(500).send({ message: "Error checking booking availability", error: error.message });
    }
});

// CREATE new maintenance period (Admin only)
maintenanceRouter.post("/", async (req, res) => {
    try {
        const maintenanceData = req.body;
        
        // Validate required fields
        if (!maintenanceData.title || !maintenanceData.description || 
            !maintenanceData.startDate || !maintenanceData.endDate) {
            return res.status(400).send({ message: "Missing required maintenance information" });
        }
        
        // Validate date range
        const startDate = new Date(maintenanceData.startDate);
        const endDate = new Date(maintenanceData.endDate);
        
        if (startDate >= endDate) {
            return res.status(400).send({ message: "Start date must be before end date" });
        }
        
        // Generate new maintenance ID
        const lastMaintenance = await maintenanceSchema.findOne().sort({ id: -1 });
        const newId = lastMaintenance ? lastMaintenance.id + 1 : 1;
        
        // Create new maintenance period
        const newMaintenance = new maintenanceSchema({
            id: newId,
            title: maintenanceData.title,
            description: maintenanceData.description,
            startDate: startDate,
            endDate: endDate,
            isActive: true,
            createdBy: maintenanceData.createdBy || 'Admin'
        });
        
        const savedMaintenance = await newMaintenance.save();
        
        const maintenanceResponse = await maintenanceSchema.findOne({ id: savedMaintenance.id }, { _id: 0 });
        res.status(201).send({
            message: "Maintenance period created successfully",
            maintenance: maintenanceResponse
        });
    } catch (error) {
        console.error("Error creating maintenance period:", error);
        res.status(500).send({ message: "Error creating maintenance period", error: error.message });
    }
});

// UPDATE maintenance period (Admin only)
maintenanceRouter.put("/:id", async (req, res) => {
    try {
        const maintenanceId = parseInt(req.params.id);
        if (isNaN(maintenanceId)) {
            return res.status(400).send({ message: "Invalid maintenance ID format" });
        }
        
        const updateData = req.body;
        
        // Check if maintenance period exists
        const existingMaintenance = await maintenanceSchema.findOne({ id: maintenanceId });
        if (!existingMaintenance) {
            return res.status(404).send({ message: `Maintenance period with ID ${maintenanceId} not found` });
        }
        
        // Validate date range if dates are being updated
        if (updateData.startDate || updateData.endDate) {
            const startDate = new Date(updateData.startDate || existingMaintenance.startDate);
            const endDate = new Date(updateData.endDate || existingMaintenance.endDate);
            
            if (startDate >= endDate) {
                return res.status(400).send({ message: "Start date must be before end date" });
            }
        }
        
        // Update maintenance period
        updateData.updatedAt = new Date();
        await maintenanceSchema.updateOne({ id: maintenanceId }, { $set: updateData });
        
        // Return the updated maintenance period
        const updatedMaintenance = await maintenanceSchema.findOne({ id: maintenanceId }, { _id: 0 });
        res.status(200).send(updatedMaintenance);
    } catch (error) {
        console.error(`Error updating maintenance period ${req.params.id}:`, error);
        res.status(500).send({ message: "Error updating maintenance period", error: error.message });
    }
});

// DEACTIVATE maintenance period (Admin only)
maintenanceRouter.patch("/:id/deactivate", async (req, res) => {
    try {
        const maintenanceId = parseInt(req.params.id);
        if (isNaN(maintenanceId)) {
            return res.status(400).send({ message: "Invalid maintenance ID format" });
        }
        
        // Check if maintenance period exists
        const existingMaintenance = await maintenanceSchema.findOne({ id: maintenanceId });
        if (!existingMaintenance) {
            return res.status(404).send({ message: `Maintenance period with ID ${maintenanceId} not found` });
        }
        
        // Deactivate maintenance period
        await maintenanceSchema.updateOne({ id: maintenanceId }, { 
            $set: { 
                isActive: false,
                updatedAt: new Date()
            } 
        });
        
        // Return the updated maintenance period
        const updatedMaintenance = await maintenanceSchema.findOne({ id: maintenanceId }, { _id: 0 });
        res.status(200).send(updatedMaintenance);
    } catch (error) {
        console.error(`Error deactivating maintenance period ${req.params.id}:`, error);
        res.status(500).send({ message: "Error deactivating maintenance period", error: error.message });
    }
});

// DELETE maintenance period (Admin only)
maintenanceRouter.delete("/:id", async (req, res) => {
    try {
        const maintenanceId = parseInt(req.params.id);
        if (isNaN(maintenanceId)) {
            return res.status(400).send({ message: "Invalid maintenance ID format" });
        }
        
        // Check if maintenance period exists
        const existingMaintenance = await maintenanceSchema.findOne({ id: maintenanceId });
        if (!existingMaintenance) {
            return res.status(404).send({ message: `Maintenance period with ID ${maintenanceId} not found` });
        }
        
        // Delete maintenance period
        await maintenanceSchema.deleteOne({ id: maintenanceId });
        
        res.status(200).send({ message: `Maintenance period with ID ${maintenanceId} successfully deleted` });
    } catch (error) {
        console.error(`Error deleting maintenance period ${req.params.id}:`, error);
        res.status(500).send({ message: "Error deleting maintenance period", error: error.message });
    }
});

module.exports = maintenanceRouter;