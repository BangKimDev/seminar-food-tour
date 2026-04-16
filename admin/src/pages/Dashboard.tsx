
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Utensils, Mic2, TrendingUp, Users, Clock, Eye, PlayCircle, Navigation } from 'lucide-react';
import { motion } from 'motion/react';
import { dashboardService } from '../services/dashboardService';
import { DashboardData } from '../types';
import { Loader2 } from 'lucide-react';

const actionIcons: Record<string, React.ReactNode> = {
  view: <Eye className="w-4 h-4" />,
  audio_play: <PlayCircle className="w-4 h-4" />,
  navigation: <Navigation className="w-4 h-4" />,
};

const actionLabels: Record<string, string> = {
  view: 'đã xem',
  audio_play: 'đã nghe thuyết minh',
  navigation: 'đã chỉ đường',
};

const categoryLabels: Record<string, string> = {
  main: 'Điểm chính',
  restaurant: 'Nhà hàng',
  cafe: 'Quán cà phê',
  market: 'Chợ',
  wc: 'Nhà vệ sinh',
  parking: 'Bãi đỗ xe',
  ticket: 'Bán vé',
  boat: 'Bến thuyền',
};

const categoryColors: Record<string, string> = {
  main: 'bg-blue-500',
  restaurant: 'bg-orange-500',
  cafe: 'bg-amber-500',
  market: 'bg-yellow-500',
  wc: 'bg-green-500',
  parking: 'bg-purple-500',
  ticket: 'bg-pink-500',
  boat: 'bg-cyan-500',
};

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const result = await dashboardService.getStats();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        {error || 'Failed to load dashboard'}
      </div>
    );
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const formatViews = (views: number) => {
    if (views >= 1000) return `${(views / 1000).toFixed(1)}k`;
    return views.toString();
  };

  const stats = [
    { label: 'Tổng số POIs', value: data.stats.pois.toString(), icon: MapPin, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Quán ăn', value: data.stats.restaurants.toString(), icon: Utensils, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Thuyết minh', value: data.stats.audioGuides.toString(), icon: Mic2, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Lượt truy cập', value: formatViews(data.stats.visits), icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50' },
  ];

  const maxPoiCount = Math.max(...data.poiDistribution.map(p => p.count), 1);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                      <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                    </div>
                    <div className={`${stat.bg} p-3 rounded-xl`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-400" />
              Hoạt động gần đây
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {data.recentActivity.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">Chưa có hoạt động nào</p>
              ) : (
                data.recentActivity.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className={`p-1.5 rounded-full bg-slate-100 text-slate-500`}>
                      {actionIcons[item.action] || <Eye className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-700">
                        <span className="font-medium text-primary">{item.restaurantName}</span>{' '}
                        <span className="text-slate-500">{actionLabels[item.action] || item.action}</span>
                      </p>
                      <p className="text-xs text-slate-400 mt-1">{formatTime(item.createdAt)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-slate-400" />
              Phân bổ POIs theo loại
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.poiDistribution.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">Chưa có POI nào</p>
              ) : (
                data.poiDistribution.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">{categoryLabels[item.category] || item.category}</span>
                      <span className="font-medium">{item.count}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${categoryColors[item.category] || 'bg-slate-500'}`}
                        style={{ width: `${(item.count / maxPoiCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Utensils className="w-5 h-5 text-slate-400" />
            Quán ăn mới tham gia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.recentRestaurants.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">Chưa có quán ăn nào</p>
            ) : (
              data.recentRestaurants.map((restaurant, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{restaurant.name}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {formatTime(restaurant.createdAt)} • {restaurant.views.toLocaleString()} lượt xem
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    restaurant.status === 'approved' ? 'bg-green-100 text-green-700' :
                    restaurant.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {restaurant.status === 'approved' ? 'Đã duyệt' :
                     restaurant.status === 'pending' ? 'Chờ duyệt' : 'Từ chối'}
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
