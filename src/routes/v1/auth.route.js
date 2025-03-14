const express = require('express');
const validate = require('../../middlewares/validate');
const authValidation = require('../../validations/auth.validation');
const authController = require('../../controllers/auth.controller');
const auth = require('../../middlewares/auth');

const router = express.Router();

router.post('/register-email', validate(authValidation.registerWithEmail), authController.registerWithEmail);
router.post(
  '/register-phone-password',
  validate(authValidation.registerWithPhonePassword),
  authController.registerWithPhonePassword
);
router.post('/register-phone-otp', validate(authValidation.registerWithPhoneOTP), authController.registerWithPhoneOTP);

router.post(
  '/register-phone-password-otp-verify',
  validate(authValidation.registerWithPhonePasswordOtpVerify),
  authController.registerWithPhonePasswordOtpVerify
);

router.post(
  '/register-phone-otp-otp-verify',
  validate(authValidation.registerWithPhoneOtpOtpVerify),
  authController.registerWithPhoneOtpOtpVerify
);

// Email verification
router.get('/verify-email', validate(authValidation.verifyEmail), authController.verifyEmail);

// Phone verification
router.post('/verify-phone', validate(authValidation.verifyPhoneOTP), authController.verifyPhoneOTP);

// Login routes
router.post('/login-email-password', validate(authValidation.loginWithEmailPassword), authController.loginWithEmailPassword);
router.post('/login-email-otp', validate(authValidation.loginWithEmail), authController.loginWithEmail);
router.post('/verify-login-email', validate(authValidation.verifyLoginEmail), authController.verifyLoginEmail);
router.post('/login-phone-password', validate(authValidation.loginWithPhonePassword), authController.loginWithPhonePassword);
router.post('/login-phone-otp-request', validate(authValidation.requestLoginOTP), authController.requestLoginOTP);
router.post('/login-phone-otp-verify', validate(authValidation.verifyLoginOTP), authController.verifyLoginOTP);

// Existing routes
router.post('/logout', validate(authValidation.logout), authController.logout);
router.post('/refresh-tokens', validate(authValidation.refreshTokens), authController.refreshTokens);
router.post('/forgot-password', validate(authValidation.forgotPassword), authController.forgotPassword);
router.post(
  '/verify-email-password-reset-otp',
  validate(authValidation.verifyEmailPasswordResetOtp),
  authController.verifyEmailPasswordResetOtp
);
router.post('/reset-password', validate(authValidation.resetPassword), authController.resetPassword);
router.post('/reset-email-password', validate(authValidation.resetEmailPassword), authController.resetEmailPassword);
router.post('/send-verification-email', auth(), authController.sendVerificationEmail);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Authentication and authorization operations
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AuthTokens:
 *       type: object
 *       properties:
 *         access:
 *           type: object
 *           properties:
 *             token:
 *               type: string
 *             expires:
 *               type: string
 *               format: date-time
 *         refresh:
 *           type: object
 *           properties:
 *             token:
 *               type: string
 *             expires:
 *               type: string
 *               format: date-time
 */

/**
 * @swagger
 * /auth/register-email:
 *   post:
 *     summary: Register a user with email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: At least one number and one letter
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Verification email sent
 *       "400":
 *         description: Email already taken
 */

/**
 * @swagger
 * /auth/register-phone-password:
 *   post:
 *     summary: Register a user with phone (Password)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - countryCode
 *               - registrationType
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 pattern: '^\d{10}$'
 *                 example: '1234567890'
 *               countryCode:
 *                 type: string
 *                 pattern: '^\+\d{1,4}$'
 *                 example: '+1'
 *               registrationType:
 *                 type: string
 *                 enum: [PHONE_PASSWORD, PHONE_OTP]
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: Required when registrationType is PHONE_PASSWORD
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OTP sent to phone number
 *                 otpToken:
 *                   type: string
 *                   description: Only returned in development environment
 *       "400":
 *         description: Invalid phone number or phone number already registered
 *       "429":
 *         description: Too many OTP requests
 */

/**
 * @swagger
 * /auth/register-phone-otp:
 *   post:
 *     summary: Register a user with phone (OTP)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - countryCode
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 pattern: '^\d{10}$'
 *                 example: '1234567890'
 *               countryCode:
 *                 type: string
 *                 pattern: '^\+\d{1,4}$'
 *                 example: '+1'
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OTP sent to phone number
 *                 otpToken:
 *                   type: string
 *                   description: Only returned in development environment
 *       "400":
 *         description: Invalid phone number or phone number already registered
 *       "429":
 *         description: Too many OTP requests
 */

/**
 * @swagger
 * /auth/login-email-password:
 *   post:
 *     summary: Login with email and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *             example:
 *               email: fake@example.com
 *               password: password1
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 tokens:
 *                   $ref: '#/components/schemas/AuthTokens'
 *       "401":
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               code: 401
 *               message: Invalid email or password
 */

/**
 * @swagger
 * /auth/login-email:
 *   post:
 *     summary: Request email login (passwordless)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *             example:
 *               email: user@example.com
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Verification email sent
 *                 verificationToken:
 *                   type: string
 *                   description: Only returned in development environment
 *       "404":
 *         description: Email not found
 *       "429":
 *         description: Too many email requests
 */

