# Food Tour API Server

Backend API cho ứng dụng Thuyết minh tự động cho phố ẩm thực.

## Tech Stack

- **Runtime**: Node.js + Express
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT (bcrypt)
- **Language**: TypeScript

## Setup

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Cấu hình Database

Đảm bảo PostgreSQL đang chạy và tạo database:

```sql
CREATE DATABASE food_tour;
```

### 3. Cấu hình Environment

```bash
cp .env.example .env
# Chỉnh sửa .env với DATABASE_URL và JWT_SECRET của bạn
```

### 4. Khởi tạo Database

```bash
# Generate Prisma Client
npm run db:generate

# Chạy migrations
npm run db:migrate

# Seed data mẫu
npm run db:seed
```

### 5. Chạy server

```bash
# Development mode (với hot reload)
npm run dev

# Production mode
npm run build
npm start
```

Server sẽ chạy tại `http://localhost:4000`

## Port Configuration

| Service | Port | URL |
|---------|------|-----|
| API Server | 4000 | http://localhost:4000 |
| Admin Portal | 5173 | http://localhost:5173 |
| Restaurant Portal | 5174 | http://localhost:5174 |
| User App | 5175 | http://localhost:5175 |
| PostgreSQL | 5432 | localhost:5432 |

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/admin/login` | Admin login |
| POST | `/api/auth/admin/register` | Register admin (admin only) |
| POST | `/api/auth/owner/register` | Restaurant owner register |
| POST | `/api/auth/owner/login` | Restaurant owner login |
| GET | `/api/auth/owner/profile` | Get owner profile |

### POIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/pois` | List all POIs |
| GET | `/api/pois/:id` | Get POI by ID |
| POST | `/api/pois` | Create POI (admin) |
| PUT | `/api/pois/:id` | Update POI (admin) |
| DELETE | `/api/pois/:id` | Delete POI (admin) |
| GET | `/api/pois/stats` | Get POI statistics |

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

## Default Admin Credentials

Sau khi seed:

- **Username**: `admin`
- **Password**: `admin123`

## Project Structure

```
server/
├── src/
│   ├── config/        # Configuration
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Auth & validation middleware
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   └── index.ts        # Entry point
├── prisma/
│   ├── schema.prisma   # Database schema
│   └── seed.ts         # Seed data
└── package.json
```

## Database Schema

```
Admin ─────────────┐
                    │
RestaurantOwner ────► Restaurant ──► MenuItem
                    │
POI ───────────────►│
                    │
                    └──► AudioGuide
```
