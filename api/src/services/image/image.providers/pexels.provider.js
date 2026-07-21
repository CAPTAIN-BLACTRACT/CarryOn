import { ImageProviderInterface } from './provider.interface.js';
import env from '../../../config/env.js';
import logger from '../../../utils/logger.js';

/**
 * Pexels image provider.
 * API docs: https://www.pexels.com/api/documentation/
 *
 * Free for commercial use with attribution.
 */
export class PexelsProvider extends ImageProviderInterface {
  constructor(apiKey = env.image.apiKey) {
    super();
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.pexels.com/v1';
  }

  async search(query, options = {}) {
    const { page = 1, perPage = 15 } = options;
    const url = `${this.baseUrl}/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`;

    const res = await fetch(url, {
      headers: { Authorization: this.apiKey },
    });

    if (!res.ok) {
      logger.error('Pexels search failed', { status: res.status });
      throw new Error(`Pexels API error: ${res.status}`);
    }

    const data = await res.json();
    return {
      images: data.photos.map(this._normalize),
      total: data.total_results,
      page: data.page,
    };
  }

  async getById(id) {
    const res = await fetch(`${this.baseUrl}/photos/${id}`, {
      headers: { Authorization: this.apiKey },
    });
    if (!res.ok) throw new Error(`Pexels getById error: ${res.status}`);
    return this._normalize(await res.json());
  }

  async getDownloadUrl(id, size = 'medium') {
    const photo = await this.getById(id);
    const sizeMap = {
      small: photo.urls?.small,
      medium: photo.urls?.medium,
      large: photo.urls?.large,
      original: photo.urls?.original,
    };
    return sizeMap[size] || photo.urls?.medium;
  }

  _normalize(photo) {
    return {
      id: String(photo.id),
      provider: 'pexels',
      width: photo.width,
      height: photo.height,
      description: photo.alt || '',
      photographer: photo.photographer,
      urls: {
        small: photo.src?.small,
        medium: photo.src?.medium,
        large: photo.src?.large2x || photo.src?.large,
        original: photo.src?.original,
      },
      sourceUrl: photo.url,
    };
  }
}
