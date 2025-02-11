const nodemailer = require('nodemailer');
const config = require('../config/config');
const logger = require('../config/logger');

let transport = null;

if (config.env === 'development' || config.env === 'test') {
  // Use ethereal email for development/testing
  transport = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'ethereal.user@ethereal.email',
      pass: 'ethereal.password'
    }
  });
} else {
  // Production email configuration
  transport = nodemailer.createTransport({
    host: config.email.smtp.host,
    port: config.email.smtp.port,
    auth: {
      user: config.email.smtp.auth.user,
      pass: config.email.smtp.auth.pass,
    },
  });
}

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @returns {Promise}
 */
const sendEmail = async (to, subject, text) => {
  try {
    const msg = { from: config.email.from, to, subject, text };

    if (config.env === 'development' || config.env === 'test') {
      // Log email content in development/test
      logger.info('Email content:', msg);
      return true;
    }

    await transport.sendMail(msg);
    return true;
  } catch (error) {
    logger.error('Error sending email:', error);
    return false;
  }
};

/**
 * Send verification email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendVerificationEmail = async (to, token) => {
  const subject = 'Email Verification';
  const verificationEmailUrl = `${config.clientUrl}/verify-email?token=${token}`;
  const text = `Dear user,
To verify your email, click on this link: ${verificationEmailUrl}
If you did not create an account, then ignore this email.`;

  return sendEmail(to, subject, text);
};

/**
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendResetPasswordEmail = async (to, token) => {
  const subject = 'Reset password';
  const resetPasswordUrl = `${config.clientUrl}/reset-password?token=${token}`;
  const text = `Dear user,
To reset your password, click on this link: ${resetPasswordUrl}
If you did not request any password resets, then ignore this email.`;

  return sendEmail(to, subject, text);
};

module.exports = {
  transport,
  sendEmail,
  sendVerificationEmail,
  sendResetPasswordEmail,
};
