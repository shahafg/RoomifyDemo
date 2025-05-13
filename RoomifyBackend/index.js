const express = require("express");
const app = express();
const PORT = 8000;

app.get("/", (req, res)=> {
    res.send("QUE asdas")
});

app.listen(PORT, ()=> console.log("Server started on port ", PORT));