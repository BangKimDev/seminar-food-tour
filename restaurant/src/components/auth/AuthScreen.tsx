/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Utensils, 
  MapPin, 
  CheckCircle2, 
  LayoutDashboard, 
  Mail, 
  Lock, 
  AlertCircle, 
  ChevronRight 
} from 'lucide-react';
import { motion } from 'motion/react';
import { SystemUser } from '../../types';
import { SAMPLE_USER } from '../../constants';

interface AuthScreenProps {
  onLogin: (user: SystemUser) => void;
}

export const AuthScreen = ({ onLogin }: AuthScreenProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate network delay
    setTimeout(() => {
      if (email === 'admin@foodstreet.vn' && password === '123456') {
        onLogin(SAMPLE_USER);
      } else {
        setError('Email hoặc mật khẩu không chính xác.');
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-6">
      <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-[32px] shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-100">
        {/* Left Side: Branding/Info */}
        <div className="md:w-1/2 bg-emerald-600 p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/20 rounded-full -ml-32 -mb-32 blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
              <Utensils className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4 leading-tight">FoodStreet<br />Manager</h1>
            <p className="text-emerald-50/80 text-lg leading-relaxed">
              Giải pháp quản lý quán ăn chuyên nghiệp dành cho các chủ hộ kinh doanh tại phố ẩm thực.
            </p>
          </div>

          <div className="relative z-10 mt-12">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/30 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">Quản lý menu món ăn linh hoạt</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/30 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">Tự động thuyết minh GPS cho khách</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/30 flex items-center justify-center">
                  <LayoutDashboard className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">Báo cáo doanh thu đơn giản</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="md:w-1/2 p-10 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Đăng nhập hệ thống</h2>
            <p className="text-slate-500">
              Vui lòng nhập tài khoản quản lý của bạn.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email / Tài khoản</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@foodstreet.vn"
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all bg-slate-50/50"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all bg-slate-50/50"
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-red-500 text-xs font-medium bg-red-50 p-4 rounded-2xl flex items-center gap-3 border border-red-100"
              >
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </motion.div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Đăng nhập ngay
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Tài khoản trải nghiệm</p>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>User: <span className="font-mono font-bold text-emerald-600">admin@foodstreet.vn</span></span>
              <span>Pass: <span className="font-mono font-bold text-emerald-600">123456</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
