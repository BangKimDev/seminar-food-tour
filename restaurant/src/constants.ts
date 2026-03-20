/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SystemUser, Restaurant, MenuItem } from './types';

export const SAMPLE_USER: SystemUser = {
  id: 'sample_admin',
  email: 'admin@foodstreet.vn',
  name: 'Quản trị viên mẫu',
  status: 'approved'
};

export const SAMPLE_RESTAURANT: Restaurant = {
  id: 'sample_admin',
  name: 'Quán Ăn Mẫu FoodStreet',
  ownerEmail: 'admin@foodstreet.vn',
  status: 'approved',
  description: 'Đây là quán ăn mẫu để bạn trải nghiệm hệ thống quản lý.',
  location: { lat: 10.7769, lng: 106.7009 },
  createdAt: new Date().toISOString()
};

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  {
    id: '1',
    restaurantId: 'sample_admin',
    dishName: 'Phở Bò Truyền Thống',
    price: 55000,
    category: 'Món chính',
    imageUrl: 'https://picsum.photos/seed/pho/400/300',
    isAvailable: true
  },
  {
    id: '2',
    restaurantId: 'sample_admin',
    dishName: 'Bún Chả Hà Nội',
    price: 45000,
    category: 'Món chính',
    imageUrl: 'https://picsum.photos/seed/buncha/400/300',
    isAvailable: true
  },
  {
    id: '3',
    restaurantId: 'sample_admin',
    dishName: 'Cà Phê Sữa Đá',
    price: 25000,
    category: 'Đồ uống',
    imageUrl: 'https://picsum.photos/seed/coffee/400/300',
    isAvailable: true
  }
];
