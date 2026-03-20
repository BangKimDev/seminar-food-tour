/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Search, Plus, Edit3, Trash2 } from 'lucide-react';
import { MenuItem } from '../../types';

interface MenuTabProps {
  menuItems: MenuItem[];
  setIsAddingItem: (isAdding: boolean) => void;
  setEditingItem: (item: MenuItem | null) => void;
  handleDeleteItem: (id: string) => void;
}

export const MenuTab = ({ 
  menuItems, 
  setIsAddingItem, 
  setEditingItem, 
  handleDeleteItem 
}: MenuTabProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div className="relative w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Tìm kiếm món ăn..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
          />
        </div>
        <button 
          onClick={() => setIsAddingItem(true)}
          className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
        >
          <Plus className="w-5 h-5" /> Thêm món mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map(item => (
          <div key={item.id} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm group hover:shadow-md transition-all">
            <div className="h-48 relative overflow-hidden">
              <img src={item.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={item.dishName} />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-emerald-600">
                {item.category}
              </div>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-lg text-slate-900">{item.dishName}</h4>
                  <p className="text-emerald-600 font-bold">{item.price.toLocaleString()}đ</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => { setEditingItem(item); setIsAddingItem(true); }}
                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${item.isAvailable ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                <span className="text-xs font-medium text-slate-500">{item.isAvailable ? 'Đang bán' : 'Hết hàng'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
