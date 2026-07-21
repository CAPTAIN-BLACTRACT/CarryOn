import { createJourney, getLatestJourney } from '../../models/index.js';
import { success } from '../../utils/helpers/response.js';

export async function saveJourney(req, res) {
  const { nextTopic = null, curiosityScores = {}, wowFactor = null, metadata = {} } = req.body || {};

  if (nextTopic !== null && typeof nextTopic !== 'string') {
    return res.status(400).json({ success: false, message: 'nextTopic must be a string.', data: null, error: null });
  }

  const journey = await createJourney(req.user.id, {
    next_topic: nextTopic?.trim() || null,
    curiosity_scores: curiosityScores,
    wow_factor: wowFactor,
    metadata,
  });

  return success(res, { journey }, 'Journey saved', 201);
}

export async function latestJourney(req, res) {
  const journey = await getLatestJourney(req.user.id);
  return success(res, { journey }, 'Latest journey');
}
