import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, Edit3, Trash2, UtensilsCrossed, Star } from 'lucide-react';
import { MenuItem } from '../../types';

interface MenuTabProps {
  menuItems: MenuItem[];
  setIsAddingItem: (isAdding: boolean) => void;
  setEditingItem: (item: MenuItem | null) => void;
  handleDeleteItem: (id: string) => void;
  handleToggleFeatured: (id: string, isFeatured: boolean) => void;
}

const categoryColors: Record<string, string> = {
  'Món chính': 'text-emerald-600',
  'Đồ uống': 'text-blue-600',
  'Món phụ': 'text-orange-500',
  'Tráng miệng': 'text-pink-500',
  'Khác': 'text-slate-500',
};

export const MenuTab = ({
  menuItems,
  setIsAddingItem,
  setEditingItem,
  handleDeleteItem,
  handleToggleFeatured
}: MenuTabProps) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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
        <AnimatePresence mode="popLayout">
          {menuItems.map(item => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm group hover:shadow-md transition-all"
            >
              {/* Image area */}
              <div className="h-48 relative overflow-hidden bg-slate-100">
                {item.imageUrl ? (
                  <div
                    className="w-full h-full bg-cover bg-center bg-no-repeat group-hover:scale-105 transition-transform duration-500"
                    style={{
                      backgroundImage: `url(${item.imageUrl})`,
                      backgroundPosition: item.cropX != null || item.cropY != null
                        ? `calc(50% - ${item.cropX || 0}px) calc(50% - ${item.cropY || 0}px)`
                        : 'center',
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <UtensilsCrossed className="w-12 h-12" />
                  </div>
                )}
                {/* Category badge */}
                <div className={`absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold ${categoryColors[item.category || 'Khác'] || 'text-slate-500'}`}>
                  {item.category || 'Khác'}
                </div>
              </div>

              {/* Card body */}
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 truncate">{item.dishName}</h4>
                    {item.description && (
                      <p className="text-xs text-slate-400 mt-0.5 truncate">{item.description}</p>
                    )}
                    <p className="text-emerald-600 font-bold mt-1.5">{item.price.toLocaleString()}đ</p>
                  </div>
                  <div className="flex gap-1 shrink-0 ml-3">
                    <button
                      onClick={() => handleToggleFeatured(item.id, !item.isFeatured)}
                      className={`p-2 rounded-lg transition-all ${
                        item.isFeatured
                          ? 'text-amber-500 hover:text-amber-600 hover:bg-amber-50'
                          : 'text-slate-300 hover:text-amber-500 hover:bg-amber-50'
                      }`}
                      title={item.isFeatured ? 'Bỏ nổi bật' : 'Đánh dấu nổi bật'}
                    >
                      <Star className="w-4 h-4" fill={item.isFeatured ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      onClick={() => { setEditingItem(item); setIsAddingItem(true); }}
                      className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <div className="relative">
                      <button
                        onClick={() => setConfirmDeleteId(confirmDeleteId === item.id ? null : item.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {confirmDeleteId === item.id && (
                        <div className="absolute right-0 top-full mt-2 z-20 bg-white rounded-xl shadow-xl border border-slate-200 p-3 min-w-[160px]">
                          <p className="text-xs font-semibold text-slate-600 mb-2.5 text-center">Xoá món này?</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="flex-1 px-3 py-1.5 text-xs font-semibold text-slate-500 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                            >
                              Huỷ
                            </button>
                            <button
                              onClick={() => { handleDeleteItem(item.id); setConfirmDeleteId(null); }}
                              className="flex-1 px-3 py-1.5 text-xs font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                            >
                              Xoá
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status dot */}
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${item.isAvailable ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                  <span className="text-xs font-medium text-slate-500">{item.isAvailable ? 'Đang bán' : 'Ngừng bán'}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default MenuTab;
