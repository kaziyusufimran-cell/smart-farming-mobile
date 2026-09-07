const twilio = require("twilio");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const from = process.env.TWILIO_PHONE_NUMBER;
const to = process.env.ALERT_PHONE_NUMBER;

let client = null;

if (accountSid && authToken && accountSid.startsWith("AC")) {
  client = twilio(accountSid, authToken);
}

const sendSMS = async (message) => {
  if (!client) {
    throw new Error("Twilio is not configured.");
  }

  const result = await client.messages.create({
    body: message,
    from: from,
    to: to,
  });

  return {
    sid: result.sid,
    status: result.status,
  };
};

module.exports = { sendSMS };