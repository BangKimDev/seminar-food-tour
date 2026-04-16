import { Request, Response } from 'express';
import { audioGuideService, SUPPORTED_LANGUAGES } from '../services/audioGuideService.js';

export const audioGuideController = {
  async getByRestaurant(req: Request, res: Response): Promise<void> {
    try {
      const restaurantId = req.params.restaurantId as string;
      const guides = await audioGuideService.getByRestaurant(restaurantId);
      res.json(guides);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const guide = await audioGuideService.getById(id);
      
      if (!guide) {
        res.status(404).json({ error: 'Audio guide not found' });
        return;
      }
      
      res.json(guide);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getByLanguage(req: Request, res: Response): Promise<void> {
    try {
      const restaurantId = req.params.restaurantId as string;
      const language = req.params.language as string;
      const guide = await audioGuideService.getByRestaurantAndLanguage(restaurantId, language);
      
      if (!guide) {
        res.status(404).json({ error: 'Audio guide not found' });
        return;
      }
      
      res.json(guide);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      console.log('[AudioGuide] Create request body:', JSON.stringify(req.body, null, 2));
      
      const { language } = req.body;
      
      if (!SUPPORTED_LANGUAGES.includes(language as any)) {
        res.status(400).json({
          error: 'Invalid language',
          supported: SUPPORTED_LANGUAGES,
        });
        return;
      }
      
      const guide = await audioGuideService.create(req.body);
      res.status(201).json(guide);
    } catch (error: any) {
      console.error('Create audio guide error:', error);
      res.status(400).json({ error: error.message });
    }
  },

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const guide = await audioGuideService.update(id, req.body);
      res.json(guide);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      await audioGuideService.delete(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await audioGuideService.getStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  getSupportedLanguages(req: Request, res: Response): void {
    res.json(SUPPORTED_LANGUAGES);
  },
};
