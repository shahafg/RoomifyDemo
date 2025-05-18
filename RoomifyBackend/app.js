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

//enable working with request from client port (5173)
const cors = require("cors");
app.use(cors());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin",  "http://localhost:5173");
    res.header("Access-Control-Allow-Headers",  
              "Origin,X-Requested-With, Content-Type, Accept");
    next();
});

//use users route
const users = require("./routes/users.route");
app.use("/users", users);

// Start the server
app.listen(PORT, (err) => {
    if (err) {
        console.log("Can't connect to the server", err);
    } else {
        console.log("Server started on port", PORT);
    }
});