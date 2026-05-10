import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Globe, Check } from 'lucide-react';

const GLOBAL_LANGUAGES = [
  { code: 'vi', label: '🇻🇳 Tiếng Việt' },
  { code: 'en', label: '🇬🇧 English' },
  { code: 'ja', label: '🇯🇵 日本語' },
  { code: 'zh', label: '🇨🇳 中文' },
  { code: 'ko', label: '🇰🇷 한국어' },
  { code: 'es', label: '🇪🇸 Español' },
  { code: 'fr', label: '🇫🇷 Français' }
];

interface LanguageSelectionModalProps {
  onSelect: (langCode: string) => void;
}

export const LanguageSelectionModal: React.FC<LanguageSelectionModalProps> = ({ onSelect }) => {
  const [selected, setSelected] = useState('vi');

  return (
    <>
      <div className="absolute inset-0 bg-black/50 z-[1000] backdrop-blur-sm" />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-sm bg-white rounded-3xl p-6 z-[1001] shadow-2xl"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Globe size={32} />
          </div>
          <h2 className="text-xl font-bold text-zinc-900">Chọn ngôn ngữ</h2>
          <p className="text-sm text-zinc-500 mt-2">Ngôn ngữ này sẽ được đặt làm mặc định khi phát Audio Guide.</p>
        </div>

        <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
          {GLOBAL_LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => setSelected(lang.code)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${selected === lang.code ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold' : 'border-zinc-200 bg-white text-zinc-700 hover:border-emerald-200'}`}
            >
              <span>{lang.label}</span>
              {selected === lang.code && <Check size={20} className="text-emerald-500" />}
            </button>
          ))}
        </div>

        <button
          onClick={() => onSelect(selected)}
          className="w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl active:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
        >
          Xác nhận
        </button>
      </motion.div>
    </>
  );
};
