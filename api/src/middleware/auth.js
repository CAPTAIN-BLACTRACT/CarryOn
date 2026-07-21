import { supabase } from '../config/supabase.js';
import { AuthenticationError } from '../utils/errors.js';
import logger from '../utils/logger.js';

/**
 * Verifies the Supabase JWT in the Authorization header.
 * Attaches `req.user` with the authenticated user's data.
 */
export async function authenticate(req, _res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw new AuthenticationError('Missing or malformed authorization header.');
    }

    const token = header.split(' ')[1];
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      logger.debug('JWT verification failed', { error: error?.message });
      throw new AuthenticationError('Invalid or expired token.');
    }

    // Attach user to request for downstream handlers
    req.user = data.user;
    req.token = token;
    next();
  } catch (err) {
    next(err instanceof AuthenticationError ? err : new AuthenticationError());
  }
}

/**
 * Optional auth — attaches user if token is present,
 * but does not block if absent.
 */
export async function optionalAuth(req, _res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) return next();

    const token = header.split(' ')[1];
    const { data } = await supabase.auth.getUser(token);
    if (data?.user) {
      req.user = data.user;
      req.token = token;
    }
  } catch {
    // Swallow — user just stays undefined
  }
  next();
}
