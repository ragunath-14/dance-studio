const axios = require('axios');

/**
 * Sends a WhatsApp message via the configured API provider.
 * Supports any REST-based WhatsApp API (Twilio, WATI, Meta Cloud API, etc.)
 */
const sendMessage = async (whatsappNumber, message) => {
  const apiEndpoint = process.env.WHATSAPP_API_URL;
  const apiKey      = process.env.WHATSAPP_API_KEY;

  // Clean number — digits only
  let cleanedNumber = whatsappNumber.replace(/\D/g, '');
  
  // Auto-prepend Indian country code '91' if the user entered exactly 10 digits
  if (cleanedNumber.length === 10) {
    cleanedNumber = '91' + cleanedNumber;
  }

  if (!apiEndpoint) {
    console.log('⚠️  WhatsApp API URL not configured. Message NOT sent.');
    console.log(`   → Would send to ${cleanedNumber}: ${message}`);
    return { success: false, reason: 'unconfigured' };
  }

  try {
    console.log(`📡 Sending WhatsApp message to +${cleanedNumber}...`);

    const response = await axios.post(
      apiEndpoint,
      { phone: cleanedNumber, message, apikey: apiKey },
      { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` } }
    );

    console.log('✅ WhatsApp message sent successfully.');
    return { success: true, response: response.data };
  } catch (error) {
    console.error('❌ Error sending WhatsApp message:', error.response?.data || error.message);
    return { success: false, reason: error.message };
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
