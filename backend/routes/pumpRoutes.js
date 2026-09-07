const express = require("express");

const {
  controlPump,
  getPumpStatus,
} = require("../controllers/pumpController");

const router = express.Router();

// Mobile app controls pump
router.post("/control", controlPump);

// ESP32 checks pump command
router.get("/status/:deviceId", getPumpStatus);

module.exports = router;