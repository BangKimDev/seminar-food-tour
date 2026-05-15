import { Request, Response } from 'express';
import { adminService, ownerService } from '../services/authService.js';
import { AuthRequest } from '../middleware/auth.js';

export const adminAuthController = {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;
      const result = await adminService.login(username, password);
      res.json(result);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  },

  async register(req: Request, res: Response): Promise<void> {
    try {
      const result = await adminService.create(req.body);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const admins = await adminService.getAll();
      res.json(admins);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
};

export const ownerAuthController = {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, password, name, address, description, cuisine, openingHours } = req.body;
      const result = await ownerService.register(email, password, name, username, address, description, cuisine, openingHours);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { identifier, password } = req.body;
      const result = await ownerService.login(identifier, password);
      res.json(result);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  },

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const authReq = req as AuthRequest;
      const owner = await ownerService.getById(authReq.user!.userId);
      res.json(owner);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const owners = await ownerService.getAll();
      res.json(owners);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const { status } = req.body;
      const result = await ownerService.updateStatus(id, status);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
};
