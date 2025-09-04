# 🔐 Test Hệ Thống Phân Quyền - Kindergarten Nutrition Management

## Base URL: http://localhost:3003/api

## 📋 Tài khoản Test

### 1. Hiệu trưởng (Admin)
- **Email**: admin@kindergarten.com
- **Password**: admin123
- **Quyền**: Toàn quyền quản lý hệ thống

### 2. Giáo viên (Teacher)
- **Email**: teacher1@kindergarten.com
- **Password**: teacher123
- **Quyền**: Quản lý trẻ em, thực phẩm, tạo thực đơn

### 3. Phụ huynh (Parent)
- **Email**: parent1@gmail.com
- **Password**: parent123
- **Quyền**: Xem thông tin con em và thực đơn

### 4. Chuyên viên dinh dưỡng (Nutritionist)
- **Email**: nutritionist@kindergarten.com
- **Password**: nutritionist123
- **Quyền**: Quản lý thực phẩm, phê duyệt thực đơn

## 🧪 Test Scenarios

### Test 1: Đăng nhập với từng role

```bash
# Test Admin Login
curl -X POST http://localhost:3003/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@kindergarten.com", "password": "admin123"}'

# Test Teacher Login
curl -X POST http://localhost:3003/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "teacher1@kindergarten.com", "password": "teacher123"}'

# Test Parent Login
curl -X POST http://localhost:3003/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "parent1@gmail.com", "password": "parent123"}'

# Test Nutritionist Login
curl -X POST http://localhost:3003/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "nutritionist@kindergarten.com", "password": "nutritionist123"}'
```

### Test 2: Xem danh sách Users (Chỉ Admin)

```bash
# Admin có thể xem - SUCCESS
curl -H "Authorization: Bearer admin-token-12345" \
  http://localhost:3003/api/users

# Teacher không thể xem - FORBIDDEN
curl -H "Authorization: Bearer teacher-token-12345" \
  http://localhost:3003/api/users

# Parent không thể xem - FORBIDDEN
curl -H "Authorization: Bearer parent-token-12345" \
  http://localhost:3003/api/users
```

### Test 3: Xem danh sách trẻ em (Phân quyền theo role)

```bash
# Admin xem tất cả trẻ em
curl -H "Authorization: Bearer admin-token-12345" \
  http://localhost:3003/api/children

# Teacher xem tất cả trẻ em
curl -H "Authorization: Bearer teacher-token-12345" \
  http://localhost:3003/api/children

# Parent chỉ xem con mình
curl -H "Authorization: Bearer parent-token-12345" \
  http://localhost:3003/api/children

# Nutritionist xem tất cả trẻ em
curl -H "Authorization: Bearer nutritionist-token-12345" \
  http://localhost:3003/api/children
```

### Test 4: Tạo hồ sơ trẻ em (Admin + Teacher only)

```bash
# Admin có thể tạo - SUCCESS
curl -X POST http://localhost:3003/api/children \
  -H "Authorization: Bearer admin-token-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "HS003",
    "fullName": "Bé Test Admin",
    "dateOfBirth": "2020-01-01",
    "gender": "male",
    "className": "Lá 2"
  }'

# Teacher có thể tạo - SUCCESS
curl -X POST http://localhost:3003/api/children \
  -H "Authorization: Bearer teacher-token-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "HS004",
    "fullName": "Bé Test Teacher",
    "dateOfBirth": "2020-02-01",
    "gender": "female",
    "className": "Lá 2"
  }'

# Parent không thể tạo - FORBIDDEN
curl -X POST http://localhost:3003/api/children \
  -H "Authorization: Bearer parent-token-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "HS005",
    "fullName": "Bé Test Parent",
    "dateOfBirth": "2020-03-01",
    "gender": "male",
    "className": "Lá 2"
  }'
```

### Test 5: Quản lý thực phẩm

