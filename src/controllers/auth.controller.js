const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, tokenService, emailService } = require('../services');
const { User } = require('../models'); // Import your Sequelize model
const ApiError = require('../utils/ApiError');

const register = catchAsync(async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.create({ email, password });
    const tokens = await tokenService.generateAuthTokens(user);
    res.status(httpStatus.CREATED).send({ user, tokens });
  } catch (error) {
    // Log detailed validation error
    console.error('Validation Error:', error.errors);
    throw new ApiError(httpStatus.BAD_REQUEST, 'Validation error');
  }
});
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  console.log('Attempting to login with email:', email); // Debugging statement

  // Verify User model is loaded
  if (!User) {
    console.error('User model is not defined');
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'User model is not defined');
  }

  // Authenticate user using Sequelize
  const user = await User.findOne({ where: { email } });

  if (!user) {
    console.error('User not found');
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid credentials');
  }

  const isValidPassword = await user.validPassword(password);

  if (!isValidPassword) {
    console.error('Invalid password');
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid credentials');
  }

  // Generate authentication tokens
  const tokens = await tokenService.generateAuthTokens(user);

  // Send response
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
  const { email } = req.body;
  const resetPasswordToken = await tokenService.generateResetPasswordToken(email);
  await emailService.sendResetPasswordEmail(email, resetPasswordToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const resetPassword = catchAsync(async (req, res) => {
  const { token } = req.query;
  const { password } = req.body;
  await authService.resetPassword(token, password);
  res.status(httpStatus.NO_CONTENT).send();
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
  await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.query.token);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
};
