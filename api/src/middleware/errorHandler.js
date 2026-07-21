import { AppError } from '../utils/errors.js';
import { failure } from '../utils/helpers/response.js';
import logger from '../utils/logger.js';
import env from '../config/env.js';

/**
 * Centralized error handler.
 * Operational errors (AppError subclasses) get their
 * statusCode; unknown errors always return 500.
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  // Log
  if (err.isOperational) {
    logger.warn(err.message, { status: err.statusCode, details: err.details });
  } else {
    logger.error('Unhandled error', {
      message: err.message,
      stack: env.isDev ? err.stack : undefined,
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal server error';
  const errorDetails = env.isDev
    ? { name: err.name, stack: err.stack, details: err.details }
    : { name: err.name };

  return failure(res, message, statusCode, errorDetails);
}

/**
 * 404 catch-all for undefined routes.
 */
export function notFoundHandler(_req, _res, next) {
  const err = new AppError('Endpoint not found', 404);
  next(err);
}
