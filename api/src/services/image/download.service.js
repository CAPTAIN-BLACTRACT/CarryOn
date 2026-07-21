import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import logger from '../../utils/logger.js';
import * as models from '../../models/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.resolve(__dirname, '../../../uploads');

/**
 * Download an image from a URL and save it locally + cache it in the DB.
 */
export async function downloadImage(url, metadata = {}) {
  try {
    // Ensure uploads directory exists
    await fs.mkdir(UPLOAD_DIR, { recursive: true });

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Download failed: ${response.status}`);

    const buffer = Buffer.from(await response.arrayBuffer());
    const ext = path.extname(new URL(url).pathname) || '.jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    await fs.writeFile(filepath, buffer);
    logger.info('Image downloaded', { filename, size: buffer.length });

    // Cache in DB
    // TODO: Enable once the image_cache table is created in Supabase
    // await models.cacheImage({
    //   source_id: metadata.sourceId || filename,
    //   provider: metadata.provider || 'unknown',
    //   url,
    //   local_path: filepath,
    //   metadata,
    // });

    return { filename, filepath, size: buffer.length };
  } catch (err) {
    logger.error('Image download failed', { error: err.message, url });
    throw err;
  }
}

/**
 * Cache image metadata in the database.
 */
export async function cacheImage(imageData) {
  // TODO: Enable once the image_cache table is created in Supabase
  // return models.cacheImage(imageData);
  return imageData;
}
