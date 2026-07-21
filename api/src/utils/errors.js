/**
 * Base application error.
 * All custom errors extend this so the error middleware
 * can distinguish operational errors from programming bugs.
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', details = null) {
    super(message, 400, details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

export class AIServiceError extends AppError {
  constructor(message = 'AI service error', details = null) {
    super(message, 502, details);
  }
}

// Keep provider-specific failures understandable and actionable for learners.
// The underlying provider error is still retained in `details` for diagnostics.
export const GEMINI_UNAVAILABLE_MESSAGE =
  'Many people are exploring right now, so Gemini needs a moment to cool down. Please explore again later, or use the self-hosted version of CarryOn.';

export class DatabaseError extends AppError {
  constructor(message = 'Database error', details = null) {
    super(message, 500, details);
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429);
  }
}
