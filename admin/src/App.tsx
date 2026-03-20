import React, { useEffect, useState } from 'react';
import { LogIn, MapPin, Route, LogOut, LayoutDashboard, Lock, User as UserIcon, AlertCircle } from 'lucide-react';
import POIAdmin from './components/POIAdmin';
import TourAdmin from './components/TourAdmin';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Tab = 'pois' | 'tours';

// Hardcoded admin credentials
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'password123'
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('tours'); // Default to tours as in image
  
  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    // Check if user was previously logged in
    const savedLogin = localStorage.getItem('isLoggedIn');
    if (savedLogin === 'true') {
      setIsLoggedIn(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoggingIn(true);
    
    // Simulate a small delay for better UX
    setTimeout(() => {
      if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        setIsLoggedIn(true);
        localStorage.setItem('isLoggedIn', 'true');
      } else {
        setError('Tài khoản hoặc mật khẩu hệ thống không chính xác.');
      }
      setIsLoggingIn(false);
    }, 500);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-zinc-50 p-4">
        <div className="p-8 bg-white rounded-2xl shadow-xl border border-zinc-200 max-w-md w-full">
          <div className="mb-6 flex justify-center">
            <div className="p-4 bg-zinc-900 rounded-2xl">
              <LayoutDashboard className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-2 text-center">Hệ Thống Quản Trị</h1>
          <p className="text-zinc-500 mb-8 text-center">Sử dụng tài khoản hệ thống để truy cập</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 ml-1">Tên đăng nhập</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
                  placeholder="admin"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 ml-1">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-lg shadow-zinc-200"
            >
              {isLoggingIn ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn className="w-5 h-5" />
              )}
              Đăng nhập hệ thống
            </button>
          </form>
          
          <div className="mt-8 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
            <p className="text-xs font-bold text-zinc-400 uppercase mb-2">Tài khoản Admin:</p>
            <p className="text-xs text-zinc-600">User: <code className="bg-zinc-200 px-1 rounded">admin</code></p>
            <p className="text-xs text-zinc-600">Pass: <code className="bg-zinc-200 px-1 rounded">password123</code></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-zinc-50 border-r border-zinc-200 flex flex-col">
        <div className="p-6 bg-blue-600 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">GPS ADMIN</span>
            <LayoutDashboard className="w-4 h-4 opacity-80" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">GPS</h1>
          <p className="text-xs opacity-80">Hoi An Tours</p>
        </div>

        <nav className="flex-1 py-4">
          <button
            onClick={() => setActiveTab('tours')}
            className={cn(
              "w-full flex items-center gap-3 px-6 py-3 transition-all font-medium text-sm",
              activeTab === 'tours' 
                ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600" 
                : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
            )}
          >
            <MapPin className="w-5 h-5" />
            Tours
          </button>
          <button
            onClick={() => setActiveTab('pois')}
            className={cn(
              "w-full flex items-center gap-3 px-6 py-3 transition-all font-medium text-sm",
              activeTab === 'pois' 
                ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600" 
                : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
            )}
          >
            <Route className="w-5 h-5" />
            Map
          </button>
        </nav>

        <div className="p-6 border-t border-zinc-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-red-500 hover:text-red-600 transition-all font-medium text-sm"
          >
            <LogOut className="w-4 h-4 rotate-180" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden bg-white">
        {activeTab === 'pois' ? <POIAdmin /> : <TourAdmin />}
      </main>
    </div>
  );
}
