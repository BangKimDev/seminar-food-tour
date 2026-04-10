import { useState, useEffect, useCallback } from 'react';
import { audioGuideService } from '../services/audioGuideService';
import { AudioGuide } from '../types';

/**
 * useAudioGuides — fetch + CRUD audio guides theo restaurantId.
 *
 * Tự động fetch lại khi restaurantId thay đổi.
 * Khi restaurantId = undefined → reset về danh sách rỗng.
 */
export function useAudioGuides(restaurantId?: string) {
  const [audioGuides, setAudioGuides] = useState<AudioGuide[]>([]);
  const [isLoading, setLoading]       = useState(false);
  const [error, setError]             = useState<string | null>(null);

  useEffect(() => {
    if (!restaurantId) {
      setAudioGuides([]);
      return;
    }
    setLoading(true);
    setError(null);
    audioGuideService
      .listByRestaurant(restaurantId)
      .then(setAudioGuides)
      .catch(err => setError(err instanceof Error ? err.message : 'Lỗi tải thuyết minh'))
      .finally(() => setLoading(false));
  }, [restaurantId]);

  const addAudioGuide = useCallback(async (
    payload: Omit<AudioGuide, 'id' | 'createdAt'>
  ): Promise<AudioGuide> => {
    const created = await audioGuideService.create(payload);
    setAudioGuides(prev => [...prev, created]);
    return created;
  }, []);

  const deleteAudioGuide = useCallback(async (id: string): Promise<void> => {
    await audioGuideService.remove(id);
    setAudioGuides(prev => prev.filter(g => g.id !== id));
  }, []);

  return { audioGuides, isLoading, error, addAudioGuide, deleteAudioGuide };
}
