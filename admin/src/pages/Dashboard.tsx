
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Utensils, Mic2, TrendingUp, Users, Clock } from 'lucide-react';
import { motion } from 'motion/react';

export const Dashboard: React.FC = () => {
  const stats = [
    { label: 'Tổng số POIs', value: '124', icon: MapPin, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Quán ăn', value: '42', icon: Utensils, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Thuyết minh', value: '156', icon: Mic2, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Lượt truy cập', value: '2.4k', icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50' },
  ];

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
              {[
                { user: 'Admin', action: 'đã thêm POI mới', target: 'Bến thuyền Tràng An', time: '2 phút trước' },
                { user: 'Admin', action: 'đã cập nhật quán ăn', target: 'Nhà hàng Thăng Long', time: '15 phút trước' },
                { user: 'System', action: 'đã tạo thuyết minh (EN)', target: 'Quán dê núi 123', time: '1 giờ trước' },
                { user: 'Admin', action: 'đã xóa POI', target: 'Điểm phụ WC 02', time: '3 giờ trước' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <p className="text-sm text-slate-700">
                      <span className="font-semibold">{item.user}</span> {item.action}{' '}
                      <span className="font-medium text-primary">"{item.target}"</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1">{item.time}</p>
                  </div>
                </div>
              ))}
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
              {[
                { label: 'Điểm chính', count: 45, color: 'bg-blue-500' },
                { label: 'WC', count: 22, color: 'bg-green-500' },
                { label: 'Bán vé', count: 12, color: 'bg-orange-500' },
                { label: 'Gửi xe', count: 30, color: 'bg-purple-500' },
                { label: 'Bến thuyền', count: 15, color: 'bg-red-500' },
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">{item.label}</span>
                    <span className="font-medium">{item.count}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.color}`} 
                      style={{ width: `${(item.count / 124) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
