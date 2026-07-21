import { GoogleGenAI } from '@google/genai';
import { AIProvider } from './provider.interface.js';
import { AIServiceError, GEMINI_UNAVAILABLE_MESSAGE } from '../../utils/errors.js';
import { LIMITS } from '../../utils/constants/index.js';
import logger from '../../utils/logger.js';
import env from '../../config/env.js';

/**
 * Google Gemini implementation of the AI provider interface.
 */
export class GeminiProvider extends AIProvider {
  constructor(apiKey = env.gemini.apiKey) {
    super();
    this.ai = new GoogleGenAI({ apiKey });
    this.model = env.gemini.model;
  }

  async generateText(prompt, options = {}) {
    return this._withRetry(async () => {
      const response = await this.ai.models.generateContent({
        model: options.model || this.model,
        contents: prompt,
      });
      return {
        text: response.text,
        usage: response.usageMetadata || {},
      };
    });
  }

  async chat(messages, options = {}) {
    return this._withRetry(async () => {
      // Convert our standard format to Gemini format
      const contents = messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : m.role,
        parts: [{ text: m.content }],
      }));

      const response = await this.ai.models.generateContent({
        model: options.model || this.model,
        contents,
        config: options.responseMimeType
          ? { responseMimeType: options.responseMimeType }
          : undefined,
      });

      return {
        text: response.text,
        usage: response.usageMetadata || {},
      };
    });
  }

  async analyzeCuriosity({ topic, selectedText = '', imageDataUrl = '' }) {
    return this._withRetry(async () => {
      const parts = [{
        text: `You are helping a learner investigate one small detail. Explain the selected detail clearly and briefly in the context of the topic. Do not discuss the image or selection process. Return plain text only.\n\nTopic: ${topic}\nSelected text: ${selectedText || '(an image region was selected)'}`,
      }];

      if (imageDataUrl) {
        const match = imageDataUrl.match(/^data:(image\/(?:png|jpeg|webp));base64,(.+)$/);
        if (match) {
          parts.push({ inlineData: { mimeType: match[1], data: match[2] } });
        }
      }

      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: [{ role: 'user', parts }],
      });

      return { text: response.text, usage: response.usageMetadata || {} };
    });
  }

  async chatStream(messages, options = {}) {
    // Convert our standard format to Gemini format
    const contents = messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : m.role,
      parts: [{ text: m.content }],
    }));

    const response = await this.ai.models.generateContentStream({
      model: options.model || this.model,
      contents,
    });

    return response;
  }

  async countTokens(text) {
    try {
      const result = await this.ai.models.countTokens({
        model: this.model,
        contents: text,
      });
      return result.totalTokens;
    } catch {
      // Fallback to rough estimate
      return Math.ceil(text.length / 4);
    }
  }

  /**
   * Retry wrapper with exponential back-off.
   */
  async _withRetry(fn, retries = LIMITS.AI_MAX_RETRIES) {
    let lastError;
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(
          () => controller.abort(),
          LIMITS.AI_TIMEOUT_MS
        );

        try {
          const result = await fn(controller.signal);
          clearTimeout(timeout);
          return result;
        } catch (err) {
          clearTimeout(timeout);
          throw err;
        }
      } catch (err) {
        lastError = err;
        logger.warn(`Gemini attempt ${attempt}/${retries} failed`, {
          error: err.message,
        });
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, 1000 * attempt));
        }
      }
    }
    throw new AIServiceError(
      GEMINI_UNAVAILABLE_MESSAGE,
      { originalError: lastError?.message }
    );
  }
}

export default new GeminiProvider();
