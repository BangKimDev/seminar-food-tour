import { Router } from 'express';
import { restaurantController } from '../controllers/restaurantController.js';
import { menuController } from '../controllers/menuController.js';
import { authenticateAdmin, authenticateOwner, authenticateAny } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { z } from 'zod';

const router = Router();

const createRestaurantSchema = z.object({
  poiId: z.string().uuid().optional(),
  name: z.string().min(1),
  description: z.string().min(1),
  cuisine: z.string().optional(),
  openingHours: z.string().optional(),
  imageUrl: z.string().url().optional(),
  ownerId: z.string().uuid().optional(),
});

const updateRestaurantSchema = createRestaurantSchema.partial().omit({ ownerId: true });

const createMenuItemSchema = z.object({
  dishName: z.string().min(1),
  price: z.number().min(0),
  category: z.string().optional(),
  imageUrl: z.string().url().optional(),
});

const updateMenuItemSchema = createMenuItemSchema.partial();

// Public routes
router.get('/', restaurantController.getAll);
router.get('/stats', restaurantController.getStats);
router.get('/nearby', restaurantController.getNearby);
router.get('/:id', restaurantController.getById);

// Admin routes
router.post('/', authenticateAdmin, validate(createRestaurantSchema), restaurantController.create);
router.put('/:id', authenticateAdmin, validate(updateRestaurantSchema), restaurantController.update);
router.delete('/:id', authenticateAdmin, restaurantController.delete);

// Menu routes (nested under restaurants)
router.get('/:restaurantId/menu', menuController.getByRestaurant);
router.post('/:restaurantId/menu', authenticateOwner, validate(createMenuItemSchema), menuController.create);

// Menu item routes
router.put('/menu/:id', authenticateOwner, validate(updateMenuItemSchema), menuController.update);
router.delete('/menu/:id', authenticateOwner, menuController.delete);

// Tracking
router.post('/:id/view', authenticateAny, restaurantController.incrementViews);

export default router;
