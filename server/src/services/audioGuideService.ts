import prisma from '../config/database.js';

export const SUPPORTED_LANGUAGES = ['vi', 'en', 'zh', 'ja', 'ko', 'fr', 'es'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

export interface CreateAudioGuideData {
  restaurantId: string;
  language: SupportedLanguage;
  content: string;
  audioUrl?: string;
  duration?: number;
}

export interface UpdateAudioGuideData {
  content?: string;
  audioUrl?: string;
  duration?: number;
}

export const audioGuideService = {
  async getByRestaurant(restaurantId: string) {
    return prisma.audioGuide.findMany({
      where: { restaurantId },
      orderBy: { language: 'asc' },
    });
  },

  async getById(id: string) {
    return prisma.audioGuide.findUnique({
      where: { id },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  },

  async getByRestaurantAndLanguage(restaurantId: string, language: string) {
    return prisma.audioGuide.findUnique({
      where: {
        restaurantId_language: {
          restaurantId,
          language,
        },
      },
    });
  },

  async create(data: CreateAudioGuideData) {
    // First try to update if exists
    const existing = await prisma.audioGuide.findUnique({
      where: {
        restaurantId_language: {
          restaurantId: data.restaurantId,
          language: data.language,
        },
      },
    });

    if (existing) {
      return prisma.audioGuide.update({
        where: { id: existing.id },
        data: {
          content: data.content,
          audioUrl: data.audioUrl,
          duration: data.duration,
        },
      });
    }

    return prisma.audioGuide.create({
      data: {
        restaurantId: data.restaurantId,
        language: data.language,
        content: data.content,
        audioUrl: data.audioUrl,
        duration: data.duration,
      },
    });
  },

  async update(id: string, data: UpdateAudioGuideData) {
    return prisma.audioGuide.update({
      where: { id },
      data,
    });
  },

  async delete(id: string) {
    return prisma.audioGuide.delete({
      where: { id },
    });
  },

  async getStats() {
    const [total, byLanguage] = await Promise.all([
      prisma.audioGuide.count(),
      prisma.audioGuide.groupBy({
        by: ['language'],
        _count: true,
      }),
    ]);

    return {
      total,
      byLanguage: byLanguage.map(l => ({
        language: l.language,
        count: l._count,
      })),
    };
  },
};
