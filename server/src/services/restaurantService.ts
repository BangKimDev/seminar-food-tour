import prisma from '../config/database.js';
import { RestaurantStatus } from '@prisma/client';

export interface CreateRestaurantData {
  poiId?: string;
  name: string;
  description: string;
  cuisine?: string;
  openingHours?: string;
  ownerId?: string;
  imageUrl?: string;
}

export interface UpdateRestaurantData {
  poiId?: string;
  name?: string;
  description?: string;
  cuisine?: string;
  openingHours?: string;
  status?: RestaurantStatus;
  imageUrl?: string;
}

export const restaurantService = {
  async getAll(params?: {
    search?: string;
    poiId?: string;
    status?: RestaurantStatus;
    ownerId?: string;
  }) {
    const where: any = {};

    if (params?.search) {
      where.name = { contains: params.search, mode: 'insensitive' };
    }
    if (params?.poiId) {
      where.poiId = params.poiId;
    }
    if (params?.status) {
      where.status = params.status;
    }
    if (params?.ownerId) {
      where.ownerId = params.ownerId;
    }

    return prisma.restaurant.findMany({
      where,
      include: {
        poi: {
          select: {
            id: true,
            name: true,
            lat: true,
            lng: true,
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        audioGuides: {
          select: {
            id: true,
            language: true,
            audioUrl: true,
            duration: true,
          },
        },
        _count: {
          select: {
            menuItems: true,
            audioGuides: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getById(id: string) {
    return prisma.restaurant.findUnique({
      where: { id },
      include: {
        poi: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        menuItems: {
          where: { isAvailable: true },
          orderBy: { category: 'asc' },
        },
        audioGuides: {
          select: {
            id: true,
            language: true,
            audioUrl: true,
            duration: true,
          },
        },
      },
    });
  },

  async create(data: CreateRestaurantData) {
    return prisma.restaurant.create({
      data: {
        name: data.name,
        description: data.description,
        cuisine: data.cuisine,
        openingHours: data.openingHours,
        poiId: data.poiId,
        ownerId: data.ownerId,
        imageUrl: data.imageUrl,
        status: data.ownerId ? 'pending' : 'approved',
      },
      include: {
        poi: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  },

  async update(id: string, data: UpdateRestaurantData) {
    return prisma.restaurant.update({
      where: { id },
      data,
      include: {
        poi: true,
      },
    });
  },

  async delete(id: string) {
    return prisma.restaurant.delete({
      where: { id },
    });
  },

  async incrementViews(id: string) {
    return prisma.restaurant.update({
      where: { id },
      data: {
        views: { increment: 1 },
      },
    });
  },

  async getStats() {
    const [total, approved, pending, rejected] = await Promise.all([
      prisma.restaurant.count(),
      prisma.restaurant.count({ where: { status: 'approved' } }),
      prisma.restaurant.count({ where: { status: 'pending' } }),
      prisma.restaurant.count({ where: { status: 'rejected' } }),
    ]);

    return { total, approved, pending, rejected };
  },

  async getNearby(lat: number, lng: number, radiusKm: number = 5) {
    const restaurants = await prisma.restaurant.findMany({
      where: { status: 'approved' },
      include: {
        poi: true,
        audioGuides: {
          select: {
            id: true,
            language: true,
            audioUrl: true,
            duration: true,
          },
        },
        _count: {
          select: {
            audioGuides: true,
          },
        },
      },
    });

    const nearby = restaurants
      .filter(r => {
        if (!r.poi) return false;
        const distance = calculateDistance(lat, lng, r.poi.lat, r.poi.lng);
        return distance <= radiusKm;
      })
      .map(r => {
        const distance = calculateDistance(lat, lng, r.poi!.lat, r.poi!.lng);
        return {
          ...r,
          distance: Math.round(distance * 1000), // meters
        };
      })
      .sort((a, b) => a.distance - b.distance);

    return nearby;
  },
};

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
