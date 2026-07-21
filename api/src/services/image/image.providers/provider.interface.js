/**
 * Image provider interface.
 * Concrete implementations (Pexels, Pixabay, Unsplash)
 * must implement these methods.
 */
export class ImageProviderInterface {
  /**
   * Search for images by query.
   * @param {string} _query
   * @param {object} [_options] – { page, perPage }
   * @returns {Promise<{ images: Array, total: number, page: number }>}
   */
  async search(_query, _options = {}) {
    throw new Error('search() must be implemented by the image provider.');
  }

  /**
   * Get a single image by its provider-specific ID.
   * @param {string} _id
   * @returns {Promise<object>}
   */
  async getById(_id) {
    throw new Error('getById() must be implemented by the image provider.');
  }

  /**
   * Get the direct download URL for an image.
   * @param {string} _id
   * @param {string} [_size] – 'small' | 'medium' | 'large' | 'original'
   * @returns {Promise<string>}
   */
  async getDownloadUrl(_id, _size = 'medium') {
    throw new Error('getDownloadUrl() must be implemented by the image provider.');
  }
}
