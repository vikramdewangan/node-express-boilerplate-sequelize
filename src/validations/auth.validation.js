const Joi = require('joi');
const { password } = require('./custom.validation');

const registerWithEmail = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string()
      .required()
      .min(8)
      .custom((value, helpers) => {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          return helpers.message('password must contain at least 1 letter and 1 number');
        }
        return value;
      }),
    name: Joi.string().required(),
  }),
};

const registerWithPhone = {
  body: Joi.object().keys({
    phoneNumber: Joi.string()
      .required()
      .pattern(/^\d{10}$/)
      .messages({
        'string.pattern.base': 'Phone number must be 10 digits',
      }),
    countryCode: Joi.string()
      .required()
      .pattern(/^\+\d{1,4}$/)
      .messages({
        'string.pattern.base': 'Country code must start with + and contain 1-4 digits',
      }),
    registrationType: Joi.string()
      .required()
      .valid('PHONE_PASSWORD', 'PHONE_OTP')
      .messages({
        'any.only': 'Registration type must be either PHONE_PASSWORD or PHONE_OTP',
      }),
    password: Joi.string().when('registrationType', {
      is: 'PHONE_PASSWORD',
      then: Joi.string()
        .required()
        .min(8)
        .custom((value, helpers) => {
          if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
            return helpers.message('password must contain at least 1 letter and 1 number');
          }
          return value;
        }),
      otherwise: Joi.forbidden(),
    }),
  }),
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

const logout = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
};

const resetPassword = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
  body: Joi.object().keys({
    password: Joi.string().required().custom(password),
  }),
};

const verifyEmail = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
};

const verifyPhoneOTP = {
  body: Joi.object().keys({
    phoneNumber: Joi.string().required().pattern(/^\d{10}$/),
    otp: Joi.string().required().length(6),
  }),
};

const loginWithPhonePassword = {
  body: Joi.object().keys({
    phoneNumber: Joi.string().required().pattern(/^\d{10}$/),
    countryCode: Joi.string().required().pattern(/^\+\d{1,4}$/),
    password: Joi.string().required(),
  }),
};

const requestLoginOTP = {
  body: Joi.object().keys({
    phoneNumber: Joi.string().required().pattern(/^\d{10}$/),
    countryCode: Joi.string().required().pattern(/^\+\d{1,4}$/),
  }),
};

const verifyLoginOTP = {
  body: Joi.object().keys({
    phoneNumber: Joi.string().required().pattern(/^\d{10}$/),
    otp: Joi.string().required().length(6),
  }),
};

module.exports = {
  registerWithEmail,
  registerWithPhone,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  verifyEmail,
  verifyPhoneOTP,
  loginWithPhonePassword,
  requestLoginOTP,
  verifyLoginOTP,
};
