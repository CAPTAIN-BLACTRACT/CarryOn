import { createClient } from '@supabase/supabase-js';
import env from './env.js';

/**
 * Lazy Supabase client factory.
 * In development without credentials, returns null
 * so the server can still start for frontend work.
 */

let _supabase = null;
let _supabaseAdmin = null;

function getSupabaseUrl() {
  return env.supabase.url;
}

function canConnect() {
  return Boolean(getSupabaseUrl() && env.supabase.anonKey);
}

/**
 * Public Supabase client — used for operations that run
 * in the context of an authenticated user's JWT.
 */
export function getSupabase() {
  if (!_supabase) {
    if (!canConnect()) return null;
    _supabase = createClient(getSupabaseUrl(), env.supabase.anonKey);
  }
  return _supabase;
}

/**
 * Admin Supabase client — uses the service-role key to
 * bypass RLS.  Use sparingly and never expose to the client.
 */
export function getSupabaseAdmin() {
  if (!_supabaseAdmin) {
    if (!canConnect() || !env.supabase.serviceRoleKey) return null;
    _supabaseAdmin = createClient(getSupabaseUrl(), env.supabase.serviceRoleKey);
  }
  return _supabaseAdmin;
}

// Backward-compat named exports (lazy getters)
export const supabase = new Proxy({}, {
  get(_, prop) {
    const client = getSupabase();
    if (!client) throw new Error('Supabase is not configured. Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY.');
    return typeof client[prop] === 'function' ? client[prop].bind(client) : client[prop];
  }
});

export const supabaseAdmin = new Proxy({}, {
  get(_, prop) {
    const client = getSupabaseAdmin();
    if (!client) throw new Error('Supabase Admin is not configured. Set SUPABASE_SECRET_KEY.');
    return typeof client[prop] === 'function' ? client[prop].bind(client) : client[prop];
  }
});

export default { supabase, supabaseAdmin, canConnect };
