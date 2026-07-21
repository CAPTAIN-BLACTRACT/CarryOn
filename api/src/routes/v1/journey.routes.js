import { Router } from 'express';
import { authenticate } from '../../middleware/index.js';
import { asyncHandler } from '../../utils/helpers/index.js';
import { saveJourney, latestJourney } from '../../controllers/journey/index.js';

const router = Router();

router.post('/', authenticate, asyncHandler(saveJourney));
router.get('/latest', authenticate, asyncHandler(latestJourney));

export default router;
