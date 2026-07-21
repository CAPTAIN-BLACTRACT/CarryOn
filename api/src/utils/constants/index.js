/** HTTP status codes used across the app. */
export const HTTP = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL: 500,
  BAD_GATEWAY: 502,
};

/** AI provider identifiers. */
export const AI_PROVIDERS = {
  GEMINI: 'gemini',
  OPENAI: 'openai',
  CLAUDE: 'claude',
};

/** Image search provider identifiers. */
export const IMAGE_PROVIDERS = {
  PEXELS: 'pexels',
  PIXABAY: 'pixabay',
  UNSPLASH: 'unsplash',
};

/** Default limits. */
export const LIMITS = {
  MAX_PROMPT_LENGTH: 4000,
  MAX_CONVERSATION_MESSAGES: 100,
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: 100,
  AI_TIMEOUT_MS: 30_000,
  AI_MAX_RETRIES: 3,
};
