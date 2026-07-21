import { PexelsProvider, PixabayProvider } from './image.providers/index.js';
import env from '../../config/env.js';
import logger from '../../utils/logger.js';

/**
 * Image search service — delegates to whichever provider
 * is configured via IMAGE_PROVIDER env var.
 */

const providers = {
  pexels: () => new PexelsProvider(),
  pixabay: () => new PixabayProvider(),
  // TODO: Add unsplash, wikimedia providers here
};

function getProvider() {
  const name = env.image.provider;
  const factory = providers[name];
  if (!factory) {
    logger.warn(`Unknown image provider "${name}", falling back to pexels`);
    return new PexelsProvider();
  }
  return factory();
}

/**
 * Search images using the configured provider.
 */
export async function searchImages(query, options = {}) {
  const provider = getProvider();
  return provider.search(query, options);
}

/**
 * Get a single image by ID.
 */
export async function getImageById(id) {
  const provider = getProvider();
  return provider.getById(id);
}

/**
 * Get a download URL for an image.
 */
export async function getDownloadUrl(id, size = 'medium') {
  const provider = getProvider();
  return provider.getDownloadUrl(id, size);
}
