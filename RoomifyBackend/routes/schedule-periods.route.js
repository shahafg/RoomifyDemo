const express = require("express");
const schedulePeriodRouter = express.Router();
const schedulePeriodSchema = require("../models/schedulePeriodSchema.js");

// GET all schedule periods
schedulePeriodRouter.get("/", async (req, res) => {
  try {
    const schedulePeriods = await schedulePeriodSchema.find({}, { _id: 0 });
    res.status(200).send(schedulePeriods);
  } catch (error) {
    console.error("Error fetching schedule periods:", error);
    res.status(500).send({ message: "Error fetching schedule periods", error: error.message });
  }
});

// GET schedule period by ID
schedulePeriodRouter.get("/:id", async (req, res) => {
  try {
    const schedulePeriod = await schedulePeriodSchema.findOne({ id: req.params.id }, { _id: 0 });

    if (!schedulePeriod) {
      return res.status(404).send({ message: `Schedule period with ID ${req.params.id} not found` });
    }

    res.status(200).send(schedulePeriod);
  } catch (error) {
    console.error(`Error fetching schedule period ${req.params.id}:`, error);
    res.status(500).send({ message: "Error fetching schedule period", error: error.message });
  }
});

// CREATE new schedule period
schedulePeriodRouter.post("/", async (req, res) => {
  try {
    const periodData = req.body;

    const existingPeriod = await schedulePeriodSchema.findOne({ id: periodData.id });
    if (existingPeriod) {
      return res.status(409).send({ message: "Schedule period with the same ID already exists" });
    }

    const newPeriod = new schedulePeriodSchema(periodData);
    const savedPeriod = await newPeriod.save();

    res.status(201).send({ message: "Schedule period created", data: savedPeriod });
  } catch (error) {
    console.error("Error creating schedule period:", error);
    res.status(500).send({ message: "Error creating schedule period", error: error.message });
  }
});

// UPDATE schedule period
schedulePeriodRouter.put("/:id", async (req, res) => {
  try {
    const updateData = req.body;

    const existingPeriod = await schedulePeriodSchema.findOne({ id: req.params.id });
    if (!existingPeriod) {
      return res.status(404).send({ message: `Schedule period with ID ${req.params.id} not found` });
    }

    await schedulePeriodSchema.updateOne({ id: req.params.id }, { $set: updateData });

    const updatedPeriod = await schedulePeriodSchema.findOne({ id: req.params.id }, { _id: 0 });
    res.status(200).send({ message: "Schedule period updated", data: updatedPeriod });
  } catch (error) {
    console.error(`Error updating schedule period ${req.params.id}:`, error);
    res.status(500).send({ message: "Error updating schedule period", error: error.message });
  }
});

// DELETE schedule period
schedulePeriodRouter.delete("/:id", async (req, res) => {
  try {
    const existingPeriod = await schedulePeriodSchema.findOne({ id: req.params.id });
    if (!existingPeriod) {
      return res.status(404).send({ message: `Schedule period with ID ${req.params.id} not found` });
    }

    await schedulePeriodSchema.deleteOne({ id: req.params.id });
    res.status(200).send({ message: `Schedule period with ID ${req.params.id} successfully deleted` });
  } catch (error) {
    console.error(`Error deleting schedule period ${req.params.id}:`, error);
    res.status(500).send({ message: "Error deleting schedule period", error: error.message });
  }
});

// BULK SAVE/UPDATE schedule periods - for saving entire schedules
schedulePeriodRouter.post("/bulk", async (req, res) => {
  try {
    const scheduleData = req.body;

    // Check if schedule already exists
    const existingSchedule = await schedulePeriodSchema.findOne({ id: scheduleData.id });
    
    if (existingSchedule) {
      // Update existing schedule
      await schedulePeriodSchema.updateOne({ id: scheduleData.id }, { $set: scheduleData });
      const updatedSchedule = await schedulePeriodSchema.findOne({ id: scheduleData.id }, { _id: 0 });
      res.status(200).send({ message: "Schedule updated successfully", data: updatedSchedule });
    } else {
      // Create new schedule
      const newSchedule = new schedulePeriodSchema(scheduleData);
      const savedSchedule = await newSchedule.save();
      res.status(201).send({ message: "Schedule created successfully", data: savedSchedule });
    }
  } catch (error) {
    console.error("Error saving schedule:", error);
    res.status(500).send({ message: "Error saving schedule", error: error.message });
  }
});

module.exports = schedulePeriodRouter;
