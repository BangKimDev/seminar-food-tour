import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { POI, POI_TYPE_LABELS, POI_TYPE_COLORS, POIType } from '../types';
import { Plus, Trash2, MapPin, X, Navigation } from 'lucide-react';

// Fix Leaflet marker icon issue
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const DEFAULT_CENTER: [number, number] = [15.8801, 108.3380]; // Hoi An

function MapEvents({ onClick }: { onClick: (latlng: L.LatLng) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng);
    },
  });
  return null;
}

export default function POIAdmin() {
  const [pois, setPois] = useState<POI[]>([]);
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'main' as POIType,
    lat: DEFAULT_CENTER[0],
    lng: DEFAULT_CENTER[1]
  });

  useEffect(() => {
    const q = query(collection(db, 'pois'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const poiList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as POI[];
      setPois(poiList);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'pois');
    });
    return () => unsubscribe();
  }, []);

  const handleMapClick = (latlng: L.LatLng) => {
    if (isAdding) {
      setFormData(prev => ({
        ...prev,
        lat: latlng.lat,
        lng: latlng.lng
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'pois'), {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        location: { lat: formData.lat, lng: formData.lng },
        createdAt: serverTimestamp()
      });
      setIsAdding(false);
      setFormData({
        name: '',
        description: '',
        type: 'main',
        lat: DEFAULT_CENTER[0],
        lng: DEFAULT_CENTER[1]
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'pois');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa POI này?')) return;
    try {
      await deleteDoc(doc(db, 'pois', id));
      if (selectedPoi?.id === id) setSelectedPoi(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'pois');
    }
  };

  const createCustomIcon = (color: string) => {
    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar List */}
      <div className="w-96 border-r border-zinc-200 bg-white flex flex-col">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">Points of Interest</h2>
            <p className="text-xs text-zinc-500">Manage locations on map</p>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className={`p-2 rounded-lg transition-all ${
              isAdding 
                ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-100'
            }`}
          >
            {isAdding ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-50/50">
          {pois.map(poi => (
            <div
              key={poi.id}
              onClick={() => setSelectedPoi(poi)}
              className={`p-4 rounded-xl border transition-all cursor-pointer group bg-white ${
                selectedPoi?.id === poi.id 
                  ? 'border-blue-600 ring-1 ring-blue-600' 
                  : 'border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md" style={{ backgroundColor: `${POI_TYPE_COLORS[poi.type]}15`, color: POI_TYPE_COLORS[poi.type] }}>
                  {POI_TYPE_LABELS[poi.type]}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(poi.id);
                  }}
                  className="p-1 text-zinc-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                {poi.name}
              </h3>
              <p className="text-xs text-zinc-500 line-clamp-2 mt-1 leading-relaxed">{poi.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative">
        <MapContainer 
          center={DEFAULT_CENTER} 
          zoom={14} 
          style={{ width: '100%', height: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapEvents onClick={handleMapClick} />
          
          {pois.map(poi => (
            <Marker 
              key={poi.id} 
              position={[poi.location.lat, poi.location.lng]}
              icon={createCustomIcon(POI_TYPE_COLORS[poi.type])}
              eventHandlers={{
                click: () => setSelectedPoi(poi),
              }}
            >
              <Popup>
                <div className="p-1 min-w-[150px]">
                  <h3 className="font-bold text-zinc-900 m-0">{poi.name}</h3>
                  <p className="text-[10px] font-bold text-blue-600 uppercase mt-1 mb-2">{POI_TYPE_LABELS[poi.type]}</p>
                  <p className="text-xs text-zinc-600 m-0 leading-relaxed">{poi.description}</p>
                </div>
              </Popup>
            </Marker>
          ))}

          {isAdding && (
            <Marker 
              position={[formData.lat, formData.lng]} 
              icon={createCustomIcon('#000')}
              draggable={true}
              eventHandlers={{
                dragend: (e) => {
                  const marker = e.target;
                  const position = marker.getLatLng();
                  setFormData(prev => ({ ...prev, lat: position.lat, lng: position.lng }));
                },
              }}
            >
              <Popup>
                <p className="text-xs font-bold m-0">Vị trí mới</p>
              </Popup>
            </Marker>
          )}
        </MapContainer>

        {/* Add Form Overlay */}
        {isAdding && (
          <div className="absolute top-6 right-6 w-80 bg-white rounded-2xl shadow-2xl border border-zinc-200 p-6 z-10 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Navigation className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900">New Point</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Point Name</label>
                <input
                  required
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                  placeholder="e.g. Ancient House"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Point Type</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData(prev => ({ ...prev, type: e.target.value as POIType }))}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                >
                  {Object.entries(POI_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 h-24 resize-none text-sm"
                  placeholder="Tell us about this place..."
                />
              </div>
              <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Coordinates</p>
                <p className="text-xs font-mono text-zinc-600">
                  {formData.lat.toFixed(6)}, {formData.lng.toFixed(6)}
                </p>
                <p className="text-[10px] text-zinc-400 mt-1 italic">Click or drag marker on map</p>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
              >
                Save Point
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
