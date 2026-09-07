const SensorData = require("../models/SensorData");
const { sendSMS } = require("../services/twilioService");

// ==========================================
// GET ALERTS
// GET /api/alerts/:deviceId
// ==========================================
const getAlerts = async (req, res) => {
  try {
    const deviceId = req.params.deviceId || "ESP32-FARM-01";

    const data = await SensorData.findOne({
      deviceId,
    }).sort({ createdAt: -1 });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "No sensor data available",
      });
    }

    const alerts = [];

    // ==========================================
    // SOIL MOISTURE
    // ==========================================
    if (data.soilMoisture !== null && data.soilMoisture !== undefined) {
      if (data.soilMoisture < 20) {
        alerts.push({
          type: "critical",
          category: "irrigation",
          icon: "🚨",
          title: "Severe Water Stress",
          message:
            "Soil moisture is very low. Irrigation is strongly recommended.",
        });
      } else if (data.soilMoisture < 40) {
        alerts.push({
          type: "warning",
          category: "irrigation",
          icon: "💧",
          title: "Low Soil Moisture",
          message:
            "Soil moisture is below the current threshold. Consider irrigation.",
        });
      }
    }

    // ==========================================
    // TEMPERATURE
    // ==========================================
    if (data.temperature !== null && data.temperature !== undefined) {
      if (data.temperature > 35) {
        alerts.push({
          type: "warning",
          category: "heat",
          icon: "🌡️",
          title: "Heat Stress Warning",
          message:
            "Temperature is high. Monitor crops for heat stress.",
        });
      }
    }

    // ==========================================
    // RAIN
    // ==========================================
    if (data.rain === true) {
      alerts.push({
        type: "info",
        category: "rain",
        icon: "🌧️",
        title: "Rain Detected",
        message:
          "Rain has been detected. Consider delaying irrigation.",
      });
    }

    // ==========================================
    // WATER TANK
    // ==========================================
    if (data.tankLevel !== null && data.tankLevel !== undefined) {
      if (data.tankLevel < 20) {
        alerts.push({
          type: "critical",
          category: "water",
          icon: "🚰",
          title: "Low Water Tank",
          message:
            "Water tank level is very low.",
        });
      }
    }

    // ==========================================
    // pH
    // ==========================================
    if (data.ph !== null && data.ph !== undefined) {
      if (data.ph < 5.5 || data.ph > 8.5) {
        alerts.push({
          type: "warning",
          category: "water-quality",
          icon: "🧪",
          title: "Abnormal Water pH",
          message:
            `Current pH is ${data.ph}. Check water quality.`,
        });
      }
    }

    // ==========================================
    // TDS
    // ==========================================
    if (data.tds !== null && data.tds !== undefined) {
      if (data.tds > 1000) {
        alerts.push({
          type: "warning",
          category: "water-quality",
          icon: "⚗️",
          title: "High TDS",
          message:
            `TDS is ${data.tds} ppm. Check water quality.`,
        });
      }
    }

    // ==========================================
    // TURBIDITY
    // ==========================================
    if (data.turbidity !== null && data.turbidity !== undefined) {
      if (data.turbidity > 50) {
        alerts.push({
          type: "warning",
          category: "water-quality",
          icon: "🌊",
          title: "High Turbidity",
          message:
            "Water turbidity is high. Check the water source.",
        });
      }
    }

    // ==========================================
    // GAS
    // ==========================================
    if (data.gasLevel !== null && data.gasLevel !== undefined) {
      if (data.gasLevel > 300) {
        alerts.push({
          type: "warning",
          category: "environment",
          icon: "⚠️",
          title: "High Gas Level",
          message:
            "Gas sensor reading is elevated. Check the environment.",
        });
      }
    }

    // ==========================================
    // RESPONSE
    // ==========================================
    res.json({
      success: true,
      deviceId,
      count: alerts.length,
      alerts,
    });

  } catch (error) {
    console.error("Alert error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate alerts",
      error: error.message,
    });
  }
};


// ==========================================
// TEST SMS
// POST /api/alerts/test-sms
// ==========================================
const testSMS = async (req, res) => {
  try {
    const message =
      req.body.message ||
      "Smart Farming Alert: This is a test SMS from your farm monitoring system.";

    const sms = await sendSMS(message);

    res.status(200).json({
      success: true,
      message: "SMS sent successfully",
      sms,
    });

  } catch (error) {
    console.error("SMS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to send SMS",
      error: error.message,
    });
  }
};


// ==========================================
// EXPORT CONTROLLERS
// ==========================================
module.exports = {
  getAlerts,
  testSMS,
};