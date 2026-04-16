import { Router } from 'express';
import { poiController } from '../controllers/poiController.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { z } from 'zod';

const router = Router();

const createPOISchema = z.object({
  name: z.string().min(1),
  category: z.enum(['main', 'wc', 'ticket', 'parking', 'boat', 'restaurant', 'cafe', 'market']),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

const updatePOISchema = createPOISchema.partial();

// Public routes
router.get('/', poiController.getAll);
router.get('/stats', poiController.getStats);
router.get('/:id', poiController.getById);

// Admin routes
router.post('/', authenticateAdmin, validate(createPOISchema), poiController.create);
router.put('/:id', authenticateAdmin, validate(updatePOISchema), poiController.update);
router.delete('/:id', authenticateAdmin, poiController.delete);

export default router;
