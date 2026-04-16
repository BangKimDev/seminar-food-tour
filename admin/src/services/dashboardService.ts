import { apiClient } from './apiClient';
import { DashboardData } from '../types';

const USE_MOCK = !import.meta.env.VITE_API_URL;

const delay = <T>(data: T, ms = 300): Promise<T> =>
  new Promise(r => setTimeout(() => r(data), ms));

const mockDashboardData: DashboardData = {
  stats: {
    pois: 124,
    restaurants: 42,
    audioGuides: 156,
    visits: 2450,
  },
  poiDistribution: [
    { category: 'restaurant', count: 45 },
    { category: 'main', count: 32 },
    { category: 'cafe', count: 28 },
    { category: 'market', count: 12 },
    { category: 'wc', count: 5 },
    { category: 'parking', count: 2 },
  ],
  restaurantByStatus: [
    { status: 'approved', count: 38 },
    { status: 'pending', count: 3 },
    { status: 'rejected', count: 1 },
  ],
  audioGuideByLanguage: [
    { language: 'vi', count: 42 },
    { language: 'en', count: 38 },
    { language: 'ja', count: 28 },
    { language: 'zh', count: 24 },
    { language: 'ko', count: 18 },
    { language: 'fr', count: 12 },
    { language: 'es', count: 8 },
  ],
  recentActivity: [
    { id: '1', action: 'view', restaurantName: 'Bún Chả Hàng Mành', createdAt: new Date().toISOString() },
    { id: '2', action: 'audio_play', restaurantName: 'Phở Gia Truyền Bát Đàn', createdAt: new Date().toISOString() },
    { id: '3', action: 'navigation', restaurantName: 'Bánh Mì Hội An', createdAt: new Date().toISOString() },
    { id: '4', action: 'view', restaurantName: 'Chả Cá Lã Vọng', createdAt: new Date().toISOString() },
  ],
  recentRestaurants: [
    { id: '1', name: 'Bún Chả Hàng Mành', status: 'approved', views: 2450, createdAt: new Date().toISOString() },
    { id: '2', name: 'Phở Gia Truyền Bát Đàn', status: 'approved', views: 3200, createdAt: new Date().toISOString() },
    { id: '3', name: 'Bánh Mì Hội An', status: 'approved', views: 1850, createdAt: new Date().toISOString() },
  ],
};

export const dashboardService = {
  async getStats(): Promise<DashboardData> {
    if (USE_MOCK) {
      return delay(mockDashboardData);
    }
    return apiClient.get<DashboardData>('/dashboard/stats');
  },
};
