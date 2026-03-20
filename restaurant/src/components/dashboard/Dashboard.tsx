/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User as UserIcon } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { Restaurant, MenuItem } from '../../types';
import { INITIAL_MENU_ITEMS } from '../../constants';
import { Sidebar } from './Sidebar';
import { OverviewTab } from './OverviewTab';
import { MenuTab } from './MenuTab';
import { SettingsTab } from './SettingsTab';
import { MenuItemModal } from './MenuItemModal';

interface DashboardProps {
  restaurant: Restaurant;
  onLogout: () => void;
}

export const Dashboard = ({ restaurant, onLogout }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'menu' | 'settings'>('overview');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize menu items from localStorage or mock data
  useEffect(() => {
    const savedItems = localStorage.getItem(`menu_items_${restaurant.id}`);
    if (savedItems) {
      setMenuItems(JSON.parse(savedItems));
    } else {
      setMenuItems(INITIAL_MENU_ITEMS);
      localStorage.setItem(`menu_items_${restaurant.id}`, JSON.stringify(INITIAL_MENU_ITEMS));
    }
  }, [restaurant.id]);

  const saveToStorage = (items: MenuItem[]) => {
    localStorage.setItem(`menu_items_${restaurant.id}`, JSON.stringify(items));
    setMenuItems(items);
  };

  const handleSaveMenuItem = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    
    const itemData: MenuItem = {
      id: editingItem ? editingItem.id : Math.random().toString(36).substr(2, 9),
      restaurantId: restaurant.id,
      dishName: formData.get('dishName') as string,
      price: Number(formData.get('price')),
      category: formData.get('category') as string,
      isAvailable: true,
      imageUrl: `https://picsum.photos/seed/${formData.get('dishName')}/400/300`
    };

    setTimeout(() => {
      let newItems;
      if (editingItem) {
        newItems = menuItems.map(item => item.id === editingItem.id ? itemData : item);
      } else {
        newItems = [...menuItems, itemData];
      }
      saveToStorage(newItems);
      setIsAddingItem(false);
      setEditingItem(null);
      setIsSaving(false);
    }, 500);
  };

  const handleDeleteItem = (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa món này?')) return;
    const newItems = menuItems.filter(item => item.id !== id);
    saveToStorage(newItems);
  };

  const [settingsName, setSettingsName] = useState(restaurant.name);
  const [settingsDesc, setSettingsDesc] = useState(restaurant.description);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const handleSaveSettings = () => {
    setIsSavingSettings(true);
    setTimeout(() => {
      alert('Cập nhật thành công! (Dữ liệu giao diện đã được thay đổi)');
      setIsSavingSettings(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={onLogout} 
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {activeTab === 'overview' && 'Bảng điều khiển'}
              {activeTab === 'menu' && 'Quản lý thực đơn'}
              {activeTab === 'settings' && 'Cài đặt quán ăn'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right mr-4 hidden md:block">
              <p className="text-sm font-bold text-slate-900">{restaurant.name}</p>
              <p className="text-xs text-emerald-600 font-medium">Đang hoạt động</p>
            </div>
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
              <UserIcon className="w-5 h-5 text-slate-500" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && <OverviewTab menuItems={menuItems} />}
            {activeTab === 'menu' && (
              <MenuTab 
                menuItems={menuItems} 
                setIsAddingItem={setIsAddingItem} 
                setEditingItem={setEditingItem} 
                handleDeleteItem={handleDeleteItem} 
              />
            )}
            {activeTab === 'settings' && (
              <SettingsTab 
                settingsName={settingsName}
                setSettingsName={setSettingsName}
                settingsDesc={settingsDesc}
                setSettingsDesc={setSettingsDesc}
                isSavingSettings={isSavingSettings}
                handleSaveSettings={handleSaveSettings}
              />
            )}
          </AnimatePresence>
        </main>
      </div>

      <MenuItemModal 
        isOpen={isAddingItem}
        onClose={() => { setIsAddingItem(false); setEditingItem(null); }}
        editingItem={editingItem}
        handleSaveMenuItem={handleSaveMenuItem}
        isSaving={isSaving}
      />
    </div>
  );
};
