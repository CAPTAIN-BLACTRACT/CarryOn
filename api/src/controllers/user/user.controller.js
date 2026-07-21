import { success } from '../../utils/helpers/response.js';

/**
 * GET /api/v1/user/profile
 * Return the authenticated user's profile.
 */
export async function getProfile(req, res) {
  // TODO: Implement
  // 1. Call models.getProfile(req.user.id)
  // 2. Return profile
  return success(res, { profile: null }, 'User profile');
}

/**
 * PUT /api/v1/user/profile
 * Update the authenticated user's profile.
 */
export async function updateProfile(req, res) {
  // TODO: Implement
  // 1. Validate input (validateProfileUpdate)
  // 2. Call models.updateProfile(req.user.id, validated)
  // 3. Return updated profile
  return success(res, { profile: null }, 'Profile updated');
}
