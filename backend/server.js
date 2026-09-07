require("dotenv").config();

const express = require("express");
const cors = require("cors");

const pumpRoutes = require("./routes/pumpRoutes");
const aiRoutes = require("./routes/aiRoutes");
const decisionRoutes = require("./routes/decisionRoutes");
const cameraRoutes = require("./routes/cameraRoutes");
const authRoutes = require("./routes/authRoutes");
const iotRoutes = require("./routes/iotRoutes");
const alertRoutes = require("./routes/alertRoutes");
const cropRoutes = require("./routes/cropRoutes");

const connectDB = require("./config/db");

const app = express();

// Connect MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/pump", pumpRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/camera", cameraRoutes);
app.use("/api/decision", decisionRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/iot", iotRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/crop", cropRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Smart Farming API is running",
  });
});

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});