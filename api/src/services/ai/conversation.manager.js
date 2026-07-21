import logger from '../../utils/logger.js';

/**
 * Conversation manager — maintains in-memory conversation
 * state for the duration of a request.  Persistence is
 * handled separately via the models layer.
 *
 * This is a stateless helper; it does NOT own storage.
 */

export class ConversationManager {
  /**
   * Trim conversation history to stay within token limits.
   * Keeps the most recent messages.
   */
  static trimHistory(messages, maxMessages = 50) {
    if (messages.length <= maxMessages) return messages;
    logger.debug(`Trimming conversation from ${messages.length} to ${maxMessages} messages`);
    return messages.slice(-maxMessages);
  }

  /**
   * Merge a new assistant response into the history.
   */
  static appendResponse(history, userMessage, assistantMessage) {
    return [
      ...history,
      { role: 'user', content: userMessage },
      { role: 'assistant', content: assistantMessage },
    ];
  }

  /**
   * Extract a title from the first user message (for auto-naming conversations).
   */
  static generateTitle(firstMessage) {
    const cleaned = firstMessage.trim().replace(/\n/g, ' ');
    if (cleaned.length <= 60) return cleaned;
    return cleaned.slice(0, 57) + '…';
  }
}
