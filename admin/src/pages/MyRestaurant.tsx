import React, { useState, useEffect } from 'react';
import { Restaurant } from '@/src/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { Store, Loader2, Save } from 'lucide-react';
import { restaurantService } from '@/src/services/restaurantService';

interface MyRestaurantProps {
  restaurantId: string;
}

export const MyRestaurant: React.FC<MyRestaurantProps> = ({ restaurantId }) => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [formData, setFormData] = useState<Partial<Restaurant>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Tạm thời fetch từ mock restaurantService cho dễ
    // Nếu API có endpoint getById thì dùng, ở đây ta dùng list rùi filter
    restaurantService.list().then(res => {
      const myRes = res.find(r => r.id === restaurantId);
      if (myRes) {
        setRestaurant(myRes);
        setFormData(myRes);
      } else {
        toast.error('Không tìm thấy thông tin quán ăn của bạn!');
      }
      setIsLoading(false);
    }).catch(() => {
      toast.error('Lỗi tải thông tin quán ăn');
      setIsLoading(false);
    });
  }, [restaurantId]);

  const handleSave = async () => {
    if (!formData.name || !formData.description) {
      toast.error('Vui lòng điền tên quán và mô tả');
      return;
    }
    
    setIsSaving(true);
    try {
      const updated = await restaurantService.update(restaurantId, formData);
      setRestaurant(updated);
      setFormData(updated);
      toast.success('Đã lưu thông tin quán ăn thành công');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi cập nhật quán ăn');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex flex-col h-[400px] items-center justify-center text-slate-400 space-y-4">
        <Store className="w-16 h-16 opacity-20" />
        <p>Không có dữ liệu quán ăn.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-xl">Thông tin quán ăn của tôi</CardTitle>
              <CardDescription>Cập nhật mô tả, giờ mở cửa và thông tin để sinh thuyết minh</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="res-name">Tên quán ăn <span className="text-red-500">*</span></Label>
              <Input 
                id="res-name" 
                placeholder="Nhập tên quán..." 
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="res-cuisine">Phân loại ẩm thực</Label>
              <Input 
                id="res-cuisine" 
                placeholder="VD: Cơm tấm, Phở, Hải sản..." 
                value={formData.cuisine || ''}
                onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="res-hours">Giờ mở cửa</Label>
              <Input 
                id="res-hours" 
                placeholder="VD: 08:00 - 22:00" 
                value={formData.openingHours || ''}
                onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="res-desc">
              Mô tả quán ăn (Nội dung thuyết minh) <span className="text-red-500">*</span>
            </Label>
            <Textarea 
              id="res-desc" 
              placeholder="Nhập phần giải thiệu hấp dẫn để hệ thống sinh Audio Thuyết Minh..." 
              className="min-h-[160px] resize-y"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <p className="text-[11px] text-slate-500 italic mt-2 bg-blue-50/50 p-2 rounded border border-blue-100">
              💡 Lưu ý: Nội dung này sẽ được sử dụng làm kịch bản gốc để dịch sang nhiều ngôn ngữ khác nhau và tạo giọng đọc tự động. Hãy viết thật sinh động nhé!
            </p>
          </div>
        </CardContent>
        <CardFooter className="bg-slate-50/50 border-t border-slate-100 justify-end py-4">
          <Button onClick={handleSave} disabled={isSaving} className="gap-2 min-w-[120px]">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Lưu thay đổi
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
