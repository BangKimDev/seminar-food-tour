import React, { useState } from 'react';
import { POI, POICategory } from '@/src/types';
import { MapPicker } from '@/src/components/MapPicker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Search,
  MapPin,
  Trash2,
  Edit2,
  X,
  Map as MapIcon,
  List,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'motion/react';

interface POIManagementProps {
  pois: POI[];
  onAdd: (poi: Omit<POI, 'id' | 'createdAt'>) => void;
  onUpdate: (id: string, poi: Partial<Omit<POI, 'id' | 'createdAt'>>) => void;
  onDelete: (id: string) => void;
}

const categoryConfig: Record<
  POICategory,
  { label: string; color: string; bgColor: string; dotColor: string }
> = {
  main: { label: 'Điểm chính', color: 'text-blue-700', bgColor: 'bg-blue-100', dotColor: 'bg-blue-500' },
  wc: { label: 'WC', color: 'text-green-700', bgColor: 'bg-green-100', dotColor: 'bg-green-500' },
  ticket: { label: 'Bán vé', color: 'text-orange-700', bgColor: 'bg-orange-100', dotColor: 'bg-orange-500' },
  parking: { label: 'Gửi xe', color: 'text-purple-700', bgColor: 'bg-purple-100', dotColor: 'bg-purple-500' },
  boat: { label: 'Bến thuyền', color: 'text-red-700', bgColor: 'bg-red-100', dotColor: 'bg-red-500' },
};

