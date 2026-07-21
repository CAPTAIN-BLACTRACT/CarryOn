import { MermaidProvider, WikipediaProvider } from './providers/index.js';
import logger from '../../utils/logger.js';

export class VisualService {
  constructor({ mermaidProvider = new MermaidProvider(), wikipediaProvider = new WikipediaProvider() } = {}) {
    this.providers = {
      mermaid: mermaidProvider,
      wikipedia: wikipediaProvider,
    };
  }

  async resolve(decision = {}) {
    try {
      const type = decision.visualType || decision.visual_type || 'none';
      if (type === 'mermaid') return this.providers.mermaid.resolve(decision.mermaid);
      if (type === 'wikipedia') return this.providers.wikipedia.resolve(decision.wikipediaSearch || decision.wikipedia_search);
      return { type: 'none' };
    } catch (error) {
      logger.warn('Visual resolution failed', { error: error.message });
      return { type: 'none' };
    }
  }
}

export const visualService = new VisualService();
