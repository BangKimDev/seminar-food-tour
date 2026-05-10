import { Request, Response } from 'express';
import prisma from '../config/database.js';

export const dashboardController = {
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const now = new Date();

      // ── Date helpers ──────────────────────────────────────────────────────
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOf30min = new Date(now.getTime() - 30 * 60 * 1000);
      const startOf30days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const startOf12weeks = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000);

      // ── Parallel queries ──────────────────────────────────────────────────
      const [
        poiCount,
        restaurantCount,
        audioGuideCount,
        totalVisits,
        totalViews,
        totalAudioPlays,
        totalNavigations,
        totalUsers,
        usersThisWeek,
        usersThisMonth,
        activeNow,
        dailyTrendRaw,
        weeklyTrendRaw,
        popularRestaurantsRaw,
        visitsByHourRaw,
        languageDistribution,
        restaurantByStatus,
      ] = await Promise.all([
        // POIs
        prisma.pOI.count(),
        // Restaurants
        prisma.restaurant.count(),
        // Audio guides
        prisma.audioGuide.count(),
        // Total visits
        prisma.visit.count(),
        // Views
        prisma.visit.count({ where: { action: 'view' } }),
        // Audio plays
        prisma.visit.count({ where: { action: 'audio_play' } }),
        // Navigations
        prisma.visit.count({ where: { action: 'navigation' } }),
        // Total unique users
        prisma.visit.findMany({ select: { visitorId: true }, distinct: ['visitorId'] })
          .then(rows => rows.filter(r => r.visitorId).length),
        // Users this week
        prisma.visit.findMany({
          where: { createdAt: { gte: startOfWeek }, visitorId: { not: null } },
          select: { visitorId: true },
          distinct: ['visitorId'],
        }).then(rows => rows.length),
        // Users this month
        prisma.visit.findMany({
          where: { createdAt: { gte: startOfMonth }, visitorId: { not: null } },
          select: { visitorId: true },
          distinct: ['visitorId'],
        }).then(rows => rows.length),
        // Active now (last 30 min)
        prisma.visit.findMany({
          where: { createdAt: { gte: startOf30min }, visitorId: { not: null } },
          select: { visitorId: true },
          distinct: ['visitorId'],
        }).then(rows => rows.length),
        // Daily trend (last 30 days)
        prisma.$queryRaw<{ date: string; users: bigint; visits: bigint; audioPlays: bigint }[]>`
          SELECT
            DATE("createdAt")::text AS date,
            COUNT(DISTINCT "visitorId")::int AS users,
            COUNT(*)::int AS visits,
            COUNT(*) FILTER (WHERE "action" = 'audio_play')::int AS "audioPlays"
          FROM "Visit"
          WHERE "createdAt" >= ${startOf30days}
          GROUP BY DATE("createdAt")
          ORDER BY DATE("createdAt")
        `,
        // Weekly trend (last 12 weeks)
        prisma.$queryRaw<{ week: string; users: bigint; visits: bigint }[]>`
          SELECT
            EXTRACT(WEEK FROM "createdAt")::text AS week,
            COUNT(DISTINCT "visitorId")::int AS users,
            COUNT(*)::int AS visits
          FROM "Visit"
          WHERE "createdAt" >= ${startOf12weeks}
          GROUP BY EXTRACT(WEEK FROM "createdAt")
          ORDER BY EXTRACT(WEEK FROM "createdAt")
        `,
        // Popular restaurants
        prisma.$queryRaw<{ id: string; name: string; views: bigint; audioPlays: bigint; navigations: bigint }[]>`
          SELECT
            r.id,
            r.name,
            COUNT(*) FILTER (WHERE v.action = 'view')::int AS views,
            COUNT(*) FILTER (WHERE v.action = 'audio_play')::int AS "audioPlays",
            COUNT(*) FILTER (WHERE v.action = 'navigation')::int AS navigations
          FROM "Restaurant" r
          LEFT JOIN "Visit" v ON v."restaurantId" = r.id
          GROUP BY r.id, r.name
          ORDER BY views DESC
          LIMIT 10
        `,
        // Visits by hour
        prisma.$queryRaw<{ hour: number; count: bigint }[]>`
          SELECT
            EXTRACT(HOUR FROM "createdAt")::int AS hour,
            COUNT(*)::int AS count
          FROM "Visit"
          GROUP BY EXTRACT(HOUR FROM "createdAt")
          ORDER BY EXTRACT(HOUR FROM "createdAt")
        `,
        // Language distribution
        prisma.audioGuide.groupBy({
          by: ['language'],
          _count: { _all: true },
        }),
        // Restaurants by status
        prisma.restaurant.groupBy({
          by: ['status'],
          _count: { _all: true },
        }),
      ]);

      // ── Recent activity ───────────────────────────────────────────────────
      const recentVisits = await prisma.visit.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
      });

      const restaurantIds = recentVisits
        .filter(v => v.restaurantId)
        .map(v => v.restaurantId as string);

      const restaurants = restaurantIds.length > 0
        ? await prisma.restaurant.findMany({
            where: { id: { in: restaurantIds } },
            select: { id: true, name: true },
          })
        : [];

      const restaurantMap = new Map(restaurants.map(r => [r.id, r.name]));

      // ── Format response ───────────────────────────────────────────────────
      const dailyTrend = dailyTrendRaw.map(d => ({
        date: d.date,
        users: Number(d.users),
        visits: Number(d.visits),
        audioPlays: Number(d.audioPlays),
      }));

      const weeklyTrend = weeklyTrendRaw.map(w => ({
        week: w.week,
        users: Number(w.users),
        visits: Number(w.visits),
      }));

      const popularRestaurants = popularRestaurantsRaw.map(r => ({
        id: r.id,
        name: r.name,
        views: Number(r.views),
        audioPlays: Number(r.audioPlays),
        navigations: Number(r.navigations),
      }));

      const visitsByHour = visitsByHourRaw.map(h => ({
        hour: h.hour,
        count: Number(h.count),
      }));

      res.json({
        stats: {
          totalUsers,
          usersThisWeek,
          usersThisMonth,
          totalVisits,
          views: totalViews,
          audioPlays: totalAudioPlays,
          navigations: totalNavigations,
          restaurants: restaurantCount,
          pois: poiCount,
          audioGuides: audioGuideCount,
          activeNow,
        },
        dailyTrend,
        weeklyTrend,
        popularRestaurants,
        visitsByHour,
        languageDistribution: languageDistribution.map(l => ({
          language: l.language,
          count: l._count._all,
        })),
        restaurantByStatus: restaurantByStatus.map(s => ({
          status: s.status,
          count: s._count._all,
        })),
        recentActivity: recentVisits.map(v => ({
          id: v.id,
          action: v.action,
          restaurantName: v.restaurantId ? (restaurantMap.get(v.restaurantId) || 'Unknown') : 'Unknown',
          createdAt: v.createdAt,
        })),
      });
    } catch (error: any) {
      console.error('Dashboard stats error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async recordVisit(req: Request, res: Response): Promise<void> {
    try {
      const { restaurantId, action, visitorId, metadata } = req.body;
      if (!action) {
        res.status(400).json({ error: 'action is required' });
        return;
      }
      const visit = await prisma.visit.create({
        data: {
          restaurantId: restaurantId || null,
          action,
          visitorId: visitorId || null,
          metadata: metadata || undefined,
        },
      });
      res.status(201).json(visit);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
};
