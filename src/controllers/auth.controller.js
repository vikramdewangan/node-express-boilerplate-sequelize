const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, tokenService, emailService } = require('../services');
const ApiError = require('../utils/ApiError');

const registerWithEmail = catchAsync(async (req, res) => {
  const result = await authService.registerWithEmail(req.body);
  res.status(httpStatus.OK).send(result);
});

const registerWithPhone = catchAsync(async (req, res) => {
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
  const { phoneNumber, password, countryCode } = req.body;
  const user = await authService.loginUserWithPhonePassword(phoneNumber, password, countryCode);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.OK).send({ user, tokens });
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

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  const resetPasswordToken = await authService.generateResetPasswordToken(req.body.email);
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.query.token, req.body.password);
  res.status(httpStatus.NO_CONTENT).send();
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const verifyEmailToken = await authService.generateVerifyEmailToken(req.user);
  await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  registerWithEmail,
  registerWithPhone,
  verifyEmail,
  verifyPhoneOTP,
  loginWithEmailPassword,
  loginWithPhonePassword,
  requestLoginOTP,
  verifyLoginOTP,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
};
