import { success } from '../../utils/helpers/response.js';
import { upsertUser } from '../../models/index.js';

/**
 * POST /api/v1/auth/login
 * Frontend authenticates via Supabase client-side.
 * This endpoint can be used for additional server-side
 * login logic (e.g. auto-create user in our DB).
 */
export async function login(req, res) {
  if (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY) {
    await upsertUser(req.user);
  }
  return success(res, { user: req.user }, 'Login successful');
}

/**
 * POST /api/v1/auth/logout
 * Server-side logout handling (cleanup, logging, etc.).
 */
export async function logout(req, res) {
  // TODO: Implement logout logic
  // 1. Invalidate session if needed
  // 2. Log the event
  return success(res, null, 'Logged out');
}

/**
 * GET /api/v1/auth/me
 * Return the currently authenticated user.
 */
export async function me(req, res) {
  return success(res, { user: req.user }, 'Current user');
}
