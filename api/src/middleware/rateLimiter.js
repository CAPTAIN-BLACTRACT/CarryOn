import rateLimit from 'express-rate-limit';
import { LIMITS } from '../utils/constants/index.js';
import { failure } from '../utils/helpers/response.js';

/**
 * General rate limiter — applied globally.
 */
export const globalLimiter = rateLimit({
  windowMs: LIMITS.RATE_LIMIT_WINDOW_MS,
  max: LIMITS.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    return failure(res, 'Too many requests. Please try again later.', 429);
  },
});

/**
 * Strict rate limiter for AI endpoints.
 */
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    return failure(res, 'AI rate limit reached. Wait a moment.', 429);
  },
});

/**
 * Auth endpoint limiter (login/signup brute-force protection).
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    return failure(res, 'Too many authentication attempts.', 429);
  },
});
