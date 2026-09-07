const express = require("express");

const {
  getFarmDecision,
} = require("../controllers/decisionController");

const router = express.Router();

router.get(
  "/:deviceId",
  getFarmDecision
);

module.exports = router;