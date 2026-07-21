import { Router } from 'express';
import authRoutes from './auth.routes.js';
import aiRoutes from './ai.routes.js';
import historyRoutes from './history.routes.js';
import userRoutes from './user.routes.js';
import imageRoutes from './image.routes.js';
import journeyRoutes from './journey.routes.js';

const router = Router();

router.use('/auth',    authRoutes);
router.use('/ai',      aiRoutes);
router.use('/history', historyRoutes);
router.use('/user',    userRoutes);
router.use('/images',  imageRoutes);
router.use('/journey', journeyRoutes);

export default router;
