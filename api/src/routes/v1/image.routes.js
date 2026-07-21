import { Router } from 'express';
import { asyncHandler } from '../../utils/helpers/index.js';
import { authenticate } from '../../middleware/index.js';
import * as imageCtrl from '../../controllers/image/index.js';

const router = Router();

router.get('/search',    authenticate, asyncHandler(imageCtrl.searchImages));
router.post('/download', authenticate, asyncHandler(imageCtrl.downloadImage));

export default router;
