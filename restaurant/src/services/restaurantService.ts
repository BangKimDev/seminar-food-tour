import { apiClient } from './apiClient';

export interface RestaurantData {
  id: string;
  name: string;
  description: string;
  cuisine?: string;
  openingHours?: string;
  imageUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  views: number;
  poi?: {
    id: string;
    name: string;
    lat: number;
    lng: number;
  };
}

export interface MenuItemData {
  id: string;
  restaurantId: string;
  dishName: string;
  price: number;
  category?: string;
  imageUrl?: string;
  isAvailable: boolean;
}

export const restaurantService = {
  async getMyRestaurant(): Promise<RestaurantData | null> {
    try {
      const restaurants = await apiClient.get<RestaurantData[]>('/restaurants');
      return restaurants[0] || null;
    } catch {
      return null;
    }
  },

  async updateRestaurant(id: string, data: Partial<RestaurantData>): Promise<RestaurantData> {
    return apiClient.patch<RestaurantData>(`/restaurants/${id}`, data);
  },

  async getMenu(restaurantId: string): Promise<MenuItemData[]> {
    return apiClient.get<MenuItemData[]>(`/restaurants/${restaurantId}/menu`);
  },

  async createMenuItem(restaurantId: string, data: Omit<MenuItemData, 'id' | 'restaurantId'>): Promise<MenuItemData> {
    return apiClient.post<MenuItemData>(`/restaurants/${restaurantId}/menu`, data);
  },

  async updateMenuItem(id: string, data: Partial<MenuItemData>): Promise<MenuItemData> {
    return apiClient.patch<MenuItemData>(`/restaurants/menu/${id}`, data);
  },

  async deleteMenuItem(id: string): Promise<void> {
    return apiClient.delete(`/restaurants/menu/${id}`);
  },

  async getStats(): Promise<{ totalDishes: number; views: number; status: string }> {
    const restaurant = await this.getMyRestaurant();
    if (!restaurant) return { totalDishes: 0, views: 0, status: 'pending' };
    
    const menu = await this.getMenu(restaurant.id);
    return {
      totalDishes: menu.length,
      views: restaurant.views,
      status: restaurant.status,
    };
  },
};
