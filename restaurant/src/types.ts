/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Restaurant {
  id: string;
  name: string;
  ownerEmail: string;
  status: 'pending' | 'approved' | 'rejected';
  description: string;
  location: { lat: number; lng: number };
  createdAt: string;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  dishName: string;
  price: number;
  category?: string;
  imageUrl?: string;
  isAvailable: boolean;
}

export interface SystemUser {
  id: string;
  email: string;
  name: string;
  status: 'pending' | 'approved' | 'rejected';
}
