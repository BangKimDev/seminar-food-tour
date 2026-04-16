
import React, { useState } from 'react';
import { POI, Restaurant } from '../types';
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
  onUpdate: (id: string, restaurant: Partial<Omit<Restaurant, 'id' | 'createdAt'>>) => void;
  onDelete: (id: string) => void;
}

export const RestaurantManagement: React.FC<RestaurantManagementProps> = ({ 
  restaurants, 
  pois, 
  onAdd, 
  onUpdate,
  onDelete 
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Partial<Restaurant>>({});

  const filteredRestaurants = restaurants.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = () => {
    if (!formData.name || !formData.poiId || !formData.description) {
      toast.error('Vui lòng điền đầy đủ thông tin và chọn POI liên kết');
      return;
    }
    onAdd({
      name: formData.name,
      poiId: formData.poiId,
      description: formData.description,
      cuisine: formData.cuisine,
      openingHours: formData.openingHours,
      status: 'approved',
    });
    setIsAdding(false);
    setFormData({});
    toast.success('Đã thêm quán ăn mới thành công');
  };

  const handleUpdate = () => {
    if (!editingId || !formData.name || !formData.description) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    onUpdate(editingId, {
      name: formData.name,
      description: formData.description,
      cuisine: formData.cuisine,
      openingHours: formData.openingHours,
    });
    setIsEditing(false);
    setEditingId(null);
    setFormData({});
    toast.success('Đã cập nhật quán ăn thành công');
  };

  const openEditDialog = (restaurant: Restaurant) => {
    setEditingId(restaurant.id);
    setFormData({
      name: restaurant.name,
      poiId: restaurant.poiId,
      description: restaurant.description,
      cuisine: restaurant.cuisine,
      openingHours: restaurant.openingHours,
    });
    setIsEditing(true);
  };

  const getPoiName = (id: string | undefined) => {
    if (!id) return 'Chưa liên kết';
    return pois.find(p => p.id === id)?.name || 'N/A';
  };

  const closeDialog = () => {
    setIsAdding(false);
    setIsEditing(false);
    setEditingId(null);
    setFormData({});
  };

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
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRestaurants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">
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
                    <TableCell>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        res.status === 'approved' ? 'bg-green-100 text-green-700' :
                        res.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {res.status === 'approved' ? 'Đã duyệt' :
                         res.status === 'pending' ? 'Chờ duyệt' : 'Từ chối'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => openEditDialog(res)}
                        >
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

      {/* Add Dialog */}
      <Dialog open={isAdding} onOpenChange={closeDialog}>
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
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="res-poi">POI liên kết</Label>
                <Select 
                  value={formData.poiId} 
                  onValueChange={(val) => setFormData({ ...formData, poiId: val })}
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
                  value={formData.cuisine || ''}
                  onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
                />
              </div>
              <div className="space-y-2">
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
              <Label htmlFor="res-desc">Mô tả quán ăn (Nội dung thuyết minh)</Label>
              <Textarea 
                id="res-desc" 
                placeholder="Nhập mô tả chi tiết để sinh thuyết minh..." 
                className="min-h-[120px]"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <p className="text-[10px] text-slate-400 italic">
                * Nội dung này sẽ được dùng làm dữ liệu gốc để dịch và sinh file âm thanh.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Hủy</Button>
            <Button onClick={handleSave}>Lưu quán ăn</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={closeDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa quán ăn</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Tên quán ăn</Label>
              <Input 
                id="edit-name" 
                placeholder="Nhập tên quán..." 
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-cuisine">Loại ẩm thực</Label>
                <Input 
                  id="edit-cuisine" 
                  placeholder="VD: Đặc sản Ninh Bình" 
                  value={formData.cuisine || ''}
                  onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-hours">Giờ mở cửa</Label>
                <Input 
                  id="edit-hours" 
                  placeholder="VD: 08:00 - 22:00" 
                  value={formData.openingHours || ''}
                  onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-desc">Mô tả quán ăn</Label>
              <Textarea 
                id="edit-desc" 
                placeholder="Nhập mô tả chi tiết..." 
                className="min-h-[120px]"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Hủy</Button>
            <Button onClick={handleUpdate}>Cập nhật</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
