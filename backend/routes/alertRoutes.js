const express = require("express");

const {
  getAlerts,
  testSMS,
} = require("../controllers/alertController");

const router = express.Router();

// Test SMS
router.post("/test-sms", testSMS);

// Get alerts for a specific device
router.get("/:deviceId", getAlerts);

module.exports = router;