/**
 * @swagger
 * /auth/verify-login-email:
 *   post:
 *     summary: Verify email login token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - token
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               token:
 *                 type: string
 *             example:
 *               email: user@example.com
 *               token: abc123def456
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 tokens:
 *                   $ref: '#/components/schemas/AuthTokens'
 *       "400":
 *         description: Invalid or expired verification token
 *       "404":
 *         description: User not found
 */

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *             example:
 *               refreshToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZWJhYzUzNDk1NGI1NDEzOTgwNmMxMTIiLCJpYXQiOjE1ODkyOTg0ODQsImV4cCI6MTU4OTMwMDI4NH0.m1U63blB0MLej_WfB7yC2FTMnCziif9X8yzwDEfJXAg
 *     responses:
 *       "204":
 *         description: No content
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /auth/refresh-tokens:
 *   post:
 *     summary: Refresh auth tokens
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthTokens'
 *       "401":
 *         description: Invalid refresh token
 */

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Forgot password
 *     description: An email will be sent to reset password.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *             example:
 *               email: fake@example.com
 *     responses:
 *       "204":
 *         description: No content
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: The reset password token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: At least one number and one letter
 *             example:
 *               password: password1
 *     responses:
 *       "204":
 *         description: No content
 *       "401":
 *         description: Password reset failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               code: 401
 *               message: Password reset failed
 */

/**
 * @swagger
 * /auth/reset-email-password:
 *   post:
 *     summary: Reset email password
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: The reset email password token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: At least one number and one letter
 *             example:
 *               password: password1
 *     responses:
 *       "204":
 *         description: No content
 *       "401":
 *         description: Password reset failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               code: 401
 *               message: Password reset failed
 */

/**
 * @swagger
 * /auth/send-verification-email:
 *   post:
 *     summary: Send verification email
 *     description: An email will be sent to verify email.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "204":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /auth/verify-email:
 *   get:
 *     summary: Verify email address
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: The verification token sent in email
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 tokens:
 *                   $ref: '#/components/schemas/AuthTokens'
 *       "400":
 *         description: Invalid or expired verification token
 */

/**
 * @swagger
 * /auth/verify-phone:
 *   post:
 *     summary: Verify phone OTP and complete registration
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - otp
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 pattern: '^\d{10}$'
 *                 example: '1234567890'
 *               otp:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 6
 *                 example: '123456'
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 tokens:
 *                   $ref: '#/components/schemas/AuthTokens'
 *       "400":
 *         description: Invalid or expired OTP
 */

/**
 * @swagger
 * /auth/login-phone-password:
 *   post:
 *     summary: Login with phone and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - countryCode
 *               - password
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 pattern: '^\d{10}$'
 *                 example: '1234567890'
 *               countryCode:
 *                 type: string
 *                 pattern: '^\+\d{1,4}$'
 *                 example: '+1'
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 tokens:
 *                   $ref: '#/components/schemas/AuthTokens'
 *       "401":
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /auth/login-phone-otp-request:
 *   post:
 *     summary: Request OTP for phone login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - countryCode
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 pattern: '^\d{10}$'
 *                 example: '1234567890'
 *               countryCode:
 *                 type: string
 *                 pattern: '^\+\d{1,4}$'
 *                 example: '+1'
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OTP sent to phone number
 *                 otpToken:
 *                   type: string
 *                   description: Only returned in development environment
 *       "404":
 *         description: User not found
 *       "429":
 *         description: Too many OTP requests
 */

/**
 * @swagger
 * /auth/login-phone-otp-verify:
 *   post:
 *     summary: Verify OTP and login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - otp
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 pattern: '^\d{10}$'
 *                 example: '1234567890'
 *               otp:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 6
 *                 example: '123456'
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 tokens:
 *                   $ref: '#/components/schemas/AuthTokens'
 *       "400":
 *         description: Invalid or expired OTP
 *       "404":
 *         description: User not found
 */

/**
 * @swagger
 * /auth/verify-email-password-reset-otp:
 *   post:
 *     summary: Verify email and OTP for password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               otp:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 6
 *             example:
 *               email: user@example.com
 *               otp: 123456
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OTP verified successfully
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       "400":
 *         description: Invalid or expired OTP
 *       "404":
 *         description: User not found with this email
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         phoneNumber:
 *           type: string
 *         countryCode:
 *           type: string
 *         isEmailVerified:
 *           type: boolean
 *         isPhoneVerified:
 *           type: boolean
 *         authMethods:
 *           type: array
 *           items:
 *             type: string
 *             enum: [EMAIL_PASSWORD, PHONE_PASSWORD, PHONE_OTP]
 *         status:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, BLOCKED]
 *         lastLogin:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *   responses:
 *     DuplicateEmail:
 *       description: Email already taken
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *           example:
 *             code: 400
 *             message: Email already taken
 *     Unauthorized:
 *       description: Unauthorized
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *           example:
 *             code: 401
 *             message: Please authenticate
 *     NotFound:
 *       description: Not found
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *           example:
 *             code: 404
 *             message: Not found
 *     Error:
 *       type: object
 *       properties:
 *         code:
 *           type: number
 *         message:
 *           type: string
 */
