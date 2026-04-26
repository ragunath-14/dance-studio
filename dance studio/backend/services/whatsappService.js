const axios = require('axios');

/**
 * Sends a WhatsApp message via the configured API provider.
 * Supports any REST-based WhatsApp API (Twilio, WATI, Meta Cloud API, etc.)
 */
const sendMessage = async (whatsappNumber, message) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken  = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER; // Format: whatsapp:+14155238886

  // Clean number — digits only
  let cleanedNumber = whatsappNumber.replace(/\D/g, '');
  if (cleanedNumber.length === 10) cleanedNumber = '91' + cleanedNumber;

  if (!accountSid || !authToken || !fromNumber) {
    console.log('⚠️  Twilio credentials not configured in .env. Message NOT sent.');
    console.log(`   → Would send to ${cleanedNumber}: ${message}`);
    return { success: false, reason: 'unconfigured' };
  }

  try {
    console.log(`📡 Sending Twilio WhatsApp message to +${cleanedNumber}...`);

    // Twilio requires form-url-encoded data
    const params = new URLSearchParams();
    params.append('To', `whatsapp:+${cleanedNumber}`);
    params.append('From', fromNumber);
    params.append('Body', message);

    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    const response = await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      params,
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    console.log('✅ Twilio WhatsApp message sent successfully. SID:', response.data.sid);
    return { success: true, response: response.data };
  } catch (error) {
    console.error('❌ Twilio Error:', error.response?.data || error.message);
    return { success: false, reason: error.response?.data?.message || error.message };
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// Public helpers
// ──────────────────────────────────────────────────────────────────────────────

exports.sendWelcomeMessage = async (whatsappNumber, studentName, classType) => {
  const message =
    `Registration Update: Expressionz Dance Academy\n\n` +
    `Student: ${studentName}\n` +
    `Class: ${classType || 'Dance Class'}\n` +
    `Status: Approved\n\n` +
    `Your enrollment has been officially approved. Welcome to Expressionz Dance Academy! Please refer to the studio for your confirmed class timings.`;

  return sendMessage(whatsappNumber, message);
};

exports.sendPendingFeesAlert = async (studentId, whatsappNumber, studentName, pendingMonths, totalDue) => {
  const message =
    `Payment Alert: Expressionz Dance Academy\n\n` +
    `Student: ${studentName}\n` +
    `Pending Dues: ₹${totalDue}\n` +
    `Billing Cycle: ${pendingMonths} month(s)\n\n` +
    `Please clear your pending dues at the academy office or via our official UPI.\n\n` +
    `If you have already paid, please ignore this automated alert.`;

  return sendMessage(whatsappNumber, message);
};

/**
 * Rejoin invitation sent when a student is marked inactive (discontinued).
 * Encourages the student to come back and join classes again.
 */
exports.sendRejoinMessage = async (whatsappNumber, studentName, classType) => {
  const message =
    `Account Update: Expressionz Dance Academy\n\n` +
    `Student: ${studentName}\n` +
    `Class: ${classType || 'Dance'}\n` +
    `Status: Inactive\n\n` +
    `This is an automated notification that your enrollment status is currently marked as inactive due to non-attendance. ` +
    `To update your enrollment status or class schedule, please contact the academy office.`;

  return sendMessage(whatsappNumber, message);
};
