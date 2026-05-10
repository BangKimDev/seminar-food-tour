import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Save, Camera, MapPin, Image } from 'lucide-react';

interface SettingsTabProps {
  settingsName: string;
  setSettingsName: (name: string) => void;
  settingsDesc: string;
  setSettingsDesc: (desc: string) => void;
  settingsImageUrl: string;
  setSettingsImageUrl: (url: string) => void;
  settingsLat: string;
  setSettingsLat: (lat: string) => void;
  settingsLng: string;
  setSettingsLng: (lng: string) => void;
  settingsOpeningHours: string;
  setSettingsOpeningHours: (hours: string) => void;
  settingsUsername: string;
  setSettingsUsername: (username: string) => void;
  settingsEmail: string;
  setSettingsEmail: (email: string) => void;
  settingsAddress: string;
  setSettingsAddress: (address: string) => void;
  isSavingSettings: boolean;
  handleSaveSettings: () => void;
}

const Toast = ({ visible }: { visible: boolean }) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-emerald-600 text-white px-5 py-3 shadow-lg shadow-emerald-600/25"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M4 9L7 12L14 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="text-sm font-semibold">Đã lưu thay đổi</span>
      </motion.div>
    )}
  </AnimatePresence>
);

const SectionTitle = ({ label }: { label: string }) => (
  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-5">
    {label}
  </p>
);

export const SettingsTab = ({
  settingsName, setSettingsName,
  settingsDesc, setSettingsDesc,
  settingsImageUrl, setSettingsImageUrl,
  settingsLat, setSettingsLat,
  settingsLng, setSettingsLng,
  settingsOpeningHours, setSettingsOpeningHours,
  settingsUsername, setSettingsUsername,
  settingsEmail, setSettingsEmail,
  settingsAddress, setSettingsAddress,
  isSavingSettings, handleSaveSettings,
}: SettingsTabProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toastVisible, setToastVisible] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setSettingsImageUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Trình duyệt không hỗ trợ định vị');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSettingsLat(pos.coords.latitude.toFixed(6));
        setSettingsLng(pos.coords.longitude.toFixed(6));
      },
      () => alert('Không thể lấy vị trí hiện tại. Vui lòng thử lại.'),
      { enableHighAccuracy: true }
    );
  };

  const handleSaveWithToast = () => {
    handleSaveSettings();
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="w-full max-w-full space-y-6 pb-28"
    >
      {/* SECTION 1: Thông tin cơ bản */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
        <SectionTitle label="Thông tin cơ bản" />
        <div className="flex flex-col md:flex-row gap-8">
          {/* LEFT: Image */}
          <div className="w-full md:w-[30%] flex flex-col items-center gap-3">
            <div
              className="w-[200px] h-[200px] shrink-0 bg-slate-50 border-2 overflow-hidden flex items-center justify-center cursor-pointer"
              style={{ borderRadius: '16px', borderStyle: settingsImageUrl ? 'solid' : 'dashed', borderColor: settingsImageUrl ? 'transparent' : '#CBD5E1' }}
              onClick={() => fileInputRef.current?.click()}
            >
              {settingsImageUrl ? (
                <img src={settingsImageUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-400">
                  <Camera className="w-8 h-8" />
                  <span className="text-xs font-medium">Tải ảnh lên</span>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 text-sm font-semibold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-2xl hover:bg-emerald-100 transition-colors"
            >
              <Image className="w-4 h-4" /> Chọn ảnh
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          {/* RIGHT: Fields */}
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Tên quán ăn</label>
              <input
                type="text"
                value={settingsName}
                onChange={(e) => setSettingsName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Mô tả quán</label>
              <textarea
                rows={4}
                value={settingsDesc}
                onChange={(e) => setSettingsDesc(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Giờ mở cửa</label>
              <input
                type="text"
                value={settingsOpeningHours}
                onChange={(e) => setSettingsOpeningHours(e.target.value)}
                placeholder="VD: 06:00 - 22:00"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Vị trí quán */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
        <SectionTitle label="Vị trí quán" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Vĩ độ (Lat)</label>
            <input
              type="number"
              step="any"
              value={settingsLat}
              onChange={(e) => setSettingsLat(e.target.value)}
              placeholder="10.7769"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Kinh độ (Lng)</label>
            <input
              type="number"
              step="any"
              value={settingsLng}
              onChange={(e) => setSettingsLng(e.target.value)}
              placeholder="106.7009"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none"
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-4">
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            className="flex items-center gap-2 text-sm font-semibold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-2xl hover:bg-emerald-100 transition-colors w-fit"
          >
            <MapPin className="w-4 h-4" /> Lấy vị trí hiện tại
          </button>
          <p className="text-xs text-slate-400">
            Bạn có thể lấy tọa độ từ Google Maps
          </p>
        </div>
      </div>

      {/* SECTION 3: Thông tin tài khoản */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
        <SectionTitle label="Thông tin tài khoản" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Tài khoản</label>
            <input
              type="text"
              value={settingsUsername}
              onChange={(e) => setSettingsUsername(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Email</label>
            <input
              type="email"
              value={settingsEmail}
              onChange={(e) => setSettingsEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Địa chỉ chi tiết</label>
            <input
              type="text"
              value={settingsAddress}
              onChange={(e) => setSettingsAddress(e.target.value)}
              placeholder="Số nhà, tên đường, hẻm..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none"
            />
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-4">
          Để thay đổi mật khẩu, vui lòng liên hệ hỗ trợ
        </p>
      </div>

      {/* Bottom action bar */}
      <div className="fixed bottom-0 right-0 left-0 md:left-72 bg-white border-t border-slate-200 px-10 py-4 z-40">
        <div className="flex justify-end">
          <button
            onClick={handleSaveWithToast}
            disabled={isSavingSettings}
            className="flex items-center gap-2 bg-emerald-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-lg shadow-emerald-600/20"
          >
            {isSavingSettings ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" /> Lưu thay đổi
              </>
            )}
          </button>
        </div>
      </div>

      <Toast visible={toastVisible} />
    </motion.div>
  );
};
