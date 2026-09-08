const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      default: "ESP32-FARM-01",
    },
    type: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: "general",
    },
    message: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "HIGH",
    },
    sensorValue: {
      type: mongoose.Schema.Types.Mixed,
    },
    status: {
      type: String,
      default: "ACTIVE",
    },
    read: {
      type: Boolean,
      default: false,
    },
    smsSent: {
      type: Boolean,
      default: false,
    },
    smsResponse: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Alert", alertSchema);
