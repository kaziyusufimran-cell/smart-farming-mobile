import { useEffect, useState } from "react";
import API from "../../backend/services/api";
import "./CropHealth.css";

function CropHealth() {

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

// =====================================================
// NUTRIENT NAME
// =====================================================

const getNutrientName = (label) => {

  const names = {
    N: "Nitrogen (N)",
    P: "Phosphorus (P)",
    K: "Potassium (K)",
    Mg: "Magnesium (Mg)"
  };

  return names[label] || label || "Unknown";
};
  // =====================================================
  // LOAD HISTORY
  // =====================================================

  const loadCropHistory = async () => {

    try {

      setHistoryLoading(true);

      const response =
        await API.get("/crop/history");

      console.log(
        "CROP HISTORY:",
        JSON.stringify(
          response.data,
          null,
          2
        )
      );

      setHistory(
        response.data.history || []
      );

    }

    catch (error) {

      console.error(
        "CROP HISTORY ERROR:",
        error
      );

    }

    finally {

      setHistoryLoading(false);

    }

  };


  useEffect(() => {

    loadCropHistory();

  }, []);


  // =====================================================
  // IMAGE SELECT
  // =====================================================

  const handleImageChange = (event) => {

    const file =
      event.target.files?.[0];

    if (!file) return;


    console.log(
      "SELECTED FILE:",
      file
    );


    setImage(file);

    setPreview(
      URL.createObjectURL(file)
    );

    setResult(null);

    setError("");

  };


  // =====================================================
  // ANALYZE CROP
  // =====================================================

  const analyzeCrop = async () => {

    if (!image) {

      setError(
        "Please select a crop image first."
      );

      return;

    }


    try {

      setLoading(true);

      setError("");

      setResult(null);


      // ===============================================
      // FORM DATA
      // ===============================================

      const formData =
        new FormData();

      formData.append(
        "image",
        image
      );


      console.log(
        "Uploading crop image..."
      );


      // ===============================================
      // API REQUEST
      // ===============================================

      const response =
        await API.post(
          "/crop/analyze",
          formData
        );


      console.log(
        "CROP ANALYSIS RESPONSE:",
        JSON.stringify(
          response.data,
          null,
          2
        )
      );


      // ===============================================
      // SAVE RESULT
      // ===============================================

      setResult(
        response.data
      );


      // ===============================================
      // REFRESH HISTORY
      // ===============================================

      await loadCropHistory();

    }

    catch (error) {

      console.error(
        "CROP ANALYSIS ERROR:",
        error
      );


      console.error(
        "SERVER RESPONSE:",
        error.response?.data
      );


      setError(
        error.response?.data?.message ||
        "Unable to analyze crop image."
      );

    }

    finally {

      setLoading(false);

    }

  };


  // =====================================================
  // RESET ANALYSIS
  // =====================================================

  const resetAnalysis = () => {

    setImage(null);

    setPreview("");

    setResult(null);

    setError("");

  };


  // =====================================================
  // HEALTH STATUS
  // =====================================================

  const getHealthStatus = () => {

    if (!result) {

      return "Waiting for analysis";

    }


    if (result.ai?.healthy === true) {

      return "Healthy";

    }


    const condition =
      (
        result.condition ||
        ""
      ).toLowerCase();


    if (
      condition.includes("healthy") ||
      condition.includes("no disease")
    ) {

      return "Healthy";

    }


    if (
      result.ai?.confidence >= 70
    ) {

      return "Needs Attention";

    }


    return "Needs Inspection";

  };


  // =====================================================
  // HEALTH CLASS
  // =====================================================

  const getHealthClass = () => {

    const status =
      getHealthStatus();


    if (
      status === "Healthy"
    ) {

      return "healthy";

    }


    if (
      status === "Needs Attention"
    ) {

      return "warning";

    }


    return "danger";

  };


  // =====================================================
  // PEST STATUS
  // =====================================================

  const pestDetected =
    result?.yolo?.count > 0;


  // =====================================================
  // PAGE
  // =====================================================

  return (

    <div className="crop-health-page">


      {/* =================================================
          HERO HEADER
      ================================================= */}

      <section className="crop-hero">

        <div className="crop-hero-icon">
          🌾
        </div>


        <div>

          <span className="section-eyebrow">
            AI-POWERED AGRICULTURE
          </span>


          <h1>
            AI Crop Health
          </h1>


          <p>
            Analyze crop images, detect possible diseases,
            identify pests and receive intelligent farm guidance.
          </p>

        </div>

      </section>


      {/* =================================================
          UPLOAD SECTION
      ================================================= */}

      <section className="crop-upload-card">


        <div className="card-heading">

          <div className="heading-icon">
            📷
          </div>


          <div>

            <h2>
              Crop Image Analysis
            </h2>


            <p>
              Upload a clear image of the crop leaf or plant.
            </p>

          </div>

        </div>


        {/* =================================================
            UPLOAD ZONE
        ================================================= */}

        <label className="upload-zone">

          <div className="upload-icon">
            ☁️
          </div>


          <strong>

            {image
              ? image.name
              : "Select a crop image"}

          </strong>


          <span>
            JPG, JPEG, PNG or other image formats
          </span>


          <span className="upload-action">
            Browse Image
          </span>


          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            hidden
          />

        </label>


        {/* =================================================
            IMAGE PREVIEW
        ================================================= */}

        {preview && (

          <div className="preview-section">


            <div className="preview-header">

              <div>

                <h3>
                  Selected Crop
                </h3>


                <span>
                  Ready for AI analysis
                </span>

              </div>


              <button
                type="button"
                className="remove-image-button"
                onClick={resetAnalysis}
              >
                Remove
              </button>

            </div>


            <div className="crop-image-container">


              <img
                src={preview}
                alt="Selected crop"
                className="crop-image"
              />


              {/* =================================================
                  YOLO PEST BOXES
              ================================================= */}

              {result?.yolo?.detections?.map(
                (detection, index) => (

                  <div
                    key={index}
                    className="pest-box"
                    style={{
                      left:
                        `${(detection.x1 / 640) * 100}%`,

                      top:
                        `${(detection.y1 / 640) * 100}%`,

                      width:
                        `${((detection.x2 - detection.x1) / 640) * 100}%`,

                      height:
                        `${((detection.y2 - detection.y1) / 640) * 100}%`,
                    }}
                  >

                    <span className="pest-label">

                      🐛{" "}

                      {detection.className}

                      {" "}

                      (
                      {detection.confidence}%
                      )

                    </span>

                  </div>

                )
              )}

            </div>

          </div>

        )}


        {/* =================================================
            ERROR
        ================================================= */}

        {error && (

          <div className="crop-error">

            ⚠️ {error}

          </div>

        )}


        {/* =================================================
            ANALYZE BUTTON
        ================================================= */}

        <button
          type="button"
          className="analyze-button"
          onClick={analyzeCrop}
          disabled={!image || loading}
        >

          {loading ? (

            <>

              <span className="loading-spinner"></span>

              Analyzing Crop...

            </>

          ) : (

            <>

              🔍 Analyze Crop

            </>

          )}

        </button>

      </section>


      {/* =================================================
          CURRENT ANALYSIS
      ================================================= */}

      {result && (

        <section className="analysis-section">


          {/* =================================================
              SECTION HEADER
          ================================================= */}

          <div className="section-title-row">

            <div>

              <span className="section-eyebrow">
                AI ANALYSIS
              </span>


              <h2>
                Crop Health Report
              </h2>


              <p>
                Results generated from your uploaded crop image.
              </p>

            </div>


            <div className="analysis-status-badge">

              ● Analysis Complete

            </div>

          </div>


          {/* =================================================
              HEALTH OVERVIEW
          ================================================= */}

          <div className="health-overview-card">


            <div className="health-score-area">

              <div
                className={`health-circle ${getHealthClass()}`}
              >

                <div className="health-circle-inner">

                  <strong>

                    {result.healthScore !== null &&
                    result.healthScore !== undefined

                      ? `${result.healthScore}%`

                      : "--"}

                  </strong>


                  <span>
                    Health
                  </span>

                </div>

              </div>

            </div>


            <div className="health-overview-content">

              <span className="overview-label">
                OVERALL CROP HEALTH
              </span>


              <h3>
                {getHealthStatus()}
              </h3>


              <p>
                {result.status ||
                  "Analysis Complete"}
              </p>


              <div className="overview-condition">

                <span>
                  Detected condition
                </span>


                <strong>
                  {result.condition ||
                    "No condition detected"}
                </strong>

              </div>

            </div>

          </div>


          {/* =================================================
              ANALYSIS CARDS
          ================================================= */}

          <div className="analysis-grid">


            {/* =================================================
                DISEASE
            ================================================= */}

            <div className="analysis-card disease-card">

              <div className="analysis-card-icon">
                🦠
              </div>


              <div className="analysis-card-content">

                <span>
                  DISEASE / CONDITION
                </span>


                <h3>
                  {result.condition ||
                    "No condition detected"}
                </h3>


                <div className="confidence-bar">

                  <div
                    className="confidence-fill"
                    style={{
                      width:
                        `${result.ai?.confidence || 0}%`,
                    }}
                  />

                </div>


                <small>

                  AI Confidence:{" "}

                  <strong>

                    {result.ai?.confidence ??
                      "--"}%

                  </strong>

                </small>

              </div>

            </div>


            {/* =================================================
                PEST
            ================================================= */}

            <div
              className={`analysis-card ${
                pestDetected
                  ? "pest-warning-card"
                  : "pest-safe-card"
              }`}
            >

              <div className="analysis-card-icon">
                🐛
              </div>


              <div className="analysis-card-content">

                <span>
                  PEST DETECTION
                </span>


                {pestDetected ? (

                  <>

                    <h3>
                      Pest Detected
                    </h3>


                    <p>
                      {result.yolo
                        ?.detections?.[0]
                        ?.className ||
                        "Unknown pest"}
                    </p>


                    <small>

                      Confidence:{" "}

                      <strong>

                        {result.yolo
                          ?.detections?.[0]
                          ?.confidence ??
                          0}%

                      </strong>

                    </small>

                  </>

                ) : (

                  <>

                    <h3>
                      No Pest Detected
                    </h3>


                    <p>
                      No detectable pest was found.
                    </p>

                  </>

                )}

              </div>

            </div>


            {/* =================================================
    NUTRIENTS
================================================= */}

<div className="analysis-card nutrient-card">

  <div className="analysis-card-icon">
    🧪
  </div>


  <div className="analysis-card-content">

    <span>
      NUTRIENT STATUS
    </span>


    <h3>

      {getNutrientName(
  result.deficiency?.classLabel
)}
    </h3>


    <p>

      {result.deficiency?.inference === true

       ?`Possible ${getNutrientName(
  result.deficiency.classLabel
)} deficiency detected.`

        : "Nutrient analysis is not available."}

    </p>


    <div className="confidence-bar">

      <div
        className="confidence-fill"
        style={{
          width:
            `${result.deficiency?.confidence || 0}%`,
        }}
      />

    </div>


    <small>

      Confidence:{" "}

      <strong>

        {result.deficiency?.confidence ?? 0}%

      </strong>

    </small>

  </div>

</div>
          </div>


          {/* =================================================
              AI FARM ADVISORY
          ================================================= */}

          <div className="ai-advisory-card">


            {/* =================================================
                ADVISORY HEADER
            ================================================= */}

            <div className="ai-advisory-header">

              <div className="ai-advisory-title">

                <div className="ai-advisory-icon">
                  🤖
                </div>


                <div>

                  <span className="ai-advisory-eyebrow">
                    INTELLIGENT FARMING
                  </span>


                  <h2>
                    AI Farm Advisory
                  </h2>


                  <p>
                    Smart guidance based on your crop analysis
                  </p>

                </div>

              </div>


              <div className="ai-active-badge">

                <span>
                  ●
                </span>

                AI ACTIVE

              </div>

            </div>


            {/* =================================================
                ADVISORY BODY
            ================================================= */}

            <div className="ai-advisory-body">


              <div className="advisory-main">

                <div className="advisory-light-icon">
                  💡
                </div>


                <div className="advisory-main-content">

                  <span className="advisory-label">
                    RECOMMENDED ACTION
                  </span>


                  <h3>

                    {result.ai?.healthy

                      ? "Continue Crop Monitoring"

                      : result.ai?.confidence < 70

                      ? "Needs Careful Inspection"

                      : "Disease Detected - Take Action"}

                  </h3>


                  <p>

                    {result.recommendation ||
                      "Continue monitoring the crop and inspect affected areas carefully."}

                  </p>

                </div>

              </div>


              {/* =================================================
                  GUIDANCE
              ================================================= */}

              <div className="advisory-guidance">


                <div className="guidance-item">

                  <div className="guidance-icon">
                    🔍
                  </div>


                  <div>

                    <strong>
                      Inspect
                    </strong>


                    <span>
                      Check affected leaves and plants closely.
                    </span>

                  </div>

                </div>


                <div className="guidance-item">

                  <div className="guidance-icon">
                    🌱
                  </div>


                  <div>

                    <strong>
                      Monitor
                    </strong>


                    <span>
                      Observe crop condition and growth regularly.
                    </span>

                  </div>

                </div>


                <div className="guidance-item">

                  <div className="guidance-icon">
                    👨‍🌾
                  </div>


                  <div>

                    <strong>
                      Get Guidance
                    </strong>


                    <span>
                      Seek agricultural expert advice if required.
                    </span>

                  </div>

                </div>

              </div>

            </div>


            {/* =================================================
                ADVISORY FOOTER
            ================================================= */}

            <div className="ai-advisory-footer">


              <div>

                🤖

                <span>
                  AI Source
                </span>


                <strong>
                  {result.imageSource ||
                    "Mobile AI"}
                </strong>

              </div>


              <div className="advisory-footer-divider">
                |
              </div>


              <div>

                ✓

                <span>
                  Analysis
                </span>


                <strong>
                  Complete
                </strong>

              </div>

            </div>

          </div>


          {/* =================================================
              AI MODEL INFORMATION
          ================================================= */}

          <div className="ai-model-bar">


            <div>

              🤖

              <span>
                AI Model
              </span>


              <strong>
                {result.ai?.model ||
                  "Crop AI Model"}
              </strong>

            </div>


            <div>

              📱

              <span>
                Source
              </span>


              <strong>
                {result.imageSource ||
                  "Mobile"}
              </strong>

            </div>

          </div>


          {/* =================================================
              AI MODEL DETAILS
          ================================================= */}

          <div className="ai-model-details">


            <div>

              <span>
                Model
              </span>


              <strong>
                {result.ai?.model ||
                  "Crop AI Model"}
              </strong>

            </div>


            <div>

              <span>
                Classes
              </span>


              <strong>
                {result.ai?.numClasses ||
                  38}
              </strong>

            </div>


            <div>

              <span>
                Input Size
              </span>


              <strong>

                {result.ai?.inputSize

                  ? `${result.ai.inputSize} × ${result.ai.inputSize}`

                  : "600 × 600"}

              </strong>

            </div>


            <div>

              <span>
                Experiment
              </span>


              <strong>
                {result.ai?.experiment ||
                  "A5_PlantDoc_Mixed"}
              </strong>

            </div>

          </div>


          {/* =================================================
              ANALYZE ANOTHER
          ================================================= */}

          <button
            type="button"
            className="secondary-analyze-button"
            onClick={resetAnalysis}
          >

            ＋ Analyze Another Crop

          </button>

        </section>

      )}


      {/* =================================================
          HISTORY
      ================================================= */}

      <section className="history-section">


        <div className="section-title-row">

          <div>

            <span className="section-eyebrow">
              PREVIOUS ANALYSES
            </span>


            <h2>
              Analysis History
            </h2>


            <p>
              Review previous crop health reports.
            </p>

          </div>


          <div className="history-count">

            {history.length} Reports

          </div>

        </div>


        {/* =================================================
            HISTORY LOADING
        ================================================= */}

        {historyLoading ? (

          <div className="history-empty">

            <span className="loading-spinner"></span>

            Loading analysis history...

          </div>

        ) : history.length === 0 ? (

          <div className="history-empty">

            📋 No previous crop analyses found.

          </div>

        ) : (

          <div className="history-grid">


            {history.map((item) => {


              const disease =
                item.cropHealth?.disease ||
                "No disease detected";


              const confidence =
                item.cropHealth
                  ?.diseaseConfidence ??
                0;


              const healthScore =
                item.cropHealth
                  ?.healthScore;


              return (

                <div
                  className="history-card"
                  key={item._id}
                >


                  {/* =======================================
                      HISTORY TOP
                  ======================================= */}

                  <div className="history-card-top">

                    <div className="history-icon">
                      🌾
                    </div>


                    <span className="history-date">

                      {item.createdAt
                        ? new Date(
                            item.createdAt
                          ).toLocaleDateString()
                        : ""}

                    </span>

                  </div>


                  {/* =======================================
                      DISEASE
                  ======================================= */}

                  <h3>
                    {disease}
                  </h3>


                  {/* =======================================
                      INFORMATION
                  ======================================= */}

                  <div className="history-info">


                    <div>

                      <span>
                        Status
                      </span>


                      <strong>
                        {item.cropHealth?.status ||
                          "Unknown"}
                      </strong>

                    </div>


                    <div>

                      <span>
                        AI Confidence
                      </span>


                      <strong>
                        {confidence}%
                      </strong>

                    </div>


                    <div>

                      <span>
                        Health Score
                      </span>


                      <strong>

                        {healthScore !== null &&
                        healthScore !== undefined

                          ? `${healthScore}%`

                          : "Not available"}

                      </strong>

                    </div>

                  </div>


                  {/* =======================================
                      PEST
                  ======================================= */}

                  {item.pestDetection?.detected && (

                    <div className="history-recommendation">

                      <span>
                        Pest Detected
                      </span>


                      <p>

                        {item.pestDetection?.pestName ||
                          "Unknown pest"}

                        {" — "}

                        {item.pestDetection
                          ?.confidence ??
                          0}%

                      </p>

                    </div>

                  )}


                  {/* =======================================
                      RECOMMENDATION
                  ======================================= */}

                  <div className="history-recommendation">

                    <span>
                      Recommendation
                    </span>


                    <p>

                      {item.recommendation ||
                        "Continue monitoring the crop."}

                    </p>

                  </div>


                  {/* =======================================
                      DATE
                  ======================================= */}

                  <small className="history-full-date">

                    {item.createdAt
                      ? new Date(
                          item.createdAt
                        ).toLocaleString()
                      : ""}

                  </small>

                </div>

              );

            })}

          </div>

        )}

      </section>

    </div>

  );

}


export default CropHealth;