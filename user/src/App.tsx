/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  Heart,
  QrCode,
  Globe,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Import modular parts
import { POI, Location, TabType } from './types/index.ts';
import { MOCK_POIS } from './data/mockData.ts';
import { calculateDistance } from './utils/geoUtils.ts';
import { useLocationTracking } from './hooks/useLocation.ts';
import { useHeartbeat } from './hooks/useHeartbeat.ts';
import { AudioPlayer } from './components/AudioPlayer.tsx';
import { LanguageSelectionModal } from './components/LanguageSelectionModal.tsx';
import { poiService } from './services/poiService.ts';

import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { restaurantService } from './services/restaurantService.ts';

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

const Header = () => (
  <header className="px-6 py-4 bg-white border-b border-zinc-100 flex items-center justify-between z-10">
    <div>
      <h1 className="text-xl font-bold tracking-tight text-emerald-600">FoodieGuide</h1>
      <p className="text-[10px] uppercase tracking-widest font-semibold text-zinc-400">Street Food Audio Tour</p>
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

// --- Entry Tracker ---

function EntryTracker({ poiId, trackedEntries }: { poiId: string; trackedEntries: React.MutableRefObject<Set<string>> }) {
  useEffect(() => {
    if (!trackedEntries.current.has(poiId)) {
      trackedEntries.current.add(poiId);
      restaurantService.recordEntry(poiId);
    }
  }, [poiId, trackedEntries]);
  return null;
}

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('map');
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null);
  const [isTracking, setIsTracking] = useState(true);
  const [pois, setPois] = useState<POI[]>([]);
  const [rawRestaurants, setRawRestaurants] = useState<any[]>([]);
  const [rawPois, setRawPois] = useState<any[]>([]);

  const [defaultLanguage, setDefaultLanguage] = useState<string | null>(localStorage.getItem('defaultLanguage'));
  const [showLanguageModal, setShowLanguageModal] = useState(!localStorage.getItem('defaultLanguage'));
  const trackedEntryPois = useRef(new Set<string>());

  useEffect(() => {
    Promise.all([
      restaurantService.getAll(),
      poiService.getAll()
    ]).then(([restaurantData, poiData]) => {
      setRawRestaurants(restaurantData);
      setRawPois(poiData);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    const rPois: POI[] = rawRestaurants.map(r => {
      let selectedAudioUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
      const audioGuides = r.audioGuides || [];
      if (audioGuides.length > 0) {
        if (defaultLanguage) {
          const match = audioGuides.find((g: any) => g.language === defaultLanguage && g.audioUrl);
          if (match) {
            selectedAudioUrl = match.audioUrl;
          } else {
            const firstWithUrl = audioGuides.find((g: any) => !!g.audioUrl);
            if (firstWithUrl) selectedAudioUrl = firstWithUrl.audioUrl;
          }
        } else {
          const firstWithUrl = audioGuides.find((g: any) => !!g.audioUrl);
          if (firstWithUrl) selectedAudioUrl = firstWithUrl.audioUrl;
        }
      }

      return {
        id: r.id,
        name: r.name,
        specialty: r.cuisine || r.description || 'Đặc sản địa phương',
        hours: r.openingHours || '08:00 - 22:00',
        rating: 4.5,
        lat: r.poi?.lat || 10.7602,
        lng: r.poi?.lng || 106.6815,
        audioUrl: selectedAudioUrl,
        description: r.description,
        image: r.imageUrl || MOCK_POIS[0].image,
        audioGuides: audioGuides.filter((g: any) => !!g.audioUrl).map((g: any) => ({ language: g.language, audioUrl: g.audioUrl }))
      };
    });

    const pPois: POI[] = rawPois.map(p => {
      let specialty = 'Tiện ích';
      if (p.category === 'wc') specialty = 'Nhà vệ sinh';
      else if (p.category === 'parking') specialty = 'Bãi đỗ xe';
      else if (p.category === 'ticket') specialty = 'Quầy vé';
      else if (p.category === 'main') specialty = 'Điểm chính';

      return {
        id: p.id,
        name: p.name,
        specialty,
        hours: '24/7',
        rating: 5.0,
        lat: p.lat,
        lng: p.lng,
        audioUrl: '',
        description: `Khu vực tiện ích: ${p.name}`,
        image: MOCK_POIS[0].image, // Fallback
        audioGuides: []
      };
    });

    setPois([...rPois, ...pPois]);
  }, [rawRestaurants, rawPois, defaultLanguage]);

  useHeartbeat();

  const { userLocation, setUserLocation, activeGeofencePoi, notifications } = useLocationTracking(isTracking, pois);

  const sortedPois = useMemo(() => {
    return [...pois].sort((a, b) => {
      const distA = calculateDistance(userLocation.lat, userLocation.lng, a.lat, a.lng);
      const distB = calculateDistance(userLocation.lat, userLocation.lng, b.lat, b.lng);
      return distA - distB;
    });
  }, [userLocation, pois]);

  return (
    <div className="flex flex-col h-[100dvh] w-full md:max-w-md md:mx-auto bg-zinc-50 font-sans text-zinc-900 md:border-x border-zinc-200 overflow-hidden md:shadow-2xl md:my-4 md:h-[calc(100vh-2rem)] md:rounded-3xl relative">
      <Header />

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
                <p className="text-sm text-zinc-500">Quản lý ngôn ngữ và vị trí.</p>
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

              <div className="bg-white rounded-2xl border border-zinc-100 p-4 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                      <Globe size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Ngôn ngữ mặc định</p>
                      <p className="text-[10px] text-zinc-400">{defaultLanguage ? `Đang chọn: ${defaultLanguage.toUpperCase()}` : 'Chưa thiết lập'}</p>
                    </div>
                  </div>
                  <button onClick={() => setShowLanguageModal(true)} className="text-xs text-blue-600 font-semibold px-3 py-1.5 bg-blue-50 rounded-lg active:bg-blue-100">
                    Thay đổi
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Track entry when POI detail is viewed within range */}
        {selectedPoi && calculateDistance(userLocation.lat, userLocation.lng, selectedPoi.lat, selectedPoi.lng) <= 100 && (
          <EntryTracker poiId={selectedPoi.id} trackedEntries={trackedEntryPois} />
        )}

        {/* POI Detail Bottom Sheet */}
        <AnimatePresence>
          {selectedPoi && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedPoi(null)} className="absolute inset-0 bg-black/40 z-40" />
              <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[32px] z-50 p-6 shadow-2xl max-h-[85%] overflow-y-auto">
                <div className="w-12 h-1.5 bg-zinc-200 rounded-full mx-auto mb-6" />
                {calculateDistance(userLocation.lat, userLocation.lng, selectedPoi.lat, selectedPoi.lng) <= 100 ? (
                  <>
                    <div className="relative mb-4">
                      <img src={selectedPoi.image} alt={selectedPoi.name} className="w-full h-48 rounded-2xl object-cover shadow-md" referrerPolicy="no-referrer" />
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
                      <AudioPlayer poi={selectedPoi} defaultLanguage={defaultLanguage || undefined} />
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
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center px-2">
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-5 border border-emerald-100">
                      <Lock size={36} />
                    </div>
                    <h2 className="text-xl font-bold text-zinc-900 mb-2">{selectedPoi.name}</h2>
                    <p className="text-sm text-zinc-500 mb-8 leading-relaxed">
                      Bạn đang ở cách quán <b>{calculateDistance(userLocation.lat, userLocation.lng, selectedPoi.lat, selectedPoi.lng).toFixed(0)}m</b>.<br />
                      Vui lòng di chuyển đến phạm vi <b>dưới 100m</b> để xem thông tin chi tiết và nghe thuyết minh.
                    </p>
                    <button onClick={() => setSelectedPoi(null)} className="w-full px-6 py-3.5 bg-emerald-600 text-white font-bold rounded-xl active:bg-emerald-700 transition-colors shadow-sm">
                      Đã hiểu
                    </button>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {showLanguageModal && (
        <LanguageSelectionModal
          onSelect={(lang) => {
            setDefaultLanguage(lang);
            localStorage.setItem('defaultLanguage', lang);
            setShowLanguageModal(false);
          }}
        />
      )}
    </div>
  );
}
