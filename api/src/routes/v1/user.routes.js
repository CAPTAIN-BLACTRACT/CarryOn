import { Router } from 'express';
import { asyncHandler } from '../../utils/helpers/index.js';
import { authenticate } from '../../middleware/index.js';
import * as userCtrl from '../../controllers/user/index.js';

const router = Router();

router.get('/profile',  authenticate, asyncHandler(userCtrl.getProfile));
router.put('/profile',  authenticate, asyncHandler(userCtrl.updateProfile));

export default router;
