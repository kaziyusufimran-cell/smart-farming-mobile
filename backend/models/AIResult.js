const mongoose = require("mongoose");

const aiResultSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      default: "ESP32-FARM-01",
    },

    imageSource: {
      type: String,
      enum: [
        "mobile",
        "esp32-camera",
      ],
      default: "mobile",
    },

    pestDetection: {
      detected: {
        type: Boolean,
        default: false,
      },

      pestName: {
        type: String,
        default: null,
      },

      confidence: {
        type: Number,
        default: 0,
      },
    },

    cropHealth: {
      status: {
        type: String,
        default: "Unknown",
      },

      disease: {
        type: String,
        default: null,
      },

      diseaseConfidence: {
        type: Number,
        default: 0,
      },

      nutrientStatus: {
        type: String,
        default: "Unknown",
      },

      nutrientConfidence: {
        type: Number,
        default: 0,
      },

      healthScore: {
        type: Number,
        default: 0,
      },
    },

    recommendation: {
      type: String,
      default: "Continue monitoring the crop.",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "AIResult",
  aiResultSchema
);