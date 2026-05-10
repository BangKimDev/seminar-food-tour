import { SystemUser, Restaurant, MenuItem } from './types';

export const SAMPLE_USER: SystemUser = {
  id: 'sample_admin',
  username: 'admin',
  email: 'admin@foodstreet.vn',
  passwordHash: '',
  name: 'Quản trị viên mẫu',
  status: 'approved',
  createdAt: new Date().toISOString(),
};

export const SAMPLE_RESTAURANT: Restaurant = {
  id: 'sample_admin',
  ownerId: 'sample_admin',
  ownerEmail: 'admin@foodstreet.vn',
  name: 'Quán Ăn Mẫu FoodStreet',
  status: 'approved',
  description: 'Đây là quán ăn mẫu để bạn trải nghiệm hệ thống quản lý.',
  location: { lat: 10.7769, lng: 106.7009 },
  createdAt: new Date().toISOString(),
};

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  {
    id: '1',
    restaurantId: 'sample_admin',
    dishName: 'Phở Bò Truyền Thống',
    price: 55000,
    category: 'Món chính',
    imageUrl: 'https://picsum.photos/seed/pho/400/300',
    isAvailable: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    restaurantId: 'sample_admin',
    dishName: 'Bún Chả Hà Nội',
    price: 45000,
    category: 'Món chính',
    imageUrl: 'https://picsum.photos/seed/buncha/400/300',
    isAvailable: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    restaurantId: 'sample_admin',
    dishName: 'Cà Phê Sữa Đá',
    price: 25000,
    category: 'Đồ uống',
    imageUrl: 'https://picsum.photos/seed/coffee/400/300',
    isAvailable: true,
    createdAt: new Date().toISOString(),
  },
];
