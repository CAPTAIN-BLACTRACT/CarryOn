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
