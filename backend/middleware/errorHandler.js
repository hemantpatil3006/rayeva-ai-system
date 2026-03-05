const { logger } = require('../utils/logger');
const { errorResponse } = require('../utils/responseHelper');

/**
 * Global error handler middleware.
 * Must be registered LAST in Express middleware chain.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  logger.error(`[${req.method}] ${req.path} — ${err.message}`, {
    stack: err.stack,
    body: req.body,
  });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    return errorResponse(res, 'Database validation failed', 400, errors);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return errorResponse(res, `Duplicate value for field: ${field}`, 409);
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    return errorResponse(res, `Invalid value for field: ${err.path}`, 400);
  }

  // JWT errors (future auth)
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 'Invalid token', 401);
  }

  // OpenAI API errors
  if (err.constructor?.name === 'APIError' || err.status) {
    return errorResponse(res, `AI service error: ${err.message}`, 502);
  }

  // Default
  const statusCode = err.statusCode || err.status || 500;
  const message =
    process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message;

  return errorResponse(res, message, statusCode);
};

module.exports = { errorHandler };
