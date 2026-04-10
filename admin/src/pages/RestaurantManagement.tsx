
import React, { useState } from 'react';
import { POI, Restaurant } from '@/src/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Trash2, Edit2, Utensils, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface RestaurantManagementProps {
  restaurants: Restaurant[];
  pois: POI[];
  onAdd: (restaurant: Omit<Restaurant, 'id' | 'createdAt'>) => void;
  onDelete: (id: string) => void;
}

export const RestaurantManagement: React.FC<RestaurantManagementProps> = ({ 
  restaurants, 
  pois, 
  onAdd, 
  onDelete 
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newRestaurant, setNewRestaurant] = useState<Partial<Restaurant>>({});

  const filteredRestaurants = restaurants.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = () => {
    if (!newRestaurant.name || !newRestaurant.poiId || !newRestaurant.description) {
      toast.error('Vui lòng điền đầy đủ thông tin và chọn POI liên kết');
      return;
    }
    onAdd(newRestaurant as Omit<Restaurant, 'id' | 'createdAt'>);
    setIsAdding(false);
    setNewRestaurant({});
    toast.success('Đã thêm quán ăn mới thành công');
  };

  const getPoiName = (id: string) => pois.find(p => p.id === id)?.name || 'N/A';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative w-72">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Tìm kiếm quán ăn..." 
            className="pl-10" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => setIsAdding(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm quán ăn
        </Button>
      </div>

      <Card className="border-slate-200">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên quán ăn</TableHead>
                <TableHead>POI liên kết</TableHead>
                <TableHead>Ẩm thực</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRestaurants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                    Không tìm thấy quán ăn nào
                  </TableCell>
                </TableRow>
              ) : (
                filteredRestaurants.map((res) => (
                  <TableRow key={res.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Utensils className="w-4 h-4 text-orange-500" />
                        {res.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-slate-600">
                        <MapPin className="w-3 h-3" />
                        {getPoiName(res.poiId)}
                      </div>
                    </TableCell>
                    <TableCell>{res.cuisine || 'Chưa cập nhật'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => onDelete(res.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isAdding} onOpenChange={setIsAdding}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Thêm quán ăn mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="res-name">Tên quán ăn</Label>
                <Input 
                  id="res-name" 
                  placeholder="Nhập tên quán..." 
                  value={newRestaurant.name || ''}
                  onChange={(e) => setNewRestaurant({ ...newRestaurant, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="res-poi">POI liên kết</Label>
                <Select 
                  value={newRestaurant.poiId} 
                  onValueChange={(val) => setNewRestaurant({ ...newRestaurant, poiId: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn POI" />
                  </SelectTrigger>
                  <SelectContent>
                    {pois.map((poi) => (
                      <SelectItem key={poi.id} value={poi.id}>{poi.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="res-cuisine">Loại ẩm thực</Label>
                <Input 
                  id="res-cuisine" 
                  placeholder="VD: Đặc sản Ninh Bình" 
                  value={newRestaurant.cuisine || ''}
                  onChange={(e) => setNewRestaurant({ ...newRestaurant, cuisine: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="res-hours">Giờ mở cửa</Label>
                <Input 
                  id="res-hours" 
                  placeholder="VD: 08:00 - 22:00" 
                  value={newRestaurant.openingHours || ''}
                  onChange={(e) => setNewRestaurant({ ...newRestaurant, openingHours: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="res-desc">Mô tả quán ăn (Nội dung thuyết minh)</Label>
              <Textarea 
                id="res-desc" 
                placeholder="Nhập mô tả chi tiết để sinh thuyết minh..." 
                className="min-h-[120px]"
                value={newRestaurant.description || ''}
                onChange={(e) => setNewRestaurant({ ...newRestaurant, description: e.target.value })}
              />
              <p className="text-[10px] text-slate-400 italic">
                * Nội dung này sẽ được dùng làm dữ liệu gốc để dịch và sinh file âm thanh.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAdding(false)}>Hủy</Button>
            <Button onClick={handleSave}>Lưu quán ăn</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
