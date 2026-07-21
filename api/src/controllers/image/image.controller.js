import { success } from '../../utils/helpers/response.js';

/**
 * GET /api/v1/images/search?q=...
 * Search for images using the configured provider.
 */
export async function searchImages(req, res) {
  // TODO: Implement
  // 1. Validate query param (validateImageSearch)
  // 2. Call imageService.searchImages(query, options)
  // 3. Return results
  return success(res, { images: [], total: 0, page: 1 }, 'Image search results');
}

/**
 * POST /api/v1/images/download
 * Download an image and cache it server-side.
 */
export async function downloadImage(req, res) {
  // TODO: Implement
  // 1. Validate input (url, imageId)
  // 2. Call downloadService.downloadImage(url, metadata)
  // 3. Return local path / cached URL
  return success(res, { filename: null }, 'Image downloaded');
}
