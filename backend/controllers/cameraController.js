const {
  analyzeCropImage,
} = require("../ai/aiService");


const receiveCameraImage = async (
  req,
  res
) => {

  try {

    if (!req.file) {

      return res.status(400).json({
        success: false,
        message:
          "No camera image received",
      });

    }

    const deviceId =
      req.body.deviceId ||
      "ESP32-CAM-01";


    console.log(
      "CAMERA IMAGE RECEIVED"
    );

    console.log(
      "Device:",
      deviceId
    );

    console.log(
      "File:",
      req.file.originalname
    );


    // Send camera image to the
    // same crop-analysis function
    const result =
      await analyzeCropImage(
        req.file
      );


    res.json({

      success: true,

      message:
        "Camera image analyzed successfully",

      deviceId,

      image: {

        filename:
          req.file.filename,

        originalName:
          req.file.originalname,

      },

      analysis: result,

    });

  } catch (error) {

    console.error(
      "CAMERA ANALYSIS ERROR:",
      error
    );

    res.status(500).json({

      success: false,

      message:
        "Camera image analysis failed",

    });

  }

};


module.exports = {
  receiveCameraImage,
};