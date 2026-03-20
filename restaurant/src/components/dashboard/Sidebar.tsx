/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Utensils, 
  LayoutDashboard, 
  Store, 
  LogOut 
} from 'lucide-react';

interface SidebarProps {
  activeTab: 'overview' | 'menu' | 'settings';
  setActiveTab: (tab: 'overview' | 'menu' | 'settings') => void;
  onLogout: () => void;
}

export const Sidebar = ({ activeTab, setActiveTab, onLogout }: SidebarProps) => {
  return (
    <div className="w-72 bg-white border-r border-slate-200 flex flex-col">
      <div className="p-8 border-b border-slate-100">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
            <Utensils className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">FoodStreet</span>
        </div>
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Hệ thống quản lý</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <LayoutDashboard className="w-5 h-5" /> Tổng quan
        </button>
        <button 
          onClick={() => setActiveTab('menu')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'menu' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <Utensils className="w-5 h-5" /> Thực đơn
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <Store className="w-5 h-5" /> Quán ăn
        </button>
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-medium"
        >
          <LogOut className="w-5 h-5" /> Đăng xuất
        </button>
      </div>
    </div>
  );
};
