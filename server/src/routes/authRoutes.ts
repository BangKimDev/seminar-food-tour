import { Router } from 'express';
import { adminAuthController, ownerAuthController } from '../controllers/authController.js';
import { authenticateAdmin, authenticateAny, authenticateOwner } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { z } from 'zod';

const router = Router();

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string().min(1),
  role: z.enum(['super_admin', 'admin', 'content_editor']).optional(),
});

// Admin routes
router.post('/admin/login', validate(loginSchema), adminAuthController.login);
router.post('/admin/register', authenticateAdmin, validate(registerSchema), adminAuthController.register);
router.get('/admin', authenticateAdmin, adminAuthController.getAll);

// Owner routes
router.post('/owner/register', validate(z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  address: z.string().optional(),
  description: z.string().optional(),
  cuisine: z.string().optional(),
  openingHours: z.string().optional(),
})), ownerAuthController.register);
router.post('/owner/login', validate(z.object({
  identifier: z.string().min(1),
  password: z.string().min(1),
})), ownerAuthController.login);
router.get('/owner/profile', authenticateOwner, ownerAuthController.getProfile);
router.get('/owner', authenticateAdmin, ownerAuthController.getAll);
router.patch('/owner/:id/status', authenticateAdmin, ownerAuthController.updateStatus);

export default router;
