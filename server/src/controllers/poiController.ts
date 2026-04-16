import { Request, Response } from 'express';
import { poiService } from '../services/poiService.js';
import { POICategory } from '@prisma/client';

export const poiController = {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const search = req.query.search as string | undefined;
      const category = req.query.category as POICategory | undefined;
      const pois = await poiService.getAll(search, category);
      res.json(pois);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const poi = await poiService.getById(id);
      
      if (!poi) {
        res.status(404).json({ error: 'POI not found' });
        return;
      }
      
      res.json(poi);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      const poi = await poiService.create(req.body);
      res.status(201).json(poi);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const poi = await poiService.update(id, req.body);
      res.json(poi);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      await poiService.delete(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await poiService.getStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
};
