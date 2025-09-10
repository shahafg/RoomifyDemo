//Import Express
const express = require("express");
const app = express();
const PORT = 3000;

//connect to DB
const mongoose = require("mongoose");
const dbURL = "mongodb://localhost:27017/Roomify";
mongoose.connect(dbURL).then(
    () => console.log("connected to DB"),
    (err) => console.log("could not connect to DB", err));

//enable working with json
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

const cors = require("cors");
const allowedOrigins = ["http://localhost:5173", "http://localhost:4200"]; // Compass, Angular

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // Allow requests like Postman or server-to-server
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
}));

//use users route
const users = require("./routes/users.route");
app.use("/users", users);

//use buildings route
const buildings = require("./routes/buildings.route");
app.use("/buildings", buildings);

//use messages route
const messages = require("./routes/messages.route");
app.use("/messages", messages);

//use rooms route
const rooms = require("./routes/rooms.route");
app.use("/rooms", rooms);

//use schedule periods route
const schedule = require("./routes/schedule-periods.route");
app.use("/schedule", schedule);

//use tickets route
const tickets = require("./routes/tickets.route");
app.use("/tickets", tickets);

//use maintenance route
const maintenanceRouter = require('./routes/maintenance_routes.js');
app.use("/maintenance", maintenanceRouter); 

//use bookings route
const bookingsRouter = require('./routes/bookings-route.js');
app.use('/bookings', bookingsRouter);

//use auditoriums route
const auditoriumsRouter = require('./routes/auditoriums.route.js');
app.use('/auditoriums', auditoriumsRouter);

//use auditorium-bookings route
const auditoriumBookingsRouter = require('./routes/auditorium-bookings.route.js');
app.use('/auditorium-bookings', auditoriumBookingsRouter);

//use auditorium-time-slots route
const auditoriumTimeSlotsRouter = require('./routes/auditorium-time-slots.route.js');
app.use('/auditorium-time-slots', auditoriumTimeSlotsRouter);

//use audit-logs route
const auditLogsRouter = require('./routes/audit-logs.route.js');
app.use('/audit-logs', auditLogsRouter);

//Start the server
app.listen(PORT, (err) => {
    if (err) {
        console.log("Can't connect to the server", err);
    } else {
        console.log("Server started on port", PORT);
    }
});