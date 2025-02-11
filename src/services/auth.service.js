const httpStatus = require('http-status');
const { Op } = require('sequelize');
const tokenService = require('./token.service');
const userService = require('./user.service');
const { User, PreRegistration, OTP, Token } = require('../models');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');
const { generateOTP, sendSMS, canSendOTP, generateVerificationToken } = require('../utils/otp');
const emailService = require('./email.service');
const config = require('../config/config');
const logger = require('../config/logger');

/**
 * Register a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const registerUser = async (userBody) => {
  // Check if email is taken
  const existingUser = await User.findOne({ where: { email: userBody.email } });
  if (existingUser) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  return User.create(userBody);
};

/**
 * Login with username and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const loginUserWithEmailAndPassword = async (email, password) => {
  const user = await userService.getUserByEmail(email);
  if (!user || !(await user.validPassword(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }
  return user;
};

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise}
 */
const logout = async (refreshToken) => {
  const refreshTokenDoc = await Token.findOne({
    where: {
      token: refreshToken,
      type: tokenTypes.REFRESH,
      blacklisted: false,
    },
  });
  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
  }
  await refreshTokenDoc.update({ blacklisted: true });
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
const refreshAuth = async (refreshToken) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
    const user = await userService.getUserById(refreshTokenDoc.userId);
    if (!user) {
      throw new Error();
    }
    await refreshTokenDoc.destroy();
    return tokenService.generateAuthTokens(user);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

/**
 * Reset password
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 * @returns {Promise}
 */
const resetPassword = async (resetPasswordToken, newPassword) => {
  try {
    const resetPasswordTokenDoc = await tokenService.verifyToken(resetPasswordToken, tokenTypes.RESET_PASSWORD);
    const user = await userService.getUserById(resetPasswordTokenDoc.userId);
    if (!user) {
      throw new Error();
    }
    await userService.updateUserById(user.id, { password: newPassword });
    await Token.destroy({
      where: {
        userId: user.id,
        type: tokenTypes.RESET_PASSWORD,
      },
    });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password reset failed');
  }
};

/**
 * Verify email
 * @param {string} verifyEmailToken
 * @returns {Promise}
 */
const verifyEmail = async (verifyEmailToken) => {
  try {
    const verifyEmailTokenDoc = await tokenService.verifyToken(verifyEmailToken, tokenTypes.VERIFY_EMAIL);
    const user = await userService.getUserById(verifyEmailTokenDoc.userId);
    if (!user) {
      throw new Error();
    }
    await Token.destroy({
      where: {
        userId: user.id,
        type: tokenTypes.VERIFY_EMAIL,
      },
    });
    await userService.updateUserById(user.id, { isEmailVerified: true });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Email verification failed');
  }
};

/**
 * Generate reset password token
 * @param {string} email
 * @returns {Promise<string>}
 */
const generateResetPasswordToken = async (email) => {
  const user = await userService.getUserByEmail(email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No users found with this email');
  }
  return tokenService.generateResetPasswordToken(user);
};

/**
 * Generate verify email token
 * @param {User} user
 * @returns {Promise<string>}
 */
const generateVerifyEmailToken = async (user) => {
  return tokenService.generateVerifyEmailToken(user);
};

/**
 * Register with email
 * @param {Object} userBody
 * @returns {Promise<Object>}
 */
const registerWithEmail = async (userBody) => {
  // Check if email is taken
  const existingUser = await User.findOne({ where: { email: userBody.email } });
  if (existingUser) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }

  // Create pre-registration entry
  const preReg = await PreRegistration.create({
    email: userBody.email,
    password: userBody.password,
    name: userBody.name,
    registrationType: 'EMAIL',
    verificationToken: generateVerificationToken(),
    verificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  });

  // Send verification email
  const emailSent = await emailService.sendVerificationEmail(userBody.email, preReg.verificationToken);

  if (!emailSent && config.env === 'production') {
    // In production, rollback if email fails
    await preReg.destroy();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to send verification email');
  }

  return {
    message: 'Verification email sent',
    verificationToken: config.env === 'development' ? preReg.verificationToken : undefined,
  };
};

/**
 * Verify email and create user
 * @param {string} token
 * @returns {Promise<User>}
 */
const verifyEmailAndCreateUser = async (token) => {
  const preReg = await PreRegistration.findOne({
    where: {
      verificationToken: token,
      verificationTokenExpiry: { [Op.gt]: new Date() },
      registrationType: 'EMAIL',
    },
  });

  if (!preReg) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid or expired verification token');
  }

  // Create user
  const user = await User.create({
    email: preReg.email,
    password: preReg.password,
    name: preReg.name,
    isEmailVerified: true,
    authMethods: ['EMAIL_PASSWORD'],
  });

  // Delete pre-registration entry
  await preReg.destroy();

  return user;
};

const registerWithPhonePassword = async (userData) => {
  // Check if phone is already registered
  const existingUser = await User.findOne({
    where: {
      phoneNumber: userData.phoneNumber,
      countryCode: userData.countryCode
    }
  });

  if (existingUser) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Phone number already registered');
  }

  const existingPreReg = await PreRegistration.findOne({
    where: { phoneNumber: userData.phoneNumber },
    order: [['lastAttempt', 'DESC']],
  });

  if (existingPreReg && !canSendOTP(existingPreReg.lastAttempt, existingPreReg.attempts)) {
    throw new ApiError(httpStatus.TOO_MANY_REQUESTS, 'Too many OTP requests. Please try again later.');
  }

  const preReg = await PreRegistration.create({
    ...userData,
    registrationType: 'PHONE_PASSWORD',
    otp: generateOTP(),
    otpExpiry: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    attempts: existingPreReg ? existingPreReg.attempts + 1 : 1,
    lastAttempt: new Date(),
  });

  // In development, return OTP for testing
  if (config.env === 'development') {
    return {
      message: 'OTP sent to phone number',
      otpToken: preReg.otp // Only in development
    };
  }

  await sendSMS(userData.phoneNumber, preReg.otp);
  return { message: 'OTP sent to phone number' };
};

