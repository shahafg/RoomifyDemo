const express = require("express");
const ticketsRouter = express.Router();
const ticketSchema = require('../models/ticketSchema.js');

// GET all tickets
ticketsRouter.get("/", async (req, res) => {
    try {
        let tickets = await ticketSchema.find({}, { _id: 0 })
            .populate('createdBy', '-_id -password')
            .populate('assignedTo', '-_id -password');
        res.status(200).send(tickets);
    } catch (error) {
        console.error("Error fetching tickets:", error);
        res.status(500).send({ message: "Error fetching tickets", error: error.message });
    }
});

// GET ticket by ID
ticketsRouter.get("/:id", async (req, res) => {
    try {
        const ticketId = parseInt(req.params.id);
        if (isNaN(ticketId)) {
            return res.status(400).send({ message: "Invalid ticket ID format" });
        }
        
        const ticket = await ticketSchema.findOne({ id: ticketId }, { _id: 0 })
            .populate('createdBy', '-_id -password')
            .populate('assignedTo', '-_id -password');
        
        if (!ticket) {
            return res.status(404).send({ message: `Ticket with ID ${ticketId} not found` });
        }
        
        res.status(200).send(ticket);
    } catch (error) {
        console.error(`Error fetching ticket ${req.params.id}:`, error);
        res.status(500).send({ message: "Error fetching ticket", error: error.message });
    }
});

// GET tickets by status
ticketsRouter.get("/status/:statusName", async (req, res) => {
    try {
        const statusName = req.params.statusName;
        
        const tickets = await ticketSchema.find({ status: statusName }, { _id: 0 })
            .populate('createdBy', '-_id -password')
            .populate('assignedTo', '-_id -password');
        
        res.status(200).send(tickets);
    } catch (error) {
        console.error(`Error fetching tickets with status ${req.params.statusName}:`, error);
        res.status(500).send({ message: "Error fetching tickets by status", error: error.message });
    }
});

// GET tickets by category
ticketsRouter.get("/category/:categoryName", async (req, res) => {
    try {
        const categoryName = req.params.categoryName;
        
        const tickets = await ticketSchema.find({ category: categoryName }, { _id: 0 })
            .populate('createdBy', '-_id -password')
            .populate('assignedTo', '-_id -password');
        
        res.status(200).send(tickets);
    } catch (error) {
        console.error(`Error fetching tickets in category ${req.params.categoryName}:`, error);
        res.status(500).send({ message: "Error fetching tickets by category", error: error.message });
    }
});

// GET tickets assigned to a user
ticketsRouter.get("/assigned/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;
        
        const tickets = await ticketSchema.find({ assignedTo: userId }, { _id: 0 })
            .populate('createdBy', '-_id -password')
            .populate('assignedTo', '-_id -password');
        
        res.status(200).send(tickets);
    } catch (error) {
        console.error(`Error fetching tickets assigned to user ${req.params.userId}:`, error);
        res.status(500).send({ message: "Error fetching assigned tickets", error: error.message });
    }
});

// GET tickets created by a user
ticketsRouter.get("/created/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;
        
        const tickets = await ticketSchema.find({ "createdBy": userId }, { _id: 0 })
            .populate('createdBy', '-_id -password')
            .populate('assignedTo', '-_id -password');
        
        res.status(200).send(tickets);
    } catch (error) {
        console.error(`Error fetching tickets created by user ${req.params.userId}:`, error);
        res.status(500).send({ message: "Error fetching created tickets", error: error.message });
    }
});

// CREATE new ticket
ticketsRouter.post("/", async (req, res) => {
    try {
        const ticketData = req.body;
        
        // Auto-generate ID if not provided
        if (!ticketData.id) {
            // Find the highest existing ID and increment
            const highestTicket = await ticketSchema.findOne().sort({ id: -1 });
            ticketData.id = highestTicket ? highestTicket.id + 1 : 1;
        }
        
        // Set creation date
        ticketData.createdAt = new Date();
        
        // Create new ticket
        const newTicket = new ticketSchema(ticketData);
        const savedTicket = await newTicket.save();
        
        // Return the saved ticket with populated user fields
        const ticketResponse = await ticketSchema.findOne({ id: savedTicket.id }, { _id: 0 })
            .populate('createdBy', '-_id -password')
            .populate('assignedTo', '-_id -password');
            
        res.status(201).send(ticketResponse);
    } catch (error) {
        console.error("Error creating ticket:", error);
        res.status(500).send({ message: "Error creating ticket", error: error.message });
    }
});

// UPDATE ticket
ticketsRouter.put("/:id", async (req, res) => {
    try {
        const ticketId = parseInt(req.params.id);
        if (isNaN(ticketId)) {
            return res.status(400).send({ message: "Invalid ticket ID format" });
        }
        
        const updateData = req.body;
        
        // Check if ticket exists
        const existingTicket = await ticketSchema.findOne({ id: ticketId });
        if (!existingTicket) {
            return res.status(404).send({ message: `Ticket with ID ${ticketId} not found` });
        }
        
        // Set updated date
        updateData.updatedAt = new Date();
        
        // Update ticket
        await ticketSchema.updateOne({ id: ticketId }, { $set: updateData });
        
        // Return the updated ticket
        const updatedTicket = await ticketSchema.findOne({ id: ticketId }, { _id: 0 })
            .populate('createdBy', '-_id -password')
            .populate('assignedTo', '-_id -password');
            
        res.status(200).send(updatedTicket);
    } catch (error) {
        console.error(`Error updating ticket ${req.params.id}:`, error);
        res.status(500).send({ message: "Error updating ticket", error: error.message });
    }
});