export const POIManagement: React.FC<POIManagementProps> = ({ pois, onAdd, onUpdate, onDelete }) => {
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null);
  const [newPoi, setNewPoi] = useState<Partial<POI>>({ category: 'main' });

  const filteredPois = pois.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = () => {
    if (!newPoi.name?.trim() || !newPoi.lat || !newPoi.lng) {
      toast.error('Vui lòng điền đầy đủ thông tin và chọn vị trí trên bản đồ');
      return;
    }

    if (dialogMode === 'add') {
      onAdd(newPoi as Omit<POI, 'id' | 'createdAt'>);
      toast.success('Đã thêm POI mới thành công');
    } else if (dialogMode === 'edit' && newPoi.id) {
      onUpdate(newPoi.id, {
        name: newPoi.name,
        category: newPoi.category,
        lat: newPoi.lat,
        lng: newPoi.lng,
      });
      toast.success('Đã cập nhật POI thành công');
    }

    handleClose();
  };

  const handleClose = () => {
    setDialogMode(null);
    setNewPoi({ category: 'main' });
  };

  const openAddDialog = () => {
    setNewPoi({ category: 'main' });
    setDialogMode('add');
  };

  const openEditDialog = (poi: POI, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setNewPoi({ ...poi });
    setDialogMode('edit');
  };

  const confirmDelete = (poi: POI, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm(`Bạn có chắc chắn muốn xóa POI "${poi.name}"?\nThao tác này sẽ xóa mọi quán ăn thuộc POI này!`)) {
      onDelete(poi.id);
      toast.success(`Đã xóa POI "${poi.name}"`);
      if (selectedPoi?.id === poi.id) setSelectedPoi(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="relative w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Tìm kiếm POI..."
              className="pl-10"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          {/* Toggle view */}
          <div className="flex items-center bg-slate-100 rounded-lg p-1 gap-1">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'list'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              <List className="w-4 h-4" />
              Danh sách
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'map'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              <MapIcon className="w-4 h-4" />
              Bản đồ
            </button>
          </div>
        </div>

        <Button onClick={openAddDialog} className="gap-2">
          <Plus className="w-4 h-4" />
          Thêm POI mới
        </Button>
      </div>

      {/* Stat badges */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(categoryConfig).map(([code, cfg]) => {
          const count = pois.filter(p => p.category === code).length;
          return (
            <span
              key={code}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.bgColor} ${cfg.color}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor}`} />
              {cfg.label}: {count}
            </span>
          );
        })}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
          Tổng: {pois.length}
        </span>
      </div>

      {/* View: Danh sách */}
      <AnimatePresence mode="wait">
        {viewMode === 'list' && (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-slate-200">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/80">
                      <TableHead className="font-semibold">Tên POI</TableHead>
                      <TableHead className="font-semibold">Phân loại</TableHead>
                      <TableHead className="font-semibold">Vị trí (Lat, Lng)</TableHead>
                      <TableHead className="font-semibold text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPois.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-16 text-slate-400">
                          <MapPin className="w-10 h-10 mx-auto mb-2 opacity-20" />
                          <p>Không tìm thấy POI nào</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPois.map(poi => {
                        const cfg = categoryConfig[poi.category];
                        return (
                          <TableRow
                            key={poi.id}
                            className="hover:bg-slate-50 cursor-pointer transition-colors"
                            onClick={() => setSelectedPoi(poi)}
                          >
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${cfg.dotColor}`} />
                                {poi.name}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${cfg.bgColor} ${cfg.color}`}
                              >
                                {cfg.label}
                              </span>
                            </TableCell>
                            <TableCell className="text-slate-500 font-mono text-xs">
                              {poi.lat}, {poi.lng}
                            </TableCell>
                            <TableCell className="text-right">
                              <div
                                className="flex justify-end gap-1"
                                onClick={e => e.stopPropagation()}
                              >
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                                  onClick={(e) => openEditDialog(poi, e)}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                                  onClick={(e) => confirmDelete(poi, e)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* View: Bản đồ */}
        {viewMode === 'map' && (
          <motion.div
            key="map"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-4"
          >
            {/* Map chiếm 2/3 */}
            <div className="lg:col-span-2">
              <Card className="border-slate-200 overflow-hidden">
                <CardHeader className="py-3 px-4 border-b border-slate-100">
                  <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                    <MapIcon className="w-4 h-4" />
                    Bản đồ POIs
                    <Badge variant="secondary" className="ml-auto">{pois.length} điểm</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <MapPicker
                    onLocationSelect={() => { }}
                    existingPois={pois.map(p => ({ lat: p.lat, lng: p.lng, name: p.name }))}
                    readOnly={true}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Danh sách nhỏ chiếm 1/3 */}
            <div className="lg:col-span-1 space-y-2 max-h-[450px] overflow-y-auto pr-1">
              {filteredPois.length === 0 ? (
                <div className="text-center text-slate-400 py-10">
                  <MapPin className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">Không có POI nào</p>
                </div>
              ) : (
                filteredPois.map(poi => {
                  const cfg = categoryConfig[poi.category];
                  return (
                    <div
                      key={poi.id}
                      className={`p-3 rounded-lg border transition-all cursor-pointer hover:shadow-sm ${selectedPoi?.id === poi.id
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-slate-100 bg-white hover:border-slate-200'
                        }`}
                      onClick={() => setSelectedPoi(poi)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dotColor}`} />
                            <p className="text-sm font-medium truncate">{poi.name}</p>
                          </div>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.bgColor} ${cfg.color}`}>
                            {cfg.label}
                          </span>
                          <p className="text-[10px] font-mono text-slate-400 mt-1">
                            {poi.lat}, {poi.lng}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                            onClick={e => openEditDialog(poi, e)}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50"
                            onClick={e => confirmDelete(poi, e)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dialog: Thêm/Sửa POI */}
      <Dialog open={dialogMode !== null} onOpenChange={open => !open && handleClose()}>
        <DialogContent className="max-w-[80vw] sm:max-w-[80vw] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              {dialogMode === 'add' ? 'Thiết lập POI mới' : 'Chỉnh sửa POI'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-2">
            {/* Left: Form */}
            <div className="lg:col-span-5 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="poi-name">
                  Tên điểm <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="poi-name"
                  placeholder="VD: Bến thuyền Tràng An"
                  value={newPoi.name || ''}
                  onChange={e => setNewPoi({ ...newPoi, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="poi-category">
                  Phân loại <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={newPoi.category}
                  onValueChange={val => setNewPoi({ ...newPoi, category: val as POICategory })}
                >
                  <SelectTrigger id="poi-category">
                    <SelectValue placeholder="Chọn loại điểm" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryConfig).map(([code, cfg]) => (
                      <SelectItem key={code} value={code}>
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${cfg.dotColor}`} />
                          {cfg.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tọa độ đã chọn */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                  Tọa độ đã chọn
                </p>
                {newPoi.lat ? (
                  <div className="flex items-center gap-2 text-sm font-mono text-primary">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span>
                      {newPoi.lat}, {newPoi.lng}
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Vui lòng click lên bản đồ để chọn vị trí
                  </p>
                )}
              </div>

              {/* Hướng dẫn */}
              <div className="text-xs text-slate-400 bg-blue-50 border border-blue-100 rounded-lg p-3 space-y-1">
                <p className="font-medium text-blue-600">💡 Hướng dẫn</p>
                <ul className="space-y-0.5 list-disc list-inside">
                  <li>Click vào bản đồ để đặt marker</li>
                  <li>Kéo marker để điều chỉnh vị trí chính xác</li>
                  <li>Dùng scroll/pinch để zoom bản đồ</li>
                </ul>
              </div>
            </div>

            {/* Right: Map */}
            <div className="lg:col-span-7 space-y-2">
              <Label>
                Chọn vị trí trên bản đồ <span className="text-red-500">*</span>
              </Label>
              <MapPicker
                onLocationSelect={(lat, lng) => setNewPoi({ ...newPoi, lat, lng })}
                existingPois={pois.map(p => ({ lat: p.lat, lng: p.lng, name: p.name }))}
                initialLat={newPoi.lat}
                initialLng={newPoi.lng}
                height="450px"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleClose}>
              <X className="w-4 h-4 mr-1.5" />
              Hủy
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <MapPin className="w-4 h-4" />
              Lưu POI
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
