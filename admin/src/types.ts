
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

export type AppState = 'login' | 'dashboard' | 'pois' | 'restaurants' | 'audio' | 'qr' | 'owner_approval';

export interface RestaurantOwner {
  id: string;
  email: string;
  username: string;
  name: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  restaurants?: {
    id: string;
    name: string;
    address?: string | null;
  }[];
}

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
  totalUsers: number;
  usersThisWeek: number;
  usersThisMonth: number;
  totalVisits: number;
  views: number;
  audioPlays: number;
  navigations: number;
  restaurants: number;
  pois: number;
  audioGuides: number;
  activeNow: number;
}

export interface DailyTrendItem {
  date: string;
  users: number;
  visits: number;
  audioPlays: number;
}

export interface WeeklyTrendItem {
  week: string;
  users: number;
  visits: number;
}

export interface PopularRestaurantItem {
  id: string;
  name: string;
  views: number;
  audioPlays: number;
  navigations: number;
}

export interface VisitByHourItem {
  hour: number;
  count: number;
}

export interface DashboardData {
  stats: DashboardStats;
  dailyTrend: DailyTrendItem[];
  weeklyTrend: WeeklyTrendItem[];
  popularRestaurants: PopularRestaurantItem[];
  visitsByHour: VisitByHourItem[];
  languageDistribution: { language: string; count: number }[];
  restaurantByStatus: { status: string; count: number }[];
  recentActivity: {
    id: string;
    action: string;
    restaurantName: string;
    createdAt: string;
  }[];
}
