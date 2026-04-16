import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  type: 'admin' | 'owner';
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export const authenticateAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];
  
  console.log('=== AUTH DEBUG ===');
  console.log('Token received:', token);
  console.log('Token length:', token?.length);
  console.log('Secret length:', config.jwt.secret.length);
  console.log('================');

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    
    if (decoded.type !== 'admin') {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const authenticateOwner = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    
    if (decoded.type !== 'owner') {
      res.status(403).json({ error: 'Restaurant owner access required' });
      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Owner auth error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const authenticateAny = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth any error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};
