import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController.js';
import { authenticateAdmin, authenticateAny } from '../middleware/auth.js';

const router = Router();

router.get('/stats', dashboardController.getStats);
router.post('/visits', authenticateAny, dashboardController.recordVisit);

export default router;
