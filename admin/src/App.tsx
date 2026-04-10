/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * App.tsx — Root component
 *
 * Tất cả UI pages được GIỮ NGUYÊN (no-touch).
 * Chỉ thay thế mock in-memory state bằng hooks gọi services.
 * Auth guard: nếu chưa đăng nhập → hiện Login page.
 */

import { useState } from 'react';
import { Layout }               from './components/Layout';
import { Login }                from './pages/Login';
import { Dashboard }            from './pages/Dashboard';
import { POIManagement }        from './pages/POIManagement';
import { RestaurantManagement } from './pages/RestaurantManagement';
import { AudioGuideManagement } from './pages/AudioGuideManagement';
import { AppState }             from './types';
import { Toaster }              from '@/components/ui/sonner';
import { toast }                from 'sonner';

// ─── Hooks (data + auth layer) ───────────────────────────────────────────────
import { useAuth }          from './hooks/useAuth';
import { usePois }          from './hooks/usePois';
import { useRestaurants }   from './hooks/useRestaurants';
import { useAudioGuides }   from './hooks/useAudioGuides';

export default function App() {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const { isLoggedIn, isLoading: authLoading, login, logout } = useAuth();

  // ── Navigation ────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<AppState>('dashboard');

  // ── Data hooks ────────────────────────────────────────────────────────────
  const {
    pois,
    isLoading: poisLoading,
    addPoi,
    deletePoi,
  } = usePois();

  const {
    restaurants,
    isLoading: restaurantsLoading,
    addRestaurant,
    deleteRestaurant,
    deleteByPoiId,          // cascade khi xóa POI
  } = useRestaurants();

  // AudioGuides được quản lý bên trong AudioGuideManagement qua hook riêng
  // truyền props rỗng để giữ interface cũ của component không thay đổi
  const {
    audioGuides,
    addAudioGuide,
    deleteAudioGuide,
  } = useAudioGuides();     // không filter theo restaurant ở đây

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleLogin = async (username: string, password: string) => {
    try {
      await login(username, password);
      // Đăng nhập xong → không cần redirect thủ công, isLoggedIn tự update
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Đăng nhập thất bại');
    }
  };

  const handleAddPoi = async (payload: Parameters<typeof addPoi>[0]) => {
    try {
      await addPoi(payload);
      // toast được hiện trong POIManagement (đã có sẵn)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi thêm POI');
    }
  };

  const handleDeletePoi = async (id: string) => {
    try {
      // Mock cascade: xóa restaurants (và audio guides bên trong deleteRestaurant)
      const affectedIds = restaurants.filter(r => r.poiId === id).map(r => r.id);
      affectedIds.forEach(rid => deleteByPoiId(id)); // sync mock stores
      deleteByPoiId(id);
      await deletePoi(id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi xóa POI');
    }
  };

  const handleAddRestaurant = async (payload: Parameters<typeof addRestaurant>[0]) => {
    try {
      await addRestaurant(payload);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi thêm quán ăn');
    }
  };

  const handleDeleteRestaurant = async (id: string) => {
    try {
      await deleteRestaurant(id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi xóa quán ăn');
    }
  };

  const handleAddAudioGuide = async (payload: Parameters<typeof addAudioGuide>[0]) => {
    try {
      await addAudioGuide(payload);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi lưu thuyết minh');
    }
  };

  const handleDeleteAudioGuide = async (id: string) => {
    try {
      await deleteAudioGuide(id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi xóa thuyết minh');
    }
  };

  // ── Auth Guard ────────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <>
        <Login onLogin={handleLogin} isLoading={authLoading} />
        <Toaster />
      </>
    );
  }

  // ── Main App ──────────────────────────────────────────────────────────────
  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab} onLogout={logout}>

      {activeTab === 'dashboard' && <Dashboard />}

      {activeTab === 'pois' && (
        <POIManagement
          pois={pois}
          onAdd={handleAddPoi}
          onDelete={handleDeletePoi}
        />
      )}

      {activeTab === 'restaurants' && (
        <RestaurantManagement
          restaurants={restaurants}
          pois={pois}
          onAdd={handleAddRestaurant}
          onDelete={handleDeleteRestaurant}
        />
      )}

      {activeTab === 'audio' && (
        <AudioGuideManagement
          restaurants={restaurants}
          audioGuides={audioGuides}
          onAdd={handleAddAudioGuide}
          onDelete={handleDeleteAudioGuide}
        />
      )}

      <Toaster />
    </Layout>
  );
}
