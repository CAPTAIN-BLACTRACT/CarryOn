import dotenv from 'dotenv';
dotenv.config();

/**
 * Centralized environment configuration.
 * Validates required vars at startup so the server fails
 * fast instead of crashing later on a missing key.
 */

const required = [
  'SUPABASE_URL',
  'SUPABASE_PUBLISHABLE_KEY',
  'SUPABASE_SECRET_KEY',
  'GEMINI_API_KEY',
];

const missing = required.filter((key) => !process.env[key]);

// In development we allow running without keys so the
// frontend can still render; in production we hard-fail.
if (missing.length && process.env.NODE_ENV === 'production') {
  throw new Error(
    `Missing required environment variables: ${missing.join(', ')}`
  );
}

if (missing.length) {
  console.warn(
    `⚠  Missing env vars (non-fatal in dev): ${missing.join(', ')}`
  );
}

const env = {
  // Server
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: (process.env.NODE_ENV || 'development') === 'development',
  isProd: process.env.NODE_ENV === 'production',

  // Supabase
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    jwtSecret: process.env.SUPABASE_JWT_SECRET || '',
  },

  // AI
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-3.5-flash',
  },

  // Images
  image: {
    provider: process.env.IMAGE_PROVIDER || 'pexels',
    apiKey: process.env.IMAGE_API_KEY || '',
  },

  // Frontend
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  // Logging
  logLevel: process.env.LOG_LEVEL || 'debug',
};

export default env;
