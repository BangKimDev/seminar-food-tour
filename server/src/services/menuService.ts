import prisma from '../config/database.js';

export interface CreateMenuItemData {
  restaurantId: string;
  dishName: string;
  price: number;
  category?: string;
  imageUrl?: string;
}

export interface UpdateMenuItemData {
  dishName?: string;
  price?: number;
  category?: string;
  imageUrl?: string;
  isAvailable?: boolean;
}

export const menuService = {
  async getByRestaurant(restaurantId: string) {
    return prisma.menuItem.findMany({
      where: { restaurantId },
      orderBy: [{ category: 'asc' }, { dishName: 'asc' }],
    });
  },

  async create(data: CreateMenuItemData) {
    return prisma.menuItem.create({
      data: {
        restaurantId: data.restaurantId,
        dishName: data.dishName,
        price: data.price,
        category: data.category,
        imageUrl: data.imageUrl,
      },
    });
  },

  async update(id: string, data: UpdateMenuItemData) {
    return prisma.menuItem.update({
      where: { id },
      data,
    });
  },

  async delete(id: string) {
    return prisma.menuItem.delete({
      where: { id },
    });
  },

  async getById(id: string) {
    return prisma.menuItem.findUnique({
      where: { id },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            ownerId: true,
          },
        },
      },
    });
  },
};
