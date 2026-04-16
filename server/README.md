# Food Tour API Server

Backend API cho ứng dụng **Thuyết minh tự động cho phố ẩm thực**.

## Quick Start

```bash
# 1. Cài đặt dependencies
npm install

# 2. Cấu hình .env
cp .env.example .env

# 3. Tạo database PostgreSQL
CREATE DATABASE food_tour;

# 4. Khởi tạo database
npm run db:generate
npm run db:migrate
npm run db:seed

# 5. Chạy server
npm run dev
```

Server chạy tại: **http://localhost:4000**

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Express.js 5 | Web framework |
| TypeScript | Type safety |
| Prisma 6 | ORM cho PostgreSQL |
| JWT | Authentication |
| bcrypt | Password hashing |
| Cloudinary | Audio file storage |
| Zod | Request validation |

---

## Project Structure

```
server/
├── src/
│   ├── config/
│   │   ├── index.ts         # App config (PORT, JWT, Cloudinary)
│   │   └── database.ts      # Prisma client singleton
│   ├── controllers/
│   │   ├── authController.ts    # Login, register, profile
│   │   ├── audioGuideController.ts
│   │   ├── dashboardController.ts
│   │   ├── menuController.ts
│   │   ├── poiController.ts
│   │   ├── restaurantController.ts
│   │   └── uploadController.ts  # Cloudinary upload
│   ├── middleware/
│   │   ├── auth.ts          # JWT authentication
│   │   └── validate.ts      # Zod validation
│   ├── routes/
│   │   ├── index.ts         # Route aggregator
│   │   ├── authRoutes.ts
│   │   ├── audioGuideRoutes.ts
│   │   ├── dashboardRoutes.ts
│   │   ├── poiRoutes.ts
│   │   ├── restaurantRoutes.ts
│   │   └── uploadRoutes.ts
│   ├── services/
│   │   ├── authService.ts
│   │   ├── audioGuideService.ts
│   │   ├── cloudinaryService.ts # Cloud upload
│   │   ├── menuService.ts
│   │   ├── poiService.ts
│   │   └── restaurantService.ts
│   └── index.ts             # Express entry point
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Sample data
├── .env                      # Environment variables
├── .env.example
└── package.json
```

---

## Database Schema

### Tables

| Table | Description |
|-------|-------------|
| `Admin` | System administrators (role: super_admin, admin, content_editor) |
| `RestaurantOwner` | Restaurant owners (status: pending, approved, rejected) |
| `POI` | Points of Interest (category: main, wc, ticket, parking, boat, restaurant, cafe, market) |
| `Restaurant` | Restaurants (status: pending, approved, rejected) |
| `MenuItem` | Menu items linked to restaurants |
| `AudioGuide` | Multi-language audio guides (unique per restaurant + language) |
| `Visit` | Analytics tracking (view, audio_play, navigation) |

### Relationships

```
Admin
RestaurantOwner ──▶ Restaurant ──▶ MenuItem
                          │
                          ├──▶ AudioGuide
                          │
POI ───────────────────────┘
                          │
Visit ────────────────────┘
```

---

## API Endpoints

### Authentication

```
POST   /api/auth/admin/login        # Admin login
POST   /api/auth/admin/register     # Register admin (super_admin only)
POST   /api/auth/owner/register     # Owner registration
POST   /api/auth/owner/login        # Owner login
GET    /api/auth/owner/profile      # Get owner profile
```

### Dashboard

```
GET    /api/dashboard/stats          # Get statistics
```

### POIs

```
GET    /api/pois                    # List all POIs
GET    /api/pois/:id                # Get POI by ID
POST   /api/pois                    # Create POI (admin)
PUT    /api/pois/:id                # Update POI (admin)
DELETE /api/pois/:id                # Delete POI (admin)
```

### Restaurants

```
GET    /api/restaurants            # List restaurants
GET    /api/restaurants/nearby     # Get nearby restaurants
GET    /api/restaurants/:id         # Get restaurant by ID
POST   /api/restaurants             # Create restaurant (admin)
PUT    /api/restaurants/:id         # Update restaurant
DELETE /api/restaurants/:id         # Delete restaurant (admin)
```

### Menu

```
GET    /api/restaurants/:id/menu    # Get restaurant menu
POST   /api/restaurants/:id/menu    # Add menu item
PUT    /api/restaurants/menu/:id    # Update menu item
DELETE /api/restaurants/menu/:id    # Delete menu item
```

### Audio Guides

```
GET    /api/audio-guides/languages             # Get supported languages
GET    /api/audio-guides/restaurant/:id        # Get guides for restaurant
GET    /api/audio-guides/:id                   # Get guide by ID
POST   /api/audio-guides                       # Create audio guide
PUT    /api/audio-guides/:id                   # Update audio guide
DELETE /api/audio-guides/:id                   # Delete audio guide
```

### Upload

```
POST   /api/upload/audio            # Upload audio to Cloudinary
```

---

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/food_tour

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-characters

# Server
PORT=4000

# Cloudinary (https://cloudinary.com)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

---

## Demo Accounts

Sau khi seed (`npm run db:seed`):

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | super_admin |
| editor | editor123 | content_editor |

---

## Seed Data

Script tạo sẵn:

- **10 POIs** - Các địa điểm trên phố ẩm thực
- **8 Restaurants** - Nhà hàng với thông tin mẫu
- **29 Menu Items** - Món ăn cho từng nhà hàng
- **20 Audio Guides** - Thuyết minh đa ngôn ngữ:
  - 8 Vietnamese (vi)
  - 8 English (en)
  - 2 Japanese (ja)
  - 2 Chinese (zh)

---

## Available Scripts

```bash
npm run dev          # Development mode (tsx watch)
npm run build        # Build TypeScript
npm start            # Run production build
npm run db:generate  # Generate Prisma client
npm run db:migrate    # Run migrations
npm run db:push       # Push schema to DB
npm run db:seed       # Seed sample data
```

---

## Prisma Studio

Mở giao diện quản lý database:

```bash
npx prisma studio
```

Truy cập: **http://localhost:5555**

---

## CORS Configuration

Server cho phép origins:

- http://localhost:5173 (Admin)
- http://localhost:5174 (Restaurant)
- http://localhost:5175 (User)

---

## Error Handling

Response format:

```json
{
  "success": false,
  "error": "Error message"
}
```

Success response:

```json
{
  "success": true,
  "data": { ... }
}
```
