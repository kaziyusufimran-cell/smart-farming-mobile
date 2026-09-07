const express = require("express");

const {
  receiveSensorData,
  getLatestSensorData,
  getSensorHistory,
} = require("../controllers/iotController");

const router = express.Router();

// ESP32 sends sensor data
router.post("/sensor", receiveSensorData);

// Dashboard gets latest reading
router.get("/latest", getLatestSensorData);

// Dashboard gets historical readings
router.get("/history/:deviceId", getSensorHistory);

module.exports = router;