
export type POICategory = 'main' | 'wc' | 'ticket' | 'parking' | 'boat' | 'restaurant' | 'cafe' | 'market';

export interface POI {
  id: string;
  name: string;
  category: POICategory;
  lat: number;
  lng: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Restaurant {
  id: string;
  poiId?: string;
  name: string;
  description: string;
  cuisine?: string;
  openingHours?: string;
  status: 'pending' | 'approved' | 'rejected';
  imageUrl?: string;
  views?: number;
  createdAt: string;
  updatedAt?: string;
  poi?: POI;
  owner?: {
    id: string;
    name: string;
    email: string;
  };
  _count?: {
    menuItems: number;
    audioGuides: number;
  };
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  dishName: string;
  price: number;
  category?: string;
  imageUrl?: string;
  isAvailable: boolean;
  createdAt: string;
}

export interface AudioGuide {
  id: string;
  restaurantId: string;
  language: string;
  content: string;
  audioUrl?: string;
  duration?: number;
  createdAt: string;
  updatedAt?: string;
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

// ─── Dashboard types ────────────────────────────────────────────────────────

export interface DashboardStats {
  pois: number;
  restaurants: number;
  audioGuides: number;
  visits: number;
}

export interface DashboardData {
  stats: DashboardStats;
  poiDistribution: { category: string; count: number }[];
  restaurantByStatus: { status: string; count: number }[];
  audioGuideByLanguage: { language: string; count: number }[];
  recentActivity: {
    id: string;
    action: string;
    restaurantName: string;
    createdAt: string;
  }[];
  recentRestaurants: {
    id: string;
    name: string;
    status: string;
    views: number;
    createdAt: string;
  }[];
}
