const mongoose = require("mongoose");
const usersSchema = require('./models/userSchema.js');

// Connect to the database
const dbURL = "mongodb://localhost:27017/Roomify";

async function addUserIDs() {
    try {
        await mongoose.connect(dbURL);
        console.log("Connected to DB");

        // Find all users without an ID field
        const usersWithoutId = await usersSchema.find({ id: { $exists: false } });
        console.log(`Found ${usersWithoutId.length} users without ID field`);

        if (usersWithoutId.length === 0) {
            console.log("All users already have ID fields");
            process.exit(0);
        }

        // Get the highest existing ID
        const userWithHighestId = await usersSchema.findOne({ id: { $exists: true } }).sort({ id: -1 });
        let nextId = userWithHighestId ? userWithHighestId.id + 1 : 1;

        // Update each user without an ID
        for (const user of usersWithoutId) {
            await usersSchema.updateOne(
                { _id: user._id },
                { $set: { id: nextId } }
            );
            console.log(`Added ID ${nextId} to user: ${user.email}`);
            nextId++;
        }

        console.log(`Successfully added IDs to ${usersWithoutId.length} users`);
        process.exit(0);

    } catch (error) {
        console.error("Error adding user IDs:", error);
        process.exit(1);
    }
}

addUserIDs();