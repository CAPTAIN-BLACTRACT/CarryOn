import { Router } from 'express';
import { asyncHandler } from '../../utils/helpers/index.js';
import { authenticate } from '../../middleware/index.js';
import { authLimiter } from '../../middleware/index.js';
import * as authCtrl from '../../controllers/auth/index.js';

const router = Router();

router.post('/login',  authLimiter, authenticate, asyncHandler(authCtrl.login));
router.post('/logout', authenticate, asyncHandler(authCtrl.logout));
router.get('/me',      authenticate, asyncHandler(authCtrl.me));

export default router;
