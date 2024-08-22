const httpStatus = require('http-status');
const config = require('../config/config');
const logger = require('../config/logger');
const ApiError = require('../utils/ApiError');
const { ErrorLog } = require('../models'); // Import ErrorLog model
const Sequelize = require('sequelize'); // Ensure Sequelize is imported if used

const errorConverter = async (err, req, res, next) => {
  let error = err;

  // Check if error is an instance of ApiError or a Sequelize error
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode ||
                       (error.name && (error.name.startsWith('Sequelize') || error instanceof Sequelize.ValidationError))
                       ? httpStatus.BAD_REQUEST
                       : httpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || httpStatus[statusCode];
    error = new ApiError(statusCode, message, false, err.stack);
  }

  // Log error to the database
  try {
    await ErrorLog.create({
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode,
    });
  } catch (logError) {
    logger.error('Failed to log error to the database:', logError);
  }

  next(error);
};

const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;

  // In production, set statusCode and message for non-operational errors
  if (config.env === 'production' && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = httpStatus[statusCode];
  }

  res.locals.errorMessage = err.message;

  const response = {
    code: statusCode,
    message,
    ...(config.env === 'development' && { stack: err.stack }),
  };

  // Log error details in development
  if (config.env === 'development') {
    logger.error(err);
  }

  res.status(statusCode).send(response);
};

module.exports = {
  errorConverter,
  errorHandler,
};
