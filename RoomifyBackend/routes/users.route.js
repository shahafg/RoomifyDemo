const express = require("express");
const usersRouter = express.Router();  // Create a router, not an app
const usersSchema = require('../models/userSchema.js');

// GET all users
usersRouter.get("/", async (req, res) => {
    try {
        let users = await usersSchema.find({}, { _id: 0 });
        res.status(200).send(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).send({ message: "Error fetching users", error: error.message });
    }
});

module.exports = usersRouter;