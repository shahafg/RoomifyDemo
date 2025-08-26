const express = require("express");
const usersRouter = express.Router();
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

// GET user by ID
usersRouter.get("/:id", async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await usersSchema.findOne({ id: userId }, { _id: 0 });
        
        if (!user) {
            return res.status(404).send({ message: `User with ID ${userId} not found` });
        }
        
        res.status(200).send(user);
    } catch (error) {
        console.error(`Error fetching user ${req.params.id}:`, error);
        res.status(500).send({ message: "Error fetching user", error: error.message });
    }
});

// CREATE new user
usersRouter.post("/register", async (req, res) => {
  try {
    const userData = req.body;
    const existingUser = await usersSchema.findOne({ email: userData.email });

    if (existingUser) {
      return res.status(409).send({
        message: "User with the same email already exists",
      });
    }

    // Create new user
    const newUser = new usersSchema(userData);
    const savedUser = await newUser.save();

    const userResponse = await usersSchema.findOne(
      { _id: savedUser._id },
      { _id: 0, __v: 0 }
    );

    res.status(201).send(userResponse);
  } catch (error) {
    console.error("Error creating user:", error);
    res
      .status(500)
      .send({ message: "Error creating user", error: error.message });
  }
});

// UPDATE user
usersRouter.put("/:id", async (req, res) => {
    try {
        const userId = req.params.id;
        const updateData = req.body;
        
        // Check if user exists
        const existingUser = await usersSchema.findOne({ id: userId });
        if (!existingUser) {
            return res.status(404).send({ message: `User with ID ${userId} not found` });
        }
        
        // If email is being updated, check if it's already in use by another user
        if (updateData.email && updateData.email !== existingUser.email) {
            const userWithEmail = await usersSchema.findOne({ email: updateData.email });
            if (userWithEmail && userWithEmail.id !== userId) {
                return res.status(409).send({ message: "Email already in use by another user" });
            }
        }
        
        // Update user
        await usersSchema.updateOne({ id: userId }, { $set: updateData });
        
        // Return the updated user
        const updatedUser = await usersSchema.findOne({ id: userId }, { _id: 0 });
        res.status(200).send(updatedUser);
    } catch (error) {
        console.error(`Error updating user ${req.params.id}:`, error);
        res.status(500).send({ message: "Error updating user", error: error.message });
    }
});

// DELETE user
usersRouter.delete("/:id", async (req, res) => {
    try {
        const userId = req.params.id;
        
        // Check if user exists
        const existingUser = await usersSchema.findOne({ id: userId });
        if (!existingUser) {
            return res.status(404).send({ message: `User with ID ${userId} not found` });
        }
        
        // Delete user
        await usersSchema.deleteOne({ id: userId });
        
        res.status(200).send({ message: `User with ID ${userId} successfully deleted` });
    } catch (error) {
        console.error(`Error deleting user ${req.params.id}:`, error);
        res.status(500).send({ message: "Error deleting user", error: error.message });
    }
});

module.exports = usersRouter;