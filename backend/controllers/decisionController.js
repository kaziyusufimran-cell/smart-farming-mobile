const SensorData = require("../models/SensorData");
const AIResult = require("../models/AIResult");

const getFarmDecision = async (req, res) => {
  try {
    const { deviceId } = req.params;

    // Get latest sensor data
    const sensorData = await SensorData.findOne({
      deviceId,
    }).sort({
      createdAt: -1,
    });

    // Get latest AI result
    const aiResult = await AIResult.findOne({
      deviceId,
    }).sort({
      createdAt: -1,
    });

    if (!sensorData) {
      return res.status(404).json({
        success: false,
        message: "No sensor data found",
      });
    }

    const decisions = [];

    // ==========================================
    // IRRIGATION DECISION
    // ==========================================

    if (
      sensorData.soilMoisture < 40 &&
      !sensorData.rain
    ) {
      decisions.push({
        type: "irrigation",
        level: "warning",
        icon: "🚰",
        title: "Irrigation Recommended",
        message:
          "Soil moisture is low and no rain is detected. Consider irrigation.",
      });
    }

    if (sensorData.soilMoisture >= 40) {
      decisions.push({
        type: "irrigation",
        level: "normal",
        icon: "💧",
        title: "Soil Moisture Adequate",
        message:
          "Current soil moisture is within the configured range.",
      });
    }

    if (sensorData.rain) {
      decisions.push({
        type: "irrigation",
        level: "normal",
        icon: "🌧️",
        title: "Rain Detected",
        message:
          "Delay irrigation while rainfall is detected.",
      });
    }

    // ==========================================
    // HEAT STRESS
    // ==========================================

    if (sensorData.temperature >= 35) {
      decisions.push({
        type: "heat",
        level: "danger",
        icon: "🌡️",
        title: "Heat Stress Warning",
        message:
          "High temperature detected. Monitor crops and water availability.",
      });
    }

    // ==========================================
    // FLOOD / HEAVY RAIN
    // ==========================================

    if (
      sensorData.rain &&
      sensorData.humidity >= 85
    ) {
      decisions.push({
        type: "flood",
        level: "warning",
        icon: "🌧️",
        title: "Excess Rainfall Risk",
        message:
          "Rain and high humidity detected. Monitor drainage and field conditions.",
      });
    }

    // ==========================================
    // PEST DETECTION
    // ==========================================

    if (
      aiResult?.pestDetection?.detected &&
      aiResult.pestDetection.confidence >= 70
    ) {
      decisions.push({
        type: "pest",
        level: "danger",
        icon: "🐛",
        title: "Pest Activity Detected",
        message:
          `${aiResult.pestDetection.pestName || "Pest"} detected with ${aiResult.pestDetection.confidence}% confidence. Consider targeted crop protection.`,
      });
    }

    // ==========================================
    // DISEASE DETECTION
    // ==========================================

    if (
      aiResult?.cropHealth?.disease &&
      aiResult.cropHealth.diseaseConfidence >= 70
    ) {
      decisions.push({
        type: "disease",
        level: "danger",
        icon: "🦠",
        title: "Possible Crop Disease",
        message:
          `${aiResult.cropHealth.disease} detected with ${aiResult.cropHealth.diseaseConfidence}% confidence. Inspect affected plants.`,
      });
    }

    // ==========================================
    // NUTRIENT STATUS
    // ==========================================

    if (
      aiResult?.cropHealth?.nutrientStatus &&
      aiResult.cropHealth.nutrientStatus !== "Normal" &&
      aiResult.cropHealth.nutrientStatus !== "Unknown"
    ) {
      decisions.push({
        type: "nutrient",
        level: "warning",
        icon: "🧪",
        title: "Nutrient Stress Indication",
        message:
          `AI analysis indicates: ${aiResult.cropHealth.nutrientStatus}. Further field assessment is recommended.`,
      });
    }

    // ==========================================
    // WATER TANK
    // ==========================================

    if (sensorData.tankLevel < 20) {
      decisions.push({
        type: "tank",
        level: "danger",
        icon: "🚰",
        title: "Low Water Tank Level",
        message:
          "Water tank level is low. Check the water supply before irrigation.",
      });
    }

    // ==========================================
    // OVERALL STATUS
    // ==========================================

    let overallStatus = "normal";

    if (
      decisions.some(
        (item) => item.level === "danger"
      )
    ) {
      overallStatus = "danger";
    } else if (
      decisions.some(
        (item) => item.level === "warning"
      )
    ) {
      overallStatus = "warning";
    }

    res.json({
      success: true,

      deviceId,

      overallStatus,

      decisions,

      sensorSummary: {
        temperature: sensorData.temperature,
        humidity: sensorData.humidity,
        soilMoisture: sensorData.soilMoisture,
        rain: sensorData.rain,
        tankLevel: sensorData.tankLevel,
      },

      aiSummary: aiResult
        ? {
            healthScore:
              aiResult.cropHealth?.healthScore,

            disease:
              aiResult.cropHealth?.disease,

            pest:
              aiResult.pestDetection?.pestName,

            pestDetected:
              aiResult.pestDetection?.detected,
          }
        : null,
    });

  } catch (error) {
    console.error(
      "DECISION ENGINE ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to generate farm decisions",
    });
  }
};

module.exports = {
  getFarmDecision,
};