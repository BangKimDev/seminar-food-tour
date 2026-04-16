import { apiClient } from './apiClient';

export interface RestaurantPOI {
  id: string;
  name: string;
  description: string;
  cuisine?: string;
  openingHours?: string;
  imageUrl?: string;
  views: number;
  distance?: number;
  poi?: {
    id: string;
    name: string;
    lat: number;
    lng: number;
  };
  audioGuides?: {
    id: string;
    language: string;
    audioUrl?: string;
    duration?: number;
  }[];
}

export interface AudioGuideContent {
  id: string;
  restaurantId: string;
  language: string;
  content: string;
  audioUrl?: string;
  duration?: number;
}

export const restaurantService = {
  async getNearby(lat: number, lng: number, radiusKm: number = 5): Promise<RestaurantPOI[]> {
    return apiClient.get<RestaurantPOI[]>(`/restaurants/nearby?lat=${lat}&lng=${lng}&radius=${radiusKm}`);
  },

  async getAll(): Promise<RestaurantPOI[]> {
    return apiClient.get<RestaurantPOI[]>('/restaurants?status=approved');
  },

  async getById(id: string): Promise<RestaurantPOI> {
    return apiClient.get<RestaurantPOI>(`/restaurants/${id}`);
  },

  async recordView(id: string): Promise<void> {
    return apiClient.post(`/restaurants/${id}/view`, {});
  },
};

export const audioService = {
  async getLanguages(): Promise<string[]> {
    return apiClient.get<string[]>('/audio-guides/languages');
  },

  async getByRestaurant(restaurantId: string): Promise<AudioGuideContent[]> {
    return apiClient.get<AudioGuideContent[]>(`/audio-guides/restaurant/${restaurantId}`);
  },

  async getByLanguage(restaurantId: string, language: string): Promise<AudioGuideContent> {
    return apiClient.get<AudioGuideContent>(`/audio-guides/restaurant/${restaurantId}/${language}`);
  },
};
