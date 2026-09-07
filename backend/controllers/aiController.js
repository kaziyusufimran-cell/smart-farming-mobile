const AIResult = require("../models/AIResult");

// ==========================================
// RECEIVE AI RESULT
// ==========================================

const receiveAIResult = async (req, res) => {
  try {
    const {
      deviceId,
      imageSource,
      pestDetection,
      cropHealth,
      recommendation,
    } = req.body;

    if (!deviceId) {
      return res.status(400).json({
        success: false,
        message: "deviceId is required",
      });
    }

    const aiResult = new AIResult({
      deviceId,
      imageSource:
        imageSource || "esp32-camera",

      pestDetection:
        pestDetection || {
          detected: false,
          pestName: null,
          confidence: 0,
        },

      cropHealth:
        cropHealth || {
          status: "Unknown",
          disease: null,
          diseaseConfidence: 0,
          nutrientStatus: "Unknown",
          nutrientConfidence: 0,
          healthScore: 0,
        },

      recommendation:
        recommendation ||
        "Continue monitoring the crop.",
    });

    const savedResult =
      await aiResult.save();

    res.status(201).json({
      success: true,
      message: "AI result received successfully",
      data: savedResult,
    });

  } catch (error) {
    console.error(
      "AI RESULT ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to save AI result",
    });
  }
};


// ==========================================
// GET LATEST AI RESULT
// ==========================================

const getLatestAIResult = async (req, res) => {
  try {
    const { deviceId } = req.params;

    const result =
      await AIResult.findOne({
        deviceId,
      }).sort({
        createdAt: -1,
      });

    if (!result) {
      return res.status(404).json({
        success: false,
        message:
          "No AI result found for this device",
      });
    }

    res.json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error(
      "GET AI RESULT ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to retrieve AI result",
    });
  }
};


// ==========================================
// GET AI RESULT HISTORY
// ==========================================

const getAIHistory = async (req, res) => {
  try {
    const { deviceId } = req.params;

    const limit =
      Number(req.query.limit) || 20;

    const results =
      await AIResult.find({
        deviceId,
      })
        .sort({
          createdAt: -1,
        })
        .limit(limit);

    res.json({
      success: true,
      count: results.length,
      data: results,
    });

  } catch (error) {
    console.error(
      "AI HISTORY ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to retrieve AI history",
    });
  }
};


module.exports = {
  receiveAIResult,
  getLatestAIResult,
  getAIHistory,
};