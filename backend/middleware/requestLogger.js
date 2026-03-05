const { logger } = require('../utils/logger');

/**
 * Request logger middleware — logs all incoming HTTP requests.
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logFn = res.statusCode >= 400 ? logger.warn.bind(logger) : logger.info.bind(logger);
    logFn(
      `[${req.method}] ${req.originalUrl} → ${res.statusCode} (${duration}ms) | IP: ${
        req.ip || req.connection?.remoteAddress
      }`
    );
  });

  next();
};

module.exports = { requestLogger };
