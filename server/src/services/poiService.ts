import prisma from '../config/database.js';
import { POICategory } from '@prisma/client';

export interface CreatePOIData {
  name: string;
  category: POICategory;
  lat: number;
  lng: number;
}

export interface UpdatePOIData {
  name?: string;
  category?: POICategory;
  lat?: number;
  lng?: number;
}

export const poiService = {
  async getAll(search?: string, category?: POICategory) {
    const where: any = {};
    
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }
    
    if (category) {
      where.category = category;
    }

    return prisma.pOI.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  },

  async getById(id: string) {
    return prisma.pOI.findUnique({
      where: { id },
      include: {
        restaurants: {
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
          },
        },
      },
    });
  },

  async create(data: CreatePOIData) {
    return prisma.pOI.create({
      data: {
        name: data.name,
        category: data.category,
        lat: data.lat,
        lng: data.lng,
      },
    });
  },

  async update(id: string, data: UpdatePOIData) {
    return prisma.pOI.update({
      where: { id },
      data,
    });
  },

  async delete(id: string) {
    return prisma.pOI.delete({
      where: { id },
    });
  },

  async getStats() {
    const [total, byCategory] = await Promise.all([
      prisma.pOI.count(),
      prisma.pOI.groupBy({
        by: ['category'],
        _count: true,
      }),
    ]);

    return {
      total,
      byCategory: byCategory.map(c => ({
        category: c.category,
        count: c._count,
      })),
    };
  },
};
