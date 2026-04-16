import { apiClient } from './apiClient';

export interface POI {
  id: string;
  name: string;
  category: 'main' | 'wc' | 'ticket' | 'parking' | 'boat' | 'restaurant' | 'cafe' | 'market';
  lat: number;
  lng: number;
}

export const poiService = {
  async getAll(): Promise<POI[]> {
    return apiClient.get<POI[]>('/pois');
  },

  async getById(id: string): Promise<POI> {
    return apiClient.get<POI>(`/pois/${id}`);
  },
};
