/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { POI } from '../types';

export const MOCK_POIS: POI[] = [
  {
    id: '1',
    name: 'Bún Chả Hàng Mành',
    specialty: 'Bún Chả Hà Nội',
    hours: '08:00 - 21:00',
    rating: 4.8,
    lat: 21.0315,
    lng: 105.8485,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    description: 'Quán bún chả gia truyền nổi tiếng nhất khu phố cổ với hương vị nước dùng đậm đà và thịt nướng than hoa.',
    image: 'https://picsum.photos/seed/buncha/400/300'
  },
  {
    id: '2',
    name: 'Phở Gia Truyền Bát Đàn',
    specialty: 'Phở Bò',
    hours: '06:00 - 10:00, 18:00 - 20:30',
    rating: 4.9,
    lat: 21.0330,
    lng: 105.8470,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    description: 'Nổi tiếng với hàng dài người xếp hàng mỗi sáng. Nước dùng trong, ngọt thanh từ xương bò.',
    image: 'https://picsum.photos/seed/pho/400/300'
  },
  {
    id: '3',
    name: 'Bánh Mì Hội An',
    specialty: 'Bánh Mì Thập Cẩm',
    hours: '07:00 - 22:00',
    rating: 4.7,
    lat: 21.0300,
    lng: 105.8500,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    description: 'Bánh mì giòn tan với pate béo ngậy và các loại nhân đặc trưng miền Trung.',
    image: 'https://picsum.photos/seed/banhmi/400/300'
  }
];
