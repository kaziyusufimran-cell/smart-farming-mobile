// =====================================================
// AI SERVICE
// =====================================================

const path = require("path");
const { execFile } = require("child_process");
const { promisify } = require("util");

const execFileAsync = promisify(execFile);


// =====================================================
// FORMAT DISEASE NAME
// =====================================================

function formatDiseaseName(label) {

  if (!label) {
    return "Unknown";
  }

  return label
    .replace(/___/g, " - ")
    .replace(/_/g, " ")
    .replace(/\(including sour\)/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}


// =====================================================
// CHECK IF DISEASE RESULT IS HEALTHY
// =====================================================

function isHealthy(label) {

  if (!label) {
    return false;
  }

  const text = label.toLowerCase();

  return (
    text.includes("healthy") ||
    text.includes("no disease") ||
    text.includes("normal")
  );
}


// =====================================================
// RECOMMENDATION
// =====================================================

function getRecommendation({
  healthy,
  disease,
  pestDetected,
  deficiency
}) {

  if (pestDetected && disease && !healthy) {
    return "Pest and disease detected. Inspect the affected crop immediately and take appropriate control measures.";
  }

  if (pestDetected) {
    return "Pest detected. Inspect the affected crop and take appropriate pest-control measures.";
  }

  if (disease && !healthy) {
    return "Disease detected. Remove severely affected leaves and follow appropriate crop disease-management practices.";
  }

  if (deficiency && deficiency !== "Unknown") {
    return `Possible ${deficiency} deficiency detected. Check soil nutrients and consider appropriate fertilization.`;
  }

  if (healthy) {
    return "Crop appears healthy. Continue regular monitoring.";
  }

  return "Continue monitoring the crop.";
}


// =====================================================
// RUN YOLO PEST DETECTION
// =====================================================

async function runYOLO(imagePath) {

  try {

    const pythonCommand =
      process.env.VIRTUAL_ENV
        ? path.join(
            process.env.VIRTUAL_ENV,
            "Scripts",
            "python.exe"
          )
        : path.join(
            process.env.USERPROFILE,
            "IOTSIH",
            "ai-env",
            "Scripts",
            "python.exe"
          );


    const yoloScript =
      path.join(
        __dirname,
        "yolo",
        "yolo_detect.py"
      );


    const absoluteImagePath =
      path.resolve(
        process.cwd(),
        imagePath
      );


    console.log("=================================");
    console.log("RUNNING YOLO PEST AI");
    console.log("Python:", pythonCommand);
    console.log("Script:", yoloScript);
    console.log("Image:", absoluteImagePath);
    console.log("=================================");


    const {
      stdout,
      stderr
    } = await execFileAsync(
      pythonCommand,
      [
        yoloScript,
        absoluteImagePath
      ],
      {
        windowsHide: true,
        maxBuffer: 10 * 1024 * 1024
      }
    );


    if (stderr) {

      console.log(
        "YOLO AI STDERR:",
        stderr
      );

    }


    const result =
      JSON.parse(
        stdout.trim()
      );


    console.log(
      "YOLO AI RESULT:",
      JSON.stringify(
        result,
        null,
        2
      )
    );


    return result;

  } catch (error) {

    console.error(
      "YOLO AI ERROR:",
      error.message
    );


    return {

      success: false,

      count: 0,

      detections: [],

      error: error.message

    };

  }

}


// =====================================================
// RUN DISEASE AI
// =====================================================

async function runDiseaseAI(imagePath) {

  try {

    const pythonCommand =
      process.env.VIRTUAL_ENV
        ? path.join(
            process.env.VIRTUAL_ENV,
            "Scripts",
            "python.exe"
          )
        : path.join(
            process.env.USERPROFILE,
            "IOTSIH",
            "ai-env",
            "Scripts",
            "python.exe"
          );


    const diseaseScript =
      path.join(
        __dirname,
        "disease_predict.py"
      );


    const absoluteImagePath =
      path.resolve(
        process.cwd(),
        imagePath
      );


    console.log("=================================");
    console.log("RUNNING CROP DISEASE AI");
    console.log("Python:", pythonCommand);
    console.log("Script:", diseaseScript);
    console.log("Image:", absoluteImagePath);
    console.log("=================================");


    const {
      stdout,
      stderr
    } = await execFileAsync(
      pythonCommand,
      [
        diseaseScript,
        absoluteImagePath
      ],
      {
        windowsHide: true,
        maxBuffer: 10 * 1024 * 1024
      }
    );


    if (stderr) {

      console.log(
        "DISEASE AI STDERR:",
        stderr
      );

    }


    const result =
      JSON.parse(
        stdout.trim()
      );


    console.log(
      "DISEASE AI RESULT:",
      JSON.stringify(
        result,
        null,
        2
      )
    );


    return result;

  } catch (error) {

    console.error(
      "DISEASE AI ERROR:",
      error.message
    );


    return {

      success: false,

      classIndex: -1,

      classLabel: "Unknown",

      confidence: 0,

      error: error.message

    };

  }

}


// =====================================================
// RUN NUTRIENT DEFICIENCY AI
// =====================================================

async function runDeficiencyAI(imagePath) {

  try {

    const pythonCommand =
      process.env.VIRTUAL_ENV
        ? path.join(
            process.env.VIRTUAL_ENV,
            "Scripts",
            "python.exe"
          )
        : path.join(
            process.env.USERPROFILE,
            "IOTSIH",
            "ai-env",
            "Scripts",
            "python.exe"
          );


    const deficiencyScript =
      path.join(
        __dirname,
        "deficiency_predict.py"
      );


    const absoluteImagePath =
      path.resolve(
        process.cwd(),
        imagePath
      );


    console.log("=================================");
    console.log("RUNNING NUTRIENT DEFICIENCY AI");
    console.log("Python:", pythonCommand);
    console.log("Script:", deficiencyScript);
    console.log("Image:", absoluteImagePath);
    console.log("=================================");


    const {
      stdout,
      stderr
    } = await execFileAsync(
      pythonCommand,
      [
        deficiencyScript,
        absoluteImagePath
      ],
      {
        windowsHide: true,
        maxBuffer: 10 * 1024 * 1024
      }
    );


    if (stderr) {

      console.log(
        "DEFICIENCY AI STDERR:",
        stderr
      );

    }


    const result =
      JSON.parse(
        stdout.trim()
      );


    console.log(
      "DEFICIENCY AI RESULT:",
      JSON.stringify(
        result,
        null,
        2
      )
    );


    return result;

  } catch (error) {

    console.error(
      "DEFICIENCY AI ERROR:",
      error.message
    );


    return {

      success: false,

      classIndex: -1,

      classLabel: "Unknown",

      confidence: 0,

      labels: [
        "N",
        "P",
        "K",
        "Mg"
      ],

      numClasses: 4,

      inputSize: 600,

      experiment: "B3-600",

      error: error.message

    };

  }

}


// =====================================================
// ANALYZE COMPLETE CROP IMAGE
// =====================================================

async function analyzeCropImage(file) {

  if (!file) {

    throw new Error(
      "No image file provided"
    );

  }


  console.log("");
  console.log("========================================");
  console.log("STARTING COMPLETE CROP AI ANALYSIS");
  console.log("========================================");


  // ===================================================
  // IMAGE PATH
  // ===================================================

  console.log(
    "IMAGE FILE:",
    file.path
  );


  // ===================================================
  // 1. YOLO PEST DETECTION
  // ===================================================

  const yoloResult =
    await runYOLO(
      file.path
    );


  // ===================================================
  // 2. DISEASE AI
  // ===================================================

  const diseaseResult =
    await runDiseaseAI(
      file.path
    );


  if (!diseaseResult.success) {

    throw new Error(
      `Disease AI failed: ${
        diseaseResult.error || "Unknown error"
      }`
    );

  }


  // ===================================================
  // 3. NUTRIENT DEFICIENCY AI
  // ===================================================

  const deficiencyResult =
    await runDeficiencyAI(
      file.path
    );


  if (!deficiencyResult.success) {

    console.error(
      "Deficiency AI failed:",
      deficiencyResult.error
    );

  }


  // ===================================================
  // DISEASE INFORMATION
  // ===================================================

  const diseaseLabel =
    diseaseResult.classLabel ||
    "Unknown";


  const diseaseConfidence =
    Number(
      diseaseResult.confidence || 0
    );


  const healthy =
    isHealthy(
      diseaseLabel
    );


  const formattedDisease =
    formatDiseaseName(
      diseaseLabel
    );


  // ===================================================
  // PEST INFORMATION
  // ===================================================

  const pestCount =
    Number(
      yoloResult.count || 0
    );


  const pestDetected =
    pestCount > 0;


  const firstPest =
    yoloResult.detections &&
    yoloResult.detections.length > 0
      ? yoloResult.detections[0]
      : null;


  // ===================================================
  // NUTRIENT INFORMATION
  // ===================================================

  const deficiencyLabel =
    deficiencyResult.success
      ? deficiencyResult.classLabel || "Unknown"
      : "Unknown";


  const deficiencyConfidence =
    Number(
      deficiencyResult.confidence || 0
    );


  // ===================================================
  // HEALTH SCORE
  // ===================================================

  let healthScore = 100;


  // Disease penalty

  if (!healthy) {

    if (diseaseConfidence >= 80) {

      healthScore -= 50;

    } else if (diseaseConfidence >= 60) {

      healthScore -= 40;

    } else if (diseaseConfidence >= 40) {

      healthScore -= 25;

    } else {

      healthScore -= 15;

    }

  }


  // Pest penalty

  if (pestDetected) {

    healthScore -= 25;

  }


  // Nutrient deficiency penalty

  if (
    deficiencyResult.success &&
    deficiencyLabel !== "Unknown"
  ) {

    healthScore -= 15;

  }


  // Keep between 0 and 100

  healthScore =
    Math.max(
      0,
      Math.min(
        100,
        healthScore
      )
    );


  // ===================================================
  // OVERALL STATUS
  // ===================================================

  let status = "Healthy";


  if (healthScore < 40) {

    status = "Critical";

  } else if (healthScore < 70) {

    status = "Needs Attention";

  } else if (healthScore < 90) {

    status = "Monitor";

  } else {

    status = "Healthy";

  }


  // ===================================================
  // RECOMMENDATION
  // ===================================================

  const recommendation =
    getRecommendation({

      healthy,

      disease:
        healthy
          ? null
          : formattedDisease,

      pestDetected,

      deficiency:
        deficiencyLabel

    });


  // ===================================================
  // FINAL RESULT
  // ===================================================

  console.log("");
  console.log("========================================");
  console.log("COMPLETE AI ANALYSIS FINISHED");
  console.log("========================================");

  console.log(
    "Disease:",
    formattedDisease
  );

  console.log(
    "Disease Confidence:",
    diseaseConfidence
  );

  console.log(
    "Healthy:",
    healthy
  );

  console.log(
    "Pest Detected:",
    pestDetected
  );

  console.log(
    "Pest Count:",
    pestCount
  );

  console.log(
    "Nutrient:",
    deficiencyLabel
  );

  console.log(
    "Nutrient Confidence:",
    deficiencyConfidence
  );

  console.log(
    "Health Score:",
    healthScore
  );

  console.log(
    "Status:",
    status
  );

  console.log("========================================");
  console.log("");


  return {

    // =================================================
    // GENERAL
    // =================================================

    success: true,

    status,

    condition:
      healthy
        ? "Healthy"
        : formattedDisease,

    healthScore,

    recommendation,


    // =================================================
    // YOLO PEST AI
    // =================================================

    yolo: {

      success:
        yoloResult.success === true,

      count:
        pestCount,

      detections:
        yoloResult.detections || []

    },


    // =================================================
    // CROP DISEASE AI
    // =================================================

    ai: {

      success:
        diseaseResult.success === true,

      healthy,

      classIndex:
        diseaseResult.classIndex ?? -1,

      classLabel:
        diseaseLabel,

      condition:
        formattedDisease,

      confidence:
        diseaseConfidence,

      model:
        "MobileNetV2 A5 PlantDoc Mixed",

      numClasses:
        diseaseResult.numClasses || 38,

      inputSize:
        diseaseResult.inputSize || 600,

      experiment:
        diseaseResult.experiment ||
        "A5_PlantDoc_Mixed"

    },


    // =================================================
    // NUTRIENT DEFICIENCY AI
    // =================================================

    deficiency: {

      inference:
        deficiencyResult.success === true,

      classIndex:
        deficiencyResult.classIndex ?? -1,

      classLabel:
        deficiencyLabel,

      confidence:
        deficiencyConfidence,

      labels:
        deficiencyResult.labels || [
          "N",
          "P",
          "K",
          "Mg"
        ],

      numClasses:
        deficiencyResult.numClasses || 4,

      inputSize:
        deficiencyResult.inputSize || 600,

      experiment:
        deficiencyResult.experiment ||
        "B3-600",

      model:
        "MobileNetV2 B3-600"

    }

  };

}


// =====================================================
// EXPORT
// =====================================================

module.exports = {

  analyzeCropImage,

  runYOLO,

  runDiseaseAI,

  runDeficiencyAI,

  formatDiseaseName,

  isHealthy,

  getRecommendation

};