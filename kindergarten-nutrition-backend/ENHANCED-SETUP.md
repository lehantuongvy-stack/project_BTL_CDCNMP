# 🚀 Enhanced Kindergarten Nutrition Management - Setup Guide

## **📋 HƯỚNG DẪN SETUP ENHANCED VERSION**

### **Bước 1: Setup XAMPP và Database**

1. **Khởi động XAMPP:**
   ```bash
   # Khởi động Apache và MySQL trong XAMPP Control Panel
   ```

2. **Tạo Database qua phpMyAdmin:**
   ```
   URL: http://localhost/phpmyadmin
   - Tạo database: kindergarten_nutrition
   - Import file: database/enhanced-schema.sql
   ```

3. **Hoặc tạo bằng MySQL command line:**
   ```bash
   mysql -u root -p < database/enhanced-schema.sql
   ```

### **Bước 2: Cấu hình Environment**

1. **Copy .env file:**
   ```bash
   copy .env.enhanced .env
   ```

2. **Chỉnh sửa .env nếu cần:**
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=kindergarten_nutrition
   ```

### **Bước 3: Chạy Enhanced Server**

```bash
# Production mode với Enhanced Database
node server-enhanced.js
```

Server sẽ chạy trên: `http://localhost:3001`

## **🎯 ENHANCED FEATURES**

### **1. Quản lý Nguyên liệu (Ingredients)**
```bash
# Lấy danh sách nguyên liệu
GET http://localhost:3001/api/nguyen-lieu

# Tạo nguyên liệu mới
POST http://localhost:3001/api/nguyen-lieu
Authorization: Bearer <token>
{
  "ten_nguyen_lieu": "Gạo tẻ Hà Nội",
  "mo_ta": "Gạo tẻ chất lượng cao",
  "don_vi_tinh": "kg",
  "gia_mua": 25000,
  "calories_per_100g": 130,
  "protein_per_100g": 2.7,
  "fat_per_100g": 0.3,
  "carbs_per_100g": 28,
  "allergens": [],
  "so_luong_ton": 50
}
```

### **2. Quản lý Thực đơn (Menus)**
```bash
# Lấy thực đơn theo ngày
GET http://localhost:3001/api/thuc-don?date=2025-08-29&meal_type=lunch

# Tạo thực đơn mới
POST http://localhost:3001/api/thuc-don
Authorization: Bearer <token>
{
  "ten_thuc_don": "Bữa trưa ngày 29/08",
  "ngay_ap_dung": "2025-08-29",
  "loai_bua_an": "lunch",
  "lop_ap_dung": "Lớp Chồi",
  "so_tre_du_kien": 25,
  "ghi_chu": "Thực đơn đặc biệt"
}
```

### **3. Đánh giá Sức khỏe (Health Assessments)**
```bash
# Lấy lịch sử đánh giá sức khỏe của trẻ
GET http://localhost:3001/api/danh-gia-suc-khoe?child_id=<child_id>&limit=5

# Tạo đánh giá sức khỏe mới
POST http://localhost:3001/api/danh-gia-suc-khoe
Authorization: Bearer <token>
{
  "child_id": "child-uuid",
  "chieu_cao": 105.5,
  "can_nang": 18.2,
  "tinh_trang_suc_khoe": "Trẻ khỏe mạnh, phát triển tốt",
  "ket_luan": "Bình thường",
  "khuyen_cao": "Duy trì chế độ ăn uống hiện tại",
  "an_uong": "good",
  "hoat_dong": "active",
  "tinh_than": "happy"
}
```

### **4. Quản lý Tồn kho (Inventory)**
```bash
# Xem tình trạng tồn kho
GET http://localhost:3001/api/inventory
Authorization: Bearer <token>
```

### **5. Báo cáo Sức khỏe Lớp học**
```bash
# Báo cáo sức khỏe theo lớp
GET http://localhost:3001/api/reports/class-health?class_name=Lớp Chồi
Authorization: Bearer <token>
```

## **📊 DATABASE SCHEMA HIGHLIGHTS**

### **Enhanced Tables:**
- ✅ `users` - Người dùng với role mở rộng
- ✅ `children` - Trẻ em với thông tin sức khỏe chi tiết
- ✅ `nguyen_lieu` - Nguyên liệu với đầy đủ thông tin dinh dưỡng
- ✅ `mon_an` - Món ăn với hướng dẫn chế biến
- ✅ `thuc_don` - Thực đơn với phê duyệt workflow
- ✅ `chi_tiet_thuc_don` - Chi tiết thực đơn
- ✅ `chi_tiet_mon_an` - Công thức món ăn
- ✅ `nha_cung_cap` - Nhà cung cấp
- ✅ `kho_hang` - Quản lý tồn kho
- ✅ `phieu_nhap_hang` - Phiếu nhập hàng
- ✅ `danh_gia_suc_khoe` - Đánh giá sức khỏe trẻ em
- ✅ `ke_hoach_dinh_duong` - Kế hoạch dinh dưỡng
- ✅ `y_kien_phu_huynh` - Ý kiến phụ huynh
- ✅ `lich_su_su_dung_nguyen_lieu` - Lịch sử sử dụng

### **Views & Analytics:**
- 📊 `v_ton_kho` - View tồn kho
- 📊 `v_thong_ke_dinh_duong_thuc_don` - Thống kê dinh dưỡng

## **🧪 TESTING ENHANCED FEATURES**

### **Test Workflow:**

1. **Login Admin:**
   ```bash
   POST http://localhost:3001/api/auth/login
   {
     "email": "admin@kindergarten.com",
     "password": "admin123"
   }
   ```

2. **Test Nguyên liệu:**
   ```bash
   GET http://localhost:3001/api/nguyen-lieu
   Authorization: Bearer <token>
   ```

3. **Test Thực đơn:**
   ```bash
   GET http://localhost:3001/api/thuc-don?date=2025-08-29
   Authorization: Bearer <token>
   ```

4. **Test Inventory:**
   ```bash
   GET http://localhost:3001/api/inventory
   Authorization: Bearer <token>
   ```

## **⚡ PERFORMANCE & SCALABILITY**

### **Database Optimizations:**
- ✅ Proper indexing on frequently queried columns
- ✅ Connection pooling for better performance
- ✅ Transaction support for data consistency
- ✅ View-based reporting for complex queries

### **API Optimizations:**
- ✅ Role-based filtering at database level
- ✅ Pagination support
- ✅ Efficient JSON parsing
- ✅ Error handling và logging

## **🔧 TROUBLESHOOTING**

### **Common Issues:**

1. **Database Connection Error:**
   ```bash
   # Check XAMPP MySQL is running
   # Verify .env DB credentials
   # Check port 3306 availability
   ```

2. **Schema Not Found:**
   ```bash
   # Import enhanced-schema.sql again
   mysql -u root -p kindergarten_nutrition < database/enhanced-schema.sql
   ```

3. **Permission Denied:**
   ```bash
   # Check user role in JWT token
   # Verify authentication headers
   ```

## **📈 NEXT STEPS**

- [ ] Add frontend React app
- [ ] Implement real-time notifications
- [ ] Add file upload for menu images
- [ ] Create mobile app APIs
- [ ] Add data export features
- [ ] Implement advanced analytics

---

🎯 **Enhanced Kindergarten Nutrition Management System is ready for production!**
