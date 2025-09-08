const mongoose = require("mongoose");
const auditoriumTimeSlotsSchema = require('./models/auditoriumTimeSlotsSchema.js');

// Connect to MongoDB
const dbURL = "mongodb://localhost:27017/Roomify";
mongoose.connect(dbURL).then(
    () => console.log("Connected to DB for seeding"),
    (err) => console.log("Could not connect to DB", err)
);

// Time slots data (8:00 AM to 8:00 PM in 1-hour slots)
const timeSlots = [
    { id: 1, startTime: "08:00", endTime: "09:00", displayName: "8:00 AM - 9:00 AM", isActive: true, order: 1 },
    { id: 2, startTime: "09:00", endTime: "10:00", displayName: "9:00 AM - 10:00 AM", isActive: true, order: 2 },
    { id: 3, startTime: "10:00", endTime: "11:00", displayName: "10:00 AM - 11:00 AM", isActive: true, order: 3 },
    { id: 4, startTime: "11:00", endTime: "12:00", displayName: "11:00 AM - 12:00 PM", isActive: true, order: 4 },
    { id: 5, startTime: "12:00", endTime: "13:00", displayName: "12:00 PM - 1:00 PM", isActive: true, order: 5 },
    { id: 6, startTime: "13:00", endTime: "14:00", displayName: "1:00 PM - 2:00 PM", isActive: true, order: 6 },
    { id: 7, startTime: "14:00", endTime: "15:00", displayName: "2:00 PM - 3:00 PM", isActive: true, order: 7 },
    { id: 8, startTime: "15:00", endTime: "16:00", displayName: "3:00 PM - 4:00 PM", isActive: true, order: 8 },
    { id: 9, startTime: "16:00", endTime: "17:00", displayName: "4:00 PM - 5:00 PM", isActive: true, order: 9 },
    { id: 10, startTime: "17:00", endTime: "18:00", displayName: "5:00 PM - 6:00 PM", isActive: true, order: 10 },
    { id: 11, startTime: "18:00", endTime: "19:00", displayName: "6:00 PM - 7:00 PM", isActive: true, order: 11 },
    { id: 12, startTime: "19:00", endTime: "20:00", displayName: "7:00 PM - 8:00 PM", isActive: true, order: 12 }
];

async function seedTimeSlots() {
    try {
        // Clear existing time slots
        await auditoriumTimeSlotsSchema.deleteMany({});
        console.log("Cleared existing time slots");
        
        // Insert new time slots
        const result = await auditoriumTimeSlotsSchema.insertMany(timeSlots);
        console.log(`Successfully seeded ${result.length} time slots`);
        
        // Display inserted time slots
        console.log("Inserted time slots:");
        result.forEach(slot => {
            console.log(`${slot.id}: ${slot.displayName} (${slot.startTime} - ${slot.endTime})`);
        });
        
    } catch (error) {
        console.error("Error seeding time slots:", error);
    } finally {
        // Close connection
        mongoose.connection.close();
        console.log("Database connection closed");
    }
}

// Run the seeding function
seedTimeSlots();