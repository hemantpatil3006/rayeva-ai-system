const { validationResult } = require('express-validator');
const { validationErrorResponse } = require('../utils/responseHelper');

/**
 * Middleware to run after express-validator check chains.
 * Formats and returns validation errors as a structured API response.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
      value: err.value,
    }));
    return validationErrorResponse(res, formattedErrors);
  }
  next();
};

module.exports = { validate };
