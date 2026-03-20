import { Timestamp } from 'firebase/firestore';

export type POIType = 'main' | 'wc' | 'ticket' | 'parking' | 'boat_dock';

export interface POI {
  id: string;
  name: string;
  description: string;
  type: POIType;
  location: {
    lat: number;
    lng: number;
  };
  createdAt: Timestamp;
}

export interface Tour {
  id: string;
  name: string;
  description: string;
  poiIds: string[];
  createdAt: Timestamp;
}

export const POI_TYPE_LABELS: Record<POIType, string> = {
  main: 'Điểm chính',
  wc: 'Nhà vệ sinh',
  ticket: 'Quầy vé',
  parking: 'Bãi đỗ xe',
  boat_dock: 'Bến thuyền'
};

export const POI_TYPE_COLORS: Record<POIType, string> = {
  main: '#EF4444', // red-500
  wc: '#3B82F6',   // blue-500
  ticket: '#F59E0B', // amber-500
  parking: '#10B981', // emerald-500
  boat_dock: '#8B5CF6' // violet-500
};