// UPDATE ticket status
ticketsRouter.patch("/:id/status", async (req, res) => {
    try {
        const ticketId = parseInt(req.params.id);
        if (isNaN(ticketId)) {
            return res.status(400).send({ message: "Invalid ticket ID format" });
        }
        
        const { status } = req.body;
        
        if (!status) {
            return res.status(400).send({ message: "Status is required" });
        }
        
        // Check if ticket exists
        const existingTicket = await ticketSchema.findOne({ id: ticketId });
        if (!existingTicket) {
            return res.status(404).send({ message: `Ticket with ID ${ticketId} not found` });
        }
        
        // Update ticket status and updatedAt
        await ticketSchema.updateOne(
            { id: ticketId }, 
            { $set: { status: status, updatedAt: new Date() } }
        );
        
        // Return the updated ticket
        const updatedTicket = await ticketSchema.findOne({ id: ticketId }, { _id: 0 })
            .populate('createdBy', '-_id -password')
            .populate('assignedTo', '-_id -password');
            
        res.status(200).send(updatedTicket);
    } catch (error) {
        console.error(`Error updating ticket status ${req.params.id}:`, error);
        res.status(500).send({ message: "Error updating ticket status", error: error.message });
    }
});

// ASSIGN ticket to user
ticketsRouter.patch("/:id/assign", async (req, res) => {
    try {
        const ticketId = parseInt(req.params.id);
        if (isNaN(ticketId)) {
            return res.status(400).send({ message: "Invalid ticket ID format" });
        }
        
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).send({ message: "User ID is required" });
        }
        
        // Check if ticket exists
        const existingTicket = await ticketSchema.findOne({ id: ticketId });
        if (!existingTicket) {
            return res.status(404).send({ message: `Ticket with ID ${ticketId} not found` });
        }
        
        // Update assignedTo and updatedAt
        await ticketSchema.updateOne(
            { id: ticketId }, 
            { $set: { assignedTo: userId, updatedAt: new Date() } }
        );
        
        // Return the updated ticket
        const updatedTicket = await ticketSchema.findOne({ id: ticketId }, { _id: 0 })
            .populate('createdBy', '-_id -password')
            .populate('assignedTo', '-_id -password');
            
        res.status(200).send(updatedTicket);
    } catch (error) {
        console.error(`Error assigning ticket ${req.params.id}:`, error);
        res.status(500).send({ message: "Error assigning ticket", error: error.message });
    }
});

// ADD attachment to ticket
ticketsRouter.patch("/:id/attachments", async (req, res) => {
    try {
        const ticketId = parseInt(req.params.id);
        if (isNaN(ticketId)) {
            return res.status(400).send({ message: "Invalid ticket ID format" });
        }
        
        const { attachment } = req.body;
        
        if (!attachment || !attachment.name || !attachment.size || !attachment.type) {
            return res.status(400).send({ message: "Valid attachment details are required" });
        }
        
        // Check if ticket exists
        const existingTicket = await ticketSchema.findOne({ id: ticketId });
        if (!existingTicket) {
            return res.status(404).send({ message: `Ticket with ID ${ticketId} not found` });
        }
        
        // Add attachment and update updatedAt
        await ticketSchema.updateOne(
            { id: ticketId }, 
            { 
                $push: { attachments: attachment },
                $set: { updatedAt: new Date() }
            }
        );
        
        // Return the updated ticket
        const updatedTicket = await ticketSchema.findOne({ id: ticketId }, { _id: 0 })
            .populate('createdBy', '-_id -password')
            .populate('assignedTo', '-_id -password');
            
        res.status(200).send(updatedTicket);
    } catch (error) {
        console.error(`Error adding attachment to ticket ${req.params.id}:`, error);
        res.status(500).send({ message: "Error adding attachment", error: error.message });
    }
});

// DELETE ticket
ticketsRouter.delete("/:id", async (req, res) => {
    try {
        const ticketId = parseInt(req.params.id);
        if (isNaN(ticketId)) {
            return res.status(400).send({ message: "Invalid ticket ID format" });
        }
        
        // Check if ticket exists
        const existingTicket = await ticketSchema.findOne({ id: ticketId });
        if (!existingTicket) {
            return res.status(404).send({ message: `Ticket with ID ${ticketId} not found` });
        }
        
        // Delete ticket
        await ticketSchema.deleteOne({ id: ticketId });
        
        res.status(200).send({ message: `Ticket with ID ${ticketId} successfully deleted` });
    } catch (error) {
        console.error(`Error deleting ticket ${req.params.id}:`, error);
        res.status(500).send({ message: "Error deleting ticket", error: error.message });
    }
});

module.exports = ticketsRouter;