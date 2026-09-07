const mongoose = require("mongoose");

const sensorDataSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      default: "ESP32-FARM-01",
    },

    // ==========================================
    // ENVIRONMENT
    // ==========================================

    temperature: {
      type: Number,
      default: null,
    },

    humidity: {
      type: Number,
      default: null,
    },

    light: {
      type: Number,
      default: null,
    },

    lightLevel: {
      type: Number,
      default: null,
    },

    lightIntensity: {
      type: Number,
      default: null,
    },

    airQuality: {
      type: Number,
      default: null,
    },

    gasLevel: {
      type: Number,
      default: null,
    },

    rain: {
      type: Boolean,
      default: false,
    },

    // ==========================================
    // SOIL
    // ==========================================

    soilMoisture: {
      type: Number,
      default: null,
    },

    soilTemperature: {
      type: Number,
      default: null,
    },

    // ==========================================
    // WATER QUALITY
    // ==========================================

    ph: {
      type: Number,
      default: null,
    },

    tds: {
      type: Number,
      default: null,
    },

    turbidity: {
      type: Number,
      default: null,
    },

    waterTemperature: {
      type: Number,
      default: null,
    },

    // ==========================================
    // WATER TANK
    // ==========================================

    waterLevel: {
      type: Number,
      default: null,
    },

    tankLevel: {
      type: Number,
      default: null,
    },

    waterUsage: {
      type: Number,
      default: null,
    },

    // ==========================================
    // PLANT / CROP
    // ==========================================

    plantHeight: {
      type: Number,
      default: null,
    },

    leafCount: {
      type: Number,
      default: null,
    },

    growthRate: {
      type: Number,
      default: null,
    },

    // ==========================================
    // PUMP
    // ==========================================

    pumpStatus: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "SensorData",
  sensorDataSchema
);