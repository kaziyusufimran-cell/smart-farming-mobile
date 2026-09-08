const SensorData = require("../models/SensorData");
const { checkSensorAlertsAndNotify } = require("../services/smsService");

// Receive sensor data from ESP32
const receiveSensorData = async (req, res) => {
  try {
    const data = req.body;

    const sensorData = await SensorData.create({
      deviceId: data.deviceId || "ESP32-FARM-01",

      temperature: data.temperature,
      humidity: data.humidity,
      light: data.light,
      rain: data.rain,
      airQuality: data.airQuality,
      gasLevel: data.gasLevel,

      soilMoisture: data.soilMoisture,
      soilTemperature: data.soilTemperature,

      ph: data.ph,
      tds: data.tds,
      turbidity: data.turbidity,
      waterTemperature: data.waterTemperature,

      tankLevel: data.tankLevel,
      pumpStatus: data.pumpStatus,
    });

    // Check alerts and send SMS asynchronously without blocking the response
    checkSensorAlertsAndNotify(sensorData).catch((err) => {
      console.error("Alert check background error:", err.message);
    });

    res.status(201).json({
      success: true,
      message: "Sensor data received",
      data: sensorData,
    });
  } catch (error) {
    console.error("Sensor data error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to save sensor data",
      error: error.message,
    });
  }
};


// Get latest sensor data
const getLatestSensorData = async (req, res) => {
  try {
    const data = await SensorData.findOne()
      .sort({ createdAt: -1 });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "No sensor data available",
      });
    }

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get sensor data error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get sensor data",
    });
  }
};
// Get historical sensor data
const getSensorHistory = async (req, res) => {
  try {
    const deviceId =
      req.params.deviceId || "ESP32-FARM-01";

    const limit = Math.min(
      parseInt(req.query.limit) || 50,
      200
    );

    const data = await SensorData.find({
      deviceId,
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select(
        "deviceId temperature humidity light rain soilMoisture soilTemperature ph tds turbidity waterTemperature tankLevel pumpStatus createdAt"
      );

    res.json({
      success: true,
      deviceId,
      count: data.length,
      data: data.reverse(),
    });
  } catch (error) {
    console.error("Sensor history error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get sensor history",
    });
  }
};

module.exports = {
  receiveSensorData,
  getLatestSensorData,
  getSensorHistory,
};