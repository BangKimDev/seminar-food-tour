import { apiClient } from './apiClient';
import { POI, ApiResponse } from '../types';

/**
 * POI Service
 *
 * ASSUMPTION (theo PRD §12):
 *   GET    /pois?search=  → ApiResponse<POI[]>
 *   POST   /pois          → POI
 *   PUT    /pois/:id      → POI
 *   DELETE /pois/:id      → 204 (cascade xóa restaurants + audio_guides)
 *
 * AUTO-MOCK khi VITE_API_URL rỗng.
 * Mock store tồn tại trong memory — bị reset khi reload page (hành vi OK cho POC).
 */

const USE_MOCK = !(import.meta.env.VITE_API_URL as string);

const delay = <T>(data: T, ms = 350): Promise<T> =>
  new Promise(r => setTimeout(() => r(data), ms));

// ----- Mock store (mutable module-level variable) -----
let _pois: POI[] = [
  { id: 'poi-1', name: 'Bến thuyền Tràng An',    category: 'boat',    lat: 20.256600, lng: 105.892300, createdAt: new Date().toISOString() },
  { id: 'poi-2', name: 'Cổng soát vé số 1',      category: 'ticket',  lat: 20.258000, lng: 105.893000, createdAt: new Date().toISOString() },
  { id: 'poi-3', name: 'Nhà vệ sinh trung tâm',  category: 'wc',      lat: 20.257100, lng: 105.891800, createdAt: new Date().toISOString() },
  { id: 'poi-4', name: 'Bãi đỗ xe A',            category: 'parking', lat: 20.256000, lng: 105.891000, createdAt: new Date().toISOString() },
  { id: 'poi-5', name: 'Hang Múa',               category: 'main',    lat: 20.254500, lng: 105.890500, createdAt: new Date().toISOString() },
];

export const poiService = {
  async list(search = ''): Promise<POI[]> {
    if (USE_MOCK) {
      const result = search.trim()
        ? _pois.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
        : [..._pois];
      return delay(result);
    }
    const res = await apiClient.get<ApiResponse<POI[]>>(
      `/pois?search=${encodeURIComponent(search)}`
    );
    return res.data;
  },

  async create(payload: Omit<POI, 'id' | 'createdAt'>): Promise<POI> {
    if (USE_MOCK) {
      const newPoi: POI = {
        ...payload,
        id: 'poi-' + Math.random().toString(36).slice(2, 9),
        createdAt: new Date().toISOString(),
      };
      _pois = [..._pois, newPoi];
      return delay(newPoi);
    }
    return apiClient.post<POI>('/pois', payload);
  },

  async update(id: string, payload: Partial<Omit<POI, 'id' | 'createdAt'>>): Promise<POI> {
    if (USE_MOCK) {
      const idx = _pois.findIndex(p => p.id === id);
      if (idx === -1) throw new Error('POI không tồn tại');
      _pois[idx] = { ..._pois[idx], ...payload };
      return delay({ ..._pois[idx] });
    }
    return apiClient.put<POI>(`/pois/${id}`, payload);
  },

  async remove(id: string): Promise<void> {
    if (USE_MOCK) {
      _pois = _pois.filter(p => p.id !== id);
      return delay(undefined);
    }
    return apiClient.delete(`/pois/${id}`);
  },
};
