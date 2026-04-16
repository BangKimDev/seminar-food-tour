import { apiClient } from './apiClient';
import { AudioGuide, ApiResponse } from '../types';

/**
 * AudioGuide Service
 *
 * ASSUMPTION (theo PRD §12):
 *   GET    /audio-guides?restaurantId=  → AudioGuide[]
 *   POST   /audio-guides                → AudioGuide
 *   DELETE /audio-guides/:id            → 204
 *
 * NOTE: audioUrl là Data URL base64 (data:audio/wav;base64,...).
 * Với backend thực, cần upload file riêng và lưu URL cloud storage.
 */

const USE_MOCK = !import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL === '';

const delay = <T>(data: T, ms = 300): Promise<T> =>
  new Promise(r => setTimeout(() => r(data), ms));

let _guides: AudioGuide[] = [];

export const audioGuideService = {
  async listByRestaurant(restaurantId: string): Promise<AudioGuide[]> {
    if (USE_MOCK) {
      return delay(_guides.filter(g => g.restaurantId === restaurantId));
    }
    return apiClient.get<AudioGuide[]>(
      `/audio-guides/restaurant/${encodeURIComponent(restaurantId)}`
    );
  },

  async create(payload: Omit<AudioGuide, 'id' | 'createdAt'>): Promise<AudioGuide> {
    if (USE_MOCK) {
      const newGuide: AudioGuide = {
        ...payload,
        id: 'guide-' + Math.random().toString(36).slice(2, 9),
        createdAt: new Date().toISOString(),
      };
      _guides = [..._guides, newGuide];
      return delay(newGuide);
    }
    return apiClient.post<AudioGuide>('/audio-guides', payload);
  },

  async remove(id: string): Promise<void> {
    if (USE_MOCK) {
      _guides = _guides.filter(g => g.id !== id);
      return delay(undefined);
    }
    return apiClient.delete(`/audio-guides/${id}`);
  },

  /** Cascade: xóa tất cả guides của một restaurant (dùng trong mock) */
  removeMockByRestaurantId(restaurantId: string): void {
    _guides = _guides.filter(g => g.restaurantId !== restaurantId);
  },
};
