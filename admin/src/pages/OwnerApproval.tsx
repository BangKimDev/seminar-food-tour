import React, { useState, useEffect } from 'react';
import { Search, UserCheck, UserX, Store, Mail, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { RestaurantOwner } from '../types';
import { ownerService } from '../services/ownerService';

type FilterTab = 'all' | 'pending' | 'approved' | 'rejected';

export const OwnerApproval: React.FC = () => {
  const [owners, setOwners] = useState<RestaurantOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState<FilterTab>('pending');

  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    try {
      setLoading(true);
      const data = await ownerService.list();
      setOwners(data);
    } catch (err: any) {
      toast.error(err.message || 'Không thể tải danh sách chủ quán');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await ownerService.updateStatus(id, 'approved');
      setOwners(prev => prev.map(o => o.id === id ? { ...o, status: 'approved' } : o));
      toast.success('Đã duyệt chủ quán thành công');
    } catch (err: any) {
      toast.error(err.message || 'Duyệt thất bại');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await ownerService.updateStatus(id, 'rejected');
      setOwners(prev => prev.map(o => o.id === id ? { ...o, status: 'rejected' } : o));
      toast.success('Đã từ chối chủ quán');
    } catch (err: any) {
      toast.error(err.message || 'Từ chối thất bại');
    }
  };

  const filtered = owners.filter(o => {
    const matchSearch = !searchTerm || 
      (o.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.username || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchTab = filterTab === 'all' || o.status === filterTab;
    return matchSearch && matchTab;
  });

  const statusLabel = (status: string) => {
    switch (status) {
      case 'approved': return 'Đã duyệt';
      case 'rejected': return 'Từ chối';
      default: return 'Chờ duyệt';
    }
  };

  const counts = {
    all: owners.length,
    pending: owners.filter(o => o.status === 'pending').length,
    approved: owners.filter(o => o.status === 'approved').length,
    rejected: owners.filter(o => o.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative w-72">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Tìm kiếm chủ quán..." 
            className="pl-10" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" onClick={fetchOwners} disabled={loading}>
          <Clock className="w-4 h-4 mr-2" />
          Làm mới
        </Button>
      </div>

      <Tabs value={filterTab} onValueChange={(v) => setFilterTab(v as FilterTab)}>
        <TabsList>
          <TabsTrigger value="all">Tất cả ({counts.all})</TabsTrigger>
          <TabsTrigger value="pending">Chờ duyệt ({counts.pending})</TabsTrigger>
          <TabsTrigger value="approved">Đã duyệt ({counts.approved})</TabsTrigger>
          <TabsTrigger value="rejected">Từ chối ({counts.rejected})</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="border-slate-200">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Chủ quán</TableHead>
                <TableHead>Tài khoản</TableHead>
                <TableHead>Quán ăn</TableHead>
                <TableHead>Ngày đăng ký</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    Không có chủ quán nào
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((owner) => (
                  <TableRow key={owner.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4 text-orange-500" />
                        <span className="font-medium">{owner.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-sm">
                        <span className="text-slate-600">{owner.email}</span>
                        <span className="text-slate-400 text-xs">@{owner.username}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {owner.restaurants && owner.restaurants.length > 0 ? (
                        <div className="flex flex-col">
                          {owner.restaurants.map(r => (
                            <span key={r.id} className="text-slate-600">{r.name}</span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400">Chưa tạo quán</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-slate-500">
                        <Calendar className="w-3 h-3" />
                        {new Date(owner.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        owner.status === 'approved' ? 'bg-green-100 text-green-700' :
                        owner.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {statusLabel(owner.status)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {owner.status === 'pending' && (
                          <>
                            <Button 
                              size="sm"
                              className="h-8"
                              onClick={() => handleApprove(owner.id)}
                            >
                              <UserCheck className="w-4 h-4 mr-1" />
                              Duyệt
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="h-8 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                              onClick={() => handleReject(owner.id)}
                            >
                              <UserX className="w-4 h-4 mr-1" />
                              Từ chối
                            </Button>
                          </>
                        )}
                        {owner.status === 'approved' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="h-8 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                            onClick={() => handleReject(owner.id)}
                          >
                            <UserX className="w-4 h-4 mr-1" />
                            Hủy duyệt
                          </Button>
                        )}
                        {owner.status === 'rejected' && (
                          <Button 
                            size="sm"
                            className="h-8"
                            onClick={() => handleApprove(owner.id)}
                          >
                            <UserCheck className="w-4 h-4 mr-1" />
                            Duyệt lại
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
