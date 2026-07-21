import { ImageProviderInterface } from './provider.interface.js';
import env from '../../../config/env.js';
import logger from '../../../utils/logger.js';

/**
 * Pixabay image provider.
 * API docs: https://pixabay.com/api/docs/
 *
 * Free for commercial use, no attribution required.
 */
export class PixabayProvider extends ImageProviderInterface {
  constructor(apiKey = env.image.apiKey) {
    super();
    this.apiKey = apiKey;
    this.baseUrl = 'https://pixabay.com/api';
  }

  async search(query, options = {}) {
    const { page = 1, perPage = 15 } = options;
    const url = `${this.baseUrl}/?key=${this.apiKey}&q=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&image_type=photo&safesearch=true`;

    const res = await fetch(url);
    if (!res.ok) {
      logger.error('Pixabay search failed', { status: res.status });
      throw new Error(`Pixabay API error: ${res.status}`);
    }

    const data = await res.json();
    return {
      images: data.hits.map(this._normalize),
      total: data.totalHits,
      page,
    };
  }

  async getById(id) {
    const url = `${this.baseUrl}/?key=${this.apiKey}&id=${id}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Pixabay getById error: ${res.status}`);
    const data = await res.json();
    if (!data.hits?.length) throw new Error('Image not found');
    return this._normalize(data.hits[0]);
  }

  async getDownloadUrl(id, size = 'medium') {
    const image = await this.getById(id);
    return image.urls?.[size] || image.urls?.medium;
  }

  _normalize(hit) {
    return {
      id: String(hit.id),
      provider: 'pixabay',
      width: hit.imageWidth,
      height: hit.imageHeight,
      description: hit.tags || '',
      photographer: hit.user,
      urls: {
        small: hit.previewURL,
        medium: hit.webformatURL,
        large: hit.largeImageURL,
        original: hit.fullHDURL || hit.largeImageURL,
      },
      sourceUrl: hit.pageURL,
    };
  }
}
