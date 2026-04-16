import { Router } from 'express';
import { uploadController } from '../controllers/uploadController.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = Router();

router.post('/audio', authenticateAdmin, uploadController.uploadAudio);
router.delete('/audio', authenticateAdmin, uploadController.deleteAudio);
router.get('/status', uploadController.getConfigStatus);

export default router;
