const mongoose = require("mongoose");
const auditoriumSchema = require('./models/auditoriumSchema.js');

// Connect to MongoDB
const dbURL = "mongodb://localhost:27017/Roomify";
mongoose.connect(dbURL).then(
    () => console.log("Connected to DB for seeding auditoriums"),
    (err) => console.log("Could not connect to DB", err)
);

// Sample auditorium data
const auditoriums = [
    {
        id: 1,
        name: "Main Auditorium",
        buildingId: 1, // Assuming building ID 1 exists
        capacity: 300,
        features: ["projector", "sound_system", "microphone", "stage_lighting"],
        isActive: true
    },
    {
        id: 2,
        name: "Science Auditorium",
        buildingId: 1,
        capacity: 200,
        features: ["projector", "sound_system", "whiteboard"],
        isActive: true
    },
    {
        id: 3,
        name: "Conference Hall A",
        buildingId: 2, // Assuming building ID 2 exists
        capacity: 150,
        features: ["projector", "video_conferencing", "sound_system"],
        isActive: true
    },
    {
        id: 4,
        name: "Theater Auditorium",
        buildingId: 2,
        capacity: 400,
        features: ["projector", "sound_system", "stage_lighting", "curtains", "microphone"],
        isActive: true
    }
];

async function seedAuditoriums() {
    try {
        // Clear existing auditoriums
        await auditoriumSchema.deleteMany({});
        console.log("Cleared existing auditoriums");
        
        // Insert new auditoriums
        const result = await auditoriumSchema.insertMany(auditoriums);
        console.log(`Successfully seeded ${result.length} auditoriums`);
        
        // Display inserted auditoriums
        console.log("Inserted auditoriums:");
        result.forEach(auditorium => {
            console.log(`${auditorium.id}: ${auditorium.name} (Building: ${auditorium.buildingId}, Capacity: ${auditorium.capacity})`);
            console.log(`   Features: ${auditorium.features.join(', ')}`);
        });
        
    } catch (error) {
        console.error("Error seeding auditoriums:", error);
    } finally {
        // Close connection
        mongoose.connection.close();
        console.log("Database connection closed");
    }
}

// Run the seeding function
seedAuditoriums();