import { Request, Response } from 'express';
import { cloudinaryService } from '../services/cloudinaryService.js';
import { authenticateAdmin } from '../middleware/auth.js';

export const uploadController = {
  async uploadAudio(req: Request, res: Response): Promise<void> {
    try {
      const { audioBase64, filename } = req.body;

      if (!audioBase64) {
        res.status(400).json({ error: 'audioBase64 is required' });
        return;
      }

      const result = await cloudinaryService.uploadAudio(
        audioBase64,
        filename || 'audio'
      );

      res.json({
        url: result.url,
        publicId: result.publicId,
        duration: result.duration,
      });
    } catch (error: any) {
      console.error('Cloudinary upload error:', error);
      res.status(500).json({ error: 'Failed to upload audio: ' + error.message });
    }
  },

  async deleteAudio(req: Request, res: Response): Promise<void> {
    try {
      const { publicId } = req.body;

      if (!publicId) {
        res.status(400).json({ error: 'publicId is required' });
        return;
      }

      await cloudinaryService.delete(publicId);
      res.status(204).send();
    } catch (error: any) {
      console.error('Cloudinary delete error:', error);
      res.status(500).json({ error: 'Failed to delete audio: ' + error.message });
    }
  },

  getConfigStatus(req: Request, res: Response): void {
    const status = cloudinaryService.getConfigStatus();
    res.json(status);
  },
};
