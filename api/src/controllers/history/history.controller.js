import { success } from '../../utils/helpers/response.js';

/**
 * GET /api/v1/history
 * List all conversations for the authenticated user.
 */
export async function listHistory(req, res) {
  // TODO: Implement
  // 1. Call models.getConversations(req.user.id)
  // 2. Return list
  return success(res, { conversations: [] }, 'Conversation history');
}

/**
 * GET /api/v1/history/:id
 * Get a single conversation with its messages.
 */
export async function getHistory(req, res) {
  // TODO: Implement
  // 1. Call models.getConversationById(req.params.id, req.user.id)
  // 2. Call models.getMessages(req.params.id)
  // 3. Return conversation + messages
  return success(res, { conversation: null, messages: [] }, 'Conversation detail');
}

/**
 * DELETE /api/v1/history/:id
 * Delete a conversation and its messages.
 */
export async function deleteHistory(req, res) {
  // TODO: Implement
  // 1. Call models.deleteConversation(req.params.id, req.user.id)
  // 2. Return confirmation
  return success(res, null, 'Conversation deleted');
}
