require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");

const connectDB = require("./config/database");
require("./config/redis");

const { initSocket } = require("./socket");
const shieldGate = require("./middleware/shieldGateMiddleware");

const authRoutes = require("./routes/authRoutes");
const rateLimitRoutes = require("./routes/rateLimitRoutes");
const statsRoutes = require("./routes/statsRoutes");
const userRouter=require("./routes/userRoutes")
const app = express();
const server = http.createServer(app);

initSocket(server);


app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);


app.use(shieldGate());

app.get("/", (req, res) => {
  res.send("ShieldGate Running 🚀");
});

app.get("/test", (req, res) => {
  res.send("Request successful ✅");
});

app.use("/api", rateLimitRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/user",userRouter)


app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});
const PORT = process.env.PORT || 8001;

connectDB()
  .then(() => {
    console.log("✅ Database connected");
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB connection failed:", err);
  });