# 🏫 Kindergarten Nutrition Management System - Pure Node.js

Hệ thống quản lý dinh dưỡng mầm non được xây dựng với **Node.js thuần** và **MySQL**.

## 📋 Tính năng chính

- ✅ **Pure Node.js** - Không sử dụng framework Express.js
- ✅ **MySQL Database** - Cơ sở dữ liệu quan hệ
- ✅ **RESTful API** - API chuẩn REST
- ✅ **Authentication** - Xác thực JWT
- ✅ **User Management** - Quản lý người dùng
- ✅ **Child Management** - Quản lý thông tin trẻ em
- ✅ **Food Management** - Quản lý thực phẩm
- ✅ **Meal Planning** - Lập kế hoạch bữa ăn
- ✅ **Demo Mode** - Chạy thử không cần database

## 🚀 Cài đặt và chạy

### Yêu cầu hệ thống
- Node.js >= 18.0.0
- MySQL >= 8.0 (tùy chọn)

### 1. Clone project
```bash
git clone <repository-url>
cd kindergarten-nutrition-backend
```

### 2. Cài đặt dependencies
```bash
npm install
```

### 3. Cấu hình môi trường
Tạo file `.env`:
```env
# Server Configuration
PORT=3002
HOST=localhost

# Database Configuration (MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=kindergarten_nutrition

# JWT Configuration
JWT_SECRET=kindergarten_secret_key
JWT_EXPIRY=24h
```

### 4. Chạy server

#### 🎯 Demo Mode (Không cần MySQL)
```bash
node server-demo.js
```

#### 🔧 Production Mode (Cần MySQL)
```bash
# Tạo database và tables
mysql -u root -p < database/init.sql

# Chạy server
npm start
# hoặc
npm run dev
```

## 📡 API Endpoints

### Base URL: `http://localhost:3002/api`

### 🏥 Health Check
```http
GET /api/health
```

### 🔐 Authentication
```http
# Đăng nhập
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@kindergarten.com",
  "password": "admin123"
}

# Lấy thông tin profile
GET /api/auth/me
Authorization: Bearer <token>
```

### 👥 Users
```http
# Lấy danh sách người dùng
GET /api/users

# Lấy thông tin user theo ID
GET /api/users/:id
```

### 👶 Children
```http
# Lấy danh sách trẻ em
GET /api/children

# Tạo hồ sơ trẻ em mới
POST /api/children
Content-Type: application/json

{
  "studentId": "HS001",
  "fullName": "Nguyễn Văn A",
  "dateOfBirth": "2020-05-15",
  "gender": "male",
  "className": "Lá 1",
  "parentId": "user-id",
  "allergies": ["Tôm", "Cua"],
  "medicalConditions": []
}
```

### 🍎 Foods
```http
# Lấy danh sách thực phẩm
GET /api/foods

# Tạo thực phẩm mới
POST /api/foods
Content-Type: application/json

{
  "name": "Cơm trắng",
  "category": "grain",
  "caloriesPer100g": 130,
  "proteinPer100g": 2.7,
  "fatPer100g": 0.3,
  "carbsPer100g": 28,
  "allergens": []
}
```

### 🍽️ Meals
```http
# Lấy danh sách bữa ăn
GET /api/meals

# Tạo bữa ăn mới
POST /api/meals
Content-Type: application/json

{
  "name": "Bữa trưa - Cơm thịt rau",
  "mealType": "lunch",
  "date": "2025-08-29",
  "description": "Bữa trưa đầy đủ dinh dưỡng",
  "ageGroup": "3-4 years"
}
```

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'teacher', 'parent', 'nutritionist') DEFAULT 'teacher',
    phone VARCHAR(15),
    address TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Children Table
```sql
CREATE TABLE children (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender ENUM('male', 'female') NOT NULL,
    parent_id CHAR(36),
    teacher_id CHAR(36),
    class_name VARCHAR(50),
    allergies JSON,
    medical_conditions JSON,
    emergency_contact JSON,
    admission_date DATE DEFAULT (CURRENT_DATE),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL
);
```

## 🧪 Testing

### Test với curl
```bash
# Health check
curl http://localhost:3002/api/health

# Login
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@kindergarten.com", "password": "admin123"}'

# Get users
curl http://localhost:3002/api/users

# Get children
curl http://localhost:3002/api/children

# Get foods
curl http://localhost:3002/api/foods

# Get meals
curl http://localhost:3002/api/meals
```

### Test với PowerShell
```powershell
# Health check
Invoke-RestMethod -Uri "http://localhost:3002/api/health" -Method Get

# Login
$loginData = @{
    email = "admin@kindergarten.com"
    password = "admin123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3002/api/auth/login" -Method Post -Body $loginData -ContentType "application/json"
```

## 📁 Cấu trúc thư mục

```
kindergarten-nutrition-backend/
├── database/
│   ├── DatabaseManager.js     # Quản lý kết nối MySQL
│   └── init.sql              # Schema database
├── services/
│   ├── AuthService.js        # Xác thực người dùng
│   ├── UserService.js        # Quản lý người dùng
│   ├── ChildService.js       # Quản lý trẻ em
│   ├── FoodService.js        # Quản lý thực phẩm
│   └── MealService.js        # Quản lý bữa ăn
├── server-pure.js            # Server chính (cần MySQL)
├── server-demo.js            # Server demo (không cần MySQL)
├── package.json              # Dependencies
├── .env                      # Cấu hình môi trường
└── README.md                 # Tài liệu hướng dẫn
```

## 🔧 Troubleshooting

### 1. Lỗi kết nối MySQL
```bash
# Kiểm tra MySQL đang chạy
mysql -u root -p

# Tạo database
CREATE DATABASE kindergarten_nutrition;
```

### 2. Lỗi port đã được sử dụng
```bash
# Kiểm tra port 3002
netstat -ano | findstr :3002

# Thay đổi port trong .env
PORT=3003
```

### 3. Lỗi dependencies
```bash
# Cài đặt lại dependencies
rm -rf node_modules package-lock.json
npm install
```

## 🛠️ Technology Stack

- **Runtime**: Node.js (Pure JavaScript)
- **Database**: MySQL 8.0+
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **HTTP Server**: Node.js native http module
- **Development**: nodemon

## 📝 Notes

- Server sử dụng **Node.js thuần**, không có Express.js
- Database sử dụng **MySQL** với raw queries
- Hỗ trợ **CORS** cho frontend
- Authentication với **JWT tokens**
- **Demo mode** để test nhanh không cần database
- Tất cả responses đều ở định dạng **JSON**

## 🎯 Demo Credentials

```json
{
  "email": "admin@kindergarten.com",
  "password": "admin123"
}
```

## 📞 Support

Nếu gặp vấn đề, vui lòng kiểm tra:
1. Node.js version >= 18
2. MySQL service đang chạy (nếu dùng production mode)
3. Port 3002 không bị conflict
4. File .env đã được cấu hình đúng

Happy coding! 🚀
