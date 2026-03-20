/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { MenuItem } from '../../types';

interface MenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem: MenuItem | null;
  handleSaveMenuItem: (e: React.FormEvent<HTMLFormElement>) => void;
  isSaving: boolean;
}

export const MenuItemModal = ({
  isOpen,
  onClose,
  editingItem,
  handleSaveMenuItem,
  isSaving
}: MenuItemModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden"
          >
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">{editingItem ? 'Chỉnh sửa món' : 'Thêm món mới'}</h3>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSaveMenuItem} className="p-8 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Tên món ăn</label>
                <input name="dishName" defaultValue={editingItem?.dishName} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Giá (VNĐ)</label>
                  <input name="price" type="number" defaultValue={editingItem?.price} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Danh mục</label>
                  <select name="category" defaultValue={editingItem?.category} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20">
                    <option value="Món chính">Món chính</option>
                    <option value="Đồ uống">Đồ uống</option>
                    <option value="Tráng miệng">Tráng miệng</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isSaving}
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all mt-4 disabled:opacity-50"
              >
                {isSaving ? 'Đang lưu...' : (editingItem ? 'Cập nhật món ăn' : 'Thêm vào thực đơn')}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
