import { Router } from 'express';
import { authenticate } from '../../middleware/index.js';
import { asyncHandler } from '../../utils/helpers/index.js';
import { saveJourney } from '../../controllers/journey/index.js';

const router = Router();

router.post('/', authenticate, asyncHandler(saveJourney));

export default router;
