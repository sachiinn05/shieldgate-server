const express = require("express");
const cors = require("cors");

const connectDB = require("./config/database");
require("./config/redis");

const rateLimitRoutes = require("./routes/rateLimitRoutes");

const app = express();

app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
  res.send("ShieldGate Running 🚀");
});


app.use("/", rateLimitRoutes);


connectDB()
  .then(() => {
    console.log("Database connection established......");

    app.listen(8001, () => {
      console.log("Server listening on port 8001");
    });
  })
  .catch((err) => {
    console.log("Database cannot be connected..", err);
  });