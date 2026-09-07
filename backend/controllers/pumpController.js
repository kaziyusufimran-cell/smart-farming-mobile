const SensorData = require("../models/SensorData");

// Turn pump ON/OFF
const controlPump = async (req, res) => {
  try {
    const { deviceId, pumpStatus } = req.body;

    if (typeof pumpStatus !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "pumpStatus must be true or false",
      });
    }

    const id = deviceId || "ESP32-FARM-01";

    const latestData = await SensorData.findOne({
      deviceId: id,
    }).sort({ createdAt: -1 });

    if (latestData) {
      latestData.pumpStatus = pumpStatus;
      await latestData.save();
    } else {
      await SensorData.create({
        deviceId: id,
        pumpStatus,
      });
    }

    res.json({
      success: true,
      message: pumpStatus
        ? "Pump turned ON"
        : "Pump turned OFF",
      pumpStatus,
    });
  } catch (error) {
    console.error("Pump control error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to control pump",
    });
  }
};


// ESP32 gets current pump command
const getPumpStatus = async (req, res) => {
  try {
    const deviceId =
      req.params.deviceId || "ESP32-FARM-01";

    const latestData = await SensorData.findOne({
      deviceId,
    }).sort({ createdAt: -1 });

    if (!latestData) {
      return res.json({
        success: true,
        deviceId,
        pumpStatus: false,
      });
    }

    res.json({
      success: true,
      deviceId,
      pumpStatus: latestData.pumpStatus,
    });
  } catch (error) {
    console.error("Pump status error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get pump status",
    });
  }
};


module.exports = {
  controlPump,
  getPumpStatus,
};