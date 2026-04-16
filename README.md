# Seminar Food Tour Application

Hệ thống quản lý và trải nghiệm Food Tour - **Thuyết minh tự động cho phố ẩm thực**.

## Mục lục

- [Giới thiệu](#giới-thiệu)
- [Tech Stack](#tech-stack)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Hướng dẫn cài đặt](#hướng-dẫn-cài-đặt)
- [Cấu hình biến môi trường](#cấu-hình-biến-môi-trường)
- [Cách chạy ứng dụng](#cách-chạy-ứng-dụng)
- [Tài khoản demo](#tài-khoản-demo)
- [Tính năng chính](#tính-năng-chính)
- [API Endpoints](#api-endpoints)

---

## Giới thiệu

**Thuyết minh tự động cho phố ẩm thực** là hệ thống bao gồm:

- **Admin Portal**: Trang quản trị cho admin quản lý POIs, nhà hàng, và nội dung thuyết minh
- **Restaurant Portal**: Trang quản lý cho chủ nhà hàng cập nhật thông tin và menu
- **User App**: Ứng dụng di động cho khách du lịch trải nghiệm food tour với thuyết minh đa ngôn ngữ
- **Backend API**: RESTful API hỗ trợ xác thực, CRUD operations, và tích hợp AI

---

## Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 5
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma 6
- **Authentication**: JWT + bcrypt

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 4
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Maps**: Leaflet + React Leaflet

### AI & Cloud
- **AI**: Google Gemini API (dịch thuật + TTS)
- **Storage**: Cloudinary (lưu trữ audio files)

---

## Cấu trúc dự án

```
seminar-food-tour/
├── server/                    # Backend API (Port 4000)
│   ├── src/
│   │   ├── config/           # Cấu hình ứng dụng
│   │   ├── controllers/     # Xử lý request/response
│   │   ├── middleware/       # Auth & validation
│   │   ├── routes/           # Định nghĩa routes
│   │   ├── services/         # Business logic
│   │   └── index.ts          # Entry point
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   └── seed.ts           # Dữ liệu mẫu
│   ├── .env                  # Environment variables
│   └── package.json
│
├── admin/                     # Admin Portal (Port 5173)
│   ├── src/
│   │   ├── pages/           # Trang quản trị
│   │   ├── services/         # API clients
│   │   ├── hooks/            # Custom React hooks
│   │   └── App.tsx
│   └── package.json
│
├── restaurant/               # Restaurant Owner Portal (Port 5174)
│   ├── src/
│   │   ├── pages/            # Trang quản lý
│   │   ├── services/         # API clients
│   │   └── App.tsx
│   └── package.json
│
└── user/                     # User Mobile App (Port 5175)
    ├── src/
    │   ├── pages/            # Trang người dùng
    │   ├── components/       # UI components
    │   └── App.tsx
    └── package.json
```

### Database Schema

```
┌─────────────────┐
│      Admin      │
└────────┬────────┘
         │
┌────────┴────────────────────┐
│   RestaurantOwner           │
└────────┬────────────────────┘
         │
┌────────┴────────┐    ┌──────────┐
│   Restaurant    │───▶│ MenuItem │
└────────┬────────┘    └──────────┘
         │
┌────────┼──────────────────────────┐
│        │                          │
▼        ▼                          ▼
┌─────────────┐    ┌─────────────┐  ┌──────────────┐
│     POI     │    │ AudioGuide  │  │    Visit     │
└─────────────┘    └─────────────┘  └──────────────┘
```

---

## Yêu cầu hệ thống

- **Node.js**: Phiên bản 18 trở lên
- **PostgreSQL**: Database server đang chạy
- **Cloudinary**: Tài khoản (miễn phí) để lưu trữ audio files
- **Gemini API Key**: Để sử dụng tính năng AI (dịch thuật + TTS)

---

## Hướng dẫn cài đặt

### 1. Clone và cài đặt dependencies

```bash
# Clone repository
git clone <repository-url>
cd seminar-food-tour

# Cài đặt dependencies cho tất cả projects
cd server && npm install
cd ../admin && npm install
cd ../restaurant && npm install
cd ../user && npm install
```

### 2. Tạo Database

Đăng nhập PostgreSQL và tạo database:

```sql
CREATE DATABASE food_tour;
```

### 3. Cấu hình biến môi trường

Sao chép file `.env.example` thành `.env` trong mỗi thư mục:

```bash
cd server
cp .env.example .env
# Chỉnh sửa .env với thông tin của bạn

cd ../admin
cp .env.example .env

cd ../restaurant
cp .env.example .env

cd ../user
cp .env.example .env
```

### 4. Cấu hình Environment Variables

#### Server (`server/.env`)

```env
DATABASE_URL=postgresql://username:password@localhost:5432/food_tour
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
PORT=4000

# Cloudinary (lấy từ cloudinary.com/dashboard)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

#### Frontend apps (`admin/.env`, `restaurant/.env`, `user/.env`)

```env
VITE_API_URL=http://localhost:4000
VITE_GEMINI_API_KEY=your-gemini-api-key
```

### 5. Khởi tạo Database

```bash
cd server

# Generate Prisma Client
npm run db:generate

# Chạy migrations (tạo bảng)
npm run db:migrate

# Seed dữ liệu mẫu
npm run db:seed
```

---

## Cách chạy ứng dụng

### 1. Chạy Backend Server

```bash
cd server
npm run dev
```
Server chạy tại: **http://localhost:4000**

### 2. Chạy Admin Portal

```bash
cd admin
npm run dev
```
Admin Portal: **http://localhost:5173**

### 3. Chạy Restaurant Portal

```bash
cd restaurant
npm run dev
```
Restaurant Portal: **http://localhost:5174**

### 4. Chạy User App

```bash
cd user
npm run dev
```
User App: **http://localhost:5175**

> **Tip**: Mở các terminal riêng biệt cho mỗi ứng dụng.

---

## Tài khoản demo

Sau khi chạy `npm run db:seed`, các tài khoản sau sẽ được tạo:

| Role | Username | Password | Permissions |
|------|----------|----------|-------------|
| Super Admin | `admin` | `admin123` | Full access |
| Content Editor | `editor` | `editor123` | View + Edit content |

---

## Tính năng chính

### Admin Portal

- **Dashboard**: Thống kê tổng quan (POIs, nhà hàng, audio guides, visits)
- **POI Management**: CRUD Points of Interest trên bản đồ
- **Restaurant Management**: Quản lý thông tin và trạng thái nhà hàng
- **Menu Management**: Thêm/sửa/xóa món ăn
- **Audio Guide Management**:
  - Tạo thuyết minh với AI (Gemini)
  - Dịch thuật đa ngôn ngữ (VN, EN, ZH, JA, KO, FR, ES)
  - Text-to-Speech với Cloudinary
  - Upload audio lên Cloudinary

### Restaurant Portal

- Quản lý thông tin nhà hàng
- Cập nhật menu
- Xem thống kê visits

### User App

- Khám phá nhà hàng trên bản đồ
- Xem chi tiết và menu nhà hàng
- Phát audio guide đa ngôn ngữ
- Navigation đến nhà hàng

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/admin/login` | Admin login |
| POST | `/api/auth/admin/register` | Register admin (super_admin only) |
| POST | `/api/auth/owner/register` | Restaurant owner register |
| POST | `/api/auth/owner/login` | Restaurant owner login |
| GET | `/api/auth/owner/profile` | Get owner profile |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Get dashboard statistics |

### POIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/pois` | List all POIs |
| GET | `/api/pois/:id` | Get POI by ID |
| POST | `/api/pois` | Create POI (admin) |
| PUT | `/api/pois/:id` | Update POI (admin) |
| DELETE | `/api/pois/:id` | Delete POI (admin) |

### Restaurants

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/restaurants` | List restaurants |
| GET | `/api/restaurants/nearby` | Get nearby restaurants |
| GET | `/api/restaurants/:id` | Get restaurant by ID |
| POST | `/api/restaurants` | Create restaurant (admin) |
| PUT | `/api/restaurants/:id` | Update restaurant |
| DELETE | `/api/restaurants/:id` | Delete restaurant (admin) |

### Menu

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/restaurants/:id/menu` | Get restaurant menu |
| POST | `/api/restaurants/:id/menu` | Add menu item |
| PUT | `/api/restaurants/menu/:id` | Update menu item |
| DELETE | `/api/restaurants/menu/:id` | Delete menu item |

### Audio Guides

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/audio-guides/languages` | Get supported languages |
| GET | `/api/audio-guides/restaurant/:id` | Get audio guides for restaurant |
| GET | `/api/audio-guides/:id` | Get audio guide by ID |
| POST | `/api/audio-guides` | Create audio guide (admin) |
| PUT | `/api/audio-guides/:id` | Update audio guide (admin) |
| DELETE | `/api/audio-guides/:id` | Delete audio guide (admin) |

### Upload

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload/audio` | Upload audio file to Cloudinary |

---

## Các lệnh hữu ích

### Server

```bash
npm run dev          # Chạy development mode
npm run build        # Build sang JavaScript
npm start            # Chạy production server
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Chạy migrations
npm run db:seed      # Seed dữ liệu mẫu
npx prisma studio    # Mở Prisma Studio (GUI database)
```

---

## License

MIT License
