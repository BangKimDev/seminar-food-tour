import { apiClient } from './apiClient';
import { Restaurant, ApiResponse } from '../types';

/**
 * Restaurant Service
 *
 * ASSUMPTION (theo PRD §12):
 *   GET    /restaurants?search=&poiId=  → ApiResponse<Restaurant[]>
 *   POST   /restaurants                 → Restaurant
 *   PUT    /restaurants/:id             → Restaurant
 *   DELETE /restaurants/:id             → 204 (cascade xóa audio_guides)
 */

const USE_MOCK = !(import.meta.env.VITE_API_URL as string);

const delay = <T>(data: T, ms = 350): Promise<T> =>
  new Promise(r => setTimeout(() => r(data), ms));

let _restaurants: Restaurant[] = [
  {
    id: 'res-1',
    poiId: 'poi-1',
    name: 'Nhà hàng Bến Thuyền',
    description:
      'Nhà hàng chuyên phục vụ các món đặc sản dê núi Ninh Bình ngay cạnh bến thuyền Tràng An. Không gian thoáng mát, view nhìn ra dòng sông Ngô Đồng thơ mộng.',
    cuisine: 'Đặc sản Ninh Bình',
    openingHours: '08:00 - 22:00',
    createdAt: new Date().toISOString(),
  },
];

export const restaurantService = {
  async list(search = '', poiId?: string): Promise<Restaurant[]> {
    if (USE_MOCK) {
      let result = [..._restaurants];
      if (search.trim()) result = result.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));
      if (poiId)         result = result.filter(r => r.poiId === poiId);
      return delay(result);
    }
    const params = new URLSearchParams({ search });
    if (poiId) params.set('poiId', poiId);
    const res = await apiClient.get<ApiResponse<Restaurant[]>>(`/restaurants?${params}`);
    return res.data;
  },

  async create(payload: Omit<Restaurant, 'id' | 'createdAt'>): Promise<Restaurant> {
    if (USE_MOCK) {
      const newRes: Restaurant = {
        ...payload,
        id: 'res-' + Math.random().toString(36).slice(2, 9),
        createdAt: new Date().toISOString(),
      };
      _restaurants = [..._restaurants, newRes];
      return delay(newRes);
    }
    return apiClient.post<Restaurant>('/restaurants', payload);
  },

  async update(id: string, payload: Partial<Omit<Restaurant, 'id' | 'createdAt'>>): Promise<Restaurant> {
    if (USE_MOCK) {
      const idx = _restaurants.findIndex(r => r.id === id);
      if (idx === -1) throw new Error('Quán ăn không tồn tại');
      _restaurants[idx] = { ..._restaurants[idx], ...payload };
      return delay({ ..._restaurants[idx] });
    }
    return apiClient.put<Restaurant>(`/restaurants/${id}`, payload);
  },

  async remove(id: string): Promise<void> {
    if (USE_MOCK) {
      _restaurants = _restaurants.filter(r => r.id !== id);
      return delay(undefined);
    }
    return apiClient.delete(`/restaurants/${id}`);
  },

  /** Cascade: xóa tất cả restaurants của một POI (dùng trong mock cascade) */
  removeMockByPoiId(poiId: string): void {
    _restaurants = _restaurants.filter(r => r.poiId !== poiId);
  },
};
