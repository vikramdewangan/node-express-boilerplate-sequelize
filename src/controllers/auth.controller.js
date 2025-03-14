const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, tokenService, emailService } = require('../services');
const ApiError = require('../utils/ApiError');
const config = require('../config/config');
const logger = require('../config/logger'); // Import logger

const registerWithEmail = catchAsync(async (req, res) => {
  const result = await authService.registerWithEmail(req.body);
  res.status(httpStatus.OK).send(result);
});

const registerWithPhonePassword = catchAsync(async (req, res) => {
  const { registrationType } = req.body;
  let result;

  try {
    if (registrationType === 'PHONE_PASSWORD') {
      if (!req.body.password) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Password is required for PHONE_PASSWORD registration');
      }
      result = await authService.registerWithPhonePassword(req.body);
    } else if (registrationType === 'PHONE_OTP') {
      result = await authService.registerWithPhoneOTP(req.body);
    } else {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid registration type');
    }

    res.status(httpStatus.OK).send(result);
  } catch (error) {
    if (error.isJoi) {
      throw new ApiError(httpStatus.BAD_REQUEST, error.details[0].message);
    }
    throw error;
  }
});

const registerWithPhonePasswordOtpVerify = catchAsync(async (req, res) => {
  const result = await authService.registerWithPhonePasswordOtpVerify(req.body);
  res.status(httpStatus.OK).send(result);
});

const registerWithPhoneOtpOtpVerify = catchAsync(async (req, res) => {
  const result = await authService.registerWithPhoneOtpOtpVerify(req.body);
  res.status(httpStatus.OK).send(result);
});

const registerWithPhoneOTP = catchAsync(async (req, res) => {
  const result = await authService.registerWithPhoneOTP(req.body);
  res.status(httpStatus.OK).send(result);
});

const verifyEmail = catchAsync(async (req, res) => {
  const user = await authService.verifyEmailAndCreateUser(req.query.token);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.OK).send({ user, tokens });
});

const verifyPhoneOTP = catchAsync(async (req, res) => {
  const { phoneNumber, otp } = req.body;
  const user = await authService.verifyPhoneAndCreateUser(phoneNumber, otp);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.OK).send({ user, tokens });
});

const loginWithEmailPassword = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.OK).send({ user, tokens });
});

const loginWithPhonePassword = catchAsync(async (req, res) => {
  try {
    const { phoneNumber, password, countryCode } = req.body;

    if (!phoneNumber || !password || !countryCode) {
      return res.status(httpStatus.BAD_REQUEST).send({
        code: httpStatus.BAD_REQUEST,
        message: 'Phone number, password and country code are required',
      });
    }

    const user = await authService.loginUserWithPhonePassword(phoneNumber, password, countryCode);
    const tokens = await tokenService.generateAuthTokens(user);
    res.status(httpStatus.OK).send({ user, tokens });
  } catch (error) {
    // Handle ApiError instances with their status code and message
    if (error instanceof ApiError) {
      return res.status(error.statusCode).send({
        code: error.statusCode,
        message: error.message,
      });
    }

    // Log unexpected errors and return a generic error message
    logger.error('Phone login error:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      code: httpStatus.INTERNAL_SERVER_ERROR,
      message: 'An error occurred during authentication',
    });
  }
});

const requestLoginOTP = catchAsync(async (req, res) => {
  const { phoneNumber, countryCode } = req.body;
  const result = await authService.loginWithPhoneOTP(phoneNumber, countryCode);
  res.status(httpStatus.OK).send(result);
});

const verifyLoginOTP = catchAsync(async (req, res) => {
  const { phoneNumber, otp } = req.body;
  const user = await authService.verifyLoginOTP(phoneNumber, otp);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.OK).send({ user, tokens });
});

const loginWithEmail = catchAsync(async (req, res) => {
  const { email } = req.body;
  const result = await authService.loginWithEmail(email);
  res.status(httpStatus.OK).send(result);
});

const verifyLoginEmail = catchAsync(async (req, res) => {
  const { email, token } = req.body;
  const user = await authService.verifyLoginEmail(email, token);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.OK).send({ user, tokens });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  const { token, otp } = await authService.generateResetPasswordToken(req.body.email);
  await emailService.sendResetPasswordEmail(req.body.email, token, otp);
  // Return the OTP in development mode for testing purposes
  if (config.env === 'development') {
    res.status(httpStatus.OK).send({
      message: 'Password reset email sent. Please check your email.',
      resetToken: token,
      otp,
    });
  } else {
    res.status(httpStatus.OK).send({
      message: 'Password reset email sent. Please check your email.',
    });
  }
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.query.token, req.body.password, req.body.otp);
  res.status(httpStatus.OK).send({ message: 'Password reset successfully' });
});

const resetEmailPassword = catchAsync(async (req, res) => {
  await authService.resetEmailPassword(req.query.token, req.body.password);
  res.status(httpStatus.OK).send({ message: 'Password reset successfully' });
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const verifyEmailToken = await authService.generateVerifyEmailToken(req.user);
  await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const verifyEmailPasswordResetOtp = catchAsync(async (req, res) => {
  const { email, otp } = req.body;
  const result = await authService.verifyEmailPasswordResetOtp(email, otp);
  res.status(httpStatus.OK).send(result);
});

module.exports = {
  registerWithEmail,
  registerWithPhonePassword,
  registerWithPhonePasswordOtpVerify,
  registerWithPhoneOtpOtpVerify,
  registerWithPhoneOTP,
  verifyEmail,
  verifyPhoneOTP,
  loginWithEmailPassword,
  loginWithPhonePassword,
  requestLoginOTP,
  verifyLoginOTP,
  loginWithEmail,
  verifyLoginEmail,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  resetEmailPassword,
  sendVerificationEmail,
  verifyEmailPasswordResetOtp,
};
