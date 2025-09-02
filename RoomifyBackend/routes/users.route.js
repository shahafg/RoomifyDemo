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

// BULK CREATE users
usersRouter.post("/bulk-register", async (req, res) => {
  try {
    const { users } = req.body;
    
    if (!users || !Array.isArray(users)) {
      return res.status(400).send({
        message: "Request body must contain a 'users' array"
      });
    }

    const results = {
      successful: [],
      failed: [],
      total: users.length
    };

    // Process each user
    for (let i = 0; i < users.length; i++) {
      const userData = users[i];
      
      try {
        // Check if user already exists
        const existingUser = await usersSchema.findOne({ email: userData.email });
        
        if (existingUser) {
          results.failed.push({
            index: i,
            email: userData.email,
            error: "User with this email already exists"
          });
          continue;
        }

        // Validate required fields
        if (!userData.email || !userData.password || !userData.fullName || 
            !userData.dateOfBirth || !userData.gender) {
          results.failed.push({
            index: i,
            email: userData.email || 'unknown',
            error: "Missing required fields"
          });
          continue;
        }

        // Create new user
        const newUser = new usersSchema({
          ...userData,
          role: userData.role || 10,
          image: userData.image || (userData.gender === 'male' ? 'assets/images/profile/male.jpg' : 'assets/images/profile/female.jpg')
        });
        
        const savedUser = await newUser.save();
        
        results.successful.push({
          index: i,
          email: userData.email,
          id: savedUser._id
        });

      } catch (userError) {
        results.failed.push({
          index: i,
          email: userData.email || 'unknown',
          error: userError.message
        });
      }
    }

    // Return results
    const statusCode = results.failed.length === 0 ? 201 : 
                      results.successful.length === 0 ? 400 : 207; // 207 = Multi-Status

    res.status(statusCode).send({
      message: `Bulk registration completed. ${results.successful.length} successful, ${results.failed.length} failed.`,
      results: results
    });

  } catch (error) {
    console.error("Error in bulk registration:", error);
    res.status(500).send({ 
      message: "Error in bulk registration", 
      error: error.message 
    });
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

// DELETE user by email
usersRouter.delete("/:email", async (req, res) => {
    try {
        const userEmail = decodeURIComponent(req.params.email);
        
        // Check if user exists
        const existingUser = await usersSchema.findOne({ email: userEmail });
        if (!existingUser) {
            return res.status(404).send({ message: `User with email ${userEmail} not found` });
        }
        
        // Delete user
        await usersSchema.deleteOne({ email: userEmail });
        
        res.status(200).send({ message: `User with email ${userEmail} successfully deleted` });
    } catch (error) {
        console.error(`Error deleting user ${req.params.email}:`, error);
        res.status(500).send({ message: "Error deleting user", error: error.message });
    }
});

module.exports = usersRouter;