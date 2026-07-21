import { VisualProvider } from './provider.interface.js';
import logger from '../../../utils/logger.js';

export class WikipediaProvider extends VisualProvider {
  constructor({ fetchImpl = fetch, timeoutMs = 5000 } = {}) {
    super();
    this.fetchImpl = fetchImpl;
    this.timeoutMs = timeoutMs;
  }

  async resolve(title) {
    if (!title?.trim()) return { type: 'none' };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const encodedTitle = encodeURIComponent(title.trim().replaceAll(' ', '_'));
      const response = await this.fetchImpl(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodedTitle}`,
        { headers: { Accept: 'application/json' }, signal: controller.signal }
      );

      if (!response.ok) throw new Error(`Wikipedia API error: ${response.status}`);
      const page = await response.json();
      if (!page.thumbnail?.source) return { type: 'none' };

      return {
        type: 'image',
        url: page.thumbnail.source,
        caption: page.title || title.trim(),
      };
    } catch (error) {
      logger.warn('Wikipedia visual lookup failed', { title, error: error.message });
      return { type: 'none' };
    } finally {
      clearTimeout(timeout);
    }
  }
}
