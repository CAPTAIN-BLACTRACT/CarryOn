/**
 * Provider interface — every AI provider must implement
 * these methods.  This acts as the contract so swapping
 * Gemini for OpenAI/Claude later is a one-line change.
 */
export class AIProvider {
  /**
   * @param {string} _prompt
   * @param {object} [_options]
   * @returns {Promise<{ text: string, usage: object }>}
   */
  async generateText(_prompt, _options = {}) {
    throw new Error('generateText() must be implemented by the provider.');
  }

  /**
   * Chat-style completion with conversation history.
   * @param {Array<{ role: string, content: string }>} _messages
   * @param {object} [_options]
   * @returns {Promise<{ text: string, usage: object }>}
   */
  async chat(_messages, _options = {}) {
    throw new Error('chat() must be implemented by the provider.');
  }

  /**
   * Streaming variant — returns a ReadableStream.
   * @param {Array<{ role: string, content: string }>} _messages
   * @param {object} [_options]
   * @returns {Promise<ReadableStream>}
   */
  async chatStream(_messages, _options = {}) {
    throw new Error('chatStream() must be implemented by the provider.');
  }

  /**
   * Placeholder for token counting.
   * @param {string} _text
   * @returns {Promise<number>}
   */
  async countTokens(_text) {
    // Default: rough estimate (1 token ≈ 4 chars)
    return Math.ceil(_text.length / 4);
  }
}
