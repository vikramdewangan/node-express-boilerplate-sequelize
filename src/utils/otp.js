/**
 * Generate a random OTP of specified length
 * @param {number} length Length of OTP (default: 6)
 * @returns {string} Generated OTP
 */
const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let OTP = '';
  for (let i = 0; i < length; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
};

/**
 * Generate a verification token
 * @returns {string} Generated token
 */
const generateVerificationToken = () => {
  return require('crypto').randomBytes(32).toString('hex');
};

/**
 * Send SMS using configured SMS provider
 * @param {string} phoneNumber
 * @param {string} message
 * @returns {Promise}
 */
const sendSMS = async (phoneNumber, otp) => {
  // TODO: Implement your SMS service integration here
  // This is a placeholder implementation
  console.log(`Sending OTP ${otp} to ${phoneNumber}`);

  // Example implementation with Twilio:
  // const twilioClient = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  // return twilioClient.messages.create({
  //   body: `Your verification code is: ${otp}`,
  //   to: phoneNumber,
  //   from: process.env.TWILIO_PHONE_NUMBER,
  // });
};

/**
 * Validate phone number format
 * @param {string} phoneNumber
 * @param {string} countryCode
 * @returns {boolean}
 */
const isValidPhoneNumber = (phoneNumber, countryCode) => {
  // TODO: Implement proper phone number validation
  // You might want to use a library like libphonenumber-js
  const phoneNumberPattern = /^\d{10}$/;
  const countryCodePattern = /^\+\d{1,4}$/;

  return phoneNumberPattern.test(phoneNumber) && countryCodePattern.test(countryCode);
};

/**
 * Rate limit check for OTP requests
 * @param {string} identifier phone number or email
 * @param {Date} lastAttempt
 * @param {number} attempts
 * @returns {boolean}
 */
const canSendOTP = (lastAttempt, attempts) => {
  if (!lastAttempt) return true;

  const now = new Date();
  const timeDiff = now - new Date(lastAttempt);
  const minutesDiff = Math.floor(timeDiff / 60000);

  // If more than 24 hours have passed, reset attempts
  if (minutesDiff > 1440) return true;

  // If more than 3 attempts in last 15 minutes, block
  if (attempts >= 3 && minutesDiff < 15) return false;

  // If more than 5 attempts in last hour, block
  if (attempts >= 5 && minutesDiff < 60) return false;

  return true;
};

module.exports = {
  generateOTP,
  generateVerificationToken,
  sendSMS,
  isValidPhoneNumber,
  canSendOTP,
};
