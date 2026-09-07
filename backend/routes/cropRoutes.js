const express = require("express");
const multer = require("multer");
const path = require("path");

const {
  analyzeCrop,
  getCropHistory,
} = require("../controllers/cropController");

const router = express.Router();


// =====================================================
// MULTER STORAGE
// =====================================================

const storage = multer.diskStorage({

  destination: (req, file, cb) => {

    cb(
      null,
      "uploads/crops"
    );

  },


  filename: (req, file, cb) => {

    const extension =
      path.extname(
        file.originalname
      );

    const filename =
      `crop-${Date.now()}${extension}`;

    cb(
      null,
      filename
    );

  },

});


const upload =
  multer({
    storage,
  });


// =====================================================
// MOBILE CROP ANALYSIS
// =====================================================

router.post(
  "/analyze",
  upload.single("image"),
  analyzeCrop
);


// =====================================================
// ESP32-CAM CROP ANALYSIS
// =====================================================

router.post(
  "/esp32-analyze",
  upload.single("image"),
  (req, res, next) => {

    if (req.file) {

      req.body.deviceId =
        req.body.deviceId ||
        "ESP32-FARM-01";

      req.body.imageSource =
        "esp32-camera";

    }

    next();

  },
  analyzeCrop
);


// =====================================================
// CROP HISTORY
// =====================================================

router.get(
  "/history",
  getCropHistory
);


// =====================================================
// EXPORT
// =====================================================

module.exports = router;