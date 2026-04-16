import { Router } from 'express';
import { audioGuideController } from '../controllers/audioGuideController.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { z } from 'zod';

const router = Router();

const createAudioGuideSchema = z.object({
  restaurantId: z.string().min(1),
  language: z.enum(['vi', 'en', 'zh', 'ja', 'ko', 'fr', 'es']),
  content: z.string().min(1),
  audioUrl: z.string().optional().nullable(),
  duration: z.number().int().positive().optional().nullable(),
});

const updateAudioGuideSchema = z.object({
  language: z.enum(['vi', 'en', 'zh', 'ja', 'ko', 'fr', 'es']).optional(),
  content: z.string().min(1).optional(),
  audioUrl: z.string().optional().nullable(),
  duration: z.number().int().positive().optional().nullable(),
});

// Public routes
router.get('/languages', audioGuideController.getSupportedLanguages);
router.get('/stats', audioGuideController.getStats);
router.get('/restaurant/:restaurantId', audioGuideController.getByRestaurant);
router.get('/:id', audioGuideController.getById);
router.get('/restaurant/:restaurantId/:language', audioGuideController.getByLanguage);

// Admin routes
router.post('/', authenticateAdmin, validate(createAudioGuideSchema), audioGuideController.create);
router.put('/:id', authenticateAdmin, validate(updateAudioGuideSchema), audioGuideController.update);
router.delete('/:id', authenticateAdmin, audioGuideController.delete);

export default router;
