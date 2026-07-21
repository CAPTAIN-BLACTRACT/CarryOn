import { supabaseAdmin } from '../config/supabase.js';
import { DatabaseError } from '../utils/errors.js';
import logger from '../utils/logger.js';

/**
 * Reusable database helpers wrapping Supabase queries.
 * Every function catches Supabase errors and wraps them
 * in a DatabaseError so the error middleware formats them
 * consistently.
 */

// ─── Generic helpers ────────────────────────────────

async function query(table, builderFn) {
  const builder = supabaseAdmin.from(table);
  const { data, error } = await builderFn(builder);
  if (error) {
    logger.error(`DB error on "${table}"`, { message: error.message, code: error.code });
    throw new DatabaseError(error.message, { table, code: error.code });
  }
  return data;
}

// ─── Users ──────────────────────────────────────────

export async function findUserById(id) {
  return query('users', (q) => q.select('*').eq('id', id).single());
}

export async function upsertUser(user) {
  return query('users', (q) =>
    q.upsert(
      {
        id: user.id,
        email: user.email,
        display_name: user.user_metadata?.full_name || user.email,
        avatar_url: user.user_metadata?.avatar_url || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    ).select().single()
  );
}

// ─── Profiles ───────────────────────────────────────

export async function getProfile(userId) {
  return query('profiles', (q) => q.select('*').eq('user_id', userId).single());
}

export async function updateProfile(userId, updates) {
  return query('profiles', (q) =>
    q.update({ ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select()
      .single()
  );
}

// ─── Conversations ──────────────────────────────────

export async function createConversation(userId, title = 'New conversation') {
  return query('conversations', (q) =>
    q.insert({ user_id: userId, title }).select().single()
  );
}

export async function getConversations(userId) {
  return query('conversations', (q) =>
    q.select('*').eq('user_id', userId).order('created_at', { ascending: false })
  );
}

export async function getConversationById(id, userId) {
  return query('conversations', (q) =>
    q.select('*').eq('id', id).eq('user_id', userId).single()
  );
}

export async function deleteConversation(id, userId) {
  return query('conversations', (q) =>
    q.delete().eq('id', id).eq('user_id', userId)
  );
}

// ─── Messages ───────────────────────────────────────

export async function addMessage(conversationId, role, content) {
  return query('messages', (q) =>
    q.insert({ conversation_id: conversationId, role, content }).select().single()
  );
}

export async function getMessages(conversationId) {
  return query('messages', (q) =>
    q.select('*').eq('conversation_id', conversationId).order('created_at', { ascending: true })
  );
}

// ─── Image Cache ────────────────────────────────────

export async function cacheImage(imageData) {
  return query('image_cache', (q) =>
    q.upsert(imageData, { onConflict: 'source_id' }).select().single()
  );
}

export async function getCachedImage(sourceId) {
  return query('image_cache', (q) =>
    q.select('*').eq('source_id', sourceId).single()
  );
}

// ─── Preferences ────────────────────────────────────

export async function getPreferences(userId) {
  return query('preferences', (q) => q.select('*').eq('user_id', userId).single());
}

export async function upsertPreferences(userId, prefs) {
  return query('preferences', (q) =>
    q.upsert({ user_id: userId, ...prefs, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
      .select()
      .single()
  );
}

export async function createJourney(userId, journey) {
  return query('journeys', (q) =>
    q.insert({ user_id: userId, ...journey }).select().single()
  );
}
