import { ValidationError } from '../utils/errors.js';
import { LIMITS } from '../utils/constants/index.js';

/**
 * Validates the body of a /chat or /generate request.
 * Throws a ValidationError if something is wrong.
 */
export function validateChatInput(body) {
  const { prompt, conversationId } = body || {};

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    throw new ValidationError('prompt is required and must be a non-empty string.');
  }

  if (prompt.length > LIMITS.MAX_PROMPT_LENGTH) {
    throw new ValidationError(
      `prompt must be ${LIMITS.MAX_PROMPT_LENGTH} characters or fewer.`
    );
  }

  if (conversationId && typeof conversationId !== 'string') {
    throw new ValidationError('conversationId must be a string.');
  }

  return { prompt: prompt.trim(), conversationId: conversationId || null };
}

export function validateWowInput(body) {
  const { topic, wowScore, wowSignals = [], steps = [] } = body || {};

  if (!topic || typeof topic !== 'string' || !topic.trim()) {
    throw new ValidationError('topic is required and must be a non-empty string.');
  }
  if (!Number.isFinite(wowScore) || wowScore < 0 || wowScore > 100) {
    throw new ValidationError('wowScore must be a number between 0 and 100.');
  }
  if (!Array.isArray(wowSignals) || wowSignals.some((signal) => typeof signal !== 'string')) {
    throw new ValidationError('wowSignals must be an array of strings.');
  }
  if (!Array.isArray(steps) || steps.some((step) => typeof step !== 'string')) {
    throw new ValidationError('steps must be an array of strings.');
  }

  return {
    topic: topic.trim().slice(0, 300),
    wowScore,
    wowSignals: wowSignals.slice(0, 6),
    steps: steps.slice(0, 3).map((step) => step.trim().slice(0, 500)),
  };
}

/**
 * Validates profile update payload.
 */
export function validateProfileUpdate(body) {
  const { displayName, avatarUrl, preferences } = body || {};

  if (displayName !== undefined && typeof displayName !== 'string') {
    throw new ValidationError('displayName must be a string.');
  }

  if (avatarUrl !== undefined && typeof avatarUrl !== 'string') {
    throw new ValidationError('avatarUrl must be a string.');
  }

  return {
    displayName: displayName?.trim() || undefined,
    avatarUrl: avatarUrl?.trim() || undefined,
    preferences: preferences || undefined,
  };
}

/**
 * Validates image search query.
 */
export function validateImageSearch(query) {
  if (!query || typeof query !== 'string' || !query.trim()) {
    throw new ValidationError('query parameter is required.');
  }
  return query.trim();
}