```bash
# Tất cả role có thể xem thực phẩm
curl -H "Authorization: Bearer parent-token-12345" \
  http://localhost:3003/api/foods

# Chỉ Staff (Admin/Teacher/Nutritionist) có thể thêm thực phẩm
curl -X POST http://localhost:3003/api/foods \
  -H "Authorization: Bearer nutritionist-token-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cà chua",
    "category": "vegetable",
    "caloriesPer100g": 18,
    "proteinPer100g": 0.9
  }'

# Parent không thể thêm thực phẩm - FORBIDDEN
curl -X POST http://localhost:3003/api/foods \
  -H "Authorization: Bearer parent-token-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Food",
    "category": "test"
  }'
```

### Test 6: Quản lý bữa ăn và phê duyệt

```bash
# Teacher tạo bữa ăn - cần phê duyệt
curl -X POST http://localhost:3003/api/meals \
  -H "Authorization: Bearer teacher-token-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bữa sáng - Cháo thịt",
    "mealType": "breakfast",
    "date": "2025-08-30",
    "description": "Bữa sáng dinh dưỡng"
  }'

# Admin tạo bữa ăn - tự động phê duyệt
curl -X POST http://localhost:3003/api/meals \
  -H "Authorization: Bearer admin-token-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bữa trưa - Cơm gà",
    "mealType": "lunch",
    "date": "2025-08-30",
    "description": "Bữa trưa đầy đủ dinh dưỡng"
  }'

# Nutritionist tạo bữa ăn - tự động phê duyệt
curl -X POST http://localhost:3003/api/meals \
  -H "Authorization: Bearer nutritionist-token-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bữa phụ - Sữa và bánh",
    "mealType": "snack",
    "date": "2025-08-30",
    "description": "Bữa phụ bổ sung"
  }'

# Parent không thể tạo bữa ăn - FORBIDDEN
curl -X POST http://localhost:3003/api/meals \
  -H "Authorization: Bearer parent-token-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Meal",
    "mealType": "lunch",
    "date": "2025-08-30"
  }'
```

### Test 7: Health Check với thông tin phân quyền

```bash
curl http://localhost:3003/api/health
```

## 🔍 PowerShell Test Commands

```powershell
# Test login với PowerShell
$loginData = @{
    email = "parent1@gmail.com"
    password = "parent123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3003/api/auth/login" -Method Post -Body $loginData -ContentType "application/json"
$token = $response.data.token

# Test xem children với parent token
$headers = @{ Authorization = "Bearer $token" }
Invoke-RestMethod -Uri "http://localhost:3003/api/children" -Headers $headers
```

## 📊 Expected Results

### Admin (Hiệu trưởng):
- ✅ Xem tất cả users
- ✅ Xem tất cả trẻ em  
- ✅ Tạo/sửa hồ sơ trẻ em
- ✅ Quản lý thực phẩm
- ✅ Tạo và tự động phê duyệt bữa ăn

### Teacher (Giáo viên):
- ❌ Không xem được users
- ✅ Xem tất cả trẻ em
- ✅ Tạo/sửa hồ sơ trẻ em
- ✅ Quản lý thực phẩm
- ✅ Tạo bữa ăn (cần phê duyệt)

### Nutritionist (Chuyên viên dinh dưỡng):
- ❌ Không xem được users
- ✅ Xem tất cả trẻ em
- ❌ Không tạo được hồ sơ trẻ em
- ✅ Quản lý thực phẩm
- ✅ Tạo và tự động phê duyệt bữa ăn

### Parent (Phụ huynh):
- ❌ Không xem được users
- ✅ Chỉ xem được con mình (2 trẻ: HS001, HS002)
- ❌ Không tạo được hồ sơ trẻ em
- ✅ Xem danh sách thực phẩm (read-only)
- ❌ Không thêm được thực phẩm
- ✅ Xem thực đơn (read-only)
- ❌ Không tạo được bữa ăn

## 🚨 Error Messages

- **401 Unauthorized**: Token không hợp lệ hoặc thiếu
- **403 Forbidden**: Không có quyền thực hiện thao tác
- **404 Not Found**: Endpoint không tồn tại
