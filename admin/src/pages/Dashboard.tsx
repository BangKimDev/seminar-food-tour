
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Users, Eye, Headphones, MapPin, Utensils, Mic2,
  TrendingUp, Clock, Navigation, PlayCircle, Loader2, Activity,
  ArrowUp, ArrowDown
} from 'lucide-react';
import { motion } from 'motion/react';
import { dashboardService } from '../services/dashboardService';
import type { DashboardData, DailyTrendItem, VisitByHourItem, PopularRestaurantItem } from '../types';

const actionLabels: Record<string, string> = {
  view: 'đã xem',
  audio_play: 'đã nghe thuyết minh',
  navigation: 'đã chỉ đường',
};

const actionIcons: Record<string, React.ReactNode> = {
  view: <Eye className="w-4 h-4" />,
  audio_play: <PlayCircle className="w-4 h-4" />,
  navigation: <Navigation className="w-4 h-4" />,
};

const langLabels: Record<string, string> = {
  vi: 'Tiếng Việt',
  en: 'English',
  ja: '日本語',
  zh: '中文',
  ko: '한국어',
  fr: 'Français',
  es: 'Español',
};

const statusLabels: Record<string, string> = {
  approved: 'Đã duyệt',
  pending: 'Chờ duyệt',
  rejected: 'Từ chối',
};

const statusColors: Record<string, string> = {
  approved: 'text-green-600 bg-green-50',
  pending: 'text-yellow-600 bg-yellow-50',
  rejected: 'text-red-600 bg-red-50',
};

function formatTime(dateStr: string) {
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
}

