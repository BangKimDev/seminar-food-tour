/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { User as UserIcon } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { Restaurant, MenuItem } from '../../types';
import { INITIAL_MENU_ITEMS } from '../../constants';
import { restaurantService, RestaurantData, MenuItemData } from '../../services/restaurantService';
import { Sidebar } from './Sidebar';
import { OverviewTab } from './OverviewTab';
import { MenuTab } from './MenuTab';
import { SettingsTab } from './SettingsTab';
import { MenuItemModal } from './MenuItemModal';

interface DashboardProps {
  restaurant: Restaurant;
  onLogout: () => void;
  onRestaurantUpdate: (data: RestaurantData) => void;
}

export const Dashboard = ({ restaurant, onLogout, onRestaurantUpdate }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'menu' | 'settings'>('overview');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [entryCount, setEntryCount] = useState(0);
  const [audioPlayCount, setAudioPlayCount] = useState(0);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch live stats (entryCount, audioPlayCount)
  useEffect(() => {
    (async () => {
      try {
        const stats = await restaurantService.getOwnerStats(restaurant.id);
        setEntryCount(stats.entryCount);
        setAudioPlayCount(stats.audioPlayCount);
      } catch {}
    })();
    const interval = setInterval(async () => {
      try {
        const stats = await restaurantService.getOwnerStats(restaurant.id);
        setEntryCount(stats.entryCount);
        setAudioPlayCount(stats.audioPlayCount);
      } catch {}
    }, 15000);
    return () => clearInterval(interval);
  }, [restaurant.id]);

  // Initialize menu items: DB first, fallback to localStorage
  useEffect(() => {
    (async () => {
      try {
        const dbItems = await restaurantService.getMenu(restaurant.id);
        if (dbItems && dbItems.length > 0) {
          const mapped: MenuItem[] = dbItems.map(item => ({
            id: item.id,
            restaurantId: item.restaurantId,
            dishName: item.dishName,
            price: item.price,
            description: item.description,
            category: item.category,
            imageUrl: item.imageUrl,
            isAvailable: item.isAvailable,
            createdAt: new Date().toISOString(),
          }));
          localStorage.setItem(`menu_items_${restaurant.id}`, JSON.stringify(mapped));
          setMenuItems(mapped);
          return;
        }
      } catch {}

      // Fallback to localStorage / mock
      const savedItems = localStorage.getItem(`menu_items_${restaurant.id}`);
      const savedUser = localStorage.getItem('foodstreet_user');
      const isDemoAdmin = savedUser && (() => { try { return JSON.parse(savedUser).email === 'admin@foodstreet.vn'; } catch { return false; } })();

      if (savedItems && isDemoAdmin) {
        setMenuItems(JSON.parse(savedItems));
      } else if (savedItems && !isDemoAdmin) {
        localStorage.removeItem(`menu_items_${restaurant.id}`);
        setMenuItems([]);
      } else if (isDemoAdmin) {
        setMenuItems(INITIAL_MENU_ITEMS);
        localStorage.setItem(`menu_items_${restaurant.id}`, JSON.stringify(INITIAL_MENU_ITEMS));
      } else {
        setMenuItems([]);
      }
    })();
  }, [restaurant.id]);

  const saveToStorage = (items: MenuItem[]) => {
    localStorage.setItem(`menu_items_${restaurant.id}`, JSON.stringify(items));
    setMenuItems(items);
  };

  const handleSaveMenuItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);

    const itemData = {
      dishName: formData.get('dishName') as string,
      price: Number(formData.get('price')),
      category: (formData.get('category') as string) || undefined,
      description: (formData.get('description') as string) || undefined,
      imageUrl: (formData.get('imageUrl') as string) || undefined,
      isAvailable: formData.get('isAvailable') === 'true',
      isFeatured: formData.get('isFeatured') === 'true',
    };

    try {
      let savedId = editingItem ? editingItem.id : '';
      let savedRestaurantId = restaurant.id;

      if (editingItem) {
        const updated = await restaurantService.updateMenuItem(editingItem.id, itemData);
        savedId = updated.id;
        savedRestaurantId = updated.restaurantId;
      } else {
        const created = await restaurantService.createMenuItem(restaurant.id, itemData);
        savedId = created.id;
        savedRestaurantId = created.restaurantId;
      }

      const fullItem: MenuItem = {
        id: savedId,
        restaurantId: savedRestaurantId,
        ...itemData,
        cropX: Number(formData.get('cropX')) || 0,
        cropY: Number(formData.get('cropY')) || 0,
        createdAt: new Date().toISOString(),
      };

      let newItems;
      if (editingItem) {
        newItems = menuItems.map(item => item.id === editingItem.id ? fullItem : item);
      } else {
        newItems = [fullItem, ...menuItems];
      }
      saveToStorage(newItems);
      setIsAddingItem(false);
      setEditingItem(null);
    } catch (err) {
      console.error('Failed to save menu item:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await restaurantService.deleteMenuItem(id);
    } catch (err) {
      console.error('Failed to delete menu item:', err);
    }
    const newItems = menuItems.filter(item => item.id !== id);
    saveToStorage(newItems);
  };

  const handleToggleFeatured = async (id: string, isFeatured: boolean) => {
    try {
      await restaurantService.toggleFeatured(id, isFeatured);
      const newItems = menuItems.map(item => item.id === id ? { ...item, isFeatured } : item);
      saveToStorage(newItems);
    } catch (err) {
      console.error('Failed to toggle featured:', err);
    }
  };

  const [settingsName, setSettingsName] = useState(restaurant.name);
  const [settingsDesc, setSettingsDesc] = useState(restaurant.description);
  const [settingsImageUrl, setSettingsImageUrl] = useState(restaurant.imageUrl || '');
  const [settingsLat, setSettingsLat] = useState(String(restaurant.location?.lat || ''));
  const [settingsLng, setSettingsLng] = useState(String(restaurant.location?.lng || ''));
  const [settingsCuisine, setSettingsCuisine] = useState(restaurant.cuisine || '');
  const [settingsOpeningHours, setSettingsOpeningHours] = useState(restaurant.openingHours || '');
  const [settingsUsername, setSettingsUsername] = useState('');
  const [settingsEmail, setSettingsEmail] = useState('');
  const [settingsAddress, setSettingsAddress] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('foodstreet_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setSettingsUsername(user.username || '');
        setSettingsEmail(user.email || '');
        setSettingsAddress(user.address || '');
      } catch {}
    }
    const savedOwner = localStorage.getItem('owner_user');
    if (savedOwner) {
      try {
        const user = JSON.parse(savedOwner);
        setSettingsUsername(user.username || settingsUsername);
        setSettingsEmail(user.email || settingsEmail);
        setSettingsAddress(user.address || settingsAddress);
      } catch {}
    }
  }, []);

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      // Persist to API
      const updated = await restaurantService.updateRestaurant(restaurant.id, {
        name: settingsName,
        description: settingsDesc,
        cuisine: settingsCuisine || undefined,
        imageUrl: settingsImageUrl || undefined,
        openingHours: settingsOpeningHours || undefined,
        address: settingsAddress || undefined,
      });
      onRestaurantUpdate(updated);

      // Persist username/email/address to localStorage
      try {
        const raw = localStorage.getItem('foodstreet_user');
        if (raw) {
          const user = JSON.parse(raw);
          user.username = settingsUsername;
          user.email = settingsEmail;
          user.address = settingsAddress;
          localStorage.setItem('foodstreet_user', JSON.stringify(user));
        }
        const raw2 = localStorage.getItem('owner_user');
        if (raw2) {
          const user = JSON.parse(raw2);
          user.username = settingsUsername;
          user.email = settingsEmail;
          user.address = settingsAddress;
          localStorage.setItem('owner_user', JSON.stringify(user));
        }
      } catch {}
    } catch (err: any) {
      console.error('Failed to save settings:', err);
    }
    setTimeout(() => {
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
            <div className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-200 overflow-hidden bg-slate-100">
              {restaurant.imageUrl ? (
                <img src={restaurant.imageUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-5 h-5 text-slate-500" />
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-10 py-8">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && <OverviewTab menuItems={menuItems} restaurant={restaurant} entryCount={entryCount} audioPlayCount={audioPlayCount} />}
            {activeTab === 'menu' && (
              <MenuTab 
                menuItems={menuItems} 
                setIsAddingItem={setIsAddingItem} 
                setEditingItem={setEditingItem} 
                handleDeleteItem={handleDeleteItem} 
                handleToggleFeatured={handleToggleFeatured}
              />
            )}
            {activeTab === 'settings' && (
              <SettingsTab
                settingsName={settingsName}
                setSettingsName={setSettingsName}
                settingsDesc={settingsDesc}
                setSettingsDesc={setSettingsDesc}
                settingsImageUrl={settingsImageUrl}
                setSettingsImageUrl={setSettingsImageUrl}
                settingsLat={settingsLat}
                setSettingsLat={setSettingsLat}
                settingsLng={settingsLng}
                setSettingsLng={setSettingsLng}
                settingsCuisine={settingsCuisine}
                setSettingsCuisine={setSettingsCuisine}
                settingsOpeningHours={settingsOpeningHours}
                setSettingsOpeningHours={setSettingsOpeningHours}
                settingsUsername={settingsUsername}
                setSettingsUsername={setSettingsUsername}
                settingsEmail={settingsEmail}
                setSettingsEmail={setSettingsEmail}
                settingsAddress={settingsAddress}
                setSettingsAddress={setSettingsAddress}
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
