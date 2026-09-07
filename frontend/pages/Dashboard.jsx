import { useEffect, useState } from "react";
import API from "../../backend/services/api";
import { Link } from "react-router-dom";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function Dashboard() {

  // =====================================================
  // STATE
  // =====================================================

  const [user, setUser] = useState(null);
  const [sensorData, setSensorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [alerts, setAlerts] = useState([]);
  const [history, setHistory] = useState([]);

  const [language, setLanguage] = useState(
    localStorage.getItem("dashboardLanguage") || "en"
  );

  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(true);

  const [pumpLoading, setPumpLoading] = useState(false);

  const [decisions, setDecisions] = useState([]);
  const [decisionStatus, setDecisionStatus] =
    useState("normal");

  const [decisionLoading, setDecisionLoading] =
    useState(true);


  // =====================================================
  // TRANSLATIONS
  // =====================================================

  const translations = {

    // ===================================================
    // ENGLISH
    // ===================================================

    en: {

      home: "Home",
      crop: "Crop",
      sensors: "Sensors",
      water: "Water",
      alerts: "Alerts",

      smartFarming: "Smart Farming",
      farmMonitoring:
        "Farm Monitoring Assistant",

      logout: "Logout",

      welcome: "Welcome",
      farmer: "Farmer",

      monitorFarm:
        "Monitor your farm using real-time IoT data.",

      systemOnline:
        "IoT System Online",

      device: "Device",

      farmAlerts:
        "Farm Alerts",

      noActiveAlerts:
        "No Active Alerts",

      conditionsNormal:
        "Current farm conditions are within the configured monitoring thresholds.",

      smartDecisions:
        "Smart Farm Decisions",

      generating:
        "Generating farm recommendations...",

      noAction:
        "No Immediate Action Required",

      noActionMessage:
        "Current sensor and AI conditions do not require immediate action.",

      environment:
        "Environment",

      temperature:
        "Temperature",

      humidity:
        "Humidity",

      light:
        "Light",

      rain:
        "Rain",

      rainDetected:
        "Rain Detected",

      noRain:
        "No Rain",

      airQuality:
        "Air Quality",

      gasLevel:
        "Gas Level",

      plantSoil:
        "Plant & Soil",

      soilMoisture:
        "Soil Moisture",

      soilTemperature:
        "Soil Temperature",

      waterQuality:
        "Water Quality",

      ph:
        "pH",

      tds:
        "TDS",

      turbidity:
        "Turbidity",

      waterTemperature:
        "Water Temperature",

      irrigation:
        "Irrigation",

      waterTank:
        "Water Tank",

      pumpStatus:
        "Pump Status",

      on:
        "ON",

      off:
        "OFF",

      updating:
        "Updating...",

      startPump:
        "Start Pump",

      stopPump:
        "Stop Pump",

      analytics:
        "Farm Analytics",

      noHistorical:
        "No historical sensor data available.",

      temperatureHistory:
        "Temperature History",

      humidityHistory:
        "Humidity History",

      soilHistory:
        "Soil Moisture History",

      tankHistory:
        "Water Tank History",

      cropHealth:
        "AI Crop Health",

      loadingAI:
        "Loading AI Analysis",

      loadingLatest:
        "Loading the latest crop analysis...",

      overallHealth:
        "Overall Crop Health",

      disease:
        "Disease",

      noDisease:
        "No disease detected",

      confidence:
        "Confidence",

      pest:
        "Pest Detection",

      noPest:
        "No pest detected",

      nutrient:
        "Nutrient Status",

      unknown:
        "Unknown",

      recommendation:
        "AI Recommendation",

      continueMonitoring:
        "Continue monitoring the crop.",

      aiSource:
        "AI Source",

      noAI:
        "No AI Analysis Yet",

      noAIMessage:
        "No crop analysis has been received.",

      analyzeCrop:
        "Analyze Crop",

      advisory:
        "AI Farm Advisory",

      recommendationTitle:
        "Recommendation",

      currentMoisture:
        "Current soil moisture is adequate. Continue monitoring the field.",

      lowMoisture:
        "Soil moisture is low. Consider irrigation if rainfall is not expected.",

      lastUpdate:
        "Last sensor update",

      unknownValue:
        "Unknown",

      loadingFarm:
        "Loading farm data...",

      unableSensor:
        "Unable to receive sensor data",

      footer:
        "Smart Farming Assistant",

      footerSub:
        "Edge AI • IoT • Smart Agriculture",

      language:
        "Language",
    },


    // ===================================================
    // HINDI
    // ===================================================

    hi: {

      home: "होम",

      crop: "फसल",

      sensors: "सेंसर",

      water: "पानी",

      alerts: "अलर्ट",

      smartFarming:
        "स्मार्ट खेती",

      farmMonitoring:
        "फार्म मॉनिटरिंग सहायक",

      logout:
        "लॉगआउट",

      welcome:
        "स्वागत है",

      farmer:
        "किसान",

      monitorFarm:
        "रीयल-टाइम IoT डेटा का उपयोग करके अपने खेत की निगरानी करें।",

      systemOnline:
        "IoT सिस्टम ऑनलाइन",

      device:
        "डिवाइस",

      farmAlerts:
        "खेत के अलर्ट",

      noActiveAlerts:
        "कोई सक्रिय अलर्ट नहीं",

      conditionsNormal:
        "खेत की वर्तमान स्थिति निर्धारित निगरानी सीमाओं के भीतर है।",

      smartDecisions:
        "स्मार्ट खेती के निर्णय",

      generating:
        "खेत के लिए सुझाव तैयार किए जा रहे हैं...",

      noAction:
        "तुरंत कार्रवाई की आवश्यकता नहीं",

      noActionMessage:
        "वर्तमान सेंसर और AI स्थिति में तुरंत कार्रवाई की आवश्यकता नहीं है।",

      environment:
        "पर्यावरण",

      temperature:
        "तापमान",

      humidity:
        "नमी",

      light:
        "प्रकाश",

      rain:
        "बारिश",

      rainDetected:
        "बारिश का पता चला",

      noRain:
        "बारिश नहीं",

      airQuality:
        "वायु गुणवत्ता",

      gasLevel:
        "गैस स्तर",

      plantSoil:
        "पौधा और मिट्टी",

      soilMoisture:
        "मिट्टी की नमी",

      soilTemperature:
        "मिट्टी का तापमान",

      waterQuality:
        "पानी की गुणवत्ता",

      ph:
        "pH",

      tds:
        "TDS",

      turbidity:
        "गंदलापन",

      waterTemperature:
        "पानी का तापमान",

      irrigation:
        "सिंचाई",

      waterTank:
        "पानी की टंकी",

      pumpStatus:
        "पंप की स्थिति",

      on:
        "चालू",

      off:
        "बंद",

      updating:
        "अपडेट हो रहा है...",

      startPump:
        "पंप चालू करें",

      stopPump:
        "पंप बंद करें",

      analytics:
        "खेत का विश्लेषण",

      noHistorical:
        "कोई ऐतिहासिक सेंसर डेटा उपलब्ध नहीं है।",

      temperatureHistory:
        "तापमान इतिहास",

      humidityHistory:
        "नमी इतिहास",

      soilHistory:
        "मिट्टी की नमी का इतिहास",

      tankHistory:
        "पानी की टंकी का इतिहास",

      cropHealth:
        "AI फसल स्वास्थ्य",

      loadingAI:
        "AI विश्लेषण लोड हो रहा है",

      loadingLatest:
        "नवीनतम फसल विश्लेषण लोड हो रहा है...",

      overallHealth:
        "कुल फसल स्वास्थ्य",

      disease:
        "रोग",

      noDisease:
        "कोई रोग नहीं पाया गया",

      confidence:
        "विश्वास स्तर",

      pest:
        "कीट पहचान",

      noPest:
        "कोई कीट नहीं पाया गया",

      nutrient:
        "पोषक स्थिति",

      unknown:
        "अज्ञात",

      recommendation:
        "AI सुझाव",

      continueMonitoring:
        "फसल की निगरानी जारी रखें।",

      aiSource:
        "AI स्रोत",

      noAI:
        "अभी कोई AI विश्लेषण नहीं",

      noAIMessage:
        "अभी तक कोई फसल विश्लेषण प्राप्त नहीं हुआ है।",

      analyzeCrop:
        "फसल का विश्लेषण करें",

      advisory:
        "AI खेती सलाह",

      recommendationTitle:
        "सुझाव",

      currentMoisture:
        "वर्तमान मिट्टी की नमी पर्याप्त है। खेत की निगरानी जारी रखें।",

      lowMoisture:
        "मिट्टी की नमी कम है। यदि बारिश की संभावना नहीं है तो सिंचाई पर विचार करें।",

      lastUpdate:
        "अंतिम सेंसर अपडेट",

      unknownValue:
        "अज्ञात",

      loadingFarm:
        "खेत का डेटा लोड हो रहा है...",

      unableSensor:
        "सेंसर डेटा प्राप्त करने में असमर्थ",

      footer:
        "स्मार्ट खेती सहायक",

      footerSub:
        "Edge AI • IoT • स्मार्ट कृषि",

      language:
        "भाषा",
    },
  };


  // =====================================================
  // TRANSLATION FUNCTION
  // =====================================================

  const t = (key) => {

    return (
      translations[language]?.[key] ||
      translations.en[key] ||
      key
    );

  };


  // =====================================================
  // CHANGE LANGUAGE
  // =====================================================

  const changeLanguage = (newLanguage) => {

    setLanguage(newLanguage);

    localStorage.setItem(
      "dashboardLanguage",
      newLanguage
    );

  };


  // =====================================================
  // FETCH SENSOR DATA
  // =====================================================

  const fetchSensorData = async () => {

    try {

      const response =
        await API.get("/iot/latest");

      console.log(
        "SENSOR DATA:",
        response.data
      );

      setSensorData(
        response.data.data
      );

      setError("");

    } catch (err) {

      console.error(
        "SENSOR ERROR:",
        err
      );

      setError(
        t("unableSensor")
      );

    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // FETCH DECISIONS
  // =====================================================

  const fetchDecisions = async () => {

    try {

      const deviceId =
        sensorData?.deviceId ||
        "ESP32-FARM-01";

      const response =
        await API.get(
          `/decision/${deviceId}`
        );

      console.log(
        "DECISION DATA:",
        response.data
      );

      setDecisions(
        response.data.decisions || []
      );

      setDecisionStatus(
        response.data.overallStatus ||
        "normal"
      );

    } catch (error) {

      console.error(
        "DECISION ERROR:",
        error.response?.data ||
        error
      );

      setDecisions([]);

    } finally {

      setDecisionLoading(false);

    }

  };


  // =====================================================
  // FETCH AI RESULT
  // =====================================================

  const fetchAIResult = async () => {

    try {

      const deviceId =
        sensorData?.deviceId ||
        "ESP32-FARM-01";

      const response =
        await API.get(
          `/ai/latest/${deviceId}`
        );

      console.log(
        "AI RESULT:",
        response.data
      );

      setAiResult(
        response.data.data
      );

    } catch (error) {

      console.error(
        "AI RESULT ERROR:",
        error.response?.data ||
        error
      );

      setAiResult(null);

    } finally {

      setAiLoading(false);

    }

  };


  // =====================================================
  // FETCH ALERTS
  // =====================================================

  const fetchAlerts = async () => {

    try {

      const deviceId =
        sensorData?.deviceId ||
        "ESP32-FARM-01";

      const response =
        await API.get(
          `/alerts/${deviceId}`
        );

      console.log(
        "ALERT DATA:",
        response.data
      );

      setAlerts(
        response.data.alerts || []
      );

    } catch (error) {

      console.error(
        "ALERT ERROR:",
        error.response?.data ||
        error
      );

    }

  };


  // =====================================================
  // FETCH HISTORY
  // =====================================================

  const fetchHistory = async () => {

    try {

      const deviceId =
        sensorData?.deviceId ||
        "ESP32-FARM-01";

      const response =
        await API.get(
          `/iot/history/${deviceId}?limit=30`
        );

      console.log(
        "HISTORY DATA:",
        response.data
      );

      const formattedData =
        (response.data.data || []).map(
          (item) => ({

            ...item,

            time:
              new Date(
                item.createdAt
              ).toLocaleTimeString(
                [],
                {
                  hour: "2-digit",
                  minute: "2-digit",
                }
              ),

          })
        );

      setHistory(
        formattedData
      );

    } catch (error) {

      console.error(
        "HISTORY ERROR:",
        error.response?.data ||
        error
      );

    }

  };


  // =====================================================
  // PUMP CONTROL
  // =====================================================

  const controlPump = async () => {

    if (!sensorData) {
      return;
    }

    try {

      setPumpLoading(true);

      const newStatus =
        !sensorData.pumpStatus;

      const response =
        await API.post(
          "/pump/control",
          {
            deviceId:
              sensorData.deviceId,

            pumpStatus:
              newStatus,
          }
        );

      console.log(
        "PUMP RESPONSE:",
        response.data
      );

      setSensorData(
        (previous) => ({

          ...previous,

          pumpStatus:
            newStatus,

        })
      );

    } catch (error) {

      console.error(
        "PUMP CONTROL ERROR:",
        error.response?.data ||
        error
      );

    } finally {

      setPumpLoading(false);

    }

  };


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {

    const savedUser =
      localStorage.getItem("user");

    if (savedUser) {

      try {

        setUser(
          JSON.parse(savedUser)
        );

      } catch (error) {

        console.error(
          "USER DATA ERROR:",
          error
        );

      }

    }

    fetchSensorData();

    const interval =
      setInterval(
        () => {
          fetchSensorData();
        },
        5000
      );

    return () =>
      clearInterval(interval);

  }, []);


  // =====================================================
  // LOAD ALERTS
  // =====================================================

  useEffect(() => {

    if (sensorData?.deviceId) {

      fetchAlerts();

    }

  }, [sensorData?.deviceId]);


  // =====================================================
  // LOAD HISTORY
  // =====================================================

  useEffect(() => {

    if (sensorData?.deviceId) {

      fetchHistory();

    }

  }, [sensorData?.deviceId]);


  // =====================================================
  // LOAD AI
  // =====================================================

  useEffect(() => {

    if (sensorData?.deviceId) {

      fetchAIResult();

    }

  }, [sensorData?.deviceId]);


  // =====================================================
  // LOAD DECISIONS
  // =====================================================

  useEffect(() => {

    if (sensorData?.deviceId) {

      fetchDecisions();

    }

  }, [sensorData?.deviceId]);


  // =====================================================
  // LOGOUT
  // =====================================================

  const logout = () => {

    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    window.location.href =
      "/login";

  };


  // =====================================================
  // LOADING SCREEN
  // =====================================================

  if (loading) {

    return (

      <div className="dashboard">

        <h1>
          🌱 {t("smartFarming")}
        </h1>

        <p>
          {t("loadingFarm")}
        </p>

      </div>

    );

  }


  // =====================================================
  // DASHBOARD
  // =====================================================

  return (

    <div className="dashboard">


      {/* =================================================
          MOBILE NAVIGATION
      ================================================= */}

      <nav className="mobile-nav">

        <Link to="/dashboard">

          <span>
            🏠
          </span>

          <small>
            {t("home")}
          </small>

        </Link>


        <Link to="/crop-health">

          <span>
            🌾
          </span>

          <small>
            {t("crop")}
          </small>

        </Link>


        <a href="#sensors">

          <span>
            📡
          </span>

          <small>
            {t("sensors")}
          </small>

        </a>


        <a href="#irrigation">

          <span>
            🚰
          </span>

          <small>
            {t("water")}
          </small>

        </a>


        <a href="#alerts">

          <span>
            🚨
          </span>

          <small>
            {t("alerts")}
          </small>

        </a>

      </nav>


      {/* =================================================
          HEADER
      ================================================= */}

      <header className="dashboard-header">

        <div>

          <h1>
            🌱 {t("smartFarming")}
          </h1>

          <p>
            {t("farmMonitoring")}
          </p>

        </div>


        {/* LANGUAGE SWITCHER */}

        <div className="language-switcher">

          <span className="language-label">
            {t("language")}:
          </span>


          <button
            type="button"
            className={
              language === "en"
                ? "active-language"
                : ""
            }
            onClick={() =>
              changeLanguage("en")
            }
          >
            English
          </button>


          <button
            type="button"
            className={
              language === "hi"
                ? "active-language"
                : ""
            }
            onClick={() =>
              changeLanguage("hi")
            }
          >
            हिंदी
          </button>

        </div>


        <button
          onClick={logout}
        >
          {t("logout")}
        </button>

      </header>


      {/* =================================================
          WELCOME
      ================================================= */}

      <section className="welcome-card">

        <h2>

          {t("welcome")},{" "}

          {user?.name ||
            t("farmer")}

          👋

        </h2>


        <p>
          {t("monitorFarm")}
        </p>


        <div className="system-status">

          🟢 {t("systemOnline")}

        </div>


        <small>

          {t("device")}:{" "}

          {sensorData?.deviceId ||
            t("unknownValue")}

        </small>

      </section>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (

        <div className="alert-card warning">

          ⚠️ {error}

        </div>

      )}


      {/* =================================================
          FARM ALERTS
      ================================================= */}

      <section id="alerts">

        <h2>
          🚨 {t("farmAlerts")}
        </h2>


        {alerts.length === 0 ? (

          <div className="alert-card normal">

            <strong>
              ✅ {t("noActiveAlerts")}
            </strong>

            <p>
              {t("conditionsNormal")}
            </p>

          </div>

        ) : (

          alerts.map(
            (alert, index) => (

              <div
                className={`alert-card ${alert.type}`}
                key={index}
              >

                <strong>

                  {alert.icon}{" "}

                  {alert.title}

                </strong>


                <p>
                  {alert.message}
                </p>

              </div>

            )
          )

        )}

      </section>


      {/* =================================================
          SMART FARM DECISIONS
      ================================================= */}

      <section>

        <h2>
          🧠 {t("smartDecisions")}
        </h2>


        {decisionLoading ? (

          <div className="decision-card">

            <p>
              🤖 {t("generating")}
            </p>

          </div>

        ) : decisions.length === 0 ? (

          <div className="decision-card normal">

            <h3>
              ✅ {t("noAction")}
            </h3>

            <p>
              {t("noActionMessage")}
            </p>

          </div>

        ) : (

          <div className="decision-list">

            {decisions.map(
              (decision, index) => (

                <div
                  key={index}
                  className={`decision-card ${decision.level}`}
                >

                  <div className="decision-title">

                    <span>
                      {decision.icon}
                    </span>

                    <strong>
                      {decision.title}
                    </strong>

                  </div>


                  <p>
                    {decision.message}
                  </p>

                </div>

              )
            )}

          </div>

        )}

      </section>


      {/* =================================================
          ENVIRONMENT
      ================================================= */}

      <section id="sensors">

        <h2>
          🌤️ {t("environment")}
        </h2>


        <div className="sensor-grid">


          {/* TEMPERATURE */}

          <div className="sensor-card">

            <span>
              🌡️
            </span>

            <h3>
              {t("temperature")}
            </h3>

            <strong>
              {sensorData?.temperature ??
                "--"} °C
            </strong>

          </div>


          {/* HUMIDITY */}

          <div className="sensor-card">

            <span>
              💧
            </span>

            <h3>
              {t("humidity")}
            </h3>

            <strong>
              {sensorData?.humidity ??
                "--"} %
            </strong>

          </div>


          {/* LIGHT */}

<div className="sensor-card">

  <span>
    ☀️
  </span>

  <h3>
    {t("light")}
  </h3>

  <strong>
    {sensorData?.lightIntensity ??
      "--"} lux
  </strong>

</div>

         {/* RAIN */}

<div className="sensor-card">

  <span>
    🌧️
  </span>

  <h3>
    {t("rain")}
  </h3>

  <strong>
    {sensorData?.rain ??
      "--"}
  </strong>

  <small>
    ADC
  </small>

</div>

          {/* AIR QUALITY */}

          <div className="sensor-card">

            <span>
              🌫️
            </span>

            <h3>
              {t("airQuality")}
            </h3>

            <strong>
              {sensorData?.airQuality ??
                "--"}
            </strong>

          </div>


          {/* GAS */}

          <div className="sensor-card">

            <span>
              🔥
            </span>

            <h3>
              {t("gasLevel")}
            </h3>

            <strong>
              {sensorData?.gasLevel ??
                "--"}
            </strong>

          </div>

        </div>

      </section>


      {/* =================================================
          PLANT & SOIL
      ================================================= */}

      <section>

        <h2>
          🌿 {t("plantSoil")}
        </h2>


        <div className="sensor-grid">


          {/* SOIL MOISTURE */}

          <div className="sensor-card">

            <span>
              🌱
            </span>

            <h3>
              {t("soilMoisture")}
            </h3>

            <strong>
              {sensorData?.soilMoisture ??
                "--"} %
            </strong>

          </div>


          {/* SOIL TEMPERATURE */}

          <div className="sensor-card">

            <span>
              🌡️
            </span>

            <h3>
              {t("soilTemperature")}
            </h3>

            <strong>
              {sensorData?.soilTemperature ??
                "--"} °C
            </strong>

          </div>

        </div>

      </section>


      {/* =================================================
          WATER QUALITY
      ================================================= */}

      <section>

        <h2>
          💧 {t("waterQuality")}
        </h2>


        <div className="sensor-grid">


          {/* PH */}

          <div className="sensor-card">

            <span>
              🧪
            </span>

            <h3>
              {t("ph")}
            </h3>

            <strong>
              {sensorData?.ph ??
                "--"}
            </strong>

          </div>


          {/* TDS */}

          <div className="sensor-card">

            <span>
              ⚗️
            </span>

            <h3>
              {t("tds")}
            </h3>

            <strong>
              {sensorData?.tds ??
                "--"} ppm
            </strong>

          </div>


          {/* TURBIDITY */}

          <div className="sensor-card">

            <span>
              🌊
            </span>

            <h3>
              {t("turbidity")}
            </h3>

            <strong>
              {sensorData?.turbidity ??
                "--"}
            </strong>

          </div>


          {/* WATER TEMPERATURE */}

          <div className="sensor-card">

            <span>
              🌡️
            </span>

            <h3>
              {t("waterTemperature")}
            </h3>

            <strong>
              {sensorData?.waterTemperature ??
                "--"} °C
            </strong>

          </div>

        </div>

      </section>


      {/* =================================================
          IRRIGATION
      ================================================= */}

      <section id="irrigation">

        <h2>
          🚰 {t("irrigation")}
        </h2>


        <div className="irrigation-card">


          {/* WATER TANK */}

          <div>

            <h3>
              {t("waterTank")}
            </h3>

            <strong>
              {sensorData?.tankLevel ??
                "--"}%
            </strong>


            <div className="tank">

              <div
                className="tank-level"
                style={{
                  width: `${
                    sensorData?.tankLevel ||
                    0
                  }%`,
                }}
              />

            </div>

          </div>


          {/* PUMP */}

          <div>

            <h3>
              {t("pumpStatus")}
            </h3>


            <div className="pump-status">

              {sensorData?.pumpStatus
                ? `🟢 ${t("on")}`
                : `⚪ ${t("off")}`}

            </div>


            <button
              className="pump-button"
              onClick={controlPump}
              disabled={pumpLoading}
            >

              {pumpLoading
                ? t("updating")
                : sensorData?.pumpStatus
                  ? t("stopPump")
                  : t("startPump")}

            </button>

          </div>

        </div>

      </section>


      {/* =================================================
          FARM ANALYTICS
      ================================================= */}

      <section>

        <h2>
          📊 {t("analytics")}
        </h2>


        {history.length === 0 ? (

          <div className="analytics-card">

            <p>
              {t("noHistorical")}
            </p>

          </div>

        ) : (

          <>


            {/* TEMPERATURE */}

            <div className="analytics-card">

              <h3>
                🌡️ {t("temperatureHistory")}
              </h3>


              <ResponsiveContainer
                width="100%"
                height={280}
              >

                <LineChart
                  data={history}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="time"
                  />

                  <YAxis />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="temperature"
                    strokeWidth={2}
                    dot={false}
                  />

                </LineChart>

              </ResponsiveContainer>

            </div>


            {/* HUMIDITY */}

            <div className="analytics-card">

              <h3>
                💧 {t("humidityHistory")}
              </h3>


              <ResponsiveContainer
                width="100%"
                height={280}
              >

                <LineChart
                  data={history}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="time"
                  />

                  <YAxis />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="humidity"
                    strokeWidth={2}
                    dot={false}
                  />

                </LineChart>

              </ResponsiveContainer>

            </div>


            {/* SOIL MOISTURE */}

            <div className="analytics-card">

              <h3>
                🌱 {t("soilHistory")}
              </h3>


              <ResponsiveContainer
                width="100%"
                height={280}
              >

                <LineChart
                  data={history}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="time"
                  />

                  <YAxis />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="soilMoisture"
                    strokeWidth={2}
                    dot={false}
                  />

                </LineChart>

              </ResponsiveContainer>

            </div>


            {/* WATER TANK */}

            <div className="analytics-card">

              <h3>
                🚰 {t("tankHistory")}
              </h3>


              <ResponsiveContainer
                width="100%"
                height={280}
              >

                <LineChart
                  data={history}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="time"
                  />

                  <YAxis />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="tankLevel"
                    strokeWidth={2}
                    dot={false}
                  />

                </LineChart>

              </ResponsiveContainer>

            </div>

          </>

        )}

      </section>


      {/* =================================================
          AI CROP HEALTH
      ================================================= */}

      <section>

        <h2>
          🌾 {t("cropHealth")}
        </h2>


        {aiLoading ? (

          <div className="health-card">

            <h3>
              🤖 {t("loadingAI")}
            </h3>

            <p>
              {t("loadingLatest")}
            </p>

          </div>

        ) : aiResult ? (

          <div className="ai-health-card">


            {/* HEALTH SCORE */}

            <div className="ai-health-score">

              <h3>
                {t("overallHealth")}
              </h3>


              <div className="health-score">

                {aiResult.cropHealth?.healthScore ??
                  "--"}%

              </div>


              <strong>

                {aiResult.cropHealth?.status ||
                  t("unknown")}

              </strong>

            </div>


            {/* DISEASE */}

            <div className="ai-result-item">

              <span>
                🦠 {t("disease")}
              </span>


              <strong>

                {aiResult.cropHealth?.disease ||
                  t("noDisease")}

              </strong>


              {aiResult.cropHealth?.disease && (

                <small>

                  {t("confidence")}:{" "}

                  {aiResult.cropHealth?.diseaseConfidence ??
                    0}%

                </small>

              )}

            </div>


            {/* PEST */}

            <div className="ai-result-item">

              <span>
                🐛 {t("pest")}
              </span>


              <strong>

                {aiResult.pestDetection?.detected

                  ? aiResult.pestDetection?.pestName

                  : t("noPest")}

              </strong>


              {aiResult.pestDetection?.detected && (

                <small>

                  {t("confidence")}:{" "}

                  {aiResult.pestDetection?.confidence ??
                    0}%

                </small>

              )}

            </div>


            {/* NUTRIENT */}

            <div className="ai-result-item">

              <span>
                🧪 {t("nutrient")}
              </span>


              <strong>

                {aiResult.cropHealth?.nutrientStatus ||
                  t("unknown")}

              </strong>


              <small>

                {t("confidence")}:{" "}

                {aiResult.cropHealth?.nutrientConfidence ??
                  0}%

              </small>

            </div>


            {/* AI RECOMMENDATION */}

            <div className="ai-recommendation">

              <h3>
                💡 {t("recommendation")}
              </h3>


              <p>

                {aiResult.recommendation ||
                  t("continueMonitoring")}

              </p>

            </div>


            {/* AI SOURCE */}

            <small className="ai-source">

              🤖 {t("aiSource")}:{" "}

              {aiResult.imageSource ||
                t("unknown")}

            </small>

          </div>

        ) : (

          <div className="health-card">

            <h3>
              🤖 {t("noAI")}
            </h3>


            <p>
              {t("noAIMessage")}
            </p>


            <Link
              to="/crop-health"
              className="crop-health-button"
            >
              📷 {t("analyzeCrop")}
            </Link>

          </div>

        )}

      </section>


      {/* =================================================
          AI FARM ADVISORY
      ================================================= */}

      <section>

        <h2>
          🤖 {t("advisory")}
        </h2>


        <div className="advisory-card">

          <h3>
            💡 {t("recommendationTitle")}
          </h3>


          {sensorData?.soilMoisture < 40 ? (

            <p>
              {t("lowMoisture")}
            </p>

          ) : (

            <p>
              {t("currentMoisture")}
            </p>

          )}

        </div>

      </section>


      {/* =================================================
          LAST UPDATE
      ================================================= */}

      <section>

        <p>

          {t("lastUpdate")}:{" "}

          {sensorData?.createdAt

            ? new Date(
                sensorData.createdAt
              ).toLocaleString(
                language === "hi"
                  ? "hi-IN"
                  : "en-IN"
              )

            : t("unknown")}

        </p>

      </section>


      {/* =================================================
          FOOTER
      ================================================= */}

      <footer>

        <p>
          {t("footer")}
        </p>

        <small>
          {t("footerSub")}
        </small>

      </footer>

    </div>

  );

}

export default Dashboard;