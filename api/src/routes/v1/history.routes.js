import { Router } from 'express';
import { asyncHandler } from '../../utils/helpers/index.js';
import { authenticate } from '../../middleware/index.js';
import * as historyCtrl from '../../controllers/history/index.js';

const router = Router();

router.get('/',    authenticate, asyncHandler(historyCtrl.listHistory));
router.get('/:id', authenticate, asyncHandler(historyCtrl.getHistory));
router.delete('/:id', authenticate, asyncHandler(historyCtrl.deleteHistory));

export default router;
