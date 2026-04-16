# Seminar Food Tour Application

Hệ thống quản lý và trải nghiệm Food Tour, bao gồm ứng dụng cho người dùng, trang quản trị cho admin, trang quản trị cho nhà hàng và hệ thống backend.

## Cấu trúc dự án

Dự án được chia thành 4 thành phần chính:

| Thành phần | Mô tả | Công nghệ chính | Cổng (Port) |
| :--- | :--- | :--- | :--- |
| `server` | Backend API | Node.js, Express, Prisma, PostgreSQL | 4000 |
| `admin` | Trang quản trị hệ thống | React, Vite, Tailwind CSS | 5173 |
| `restaurant` | Trang quản lý nhà hàng | React, Vite, Tailwind CSS | 5174 |
| `user` | Ứng dụng người dùng | React, Vite, Tailwind CSS, Leaflet | 5175 |

---

## Hướng dẫn cài đặt

### 1. Yêu cầu hệ thống

- Node.js (phiên bản 18 trở lên)
- PostgreSQL (Cơ sở dữ liệu)
- Tài khoản Cloudinary (Để lưu trữ hình ảnh)

### 2. Cài đặt Dependencies

Bạn cần cài đặt dependencies cho từng thư mục:

```bash
# Cài đặt cho Server
cd server
npm install

# Cài đặt cho Admin
cd ../admin
npm install

# Cài đặt cho Restaurant
cd ../restaurant
npm install

# Cài đặt cho User
cd ../user
npm install
```

### 3. Cấu hình biến môi trường (.env)

Trong mỗi thư mục, sao chép file `.env.example` thành `.env` và điền các thông tin cần thiết.

#### Server (`server/.env`):
- `DATABASE_URL`: Đường dẫn kết nối PostgreSQL.
- `JWT_SECRET`: Khóa bí mật cho JWT.
- `CLOUDINARY_*`: Thông tin API từ Cloudinary.
- `PORT`: Mặc định là 4000.

#### Frontend (`admin/.env`, `restaurant/.env`, `user/.env`):
- `GEMINI_API_KEY`: API Key cho các tính năng AI (Gemini).
- `APP_URL`: URL của ứng dụng.

---

## Chạy dự án

### 1. Thiết lập Database (Server)

Trước khi chạy server lần đầu, bạn cần khởi tạo database:

```bash
cd server
# Tạo file prisma client
npm run db:generate

# Tạo bảng theo schema Prisma (Yêu cầu PostgreSQL đang chạy)
npm run db:migrate

# (Tùy chọn) Chạy seed dữ liệu mẫu
npm run db:seed
```

### 2. Chạy Server

```bash
cd server
npm run dev
```
Server sẽ chạy tại: `http://localhost:4000`

### 3. Chạy các ứng dụng Frontend

Mở các terminal mới cho từng ứng dụng:

```bash
# Chạy Admin Dashboard
cd admin
npm run dev

# Chạy Restaurant Dashboard
cd restaurant
npm run dev

# Chạy User Application
cd user
npm run dev
```

---

## Các lệnh chính (Server)

- `npm run dev`: Chạy server ở chế độ development (tự động reload).
- `npm run build`: Build dự án sang TypeScript.
- `npm run start`: Chạy server đã build.
- `npx prisma studio`: Mở giao diện quản lý database của Prisma.

---

## Công nghệ sử dụng

- **Backend**: Express, TypeScript, Prisma ORM, PostgreSQL, JWT Authentication.
- **Frontend**: React 19, Vite, Tailwind CSS v4, Framer Motion (Animations), Lucide React (Icons).
- **Maps**: Leaflet & React Leaflet (đối với ứng dụng User và Admin).
- **AI Integration**: Google Gemini API.
