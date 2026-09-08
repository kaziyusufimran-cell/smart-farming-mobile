const Alert = require("../models/Alert");

// Cooldown tracking to prevent SMS spamming (minimum 15 minutes between SMS for the same alert type)
const alertCooldowns = new Map();
const COOLDOWN_DURATION_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Send SMS via Twilio
 */
async function sendViaTwilio({ message, recipientPhone }) {
  const twilio = require("twilio");
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;
  const to = recipientPhone || process.env.ALERT_PHONE_NUMBER;

  if (!accountSid || !authToken || !accountSid.startsWith("AC")) {
    throw new Error("Twilio is not configured with valid credentials in .env");
  }

  console.log(`[Twilio] Sending SMS to ${to}...`);
  const client = twilio(accountSid, authToken);
  const result = await client.messages.create({
    body: message,
    from,
    to,
  });

  console.log(`[Twilio Response] SID: ${result.sid}, Status: ${result.status}`);
  return {
    provider: "TWILIO",
    sid: result.sid,
    status: result.status,
  };
}

/**
 * Unified SMS dispatcher:
 * Dispatches via Twilio if configured, or simulates delivery.
 */
async function sendSMS({ message, alertType = "Farm Alert", sensorValue = null, recipientPhone = null }) {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_ACCOUNT_SID.startsWith("AC")) {
    return await sendViaTwilio({ message, recipientPhone });
  } else {
    console.warn("[SMS WARNING] Twilio credentials are not configured in .env.");
    return {
      provider: "MOCK",
      status: "SIMULATED",
      message: "No SMS credentials in .env. Alert logged to MongoDB.",
    };
  }
}

/**
 * Check sensor data thresholds and automatically dispatch SMS with debounce
 */
async function checkSensorAlertsAndNotify(sensorData) {
  const deviceId = sensorData.deviceId || "ESP32-FARM-01";
  const alertsToTrigger = [];

  // 1. Critical Soil Moisture (< 20%)
  if (sensorData.soilMoisture !== null && sensorData.soilMoisture !== undefined && sensorData.soilMoisture < 20) {
    alertsToTrigger.push({
      type: "SOIL_MOISTURE_CRITICAL",
      category: "irrigation",
      severity: "CRITICAL",
      sensorValue: sensorData.soilMoisture,
      message: `🚨 CRITICAL [${deviceId}]: Soil moisture is dangerously low (${sensorData.soilMoisture}%). Turn on irrigation pump immediately!`,
    });
  }

  // 2. Critical Low Water Tank (< 20%)
  if (sensorData.tankLevel !== null && sensorData.tankLevel !== undefined && sensorData.tankLevel < 20) {
    alertsToTrigger.push({
      type: "WATER_TANK_LOW",
      category: "water",
      severity: "CRITICAL",
      sensorValue: sensorData.tankLevel,
      message: `🚨 WATER ALERT [${deviceId}]: Water tank level is low (${sensorData.tankLevel}%). Please refill the tank.`,
    });
  }

  // 3. Extreme Heat Stress (> 38°C)
  if (sensorData.temperature !== null && sensorData.temperature !== undefined && sensorData.temperature > 38) {
    alertsToTrigger.push({
      type: "HEAT_STRESS_CRITICAL",
      category: "heat",
      severity: "HIGH",
      sensorValue: sensorData.temperature,
      message: `🌡️ HEAT ALERT [${deviceId}]: Extreme temperature detected (${sensorData.temperature}°C). Protect crops from heat stress.`,
    });
  }

  // 4. Hazardous Gas (> 400)
  if (sensorData.gasLevel !== null && sensorData.gasLevel !== undefined && sensorData.gasLevel > 400) {
    alertsToTrigger.push({
      type: "GAS_HAZARD",
      category: "environment",
      severity: "HIGH",
      sensorValue: sensorData.gasLevel,
      message: `⚠️ GAS WARNING [${deviceId}]: Elevated toxic gas level (${sensorData.gasLevel}). Check farm ventilation immediately.`,
    });
  }

  // Process and send SMS with cooldown
  for (const alertInfo of alertsToTrigger) {
    const cooldownKey = `${deviceId}_${alertInfo.type}`;
    const lastSent = alertCooldowns.get(cooldownKey) || 0;
    const now = Date.now();

    if (now - lastSent < COOLDOWN_DURATION_MS) {
      const minutesLeft = Math.ceil((COOLDOWN_DURATION_MS - (now - lastSent)) / 60000);
      console.log(`[SMS Cooldown] Skipping SMS for ${alertInfo.type}, cooldown active for another ${minutesLeft} mins.`);
      continue;
    }

    // Update cooldown
    alertCooldowns.set(cooldownKey, now);

    let smsSuccess = false;
    let smsResult = null;

    try {
      smsResult = await sendSMS({
        message: alertInfo.message,
        alertType: alertInfo.type,
        sensorValue: alertInfo.sensorValue,
      });
      smsSuccess = true;
    } catch (err) {
      console.error(`[SMS Error] Failed to send ${alertInfo.type} alert:`, err.message);
      smsResult = { error: err.message };
    }

    // Save alert into MongoDB
    try {
      await Alert.create({
        deviceId,
        type: alertInfo.type,
        category: alertInfo.category,
        message: alertInfo.message,
        severity: alertInfo.severity,
        sensorValue: alertInfo.sensorValue,
        smsSent: smsSuccess,
        smsResponse: smsResult,
      });
      console.log(`[Alert Saved] ${alertInfo.type} saved to MongoDB.`);
    } catch (dbErr) {
      console.error("[DB Error] Failed to save alert to MongoDB:", dbErr.message);
    }
  }
}

/**
 * Trigger SMS for AI detection (Pest / Severe Disease) with cooldown
 */
async function notifyAIAlert({ deviceId = "ESP32-FARM-01", type, message, details = {} }) {
  const cooldownKey = `${deviceId}_${type}`;
  const lastSent = alertCooldowns.get(cooldownKey) || 0;
  const now = Date.now();

  if (now - lastSent < COOLDOWN_DURATION_MS) {
    const minutesLeft = Math.ceil((COOLDOWN_DURATION_MS - (now - lastSent)) / 60000);
    console.log(`[SMS Cooldown] Skipping AI SMS for ${type}, cooldown active for another ${minutesLeft} mins.`);
    return;
  }

  alertCooldowns.set(cooldownKey, now);

  let smsSuccess = false;
  let smsResult = null;

  try {
    smsResult = await sendSMS({
      message,
      alertType: type,
      sensorValue: details.condition || details.pestName || "",
    });
    smsSuccess = true;
  } catch (err) {
    console.error(`[SMS AI Error] Failed to send ${type}:`, err.message);
    smsResult = { error: err.message };
  }

  try {
    await Alert.create({
      deviceId,
      type,
      category: type.includes("PEST") ? "pest" : "disease",
      message,
      severity: "CRITICAL",
      sensorValue: details,
      smsSent: smsSuccess,
      smsResponse: smsResult,
    });
  } catch (dbErr) {
    console.error("[DB Error] Failed to save AI alert:", dbErr.message);
  }
}

module.exports = {
  sendSMS,
  sendViaTwilio,
  checkSensorAlertsAndNotify,
  notifyAIAlert,
};
