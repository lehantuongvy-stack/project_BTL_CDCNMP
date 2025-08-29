# Hệ Thống Quản Lý Dinh Dưỡng Mầm Non - Backend

API Backend cho việc quản lý dinh dưỡng và theo dõi sức khỏe trẻ em mầm non.

## Tính Năng

- Xác thực và phân quyền người dùng
- Quản lý hồ sơ trẻ em
- Lập kế hoạch và theo dõi bữa ăn
- Phân tích dinh dưỡng và báo cáo
- Theo dõi tăng trưởng

## Công Nghệ Sử Dụng

- **Node.js** - Môi trường runtime
- **Express.js** - Framework web
- **PostgreSQL** - Cơ sở dữ liệu (dự kiến)
- **JWT** - Xác thực
- **Helmet** - Middleware bảo mật
- **Morgan** - Ghi log request
- **CORS** - Chia sẻ tài nguyên cross-origin

## Bắt Đầu

### Yêu Cầu Hệ Thống

- Node.js (phiên bản 14 trở lên)
- npm hoặc yarn
- PostgreSQL (cho production)

### Cài Đặt

1. Clone repository
```bash
git clone <repository-url>
cd kindergarten-nutrition-backend
```

2. Cài đặt dependencies
```bash
npm install
```

3. Tạo file environment
```bash
cp .env.example .env
```

4. Cập nhật các biến môi trường trong file `.env`

5. Khởi chạy development server
```bash
npm run dev
```

Server sẽ chạy tại `http://localhost:3001`

## Scripts Có Sẵn

- `npm start` - Khởi chạy production server
- `npm run dev` - Khởi chạy development server với nodemon
- `npm test` - Chạy tests

## API Endpoints

### Xác Thực
- `POST /api/auth/register` - Đăng ký người dùng mới
- `POST /api/auth/login` - Đăng nhập người dùng
- `GET /api/auth/me` - Lấy thông tin người dùng hiện tại
- `POST /api/auth/logout` - Đăng xuất người dùng

### Quản Lý Trẻ Em
- `GET /api/children` - Lấy danh sách tất cả trẻ em
- `GET /api/children/:id` - Lấy thông tin một trẻ em
- `POST /api/children` - Tạo hồ sơ trẻ em mới
- `PUT /api/children/:id` - Cập nhật thông tin trẻ em
- `DELETE /api/children/:id` - Xóa hồ sơ trẻ em

### Quản Lý Bữa Ăn
- `GET /api/meals` - Lấy danh sách tất cả bữa ăn
- `GET /api/meals/:id` - Lấy thông tin một bữa ăn
- `POST /api/meals` - Tạo bữa ăn mới
- `PUT /api/meals/:id` - Cập nhật bữa ăn
- `DELETE /api/meals/:id` - Xóa bữa ăn

### Theo Dõi Dinh Dưỡng
- `GET /api/nutrition` - Lấy hồ sơ dinh dưỡng
- `GET /api/nutrition/child/:childId` - Lấy hồ sơ theo trẻ em
- `POST /api/nutrition` - Tạo hồ sơ dinh dưỡng mới
- `GET /api/nutrition/report/:childId` - Lấy báo cáo dinh dưỡng

## Cấu Trúc Dự Án

```
kindergarten-nutrition-backend/
├── config/           # Cấu hình database và ứng dụng
├── controllers/      # Controllers cho routes
├── middleware/       # Middleware tùy chỉnh
├── models/          # Models cơ sở dữ liệu
├── routes/          # API routes
├── utils/           # Các hàm tiện ích
├── database/        # Migrations và seeders database
├── tests/           # Test files
├── app.js           # Cấu hình Express app
├── server.js        # Entry point của server
└── package.json     # Dependencies của dự án
```

## Biến Môi Trường

Copy `.env.example` thành `.env` và cập nhật các biến sau:

- `NODE_ENV` - Môi trường (development/production)
- `PORT` - Port của server (mặc định: 3001)
- `DB_URL` - Chuỗi kết nối database
- `JWT_SECRET` - Khóa bí mật JWT
- `FRONTEND_URL` - URL của ứng dụng frontend

## Đóng Góp

1. Fork repository
2. Tạo feature branch
3. Commit các thay đổi của bạn
4. Push lên branch
5. Tạo Pull Request

## Giấy Phép

Dự án này được cấp phép theo giấy phép ISC.
