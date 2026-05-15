/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Restaurant {
  id: string;
  ownerId: string;
  ownerEmail: string;
  name: string;
  description: string;
  cuisine?: string;
  location: { lat: number; lng: number };
  imageUrl?: string;
  openingHours?: string;
  status: 'pending' | 'approved' | 'rejected';
  views?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface SystemUser {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  name: string;
  restaurantId?: string;
  address?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  dishName: string;
  description?: string;
  price: number;
  category?: string;
  imageUrl?: string;
  cropX?: number;
  cropY?: number;
  isAvailable: boolean;
  isFeatured?: boolean;
  createdAt: string;
  updatedAt?: string;
}