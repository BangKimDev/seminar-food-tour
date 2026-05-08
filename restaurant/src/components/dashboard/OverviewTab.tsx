import React from 'react';
import { motion } from 'motion/react';
import { MenuItem, Restaurant } from '../../types';

interface OverviewTabProps {
  menuItems: MenuItem[];
  restaurant: Restaurant;
}

export const OverviewTab = ({ menuItems, restaurant }: OverviewTabProps) => {
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
          <p className="text-sm font-medium text-slate-500 mb-1">Trạng thái quán</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <h3 className="text-xl font-bold text-emerald-600 uppercase">Mở cửa</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-sm font-medium text-slate-500 mb-1">Lượt xem hôm nay</p>
          <h3 className="text-3xl font-bold text-slate-900">{restaurant.views ?? 0}</h3>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold mb-6">Món ăn nổi bật</h3>
        <div className="space-y-4">
          {menuItems.slice(0, 3).map(item => (
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
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default OverviewTab;
