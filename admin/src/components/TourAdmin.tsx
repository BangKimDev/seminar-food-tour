import React, { useState, useEffect, useMemo, useRef } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { POI, Tour, POI_TYPE_LABELS, POI_TYPE_COLORS } from '../types';
import { Plus, Trash2, GripVertical, X, Route, MapPin, ChevronRight, Save } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableItemProps {
  id: string;
  poi: POI;
  index: number;
  onRemove: (id: string) => void;
  key?: string;
}

function SortablePOIItem({ id, poi, index, onRemove }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 p-4 bg-white border border-zinc-200 rounded-xl group ${isDragging ? 'shadow-2xl ring-2 ring-blue-600' : 'hover:border-zinc-300'}`}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-zinc-400 hover:text-blue-600 transition-colors">
        <GripVertical className="w-5 h-5" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Point {index + 1}</span>
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md" style={{ backgroundColor: `${POI_TYPE_COLORS[poi.type]}15`, color: POI_TYPE_COLORS[poi.type] }}>
            {POI_TYPE_LABELS[poi.type]}
          </span>
        </div>
        <h4 className="font-bold text-zinc-900 truncate">{poi.name}</h4>
      </div>

      <button
        onClick={() => onRemove(id)}
        className="p-2 text-zinc-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function TourAdmin() {
  const [pois, setPois] = useState<POI[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    selectedPoiIds: [] as string[]
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const qPois = query(collection(db, 'pois'), orderBy('createdAt', 'desc'));
    const unsubscribePois = onSnapshot(qPois, (snapshot) => {
      setPois(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as POI[]);
    });

    const qTours = query(collection(db, 'tours'), orderBy('createdAt', 'desc'));
    const unsubscribeTours = onSnapshot(qTours, (snapshot) => {
      setTours(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Tour[]);
    });

    return () => {
      unsubscribePois();
      unsubscribeTours();
    };
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setFormData(prev => {
        const oldIndex = prev.selectedPoiIds.indexOf(active.id as string);
        const newIndex = prev.selectedPoiIds.indexOf(over.id as string);
        return {
          ...prev,
          selectedPoiIds: arrayMove(prev.selectedPoiIds, oldIndex, newIndex)
        };
      });
    }
  };

  const addPoiToTour = (poiId: string) => {
    if (formData.selectedPoiIds.includes(poiId)) return;
    setFormData(prev => ({
      ...prev,
      selectedPoiIds: [...prev.selectedPoiIds, poiId]
    }));
  };

  const removePoiFromTour = (poiId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedPoiIds: prev.selectedPoiIds.filter(id => id !== poiId)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.selectedPoiIds.length < 2) {
      alert('Vui lòng chọn ít nhất 2 POI để tạo tour.');
      return;
    }
    try {
      await addDoc(collection(db, 'tours'), {
        name: formData.name,
        description: formData.description,
        poiIds: formData.selectedPoiIds,
        createdAt: serverTimestamp()
      });
      setIsAdding(false);
      setFormData({ name: '', description: '', selectedPoiIds: [] });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'tours');
    }
  };

  const handleDeleteTour = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tour này?')) return;
    try {
      await deleteDoc(doc(db, 'tours', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'tours');
    }
  };

  const selectedPois = useMemo(() => {
    return formData.selectedPoiIds
      .map(id => pois.find(p => p.id === id))
      .filter((p): p is POI => !!p);
  }, [formData.selectedPoiIds, pois]);

  return (
    <div className="h-full flex flex-col bg-zinc-50">
      <div className="p-8 border-b border-zinc-200 bg-white flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Tour Management</h1>
          <p className="text-sm text-zinc-500">Build routes from points of interest</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
        >
          {isAdding ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {isAdding ? 'Cancel' : 'Create New Tour'}
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        {isAdding ? (
          <div className="h-full flex overflow-hidden p-8 gap-8">
            {/* Left: Form & Route Builder */}
            <div className="flex-1 flex flex-col gap-6 overflow-hidden">
              <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                <h3 className="text-lg font-bold text-zinc-900 mb-4">Tour Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Tour Name</label>
                    <input
                      required
                      value={formData.name}
                      onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                      placeholder="e.g. Ancient Town Walk"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 h-20 resize-none text-sm"
                      placeholder="Short description of this tour..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex-1 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-zinc-900">Route Builder</h3>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{formData.selectedPoiIds.length} points selected</span>
                </div>
                
                {formData.selectedPoiIds.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-zinc-100 rounded-2xl p-8 text-center">
                    <div className="p-4 bg-zinc-50 rounded-full mb-4">
                      <MapPin className="w-8 h-8 text-zinc-300" />
                    </div>
                    <p className="text-sm text-zinc-400">No points in route yet.<br />Select points from the list on the right.</p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto pr-2">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <SortableContext items={formData.selectedPoiIds} strategy={verticalListSortingStrategy}>
                        <div className="space-y-3">
                          {selectedPois.map((poi, index) => (
                            <SortablePOIItem
                              key={poi.id}
                              id={poi.id}
                              poi={poi}
                              index={index}
                              onRemove={removePoiFromTour}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={formData.selectedPoiIds.length < 2 || !formData.name}
                  className="mt-6 w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save Tour
                </button>
              </div>
            </div>

            {/* Right: POI Selector */}
            <div className="w-80 bg-white rounded-2xl border border-zinc-200 shadow-sm flex flex-col overflow-hidden">
              <div className="p-6 border-b border-zinc-200">
                <h3 className="text-lg font-bold text-zinc-900 mb-1">Select Points</h3>
                <p className="text-xs text-zinc-500">Click to add to route</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-50/30">
                {pois.map(poi => {
                  const isSelected = formData.selectedPoiIds.includes(poi.id);
                  return (
                    <button
                      key={poi.id}
                      disabled={isSelected}
                      onClick={() => addPoiToTour(poi.id)}
                      className={`w-full text-left p-4 rounded-xl border transition-all bg-white ${
                        isSelected 
                          ? 'border-zinc-100 opacity-50 cursor-not-allowed' 
                          : 'border-zinc-200 hover:border-blue-600 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md" style={{ backgroundColor: `${POI_TYPE_COLORS[poi.type]}15`, color: POI_TYPE_COLORS[poi.type] }}>
                          {POI_TYPE_LABELS[poi.type]}
                        </span>
                        {isSelected && <Plus className="w-4 h-4 text-zinc-300 rotate-45" />}
                      </div>
                      <h4 className="font-bold text-zinc-900 text-sm">{poi.name}</h4>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto max-h-full">
            {tours.map(tour => (
              <div key={tour.id} className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden group hover:border-blue-600 transition-all duration-300">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-100">
                      <Route className="w-6 h-6 text-white" />
                    </div>
                    <button
                      onClick={() => handleDeleteTour(tour.id)}
                      className="p-2 text-zinc-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 mb-2">{tour.name}</h3>
                  <p className="text-sm text-zinc-500 mb-6 line-clamp-2 leading-relaxed">{tour.description}</p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      <span>Route</span>
                      <span>{tour.poiIds.length} points</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tour.poiIds.slice(0, 3).map((id, i) => {
                        const poi = pois.find(p => p.id === id);
                        return (
                          <div key={id} className="flex items-center gap-1">
                            <span className="text-xs font-medium text-zinc-600 bg-zinc-100 px-2 py-1 rounded-lg">
                              {poi?.name || '...'}
                            </span>
                            {i < 2 && i < tour.poiIds.length - 1 && <ChevronRight className="w-3 h-3 text-zinc-300" />}
                          </div>
                        );
                      })}
                      {tour.poiIds.length > 3 && (
                        <span className="text-xs font-medium text-zinc-400 px-2 py-1">
                          +{tour.poiIds.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    Created {tour.createdAt?.toDate().toLocaleDateString('en-US')}
                  </span>
                  <button className="text-sm font-bold text-blue-600 hover:underline">
                    Details
                  </button>
                </div>
              </div>
            ))}
            
            {tours.length === 0 && (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
                <div className="p-6 bg-zinc-100 rounded-full mb-4">
                  <Route className="w-12 h-12 text-zinc-300" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-2">No Tours Found</h3>
                <p className="text-zinc-500 mb-8">Start by creating your first tour route</p>
                <button
                  onClick={() => setIsAdding(true)}
                  className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                >
                  Create Tour Now
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
