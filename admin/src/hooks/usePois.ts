import { useState, useEffect, useCallback } from 'react';
import { poiService } from '../services/poiService';
import { POI } from '../types';

/**
 * usePois — fetch + CRUD POIs với loading/error states.
 *
 * Tự động load khi mount.
 * addPoi / updatePoi / deletePoi cập nhật local state lạc quan (optimistic)
 * rồi sync với server. Error được throw để caller hiện toast.
 */
export function usePois() {
  const [pois, setPois]         = useState<POI[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const fetchPois = useCallback(async (search = '') => {
    setLoading(true);
    setError(null);
    try {
      const data = await poiService.list(search);
      setPois(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải dữ liệu POI');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPois(); }, [fetchPois]);

  const addPoi = useCallback(async (payload: Omit<POI, 'id' | 'createdAt'>): Promise<POI> => {
    const created = await poiService.create(payload);
    setPois(prev => [...prev, created]);
    return created;
  }, []);

  const updatePoi = useCallback(async (
    id: string,
    payload: Partial<Omit<POI, 'id' | 'createdAt'>>
  ): Promise<POI> => {
    const updated = await poiService.update(id, payload);
    setPois(prev => prev.map(p => p.id === id ? updated : p));
    return updated;
  }, []);

  const deletePoi = useCallback(async (id: string): Promise<void> => {
    await poiService.remove(id);
    setPois(prev => prev.filter(p => p.id !== id));
  }, []);

  return { pois, isLoading, error, fetchPois, addPoi, updatePoi, deletePoi };
}
