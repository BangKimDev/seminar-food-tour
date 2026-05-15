import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera } from 'lucide-react';
import { MenuItem } from '../../types';

interface MenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem: MenuItem | null;
  handleSaveMenuItem: (e: React.FormEvent<HTMLFormElement>) => void;
  isSaving: boolean;
}

export const MenuItemModal = ({
  isOpen,
  onClose,
  editingItem,
  handleSaveMenuItem,
  isSaving
}: MenuItemModalProps) => {
  const [dishName, setDishName] = useState('');
  const [dishNameError, setDishNameError] = useState('');
  const [price, setPrice] = useState('');
  const [priceError, setPriceError] = useState('');
  const [category, setCategory] = useState('Món chính');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragStart = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  useEffect(() => {
    if (editingItem) {
      setDishName(editingItem.dishName);
      setPrice(String(editingItem.price));
      setCategory(editingItem.category || 'Món chính');
      setDescription(editingItem.description || '');
      setImageUrl(editingItem.imageUrl || '');
      setPreviewUrl(editingItem.imageUrl || '');
      setIsAvailable(editingItem.isAvailable);
      setIsFeatured(editingItem.isFeatured || false);
      setTranslateX(editingItem.cropX || 0);
      setTranslateY(editingItem.cropY || 0);
    } else {
      setDishName('');
      setPrice('');
      setCategory('Món chính');
      setDescription('');
      setImageUrl('');
      setPreviewUrl('');
      setIsAvailable(true);
      setIsFeatured(false);
      setTranslateX(0);
      setTranslateY(0);
    }
    setDishNameError('');
    setPriceError('');
  }, [editingItem, isOpen]);

  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setTranslateX(dragStart.current.tx + dx);
      setTranslateY(dragStart.current.ty + dy);
    };
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!previewUrl) return;
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, tx: translateX, ty: translateY };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPreviewUrl(dataUrl);
      setImageUrl(dataUrl);
      setTranslateX(0);
      setTranslateY(0);
    };
    reader.readAsDataURL(file);
  };

  const handleUrlChange = (url: string) => {
    setImageUrl(url);
    setPreviewUrl(url);
    setTranslateX(0);
    setTranslateY(0);
  };

  const handleRemoveImage = () => {
    setPreviewUrl('');
    setImageUrl('');
    setTranslateX(0);
    setTranslateY(0);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let hasError = false;

    if (!dishName.trim()) {
      setDishNameError('Vui lòng nhập tên món ăn');
      hasError = true;
    } else {
      setDishNameError('');
    }

    const priceVal = Number(price);
    if (!price || isNaN(priceVal) || priceVal <= 0) {
      setPriceError('Vui lòng nhập giá món ăn');
      hasError = true;
    } else {
      setPriceError('');
    }

    if (hasError) return;

    const form = e.currentTarget;
    const dishInput = form.querySelector<HTMLInputElement>('[name="dishName"]');
    const priceInput = form.querySelector<HTMLInputElement>('[name="price"]');
    const categoryInput = form.querySelector<HTMLSelectElement>('[name="category"]');
    const descInput = form.querySelector<HTMLTextAreaElement>('[name="description"]');
    const imageInput = form.querySelector<HTMLInputElement>('[name="imageUrl"]');
    const availInput = form.querySelector<HTMLInputElement>('[name="isAvailable"]');
    const cropXInput = form.querySelector<HTMLInputElement>('[name="cropX"]');
    const cropYInput = form.querySelector<HTMLInputElement>('[name="cropY"]');

    if (dishInput) dishInput.value = dishName;
    if (priceInput) priceInput.value = String(priceVal);
    if (categoryInput) categoryInput.value = category;
    if (descInput) descInput.value = description;
    if (imageInput) imageInput.value = imageUrl;
    if (availInput) availInput.value = String(isAvailable);
    const featuredInput = form.querySelector<HTMLInputElement>('[name="isFeatured"]');
    if (featuredInput) featuredInput.value = String(isFeatured);
    if (cropXInput) cropXInput.value = String(Math.round(translateX));
    if (cropYInput) cropYInput.value = String(Math.round(translateY));

    handleSaveMenuItem(e);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white w-[680px] rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Title */}
            <div className="shrink-0 px-6 py-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">{editingItem ? 'Chỉnh sửa món' : 'Thêm món mới'}</h3>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1">
              <input type="hidden" name="dishName" />
              <input type="hidden" name="price" />
              <input type="hidden" name="category" />
              <input type="hidden" name="description" />
              <input type="hidden" name="imageUrl" />
              <input type="hidden" name="isAvailable" />
              <input type="hidden" name="isFeatured" />
              <input type="hidden" name="cropX" />
              <input type="hidden" name="cropY" />

              {/* 2-column body */}
              <div className="flex-1 grid grid-cols-[55%_45%] gap-5 py-5">
                {/* LEFT COLUMN */}
                <div className="space-y-4 pl-6">
                  {/* Tên món ăn */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Tên món ăn</label>
                    <input
                      type="text"
                      value={dishName}
                      onChange={(e) => { setDishName(e.target.value); setDishNameError(''); }}
                      placeholder="VD: Phở Bò Truyền Thống"
                      className={`w-full px-4 py-2.5 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm ${dishNameError ? 'border-red-400' : 'border-slate-200'}`}
                    />
                    {dishNameError && <p className="text-xs text-red-500">{dishNameError}</p>}
                  </div>

                  {/* Giá + Danh mục */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-700">Giá (VNĐ)</label>
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => { setPrice(e.target.value); setPriceError(''); }}
                        placeholder="55000"
                        className={`w-full px-4 py-2.5 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm ${priceError ? 'border-red-400' : 'border-slate-200'}`}
                      />
                      {priceError && <p className="text-xs text-red-500">{priceError}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-700">Danh mục</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm"
                      >
                        <option value="Món chính">Món chính</option>
                        <option value="Đồ uống">Đồ uống</option>
                        <option value="Món phụ">Món phụ</option>
                        <option value="Tráng miệng">Tráng miệng</option>
                        <option value="Khác">Khác</option>
                      </select>
                    </div>
                  </div>

                  {/* Mô tả */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Mô tả món ăn</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={2}
                      placeholder="Mô tả ngắn về món ăn..."
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none text-sm"
                    />
                  </div>

                  {/* Toggle: Đang bán */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsAvailable(!isAvailable)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${isAvailable ? 'bg-emerald-500' : 'bg-slate-300'}`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isAvailable ? 'translate-x-5' : 'translate-x-0'}`}
                      />
                    </button>
                    <span className={`text-sm font-semibold ${isAvailable ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {isAvailable ? 'Đang bán' : 'Ngừng bán'}
                    </span>
                  </div>

                  {/* Toggle: Nổi bật */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsFeatured(!isFeatured)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${isFeatured ? 'bg-amber-500' : 'bg-slate-300'}`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isFeatured ? 'translate-x-5' : 'translate-x-0'}`}
                      />
                    </button>
                    <span className={`text-sm font-semibold ${isFeatured ? 'text-amber-600' : 'text-slate-400'}`}>
                      {isFeatured ? 'Nổi bật ⭐' : 'Không nổi bật'}
                    </span>
                  </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="flex flex-col gap-3 pb-8 pr-6">
                  <label className="text-sm font-bold text-slate-700">Hình ảnh</label>
                  <div
                    className={`flex-1 min-h-[220px] border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center bg-slate-50/50 hover:bg-slate-100/50 transition-colors overflow-hidden ${!previewUrl ? 'cursor-pointer' : ''}`}
                    onClick={() => { if (!previewUrl) fileInputRef.current?.click(); }}
                    onMouseDown={handleMouseDown}
                  >
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt=""
                        className="w-full h-full object-cover"
                        style={{
                          transform: `translate(${translateX}px, ${translateY}px)`,
                          cursor: isDragging ? 'grabbing' : 'grab',
                          userSelect: 'none',
                        }}
                        draggable={false}
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-slate-400">
                        <Camera className="w-7 h-7" />
                        <span className="text-xs font-medium">Tải ảnh lên</span>
                      </div>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

                  {previewUrl && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Kéo ảnh để chọn vùng hiển thị</span>
                      <button type="button" onClick={handleRemoveImage} className="text-xs text-red-500 hover:text-red-600 font-medium">
                        ✕ Xoá ảnh
                      </button>
                    </div>
                  )}

                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm"
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="shrink-0 px-6 py-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-3.5 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    editingItem ? 'Lưu thay đổi' : 'Thêm vào thực đơn'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MenuItemModal;
