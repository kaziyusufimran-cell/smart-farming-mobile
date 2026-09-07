const { analyzeCropImage } = require("../ai/aiService");
const AIResult = require("../models/AIResult");


// =====================================================
// ANALYZE CROP
// =====================================================

const analyzeCrop = async (req, res) => {

  try {

    // =================================================
    // CHECK IMAGE
    // =================================================

    if (!req.file) {

      return res.status(400).json({
        success: false,
        message: "No crop image uploaded",
      });

    }


    console.log(
      "Crop image received:",
      req.file.originalname
    );


    // =================================================
    // RUN AI ANALYSIS
    // =================================================

    const result =
      await analyzeCropImage(
        req.file
      );


    // =================================================
    // SAVE AI RESULT TO MONGODB
    // =================================================

    const savedResult =
      await AIResult.create({

        deviceId:
          req.body.deviceId ||
          "ESP32-FARM-01",

        imageSource:
          req.body.imageSource ||
          "mobile",


        // =============================================
        // PEST DETECTION
        // =============================================

        pestDetection: {

          detected:
            result.yolo?.count > 0,

          pestName:
            result.yolo?.detections?.[0]?.className ||
            null,

          confidence:
            result.yolo?.detections?.[0]?.confidence ||
            0,

        },


        // =============================================
        // CROP HEALTH
        // =============================================

        cropHealth: {

          status:
            result.ai?.healthy
              ? "Healthy"
              : result.status ||
                "Analysis Complete",

          disease:
            result.ai?.classLabel ||
            result.condition ||
            null,

          diseaseConfidence:
            result.ai?.confidence ||
            0,

          nutrientStatus: result.deficiency?.classLabel || "Unknown",
nutrientConfidence: result.deficiency?.confidence || 0,
          healthScore:
            result.healthScore ?? 0,

        },


        // =============================================
        // RECOMMENDATION
        // =============================================

        recommendation:
          result.recommendation ||
          "Continue monitoring the crop.",

      });


    console.log(
      "AI result saved to MongoDB:",
      savedResult._id
    );


    // =================================================
    // SEND RESPONSE TO REACT
    // =================================================

    return res.status(200).json({

      success: true,

      message:
        "Crop image analyzed successfully",


      image: {

        filename:
          req.file.filename,

        originalName:
          req.file.originalname,

      },


      // ===============================================
      // AI RESULT
      // ===============================================

      ...result,


      // ===============================================
      // DATABASE
      // ===============================================

      database: {

        saved: true,

        id:
          savedResult._id,

      },

    });

  }


  // ===================================================
  // ERROR
  // ===================================================

  catch (error) {

    console.error(
      "Crop analysis error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Crop analysis failed",

      error:
        error.message,

    });

  }

};


// =====================================================
// GET CROP HISTORY
// =====================================================

const getCropHistory = async (req, res) => {

  try {

    const history =
      await AIResult.find({

        imageSource:
          "mobile",

      })

      .sort({
        createdAt: -1,
      })

      .limit(20);


    return res.status(200).json({

      success: true,

      count:
        history.length,

      history,

    });

  }


  catch (error) {

    console.error(
      "Crop history error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Failed to fetch crop history",

      error:
        error.message,

    });

  }

};


// =====================================================
// EXPORT
// =====================================================

module.exports = {

  analyzeCrop,

  getCropHistory,

};