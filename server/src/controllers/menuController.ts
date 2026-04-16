import { Request, Response } from 'express';
import { menuService } from '../services/menuService.js';
import { AuthRequest } from '../middleware/auth.js';

export const menuController = {
  async getByRestaurant(req: Request, res: Response): Promise<void> {
    try {
      const restaurantId = req.params.restaurantId as string;
      const items = await menuService.getByRestaurant(restaurantId);
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      const restaurantId = req.params.restaurantId as string;
      const item = await menuService.create({
        ...req.body,
        restaurantId,
      });
      res.status(201).json(item);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const item = await menuService.update(id, req.body);
      res.json(item);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      await menuService.delete(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
};
