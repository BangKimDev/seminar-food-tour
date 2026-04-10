import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon bị mất do vite bundling
// Dùng URL từ unpkg thay vì import PNG để tránh lỗi TypeScript
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});


// Icon riêng cho điểm đã chọn (màu xanh primary)
const selectedIcon = L.divIcon({
  className: '',
  html: `<div style="
    width: 28px; height: 28px;
    background: #3B82F6;
    border: 3px solid white;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    box-shadow: 0 2px 8px rgba(59,130,246,0.5);
  "></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});

// Icon cho POI đã tồn tại (màu xám)
const existingIcon = L.divIcon({
  className: '',
  html: `<div style="
    width: 18px; height: 18px;
    background: #94A3B8;
    border: 2px solid white;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    box-shadow: 0 1px 4px rgba(0,0,0,0.2);
  "></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 18],
  popupAnchor: [0, -18],
});

interface ExistingPOI {
  lat: number;
  lng: number;
  name: string;
}

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
  existingPois?: ExistingPOI[];
  readOnly?: boolean; // Khi true: chỉ xem, không cho phép click chọn vị trí
}

const DEFAULT_CENTER: [number, number] = [20.2566, 105.8923]; // Tràng An, Ninh Bình
const DEFAULT_ZOOM = 15;

export const MapPicker: React.FC<MapPickerProps> = ({
  onLocationSelect,
  initialLat,
  initialLng,
  existingPois = [],
  readOnly = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const selectedMarkerRef = useRef<L.Marker | null>(null);
  const existingMarkersRef = useRef<L.Marker[]>([]);

  // Khởi tạo bản đồ
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
    });

    // OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Click để chọn vị trí (chỉ khi không phải readOnly)
    if (!readOnly) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        const roundedLat = parseFloat(lat.toFixed(6));
        const roundedLng = parseFloat(lng.toFixed(6));

        if (selectedMarkerRef.current) {
          selectedMarkerRef.current.remove();
        }

        const marker = L.marker([roundedLat, roundedLng], { icon: selectedIcon, draggable: true })
          .addTo(map)
          .bindPopup(`<b>Vị trí đã chọn</b><br/>Lat: ${roundedLat}<br/>Lng: ${roundedLng}`)
          .openPopup();

        marker.on('dragend', (de) => {
          const pos = (de.target as L.Marker).getLatLng();
          const newLat = parseFloat(pos.lat.toFixed(6));
          const newLng = parseFloat(pos.lng.toFixed(6));
          onLocationSelect(newLat, newLng);
          marker.setPopupContent(
            `<b>Vị trí đã chọn</b><br/>Lat: ${newLat}<br/>Lng: ${newLng}`
          ).openPopup();
        });

        selectedMarkerRef.current = marker;
        onLocationSelect(roundedLat, roundedLng);
      });
    } else {
      // readOnly: đổi cursor thành default
      map.getContainer().style.cursor = 'default';
    }

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Xử lý initial position
  useEffect(() => {
    if (!mapRef.current) return;
    if (initialLat === undefined || initialLng === undefined) return;

    if (selectedMarkerRef.current) {
      selectedMarkerRef.current.remove();
    }

    const marker = L.marker([initialLat, initialLng], { icon: selectedIcon, draggable: true })
      .addTo(mapRef.current)
      .bindPopup(`<b>Vị trí đã chọn</b><br/>Lat: ${initialLat}<br/>Lng: ${initialLng}`)
      .openPopup();

    marker.on('dragend', (de) => {
      const pos = (de.target as L.Marker).getLatLng();
      const newLat = parseFloat(pos.lat.toFixed(6));
      const newLng = parseFloat(pos.lng.toFixed(6));
      onLocationSelect(newLat, newLng);
    });

    selectedMarkerRef.current = marker;
    mapRef.current.setView([initialLat, initialLng], DEFAULT_ZOOM);
  }, [initialLat, initialLng]);

  // Xử lý existing POIs
  useEffect(() => {
    if (!mapRef.current) return;

    // Xóa markers cũ
    existingMarkersRef.current.forEach(m => m.remove());
    existingMarkersRef.current = [];

    // Thêm markers mới
    existingPois.forEach(poi => {
      const marker = L.marker([poi.lat, poi.lng], { icon: existingIcon })
        .addTo(mapRef.current!)
        .bindTooltip(poi.name, { permanent: false, direction: 'top' });
      existingMarkersRef.current.push(marker);
    });
  }, [existingPois]);

  return (
    <div className="space-y-1">
      {!readOnly && (
        <div className="flex items-center gap-4 text-xs text-slate-500 mb-1">
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full bg-blue-500"></span>
            Vị trí đang chọn
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full bg-slate-400"></span>
            POI đã có
          </span>
          <span className="italic text-slate-400">Click bản đồ để chọn vị trí</span>
        </div>
      )}
      <div
        ref={mapContainerRef}
        style={{
          height: readOnly ? '450px' : '340px',
          width: '100%',
          borderRadius: readOnly ? '0' : '8px',
          zIndex: 0,
        }}
        className={readOnly ? '' : 'border border-slate-200 shadow-inner'}
      />
    </div>
  );
};
