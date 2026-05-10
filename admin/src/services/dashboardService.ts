import { apiClient } from './apiClient';
import type { DashboardData } from '../types';

const USE_MOCK = !import.meta.env.VITE_API_URL;

const delay = <T>(data: T, ms = 300): Promise<T> =>
  new Promise(r => setTimeout(() => r(data), ms));

const mockDashboardData: DashboardData = {
  stats: {
    totalUsers: 156,
    usersThisWeek: 42,
    usersThisMonth: 128,
    totalVisits: 2450,
    views: 1200,
    audioPlays: 800,
    navigations: 450,
    restaurants: 8,
    pois: 10,
    audioGuides: 20,
    activeNow: 3,
  },
  dailyTrend: [
    { date: '2026-04-10', users: 8, visits: 22, audioPlays: 14 },
    { date: '2026-04-11', users: 12, visits: 35, audioPlays: 20 },
    { date: '2026-04-12', users: 18, visits: 48, audioPlays: 30 },
    { date: '2026-04-13', users: 15, visits: 40, audioPlays: 25 },
    { date: '2026-04-14', users: 22, visits: 65, audioPlays: 38 },
    { date: '2026-04-15', users: 25, visits: 72, audioPlays: 42 },
    { date: '2026-04-16', users: 20, visits: 55, audioPlays: 32 },
    { date: '2026-04-17', users: 28, visits: 80, audioPlays: 45 },
    { date: '2026-04-18', users: 30, visits: 90, audioPlays: 50 },
    { date: '2026-04-19', users: 26, visits: 75, audioPlays: 40 },
    { date: '2026-04-20', users: 32, visits: 95, audioPlays: 55 },
    { date: '2026-04-21', users: 35, visits: 100, audioPlays: 60 },
    { date: '2026-04-22', users: 29, visits: 82, audioPlays: 48 },
    { date: '2026-04-23', users: 38, visits: 110, audioPlays: 62 },
    { date: '2026-04-24', users: 40, visits: 115, audioPlays: 68 },
    { date: '2026-04-25', users: 42, visits: 120, audioPlays: 70 },
    { date: '2026-04-26', users: 36, visits: 98, audioPlays: 58 },
    { date: '2026-04-27', users: 45, visits: 130, audioPlays: 75 },
    { date: '2026-04-28', users: 48, visits: 140, audioPlays: 80 },
    { date: '2026-04-29', users: 50, visits: 145, audioPlays: 85 },
    { date: '2026-04-30', users: 44, visits: 125, audioPlays: 72 },
    { date: '2026-05-01', users: 52, visits: 150, audioPlays: 88 },
    { date: '2026-05-02', users: 55, visits: 160, audioPlays: 92 },
    { date: '2026-05-03', users: 48, visits: 135, audioPlays: 78 },
    { date: '2026-05-04', users: 58, visits: 170, audioPlays: 95 },
    { date: '2026-05-05', users: 60, visits: 175, audioPlays: 100 },
    { date: '2026-05-06', users: 56, visits: 158, audioPlays: 90 },
    { date: '2026-05-07', users: 62, visits: 180, audioPlays: 105 },
    { date: '2026-05-08', users: 45, visits: 130, audioPlays: 75 },
    { date: '2026-05-09', users: 42, visits: 120, audioPlays: 70 },
  ],
  weeklyTrend: [
    { week: '14', users: 35, visits: 98 },
    { week: '15', users: 48, visits: 145 },
    { week: '16', users: 62, visits: 210 },
    { week: '17', users: 85, visits: 280 },
    { week: '18', users: 110, visits: 350 },
    { week: '19', users: 128, visits: 420 },
  ],
  popularRestaurants: [
    { id: 'res-002', name: 'Phở Gia Truyền Bát Đàn', views: 3200, audioPlays: 450, navigations: 120 },
    { id: 'res-001', name: 'Bún Chả Hàng Mành', views: 2450, audioPlays: 380, navigations: 95 },
    { id: 'res-003', name: 'Bánh Mì Hội An - Hà Nội', views: 1850, audioPlays: 280, navigations: 78 },
    { id: 'res-004', name: 'Chả Cá Lã Vọng', views: 1200, audioPlays: 210, navigations: 65 },
    { id: 'res-007', name: 'Bếp Thái Siêu - Ẩm Thực Thái', views: 1100, audioPlays: 190, navigations: 52 },
    { id: 'res-005', name: 'Bún Bò Huế Hàm Long', views: 980, audioPlays: 150, navigations: 40 },
    { id: 'res-006', name: 'Xôi Xéo Giò Hà Nội', views: 750, audioPlays: 120, navigations: 35 },
    { id: 'res-008', name: 'Cốm Mềm Hà Nội', views: 620, audioPlays: 98, navigations: 28 },
  ],
  visitsByHour: [
    { hour: 6, count: 15 },
    { hour: 7, count: 45 },
    { hour: 8, count: 85 },
    { hour: 9, count: 110 },
    { hour: 10, count: 130 },
    { hour: 11, count: 160 },
    { hour: 12, count: 200 },
    { hour: 13, count: 145 },
    { hour: 14, count: 95 },
    { hour: 15, count: 80 },
    { hour: 16, count: 90 },
    { hour: 17, count: 140 },
    { hour: 18, count: 220 },
    { hour: 19, count: 280 },
    { hour: 20, count: 240 },
    { hour: 21, count: 150 },
    { hour: 22, count: 65 },
  ],
  languageDistribution: [
    { language: 'vi', count: 8 },
    { language: 'en', count: 8 },
    { language: 'ja', count: 2 },
    { language: 'zh', count: 2 },
  ],
  restaurantByStatus: [
    { status: 'approved', count: 8 },
    { status: 'pending', count: 0 },
    { status: 'rejected', count: 0 },
  ],
  recentActivity: [
    { id: '1', action: 'view', restaurantName: 'Bún Chả Hàng Mành', createdAt: new Date(Date.now() - 300000).toISOString() },
    { id: '2', action: 'audio_play', restaurantName: 'Phở Gia Truyền Bát Đàn', createdAt: new Date(Date.now() - 600000).toISOString() },
    { id: '3', action: 'navigation', restaurantName: 'Bánh Mì Hội An', createdAt: new Date(Date.now() - 1200000).toISOString() },
    { id: '4', action: 'view', restaurantName: 'Chả Cá Lã Vọng', createdAt: new Date(Date.now() - 1800000).toISOString() },
    { id: '5', action: 'audio_play', restaurantName: 'Bún Bò Huế Hàm Long', createdAt: new Date(Date.now() - 2400000).toISOString() },
    { id: '6', action: 'view', restaurantName: 'Bếp Thái Siêu', createdAt: new Date(Date.now() - 3600000).toISOString() },
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
