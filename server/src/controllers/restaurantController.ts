import { Request, Response } from 'express';
import { restaurantService } from '../services/restaurantService.js';
import { AuthRequest } from '../middleware/auth.js';
import { RestaurantStatus } from '@prisma/client';

export const restaurantController = {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const search = req.query.search as string | undefined;
      const poiId = req.query.poiId as string | undefined;
      const status = req.query.status as RestaurantStatus | undefined;
      const ownerId = req.query.ownerId as string | undefined;
      const restaurants = await restaurantService.getAll({ search, poiId, status, ownerId });
      res.json(restaurants);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const restaurant = await restaurantService.getById(id);
      
      if (!restaurant) {
        res.status(404).json({ error: 'Restaurant not found' });
        return;
      }
      
      res.json(restaurant);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      const authReq = req as AuthRequest;
      const data = {
        ...req.body,
        ownerId: authReq.user?.type === 'owner' ? authReq.user.userId : req.body.ownerId,
      };
      const restaurant = await restaurantService.create(data);
      res.status(201).json(restaurant);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const authReq = req as AuthRequest;
      
      if (authReq.user?.type === 'owner') {
        const restaurant = await restaurantService.getById(id);
        if (restaurant?.ownerId !== authReq.user.userId) {
          res.status(403).json({ error: 'Not authorized' });
          return;
        }
        const { status, ownerId, ...ownerData } = req.body;
        const result = await restaurantService.update(id, ownerData);
        res.json(result);
      } else {
        const result = await restaurantService.update(id, req.body);
        res.json(result);
      }
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      await restaurantService.delete(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async incrementViews(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      await restaurantService.incrementViews(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getNearby(req: Request, res: Response): Promise<void> {
    try {
      const lat = req.query.lat as string;
      const lng = req.query.lng as string;
      const radius = req.query.radius as string;
      
      if (!lat || !lng) {
        res.status(400).json({ error: 'lat and lng are required' });
        return;
      }
      
      const restaurants = await restaurantService.getNearby(
        parseFloat(lat),
        parseFloat(lng),
        radius ? parseFloat(radius) : 5
      );
      res.json(restaurants);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await restaurantService.getStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async incrementEntry(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      await restaurantService.incrementEntry(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async incrementAudioPlay(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      await restaurantService.incrementAudioPlay(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getOwnerStats(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const stats = await restaurantService.getOwnerStats(id);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
};
