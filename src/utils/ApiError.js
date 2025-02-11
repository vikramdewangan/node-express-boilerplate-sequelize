class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = '', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    this.errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = ApiError;
