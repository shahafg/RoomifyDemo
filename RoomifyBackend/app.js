// Import Express
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

// //enable working with request from client port (5173)
// const cors = require("cors");
// app.use(cors());
// app.use((req, res, next) => {
//     res.header("Access-Control-Allow-Origin",  "http://localhost:5173");
//     res.header("Access-Control-Allow-Headers",  
//               "Origin,X-Requested-With, Content-Type, Accept");
//     next();
// });
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

// use maintenance route
const maintenanceRouter = require('./routes/maintenance_routes.js');
app.use("/maintenance", maintenanceRouter); 

const bookingsRouter = require('./routes/bookings-route.js');
app.use('/bookings', bookingsRouter);

// Start the server
app.listen(PORT, (err) => {
    if (err) {
        console.log("Can't connect to the server", err);
    } else {
        console.log("Server started on port", PORT);
    }
});