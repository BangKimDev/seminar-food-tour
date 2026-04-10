import { useState, useEffect, useCallback } from 'react';
import { restaurantService } from '../services/restaurantService';
import { audioGuideService } from '../services/audioGuideService';
import { Restaurant } from '../types';

/**
 * useRestaurants — fetch + CRUD restaurants với loading/error states.
 *
 * deleteRestaurant tự cascade xóa audio guides trong mock mode
 * (backend thực tự xử lý cascade qua FK ON DELETE CASCADE).
 */
export function useRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setLoading]       = useState(false);
  const [error, setError]             = useState<string | null>(null);

  const fetchRestaurants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await restaurantService.list();
      setRestaurants(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải dữ liệu quán ăn');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRestaurants(); }, [fetchRestaurants]);

  const addRestaurant = useCallback(async (
    payload: Omit<Restaurant, 'id' | 'createdAt'>
  ): Promise<Restaurant> => {
    const created = await restaurantService.create(payload);
    setRestaurants(prev => [...prev, created]);
    return created;
  }, []);

  const updateRestaurant = useCallback(async (
    id: string,
    payload: Partial<Omit<Restaurant, 'id' | 'createdAt'>>
  ): Promise<Restaurant> => {
    const updated = await restaurantService.update(id, payload);
    setRestaurants(prev => prev.map(r => r.id === id ? updated : r));
    return updated;
  }, []);

  const deleteRestaurant = useCallback(async (id: string): Promise<void> => {
    // cascade mock: xóa audio guides liên quan trước
    audioGuideService.removeMockByRestaurantId(id);
    await restaurantService.remove(id);
    setRestaurants(prev => prev.filter(r => r.id !== id));
  }, []);

  /** Cascade từ POI delete: xóa tất cả restaurants của một poiId */
  const deleteByPoiId = useCallback((poiId: string): void => {
    restaurantService.removeMockByPoiId(poiId);
    setRestaurants(prev => prev.filter(r => r.poiId !== poiId));
  }, []);

  return {
    restaurants, isLoading, error,
    fetchRestaurants, addRestaurant, updateRestaurant, deleteRestaurant, deleteByPoiId,
  };
}
