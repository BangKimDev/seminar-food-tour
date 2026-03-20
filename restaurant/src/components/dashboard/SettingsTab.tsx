/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Save } from 'lucide-react';

interface SettingsTabProps {
  settingsName: string;
  setSettingsName: (name: string) => void;
  settingsDesc: string;
  setSettingsDesc: (desc: string) => void;
  isSavingSettings: boolean;
  handleSaveSettings: () => void;
}

export const SettingsTab = ({
  settingsName,
  setSettingsName,
  settingsDesc,
  setSettingsDesc,
  isSavingSettings,
  handleSaveSettings
}: SettingsTabProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="max-w-2xl"
    >
      <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
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
        <div className="pt-4">
          <button 
            onClick={handleSaveSettings}
            disabled={isSavingSettings}
            className="flex items-center gap-2 bg-emerald-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-lg shadow-emerald-600/20"
          >
            {isSavingSettings ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Save className="w-5 h-5" /> Lưu thay đổi
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
