const express = require("express");
const cors = require("cors");
const http = require("http");

const connectDB = require("./config/database");
require("./config/redis");

const rateLimitRoutes = require("./routes/rateLimitRoutes");
const statsRouter = require("./routes/statsRoutes");
const shieldGate = require("./middleware/shieldGateMiddleware");


const { initSocket } = require("./socket");

const app = express();
const server = http.createServer(app);


initSocket(server);


app.use(cors());
app.use(express.json());
app.use(shieldGate());


app.get("/", (req, res) => {
  res.send("ShieldGate Running ");
});

app.get("/test", (req, res) => {
  res.send("Request successful ✅");
});

app.use("/api", rateLimitRoutes);
app.use("/api/stats", statsRouter);


connectDB()
  .then(() => {
    console.log("Database connection established......");

    server.listen(8001, () => {
      console.log("🚀 Server running with Socket.io on port 8001");
    });
  })
  .catch((err) => {
    console.log("Database cannot be connected..", err);
  });