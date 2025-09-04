# 🏫 HƯỚNG DẪN ADMIN TẠO TÀI KHOẢN

## 📋 OVERVIEW
Hệ thống **không có đăng ký công khai**. Chỉ Admin (Hiệu trưởng) mới có thể tạo tài khoản cho:
- Giáo viên (teacher)
- Chuyên viên dinh dưỡng (nutritionist) 
- Phụ huynh (parent)

## 🔐 AUTHENTICATION
Trước tiên, admin cần đăng nhập để lấy token:

```bash
POST http://localhost:3002/api/auth/login
Content-Type: application/json

{
  "email": "admin@kindergarten.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "user": { ... },
    "token": "your-jwt-token-here"
  }
}
```

## 👩‍🏫 TẠO TÀI KHOẢN GIÁO VIÊN

```bash
POST http://localhost:3002/api/users
Authorization: Bearer your-jwt-token-here
Content-Type: application/json

{
  "name": "Nguyễn Thị Lan",
  "email": "nguyenlan@kindergarten.com",
  "password": "teacher123",
  "role": "teacher",
  "phone": "0901234567",
  "address": "123 Đường ABC, Quận 1, TP.HCM"
}
```

## 🥗 TẠO TÀI KHOẢN CHUYÊN VIÊN DINH DƯỠNG

```bash
POST http://localhost:3002/api/users
Authorization: Bearer your-jwt-token-here
Content-Type: application/json

{
  "name": "Trần Văn Minh",
  "email": "tranminh@kindergarten.com",
  "password": "nutritionist123",
  "role": "nutritionist",
  "phone": "0902345678",
  "address": "456 Đường XYZ, Quận 2, TP.HCM"
}
```

## 👨‍👩‍👧‍👦 TẠO TÀI KHOẢN PHỤ HUYNH (KÈM CON)

```bash
POST http://localhost:3002/api/users
Authorization: Bearer your-jwt-token-here
Content-Type: application/json

{
  "name": "Lê Văn Hùng",
  "email": "levanhung@gmail.com",
  "password": "parent123",
  "role": "parent",
  "phone": "0903456789",
  "address": "789 Đường DEF, Quận 3, TP.HCM",
  "children": [
    {
      "name": "Lê Minh An",
      "birthday": "2019-05-15",
      "gender": "male",
      "classroom": "Lớp Chồi"
    },
    {
      "name": "Lê Minh Châu", 
      "birthday": "2020-08-22",
      "gender": "female",
      "classroom": "Lớp Lá"
    }
  ]
}
```

## 📝 VALIDATION RULES

### Required Fields (Bắt buộc):
- `name`: Họ tên
- `email`: Email (unique)
- `password`: Mật khẩu
- `role`: Vai trò (teacher, nutritionist, parent)

### Optional Fields:
- `phone`: Số điện thoại
- `address`: Địa chỉ
- `children`: Mảng thông tin con (chỉ dành cho parent)

### Role Restrictions:
- ❌ Không thể tạo tài khoản `admin`
- ✅ Chỉ được tạo: `teacher`, `nutritionist`, `parent`
- ✅ Email phải unique trong hệ thống

## 🎯 RESPONSE EXAMPLES

### ✅ Success Response:
```json
{
  "success": true,
  "message": "Tạo tài khoản Phụ huynh thành công",
  "data": {
    "user": {
      "id": "user-1693123456789",
      "name": "Lê Văn Hùng",
      "email": "levanhung@gmail.com",
      "role": "parent",
      "phone": "0903456789",
      "address": "789 Đường DEF, Quận 3, TP.HCM",
      "isActive": true,
      "createdAt": "2025-08-29T10:30:00.000Z",
      "createdBy": "admin-001"
    },
    "childrenCreated": 2
  }
}
```

### ❌ Error Responses:

**Thiếu thông tin:**
```json
{
  "success": false,
  "message": "Thiếu thông tin bắt buộc: name, email"
}
```

**Email đã tồn tại:**
```json
{
  "success": false,
  "message": "Email đã tồn tại trong hệ thống"
}
```

**Role không hợp lệ:**
```json
{
  "success": false,
  "message": "Role không hợp lệ. Chỉ cho phép: teacher, nutritionist, parent"
}
```

**Không có quyền:**
```json
{
  "success": false,
  "message": "Forbidden: Chỉ hiệu trưởng mới có thể tạo tài khoản người dùng"
}
```

## 🔍 KIỂM TRA TÀI KHOẢN ĐÃ TẠO

```bash
GET http://localhost:3002/api/users
Authorization: Bearer your-jwt-token-here
```

## 📚 LƯU Ý QUAN TRỌNG

1. **Bảo mật**: Chỉ admin mới có thể tạo tài khoản
2. **Mật khẩu**: Được hash tự động bằng bcrypt
3. **Parent-Child**: Khi tạo parent, có thể thêm nhiều con cùng lúc
4. **Email**: Phải unique, không được trùng lặp
5. **No Registration**: Hệ thống không có endpoint đăng ký công khai

## 🧪 TEST WORKFLOW

1. **Login admin** → Lấy token
2. **Tạo teacher** → Test role teacher
3. **Tạo nutritionist** → Test role nutritionist  
4. **Tạo parent + children** → Test role parent với con
5. **Kiểm tra users list** → Verify tài khoản đã tạo
6. **Test login** → Đăng nhập bằng tài khoản mới tạo

---

🎯 **Kết quả**: Hệ thống quản lý tài khoản hoàn toàn bởi admin, không có đăng ký tự do!
