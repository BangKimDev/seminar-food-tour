import { Router } from 'express';
import authRoutes from './authRoutes.js';
import poiRoutes from './poiRoutes.js';
import restaurantRoutes from './restaurantRoutes.js';
import audioGuideRoutes from './audioGuideRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import uploadRoutes from './uploadRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/pois', poiRoutes);
router.use('/restaurants', restaurantRoutes);
router.use('/audio-guides', audioGuideRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/upload', uploadRoutes);

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
