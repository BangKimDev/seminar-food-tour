import { Request, Response } from 'express';
import prisma from '../config/database.js';

export const dashboardController = {
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const [
        poiCount,
        restaurantCount,
        audioGuideCount,
        visitCount,
        poiByCategory,
        restaurantByStatus,
        audioGuideByLanguage,
        recentVisits,
        recentRestaurants,
      ] = await Promise.all([
        prisma.pOI.count(),
        prisma.restaurant.count(),
        prisma.audioGuide.count(),
        prisma.visit.count(),
        prisma.pOI.groupBy({
          by: ['category'],
          _count: { _all: true },
        }),
        prisma.restaurant.groupBy({
          by: ['status'],
          _count: { _all: true },
        }),
        prisma.audioGuide.groupBy({
          by: ['language'],
          _count: { _all: true },
        }),
        prisma.visit.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.restaurant.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            status: true,
            createdAt: true,
            views: true,
          },
        }),
      ]);

      // Get restaurant names for visits
      const restaurantIds = recentVisits
        .filter(v => v.restaurantId)
        .map(v => v.restaurantId as string);
      
      const restaurants = await prisma.restaurant.findMany({
        where: { id: { in: restaurantIds } },
        select: { id: true, name: true },
      });
      
      const restaurantMap = new Map(restaurants.map(r => [r.id, r.name]));

      res.json({
        stats: {
          pois: poiCount,
          restaurants: restaurantCount,
          audioGuides: audioGuideCount,
          visits: visitCount,
        },
        poiDistribution: poiByCategory.map(c => ({
          category: c.category,
          count: c._count._all,
        })),
        restaurantByStatus: restaurantByStatus.map(s => ({
          status: s.status,
          count: s._count._all,
        })),
        audioGuideByLanguage: audioGuideByLanguage.map(l => ({
          language: l.language,
          count: l._count._all,
        })),
        recentActivity: recentVisits.map(v => ({
          id: v.id,
          action: v.action,
          restaurantName: v.restaurantId ? (restaurantMap.get(v.restaurantId) || 'Unknown') : 'Unknown',
          createdAt: v.createdAt,
        })),
        recentRestaurants: recentRestaurants.map(r => ({
          id: r.id,
          name: r.name,
          status: r.status,
          views: r.views,
          createdAt: r.createdAt,
        })),
      });
    } catch (error: any) {
      console.error('Dashboard stats error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async recordVisit(req: Request, res: Response): Promise<void> {
    try {
      const { restaurantId, action, metadata } = req.body;
      const visit = await prisma.visit.create({
        data: {
          restaurantId,
          action,
          metadata,
        },
      });
      res.status(201).json(visit);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
};
