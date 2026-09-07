const express = require("express");

const {
  receiveAIResult,
  getLatestAIResult,
  getAIHistory,
} = require("../controllers/aiController");

const router = express.Router();


// Receive AI result from ESP32-S3
router.post(
  "/result",
  receiveAIResult
);


// Get latest AI result
router.get(
  "/latest/:deviceId",
  getLatestAIResult
);


// Get AI history
router.get(
  "/history/:deviceId",
  getAIHistory
);


module.exports = router;