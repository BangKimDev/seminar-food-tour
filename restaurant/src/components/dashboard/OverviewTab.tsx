import React from 'react';
import { motion } from 'motion/react';
import { MenuItem, Restaurant } from '../../types';

interface OverviewTabProps {
  menuItems: MenuItem[];
  restaurant: Restaurant;
  entryCount: number;
  audioPlayCount: number;
}

export const OverviewTab = ({ menuItems, restaurant, entryCount, audioPlayCount }: OverviewTabProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-sm font-medium text-slate-500 mb-1">Tổng số món</p>
          <h3 className="text-3xl font-bold text-slate-900">{menuItems.length}</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-sm font-medium text-slate-500 mb-1">Số người xem quán</p>
          <h3 className="text-3xl font-bold text-emerald-600">{entryCount}</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-sm font-medium text-slate-500 mb-1">Số người nghe audio quán</p>
          <h3 className="text-3xl font-bold text-emerald-600">{audioPlayCount}</h3>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold mb-6">Món ăn nổi bật</h3>
        <div className="space-y-4">
          {menuItems.filter(m => m.isFeatured).length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">
              Chưa có món nổi bật. Vào tab <strong>Thực đơn</strong> để gắn sao ⭐ cho món ăn.
            </p>
          ) : (
            menuItems.filter(m => m.isFeatured).slice(0, 6).map(item => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-4">
                  <img src={item.imageUrl} className="w-12 h-12 rounded-xl object-cover" alt="" />
                  <div>
                    <p className="font-bold text-slate-900">{item.dishName}</p>
                    <p className="text-xs text-slate-500">{item.category}</p>
                  </div>
                </div>
                <p className="font-bold text-emerald-600">{item.price.toLocaleString()}đ</p>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default OverviewTab;
