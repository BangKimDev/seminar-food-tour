import { apiClient } from './apiClient';
import { RestaurantOwner } from '../types';

export const ownerService = {
  async list(): Promise<RestaurantOwner[]> {
    return apiClient.get<RestaurantOwner[]>('/auth/owner');
  },

  async updateStatus(id: string, status: 'approved' | 'rejected'): Promise<RestaurantOwner> {
    return apiClient.patch<RestaurantOwner>(`/auth/owner/${id}/status`, { status });
  },
};
