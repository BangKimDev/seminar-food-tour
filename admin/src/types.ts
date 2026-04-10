
export type POICategory = 'main' | 'wc' | 'ticket' | 'parking' | 'boat';

export interface POI {
  id: string;
  name: string;
  category: POICategory;
  lat: number;
  lng: number;
  createdAt: string;
}

export interface Restaurant {
  id: string;
  poiId: string;
  name: string;
  description: string;
  cuisine?: string;
  openingHours?: string;
  createdAt: string;
}

export interface AudioGuide {
  id: string;
  restaurantId: string;
  language: string;
  content: string;
  audioUrl?: string;
  createdAt: string;
}

export type AppState = 'login' | 'dashboard' | 'pois' | 'restaurants' | 'audio';

// ─── Auth & API types ────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  role: 'admin' | 'super_admin' | 'content_editor';
}

export interface ApiResponse<T> {
  data: T;
  total?: number;
  message?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
}
