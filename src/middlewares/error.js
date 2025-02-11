const httpStatus = require('http-status');
const config = require('../config/config');
const logger = require('../config/logger');
const ApiError = require('../utils/ApiError');
const { ErrorLog } = require('../models'); // Import ErrorLog model
const Sequelize = require('sequelize'); // Ensure Sequelize is imported if used

// Map Sequelize errors to API errors
const sequelizeErrorMap = {
  ValidationError: httpStatus.BAD_REQUEST,
  UniqueConstraintError: httpStatus.CONFLICT,
  ForeignKeyConstraintError: httpStatus.BAD_REQUEST,
  ExclusionConstraintError: httpStatus.CONFLICT,
  DatabaseError: httpStatus.INTERNAL_SERVER_ERROR,
};

const errorConverter = async (err, req, res, next) => {
  let error = err;
  
  // Convert Sequelize errors
  if (error instanceof Sequelize.Error) {
    const statusCode = sequelizeErrorMap[error.name] || httpStatus.BAD_REQUEST;
    const message = error.message || httpStatus[statusCode];
    error = new ApiError(statusCode, message, true, err.stack, {
      type: error.name,
      fields: error.errors?.map(e => ({
        field: e.path,
        message: e.message,
        value: e.value,
      })),
    });
  }
  
  // Convert other errors to ApiError
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || httpStatus[statusCode];
    error = new ApiError(statusCode, message, false, err.stack);
  }

  // Log error to database
  try {
    await ErrorLog.create({
      errorId: error.errorId,
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode,
      details: error.details,
      path: req.path,
      method: req.method,
      requestBody: req.body,
      requestQuery: req.query,
      userAgent: req.get('user-agent'),
      ip: req.ip,
      userId: req.user?.id,
    });
  } catch (logError) {
    logger.error('Failed to log error to database:', logError);
  }

  next(error);
};

const errorHandler = (err, req, res, next) => {
  let { statusCode, message, details } = err;

  // Handle production error messages
  if (config.env === 'production' && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
    details = null;
  }

  const response = {
    code: statusCode,
    message,
    ...(details && { details }),
    ...(config.env === 'development' && {
      stack: err.stack,
      errorId: err.errorId,
    }),
  };

  // Log error
  if (statusCode >= 500) {
    logger.error({
      errorId: err.errorId,
      message: err.message,
      stack: err.stack,
      details: err.details,
      path: req.path,
      method: req.method,
    });
  } else {
    logger.warn({
      errorId: err.errorId,
      message: err.message,
      path: req.path,
      method: req.method,
    });
  }

  res.status(statusCode).send(response);
};

const handleJSONParseError = (err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    const error = new ApiError(
      httpStatus.BAD_REQUEST,
      'Invalid JSON payload',
      true,
      err.stack,
      { syntaxError: err.message }
    );
    return errorHandler(error, req, res, next);
  }
  next(err);
};

// Rate limit error handler
const handleRateLimitError = (err, req, res, next) => {
  if (err.type === 'RateLimit') {
    const error = new ApiError(
      httpStatus.TOO_MANY_REQUESTS,
      'Too many requests',
      true,
      err.stack,
      { retryAfter: err.retryAfter }
    );
    return errorHandler(error, req, res, next);
  }
  next(err);
};

module.exports = {
  errorConverter,
  errorHandler,
  handleJSONParseError,
  handleRateLimitError,
};
