/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Map as MapIcon, 
  List, 
  Navigation, 
  Star, 
  Clock, 
  Utensils, 
  ChevronRight,
  Settings,
  Bell,
  Volume2,
  LocateFixed,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Import modular parts
import { POI, Location, TabType } from './types/index.ts';
import { MOCK_POIS } from './data/mockData.ts';
import { calculateDistance } from './utils/geoUtils.ts';
import { useLocationTracking } from './hooks/useLocation.ts';
import { restaurantService } from './services/restaurantService.ts';
import { AudioPlayer } from './components/AudioPlayer.tsx';

import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const poiIcon = L.divIcon({
  html: `<div style="background-color: white; border-radius: 50%; padding: 4px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.2); display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; color: #10b981; border: 2px solid #10b981; font-size: 16px;">🍔</div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const userIcon = L.divIcon({
  html: `<div style="width: 16px; height: 16px; background-color: #3b82f6; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3);"></div>`,
  className: '',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const MapUpdater = ({ center, zoom }: { center: { lat: number; lng: number }, zoom?: number }) => {
  const map = useMap();
  React.useEffect(() => {
    map.flyTo([center.lat, center.lng], zoom || map.getZoom());
  }, [center, map, zoom]);
  return null;
};

// --- Sub-components ---

const Header = ({ hasNotifications }: { hasNotifications: boolean }) => (
  <header className="px-6 py-4 bg-white border-b border-zinc-100 flex items-center justify-between z-10">
    <div>
      <h1 className="text-xl font-bold tracking-tight text-emerald-600">FoodieGuide</h1>
      <p className="text-[10px] uppercase tracking-widest font-semibold text-zinc-400">Street Food Audio Tour</p>
    </div>
    <div className="relative">
      <Bell size={20} className="text-zinc-400" />
      {hasNotifications && (
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
      )}
    </div>
  </header>
);

const BottomNav = ({ activeTab, setActiveTab }: { activeTab: TabType, setActiveTab: (t: TabType) => void }) => (
  <nav className="bg-white border-t border-zinc-100 px-8 py-4 flex justify-between items-center z-10">
    <NavButton active={activeTab === 'map'} onClick={() => setActiveTab('map')} icon={<MapIcon size={22} />} label="Bản đồ" />
    <NavButton active={activeTab === 'list'} onClick={() => setActiveTab('list')} icon={<List size={22} />} label="Gần đây" />
    <NavButton active={activeTab === 'tracking'} onClick={() => setActiveTab('tracking')} icon={<Settings size={22} />} label="GPS" />
  </nav>
);

const NavButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-emerald-600 scale-110' : 'text-zinc-400'}`}>
    {icon}
    <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
    {active && <motion.div layoutId="nav-dot" className="w-1 h-1 bg-emerald-600 rounded-full mt-0.5" />}
  </button>
);

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('map');
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null);
  const [isTracking, setIsTracking] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [pois, setPois] = useState<POI[]>([]);

  useEffect(() => {
    restaurantService.getAll().then(data => {
      const mapped: POI[] = data.map(r => ({
        id: r.id,
        name: r.name,
        specialty: r.cuisine || r.description || 'Đặc sản địa phương',
        hours: r.openingHours || '08:00 - 22:00',
        rating: 4.5,
        lat: r.poi?.lat || 10.7602,
        lng: r.poi?.lng || 106.6815,
        audioUrl: (r.audioGuides && r.audioGuides.length > 0 && r.audioGuides[0].audioUrl) 
                  ? r.audioGuides[0].audioUrl 
                  : 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        description: r.description,
        image: r.imageUrl || MOCK_POIS[0].image,
        audioGuides: r.audioGuides?.filter(g => !!g.audioUrl).map(g => ({ language: g.language, audioUrl: g.audioUrl! })) || []
      }));
      setPois(mapped);
    }).catch(console.error);
  }, []);

  const toggleFavorite = (poiId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      alert("Vui lòng đăng nhập để lưu quán ăn yêu thích!");
      return;
    }
    setFavorites(prev => prev.includes(poiId) ? prev.filter(id => id !== poiId) : [...prev, poiId]);
  };

  const { userLocation, setUserLocation, activeGeofencePoi, notifications } = useLocationTracking(isTracking, pois);

  const sortedPois = useMemo(() => {
    return [...pois].sort((a, b) => {
      const distA = calculateDistance(userLocation.lat, userLocation.lng, a.lat, a.lng);
      const distB = calculateDistance(userLocation.lat, userLocation.lng, b.lat, b.lng);
      return distA - distB;
    });
  }, [userLocation, pois]);

  return (
    <div className="flex flex-col h-screen bg-zinc-50 font-sans text-zinc-900 max-w-md mx-auto border-x border-zinc-200 overflow-hidden">
      <Header hasNotifications={notifications.length > 0} />

      <main className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'map' && (
            <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full w-full relative z-0">
              <MapContainer 
                 center={[userLocation.lat, userLocation.lng]} 
                 zoom={15} 
                 zoomControl={false}
                 style={{ height: '100%', width: '100%', zIndex: 0 }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <MapUpdater center={{ lat: userLocation.lat, lng: userLocation.lng }} />
                
                {pois.map(poi => (
                  <Marker 
                    key={poi.id} 
                    position={[poi.lat, poi.lng]} 
                    icon={poiIcon}
                    eventHandlers={{ click: () => setSelectedPoi(poi) }}
                  />
                ))}

                <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon} />
              </MapContainer>

              <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-[400]">
                <button onClick={() => {
                  if ('geolocation' in navigator) {
                    navigator.geolocation.getCurrentPosition(pos => {
                       setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                    });
                  }
                }} className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-emerald-600 active:scale-95 transition-transform hover:bg-zinc-50 border border-zinc-100">
                  <LocateFixed size={20} />
                </button>
              </div>

              {activeGeofencePoi && (
                <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute top-4 left-4 right-4 bg-emerald-600 text-white p-3 rounded-xl shadow-xl flex items-center gap-3 z-[400]">
                  <Volume2 size={20} className="animate-pulse" />
                  <p className="text-xs font-medium flex-1">Đã đến {activeGeofencePoi.name}. Tự động phát audio...</p>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'list' && (
            <motion.div key="list" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="h-full overflow-y-auto p-6 space-y-4">
              <h2 className="text-lg font-bold">Quán ăn gần bạn</h2>
              {sortedPois.map(poi => {
                const dist = calculateDistance(userLocation.lat, userLocation.lng, poi.lat, poi.lng);
                return (
                  <button key={poi.id} onClick={() => { setSelectedPoi(poi); setActiveTab('map'); }} className="w-full bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm flex items-center gap-4 text-left active:bg-zinc-50 transition-colors">
                    <img src={poi.image} alt={poi.name} className="w-16 h-16 rounded-xl object-cover" referrerPolicy="no-referrer" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-zinc-900 truncate">{poi.name}</h3>
                      <p className="text-xs text-zinc-500 truncate">{poi.specialty}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase">{dist.toFixed(0)}m</span>
                        <div className="flex items-center text-amber-500">
                          <Star size={10} fill="currentColor" />
                          <span className="text-[10px] font-bold ml-0.5">{poi.rating}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-zinc-300" />
                  </button>
                );
              })}
            </motion.div>
          )}

          {activeTab === 'tracking' && (
            <motion.div key="tracking" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="h-full p-6 space-y-8">
              <div className="space-y-2">
                <h2 className="text-lg font-bold">Cài đặt</h2>
                <p className="text-sm text-zinc-500">Quản lý tài khoản, vị trí và thông báo.</p>
              </div>

              {/* Login Section */}
              <div className="bg-white rounded-2xl border border-zinc-100 p-4 shadow-sm">
                 <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">Tài khoản</h3>
                 {!isLoggedIn ? (
                    <div className="space-y-3">
                       <p className="text-sm text-zinc-600">Đăng nhập để lưu lịch sử chuyến đi và đánh giá quán ăn.</p>
                       <button onClick={() => setIsLoggedIn(true)} className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl active:bg-emerald-700 transition-colors">
                           Đăng nhập / Đăng ký
                       </button>
                    </div>
                 ) : (
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold text-lg">
                             U
                          </div>
                          <div>
                             <p className="text-sm font-bold">User123</p>
                             <p className="text-[10px] text-zinc-400">user123@example.com</p>
                          </div>
                       </div>
                       <button onClick={() => setIsLoggedIn(false)} className="text-sm text-red-500 font-semibold px-3 py-1.5 bg-red-50 rounded-lg active:bg-red-100">
                          Đăng xuất
                       </button>
                    </div>
                 )}
              </div>
              <div className="bg-white rounded-2xl border border-zinc-100 p-4 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isTracking ? 'bg-emerald-100 text-emerald-600' : 'bg-zinc-100 text-zinc-400'}`}>
                      <Navigation size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Theo dõi vị trí</p>
                      <p className="text-[10px] text-zinc-400">Chạy ngầm để kích hoạt audio</p>
                    </div>
                  </div>
                  <button onClick={() => setIsTracking(!isTracking)} className={`w-12 h-6 rounded-full transition-colors relative ${isTracking ? 'bg-emerald-500' : 'bg-zinc-200'}`}>
                    <motion.div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm" animate={{ x: isTracking ? 24 : 0 }} />
                  </button>
                </div>
              </div>

              {isLoggedIn && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
                    <Heart size={14} fill="currentColor" /> Quán Yêu Thích
                  </h3>
                  <div className="space-y-2">
                    {favorites.length === 0 ? (
                      <p className="text-sm text-zinc-400 italic">Bạn chưa lưu quán ăn nào.</p>
                    ) : (
                      favorites.map(favId => {
                        const favPoi = pois.find(p => p.id === favId);
                        if(!favPoi) return null;
                        return (
                          <div key={favId} onClick={() => { setSelectedPoi(favPoi); setActiveTab('map'); }} className="flex items-center gap-3 p-3 bg-white border border-rose-100 shadow-sm rounded-xl cursor-pointer active:scale-95 transition-transform">
                            <img src={favPoi.image} className="w-10 h-10 rounded-lg object-cover" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-zinc-900 truncate">{favPoi.name}</p>
                              <p className="text-xs text-zinc-500 truncate">{favPoi.specialty}</p>
                            </div>
                            <button onClick={(e) => toggleFavorite(favId, e)} className="p-2 text-rose-500 hover:scale-110 transition-transform">
                              <Heart size={16} fill="currentColor" />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Lịch sử thông báo</h3>
                <div className="space-y-2">
                  {notifications.length === 0 ? (
                    <p className="text-sm text-zinc-400 italic">Chưa có thông báo nào.</p>
                  ) : (
                    notifications.map((note, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-zinc-100 rounded-xl">
                        <Bell size={14} className="mt-0.5 text-zinc-500" />
                        <p className="text-xs text-zinc-700">{note}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* POI Detail Bottom Sheet */}
        <AnimatePresence>
          {selectedPoi && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedPoi(null)} className="absolute inset-0 bg-black/40 z-40" />
              <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[32px] z-50 p-6 shadow-2xl max-h-[85%] overflow-y-auto">
                <div className="w-12 h-1.5 bg-zinc-200 rounded-full mx-auto mb-6" />
                <div className="relative mb-4">
                  <img src={selectedPoi.image} alt={selectedPoi.name} className="w-full h-48 rounded-2xl object-cover shadow-md" referrerPolicy="no-referrer" />
                  <button onClick={(e) => toggleFavorite(selectedPoi.id, e)} className="absolute top-4 right-4 bg-white/90 backdrop-blur p-2.5 rounded-full shadow-lg text-rose-500 active:scale-95 transition-transform">
                    <Heart size={20} fill={favorites.includes(selectedPoi.id) ? "currentColor" : "none"} />
                  </button>
                </div>
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-2xl font-bold text-zinc-900 leading-tight">{selectedPoi.name}</h2>
                  <div className="flex items-center text-amber-500 bg-amber-50 px-2 py-1 rounded-lg">
                    <Star size={14} fill="currentColor" />
                    <span className="text-sm font-bold ml-1">{selectedPoi.rating}</span>
                  </div>
                </div>
                <p className="text-emerald-600 font-bold text-sm mb-4">{selectedPoi.specialty}</p>
                <div className="flex gap-4 mb-6">
                  <div className="flex items-center gap-1.5 text-zinc-500"><Clock size={14} /><span className="text-xs">{selectedPoi.hours}</span></div>
                  <div className="flex items-center gap-1.5 text-zinc-500"><Navigation size={14} /><span className="text-xs">{calculateDistance(userLocation.lat, userLocation.lng, selectedPoi.lat, selectedPoi.lng).toFixed(0)}m</span></div>
                </div>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Giới thiệu</h3>
                    <p className="text-sm text-zinc-600 leading-relaxed">{selectedPoi.description}</p>
                  </div>
                  <AudioPlayer poi={selectedPoi} />
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">Đánh giá nhanh</h3>
                    <div className="flex justify-between gap-2">
                      {[1, 2, 3, 4, 5].map(s => (
                        <button key={s} className="flex-1 py-3 rounded-xl border border-zinc-100 hover:bg-amber-50 hover:border-amber-200 transition-all group">
                          <Star size={20} className="mx-auto text-zinc-300 group-hover:text-amber-500 group-hover:fill-amber-500" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
