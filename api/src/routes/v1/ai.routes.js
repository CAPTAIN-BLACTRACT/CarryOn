import { Router } from 'express';
import { asyncHandler } from '../../utils/helpers/index.js';
import { authenticate, aiLimiter } from '../../middleware/index.js';
import * as aiCtrl from '../../controllers/ai/index.js';

const router = Router();

router.post('/chat',     authenticate, aiLimiter, asyncHandler(aiCtrl.chat));
router.post('/curiosity', authenticate, aiLimiter, asyncHandler(aiCtrl.curiosity));
router.post('/generate', authenticate, aiLimiter, asyncHandler(aiCtrl.generate));

export default router;