/**
 * Register with phone OTP
 * @param {Object} userData
 * @returns {Promise<Object>}
 */
const registerWithPhoneOTP = async (userData) => {
  // Check if phone is already registered
  const existingUser = await User.findOne({
    where: {
      phoneNumber: userData.phoneNumber,
      countryCode: userData.countryCode,
    },
  });

  if (existingUser) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Phone number already registered');
  }

  // Check rate limiting
  const existingPreReg = await PreRegistration.findOne({
    where: { phoneNumber: userData.phoneNumber },
    order: [['lastAttempt', 'DESC']],
  });

  if (existingPreReg && !canSendOTP(existingPreReg.lastAttempt, existingPreReg.attempts)) {
    throw new ApiError(httpStatus.TOO_MANY_REQUESTS, 'Too many OTP requests. Please try again later.');
  }

  // Create pre-registration entry
  const preReg = await PreRegistration.create({
    phoneNumber: userData.phoneNumber,
    countryCode: userData.countryCode,
    registrationType: 'PHONE_OTP',
    otp: generateOTP(),
    otpExpiry: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    attempts: existingPreReg ? existingPreReg.attempts + 1 : 1,
    lastAttempt: new Date(),
  });

  // Send OTP
  await sendSMS(userData.phoneNumber, preReg.otp);

  return {
    message: 'OTP sent to phone number',
    otpToken: config.env === 'development' ? preReg.otp : undefined,
  };
};

/**
 * Verify phone OTP and create user
 * @param {string} phoneNumber
 * @param {string} otp
 * @returns {Promise<User>}
 */
const verifyPhoneAndCreateUser = async (phoneNumber, otp) => {
  logger.info(`Verifying OTP for phone: ${phoneNumber}`);

  const preReg = await PreRegistration.findOne({
    where: {
      phoneNumber,
      otp,
      otpExpiry: { [Op.gt]: new Date() },
      registrationType: { [Op.in]: ['PHONE_PASSWORD', 'PHONE_OTP'] },
    },
  });

  if (!preReg) {
    // Check why verification failed
    const expiredPreReg = await PreRegistration.findOne({
      where: { phoneNumber },
      order: [['createdAt', 'DESC']],
    });

    if (!expiredPreReg) {
      logger.error(`No pre-registration found for phone: ${phoneNumber}`);
      throw new ApiError(httpStatus.BAD_REQUEST, 'No registration found for this phone number');
    }

    if (expiredPreReg.otp !== otp) {
      logger.error(`Invalid OTP for phone: ${phoneNumber}`);
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid OTP');
    }

    if (expiredPreReg.otpExpiry <= new Date()) {
      logger.error(`Expired OTP for phone: ${phoneNumber}`);
      throw new ApiError(httpStatus.BAD_REQUEST, 'OTP has expired');
    }

    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid or expired OTP');
  }

  // Create user based on registration type
  const userData = {
    phoneNumber: preReg.phoneNumber,
    countryCode: preReg.countryCode,
    isPhoneVerified: true,
    authMethods: [preReg.registrationType === 'PHONE_PASSWORD' ? 'PHONE_PASSWORD' : 'PHONE_OTP'],
  };

  // Add password if registration type is PHONE_PASSWORD
  if (preReg.registrationType === 'PHONE_PASSWORD') {
    userData.password = preReg.password;
  }

  const user = await User.create(userData);

  // Delete pre-registration entry
  await preReg.destroy();

  return user;
};

const loginWithPhoneOTP = async (phoneNumber, countryCode) => {
  const user = await User.findOne({ where: { phoneNumber, countryCode } });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const lastOTP = await OTP.findOne({
    where: { phoneNumber },
    order: [['createdAt', 'DESC']],
  });

  if (lastOTP && !canSendOTP(lastOTP.createdAt, lastOTP.attempts)) {
    throw new ApiError(httpStatus.TOO_MANY_REQUESTS, 'Too many OTP requests. Please try again later.');
  }

  const otp = await OTP.create({
    userId: user.id,
    phoneNumber,
    countryCode,
    otp: generateOTP(),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    type: 'LOGIN',
    attempts: lastOTP ? lastOTP.attempts + 1 : 1,
  });

  await sendSMS(phoneNumber, otp.otp);
  return { message: 'OTP sent to phone number' };
};

const verifyLoginOTP = async (phoneNumber, otp) => {
  const otpRecord = await OTP.findOne({
    where: {
      phoneNumber,
      otp,
      expiresAt: { [Op.gt]: new Date() },
      verified: false,
      type: 'LOGIN',
    },
  });

  if (!otpRecord) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid or expired OTP');
  }

  const user = await User.findByPk(otpRecord.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  await otpRecord.update({ verified: true });
  user.lastLogin = new Date();
  await user.save();

  return user;
};

module.exports = {
  registerUser,
  loginUserWithEmailAndPassword,
  logout,
  refreshAuth,
  resetPassword,
  verifyEmail,
  generateResetPasswordToken,
  generateVerifyEmailToken,
  registerWithEmail,
  registerWithPhonePassword,
  registerWithPhoneOTP,
  verifyEmailAndCreateUser,
  verifyPhoneAndCreateUser,
  loginWithPhoneOTP,
  verifyLoginOTP,
};
