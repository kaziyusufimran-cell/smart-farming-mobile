const express = require("express");

const {
  getAlerts,
  getAlertHistory,
  testSMS,
} = require("../controllers/alertController");

const router = express.Router();

// Test SMS
router.post("/test-sms", testSMS);

// Get alert history (MongoDB stored records)
router.get("/history/all", getAlertHistory);
router.get("/:deviceId/history", getAlertHistory);

// Get live computed alerts for a specific device
router.get("/:deviceId", getAlerts);

module.exports = router;