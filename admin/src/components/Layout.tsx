
import React from 'react';
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  Utensils, 
  Mic2, 
  LogOut,
  ChevronRight,
  User,
  QrCode
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AppState, AuthUser } from '@/src/types';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: AppState;
  user: AuthUser;
  onTabChange: (tab: AppState) => void;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  user,
  onTabChange,
  onLogout 
}) => {
  const isOwner = user.role === 'restaurant_owner';

  const menuItems = isOwner ? [
    { id: 'my_restaurant', label: 'Quán ăn của tôi', icon: Utensils },
    { id: 'audio', label: 'Quản lý thuyết minh', icon: Mic2 },
  ] : [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pois', label: 'Quản lý POIs', icon: MapIcon },
    { id: 'restaurants', label: 'Quản lý quán ăn', icon: Utensils },
    { id: 'audio', label: 'Quản lý thuyết minh', icon: Mic2 },
    { id: 'qr', label: 'QR Code', icon: QrCode },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3 text-primary font-bold text-xl">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
              <MapIcon className="w-5 h-5" />
            </div>
            <span>POI Admin</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id as AppState)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="ml-auto w-4 h-4" />}
              </button>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
          <Separator className="mb-4" />
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
              <User className="w-4 h-4 text-slate-500" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{user.displayName}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={onLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Đăng xuất
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-bottom border-slate-200 flex items-center px-8 justify-between">
          <h1 className="text-lg font-semibold text-slate-800">
            {menuItems.find(i => i.id === activeTab)?.label}
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-xs text-slate-400 font-mono">
              SYSTEM v1.0.0
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