function formatNumber(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

function statDelta(current: number, previous: number) {
  if (previous === 0) return { delta: 0, isUp: true };
  const pct = ((current - previous) / previous) * 100;
  return { delta: Math.round(pct), isUp: pct >= 0 };
}

// ─── Mini Bar Chart ──────────────────────────────────────────────────────────

function BarChart({ data, color, height = 140 }: {
  data: { label: string; value: number }[];
  color: string;
  height?: number;
}) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
          <span className="text-[10px] font-medium text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
            {d.value}
          </span>
          <div
            className={`w-full rounded-t ${color} transition-all duration-300`}
            style={{ height: `${(d.value / max) * 100}%`, minHeight: 4 }}
          />
          <span className="text-[9px] text-slate-400 truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadDashboard, 30000);
    return () => clearInterval(interval);
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

  return (
    <div className="space-y-8">
      {/* Header with Active Now */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Tổng quan</h2>
          <p className="text-sm text-slate-500 mt-1">Bảng điều khiển Food Tour</p>
        </div>
        <div className="flex items-center gap-3">
          {data.stats.activeNow > 0 && (
            <Badge variant="default" className="bg-green-500 hover:bg-green-600 flex items-center gap-1.5 px-3 py-1.5">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              {data.stats.activeNow} người đang dùng
            </Badge>
          )}
          <button
            onClick={loadDashboard}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors px-2 py-1"
          >
            Làm mới
          </button>
        </div>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Người dùng"
          value={formatNumber(data.stats.totalUsers)}
          sub={`${data.stats.usersThisMonth} trong tháng`}
          icon={Users}
          color="text-blue-600"
          bg="bg-blue-50"
          delay={0}
        />
        <StatCard
          label="Lượt tương tác"
          value={formatNumber(data.stats.totalVisits)}
          sub={`${data.stats.views} xem · ${data.stats.audioPlays} nghe · ${data.stats.navigations} chỉ đường`}
          icon={Activity}
          color="text-emerald-600"
          bg="bg-emerald-50"
          delay={0.1}
        />
        <StatCard
          label="Audio đã phát"
          value={formatNumber(data.stats.audioPlays)}
          sub={`${data.stats.totalVisits > 0 ? Math.round(data.stats.audioPlays / data.stats.totalVisits * 100) : 0}% tổng tương tác`}
          icon={Headphones}
          color="text-purple-600"
          bg="bg-purple-50"
          delay={0.2}
        />
        <StatCard
          label="Nhà hàng"
          value={formatNumber(data.stats.restaurants)}
          sub={`${data.stats.pois} POIs · ${data.stats.audioGuides} thuyết minh`}
          icon={Utensils}
          color="text-orange-600"
          bg="bg-orange-50"
          delay={0.3}
        />
      </div>

      {/* Daily Trend + Hourly Traffic */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-slate-200 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-4 h-4 text-slate-400" />
              Xu hướng 30 ngày
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.dailyTrend.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">Chưa có dữ liệu</p>
            ) : (
              <div className="flex items-end gap-1" style={{ height: 160 }}>
                {data.dailyTrend.map((d, i) => {
                  const maxVisits = Math.max(...data.dailyTrend.map(x => x.visits), 1);
                  const isToday = i === data.dailyTrend.length - 1;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                      <span className="text-[9px] font-medium text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-5">
                        {d.visits}
                      </span>
                      <div
                        className={`w-full rounded-t transition-all duration-300 ${isToday ? 'bg-emerald-500' : 'bg-emerald-200 hover:bg-emerald-400'}`}
                        style={{ height: `${(d.visits / maxVisits) * 100}%`, minHeight: 4 }}
                      />
                      <span className="text-[8px] text-slate-400 truncate w-full text-center">
                        {d.date.slice(5)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="flex items-center justify-between mt-4 text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-200" /> Lượt truy cập
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Hôm nay
                </span>
              </div>
              {data.dailyTrend.length >= 2 && (
                <span>
                  TB {(data.dailyTrend.reduce((a, b) => a + b.visits, 0) / data.dailyTrend.length).toFixed(0)} / ngày
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="w-4 h-4 text-slate-400" />
              Giờ hoạt động
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.visitsByHour.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">Chưa có dữ liệu</p>
            ) : (
              <div className="flex items-end gap-1" style={{ height: 120 }}>
                {data.visitsByHour.map((h, i) => {
                  const maxCount = Math.max(...data.visitsByHour.map(x => x.count), 1);
                  const isPeak = h.count >= Math.max(...data.visitsByHour.map(x => x.count));
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                      <div
                        className={`w-full rounded-t transition-all duration-300 ${isPeak ? 'bg-amber-500' : 'bg-amber-200 hover:bg-amber-400'}`}
                        style={{ height: `${(h.count / maxCount) * 100}%`, minHeight: 4 }}
                      />
                      <span className="text-[8px] text-slate-400">{h.hour}h</span>
                    </div>
                  );
                })}
              </div>
            )}
            {data.visitsByHour.length > 0 && (
              <p className="text-xs text-slate-500 mt-4 text-center">
                Cao điểm: <span className="font-semibold text-amber-600">
                  {data.visitsByHour.reduce((a, b) => a.count > b.count ? a : b).hour}h
                </span>
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Popular Restaurants + Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-slate-200 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-4 h-4 text-slate-400" />
              Nhà hàng phổ biến
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">#</TableHead>
                  <TableHead>Nhà hàng</TableHead>
                  <TableHead className="text-right">
                    <span className="flex items-center gap-1 justify-end"><Eye className="w-3 h-3" /> Xem</span>
                  </TableHead>
                  <TableHead className="text-right">
                    <span className="flex items-center gap-1 justify-end"><Headphones className="w-3 h-3" /> Nghe</span>
                  </TableHead>
                  <TableHead className="text-right">
                    <span className="flex items-center gap-1 justify-end"><Navigation className="w-3 h-3" /> Đường</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.popularRestaurants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-slate-400 py-8">
                      Chưa có dữ liệu
                    </TableCell>
                  </TableRow>
                ) : (
                  data.popularRestaurants.map((r, i) => (
                    <TableRow key={r.id}>
                      <TableCell className="text-slate-400 font-medium">{i + 1}</TableCell>
                      <TableCell className="font-medium text-slate-800">{r.name}</TableCell>
                      <TableCell className="text-right font-medium">{formatNumber(r.views)}</TableCell>
                      <TableCell className="text-right text-purple-600 font-medium">{formatNumber(r.audioPlays)}</TableCell>
                      <TableCell className="text-right text-blue-600 font-medium">{formatNumber(r.navigations)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Mic2 className="w-4 h-4 text-slate-400" />
                Ngôn ngữ thuyết minh
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.languageDistribution.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">Chưa có</p>
                ) : (
                  data.languageDistribution.map((l, i) => {
                    const maxCount = Math.max(...data.languageDistribution.map(x => x.count), 1);
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-600">{langLabels[l.language] || l.language}</span>
                          <span className="font-medium">{l.count}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: `${(l.count / maxCount) * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="w-4 h-4 text-slate-400" />
                Trạng thái nhà hàng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.restaurantByStatus.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">Chưa có</p>
                ) : (
                  data.restaurantByStatus.map((s, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[s.status] || 'text-slate-600 bg-slate-50'}`}>
                        {statusLabels[s.status] || s.status}
                      </span>
                      <span className="font-semibold text-slate-700">{s.count}</span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="w-4 h-4 text-slate-400" />
            Hoạt động gần đây
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.recentActivity.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">Chưa có hoạt động</p>
            ) : (
              data.recentActivity.map((item, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className={`p-1.5 rounded-full bg-slate-100 text-slate-500 mt-0.5`}>
                    {actionIcons[item.action] || <Eye className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700">
                      <span className="font-medium text-primary truncate">{item.restaurantName}</span>{' '}
                      <span className="text-slate-500">{actionLabels[item.action] || item.action}</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{formatTime(item.createdAt)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ─── StatCard Sub-component ──────────────────────────────────────────────────

function StatCard({ label, value, sub, icon: Icon, color, bg, delay }: {
  label: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="border-slate-200">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-2">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
            <div className={`${bg} p-2 rounded-lg`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
          <p className="text-[11px] text-slate-400 mt-1">{sub}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
