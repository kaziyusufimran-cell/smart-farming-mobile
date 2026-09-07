const express = require("express");

const router = express.Router();

const upload = require("../middleware/upload");

const {
  receiveCameraImage,
} = require("../controllers/cameraController");

router.post(
  "/upload",
  upload.single("image"),
  receiveCameraImage
);

module.exports = router;