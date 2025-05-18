const express = require("express");
const messagesRouter = express.Router();
const messageSchema = require('../models/messageSchema.js');

// GET all messages
messagesRouter.get("/", async (req, res) => {
    try {
        let messages = await messageSchema.find({}, { _id: 0 }).sort({ timestamp: -1 });
        res.status(200).send(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).send({ message: "Error fetching messages", error: error.message });
    }
});

// GET message by ID
messagesRouter.get("/:id", async (req, res) => {
    try {
        const messageId = req.params.id;
        const message = await messageSchema.findOne({ id: messageId }, { _id: 0 });
        
        if (!message) {
            return res.status(404).send({ message: `Message with ID ${messageId} not found` });
        }
        
        res.status(200).send(message);
    } catch (error) {
        console.error(`Error fetching message ${req.params.id}:`, error);
        res.status(500).send({ message: "Error fetching message", error: error.message });
    }
});

// GET conversation between two users
messagesRouter.get("/conversation/:user1Id/:user2Id", async (req, res) => {
    try {
        const user1Id = req.params.user1Id;
        const user2Id = req.params.user2Id;
        
        const messages = await messageSchema.find({
            $or: [
                { senderId: user1Id, receiverId: user2Id },
                { senderId: user2Id, receiverId: user1Id }
            ]
        }, { _id: 0 }).sort({ timestamp: 1 });
        
        res.status(200).send(messages);
    } catch (error) {
        console.error(`Error fetching conversation between ${req.params.user1Id} and ${req.params.user2Id}:`, error);
        res.status(500).send({ message: "Error fetching conversation", error: error.message });
    }
});

// GET messages for a user (inbox)
messagesRouter.get("/user/:userId/inbox", async (req, res) => {
    try {
        const userId = req.params.userId;
        
        const messages = await messageSchema.find({
            receiverId: userId
        }, { _id: 0 }).sort({ timestamp: -1 });
        
        res.status(200).send(messages);
    } catch (error) {
        console.error(`Error fetching inbox for user ${req.params.userId}:`, error);
        res.status(500).send({ message: "Error fetching inbox", error: error.message });
    }
});

// GET messages sent by a user (outbox)
messagesRouter.get("/user/:userId/sent", async (req, res) => {
    try {
        const userId = req.params.userId;
        
        const messages = await messageSchema.find({
            senderId: userId
        }, { _id: 0 }).sort({ timestamp: -1 });
        
        res.status(200).send(messages);
    } catch (error) {
        console.error(`Error fetching sent messages for user ${req.params.userId}:`, error);
        res.status(500).send({ message: "Error fetching sent messages", error: error.message });
    }
});

// CREATE new message
messagesRouter.post("/", async (req, res) => {
    try {
        const messageData = req.body;
        
        // Generate unique id if not provided
        if (!messageData.id) {
            messageData.id = `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        }
        
        // Set timestamp if not provided
        if (!messageData.timestamp) {
            messageData.timestamp = new Date();
        }
        
        // Create new message
        const newMessage = new messageSchema(messageData);
        const savedMessage = await newMessage.save();
        const messageResponse = await messageSchema.findOne({ id: savedMessage.id }, { _id: 0 });
        res.status(201).send(messageResponse);
    } catch (error) {
        console.error("Error creating message:", error);
        res.status(500).send({ message: "Error creating message", error: error.message });
    }
});

// MARK message as read
messagesRouter.patch("/:id/read", async (req, res) => {
    try {
        const messageId = req.params.id;
        
        // Check if message exists
        const existingMessage = await messageSchema.findOne({ id: messageId });
        if (!existingMessage) {
            return res.status(404).send({ message: `Message with ID ${messageId} not found` });
        }
        
        // Update message read status
        await messageSchema.updateOne({ id: messageId }, { $set: { read: true } });
        
        // Return the updated message
        const updatedMessage = await messageSchema.findOne({ id: messageId }, { _id: 0 });
        res.status(200).send(updatedMessage);
    } catch (error) {
        console.error(`Error marking message ${req.params.id} as read:`, error);
        res.status(500).send({ message: "Error updating message read status", error: error.message });
    }
});

// DELETE message
messagesRouter.delete("/:id", async (req, res) => {
    try {
        const messageId = req.params.id;
        
        // Check if message exists
        const existingMessage = await messageSchema.findOne({ id: messageId });
        if (!existingMessage) {
            return res.status(404).send({ message: `Message with ID ${messageId} not found` });
        }
        
        // Delete message
        await messageSchema.deleteOne({ id: messageId });
        
        res.status(200).send({ message: `Message with ID ${messageId} successfully deleted` });
    } catch (error) {
        console.error(`Error deleting message ${req.params.id}:`, error);
        res.status(500).send({ message: "Error deleting message", error: error.message });
    }
});

module.exports = messagesRouter;