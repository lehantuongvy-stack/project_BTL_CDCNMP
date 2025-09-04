-- ============================================
-- Kindergarten Nutrition Management - Enhanced Database Schema
-- Cải thiện từ schema gốc để phù hợp với Pure Node.js
-- ============================================

CREATE DATABASE IF NOT EXISTS kindergarten_nutrition;
USE kindergarten_nutrition;

-- Drop existing tables if they exist (for clean install)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS y_kien_phu_huynh;
DROP TABLE IF EXISTS lich_su_su_dung_nguyen_lieu;
DROP TABLE IF EXISTS chi_tiet_phieu_nhap;
DROP TABLE IF EXISTS phieu_nhap_hang;
DROP TABLE IF EXISTS kho_hang;
DROP TABLE IF EXISTS ke_hoach_dinh_duong;
DROP TABLE IF EXISTS danh_gia_suc_khoe;
DROP TABLE IF EXISTS chi_tiet_thuc_don;
DROP TABLE IF EXISTS thuc_don;
DROP TABLE IF EXISTS chi_tiet_mon_an;
DROP TABLE IF EXISTS mon_an;
DROP TABLE IF EXISTS nguyen_lieu;
DROP TABLE IF EXISTS nha_cung_cap;
DROP TABLE IF EXISTS children;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- ==============================================
-- BẢNG CỐT LÕI (Core Tables)
-- ==============================================

-- A. Bảng Users (Kết hợp Admin, Giáo viên, Phụ huynh)
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    username VARCHAR(50) UNIQUE,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name NVARCHAR(100) NOT NULL,
    role ENUM('admin', 'teacher', 'parent', 'nutritionist') DEFAULT 'teacher',
    phone VARCHAR(15),
    address NVARCHAR(200),
    chuc_vu NVARCHAR(100), -- Chức vụ (cho giáo viên)
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_active (is_active)
);

-- B. Bảng Trẻ em (Children) - Cải thiện
CREATE TABLE children (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id VARCHAR(20) UNIQUE NOT NULL, -- Mã học sinh
    full_name NVARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender ENUM('male', 'female') NOT NULL,
    class_name NVARCHAR(50), -- Lớp học
    parent_id CHAR(36), -- FK đến users (role=parent)
    teacher_id CHAR(36), -- FK đến users (role=teacher)
    
    -- Thông tin sức khỏe
    height FLOAT DEFAULT 0, -- Chiều cao (cm)
    weight FLOAT DEFAULT 0, -- Cân nặng (kg)
    allergies JSON, -- Dị ứng
    medical_conditions JSON, -- Tình trạng y tế
    
    -- Thông tin liên hệ khẩn cấp
    emergency_contact JSON,
    admission_date DATE DEFAULT (CURRENT_DATE),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_student_id (student_id),
    INDEX idx_class (class_name),
    INDEX idx_parent (parent_id),
    INDEX idx_teacher (teacher_id)
);

-- ==============================================
-- BẢNG QUẢN LÝ THỰC PHẨM & DINH DƯỠNG
-- ==============================================

-- C. Bảng Nhà cung cấp
CREATE TABLE nha_cung_cap (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ten_ncc NVARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    dia_chi NVARCHAR(200),
    email VARCHAR(100),
    trang_thai ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_ten_ncc (ten_ncc),
    INDEX idx_trang_thai (trang_thai)
);

-- D. Bảng Nguyên liệu (Foods/Ingredients) - Cải thiện
CREATE TABLE nguyen_lieu (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    ten_nguyen_lieu NVARCHAR(100) NOT NULL,
    mo_ta NVARCHAR(200),
    don_vi_tinh NVARCHAR(20) DEFAULT 'kg', -- kg, lít, hộp, gói
    gia_mua DECIMAL(10,2) DEFAULT 0,
    nha_cung_cap_id INT,
    
    -- Thông tin dinh dưỡng trên 100g
    calories_per_100g FLOAT DEFAULT 0,
    protein_per_100g FLOAT DEFAULT 0,
    fat_per_100g FLOAT DEFAULT 0,
    carbs_per_100g FLOAT DEFAULT 0,
    fiber_per_100g FLOAT DEFAULT 0,
    
    -- Vitamin và khoáng chất
    vitamin_a FLOAT DEFAULT 0,
    vitamin_c FLOAT DEFAULT 0,
    calcium FLOAT DEFAULT 0,
    iron FLOAT DEFAULT 0,
    
    allergens JSON, -- Chất gây dị ứng
    trang_thai ENUM('available', 'out_of_stock', 'discontinued') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (nha_cung_cap_id) REFERENCES nha_cung_cap(id),
    
    INDEX idx_ten_nguyen_lieu (ten_nguyen_lieu),
    INDEX idx_trang_thai (trang_thai),
    INDEX idx_nha_cung_cap (nha_cung_cap_id)
);

-- E. Bảng Món ăn - Cải thiện
CREATE TABLE mon_an (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    ten_mon_an NVARCHAR(100) NOT NULL,
    mo_ta NVARCHAR(500),
    loai_mon ENUM('main_dish', 'soup', 'dessert', 'drink', 'snack') DEFAULT 'main_dish',
    do_tuoi_phu_hop NVARCHAR(50), -- "3-4 tuổi", "5-6 tuổi"
    thoi_gian_che_bien INT DEFAULT 0, -- phút
    khau_phan_chuan INT DEFAULT 1, -- Số khẩu phần chuẩn
    
    -- Tổng dinh dưỡng của món (tính toán từ nguyên liệu)
    total_calories FLOAT DEFAULT 0,
    total_protein FLOAT DEFAULT 0,
    total_fat FLOAT DEFAULT 0,
    total_carbs FLOAT DEFAULT 0,
    
    huong_dan_che_bien TEXT, -- Hướng dẫn chế biến
    trang_thai ENUM('active', 'inactive', 'seasonal') DEFAULT 'active',
    created_by CHAR(36), -- FK đến users
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id),
    
    INDEX idx_ten_mon_an (ten_mon_an),
    INDEX idx_loai_mon (loai_mon),
    INDEX idx_trang_thai (trang_thai)
);

-- F. Bảng Chi tiết món ăn - Nguyên liệu
CREATE TABLE chi_tiet_mon_an (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mon_an_id CHAR(36) NOT NULL,
    nguyen_lieu_id CHAR(36) NOT NULL,
    so_luong FLOAT NOT NULL, -- Số lượng cần (theo đơn vị tính)
    ghi_chu NVARCHAR(200),
    
    FOREIGN KEY (mon_an_id) REFERENCES mon_an(id) ON DELETE CASCADE,
    FOREIGN KEY (nguyen_lieu_id) REFERENCES nguyen_lieu(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_mon_nguyen_lieu (mon_an_id, nguyen_lieu_id),
    INDEX idx_mon_an (mon_an_id),
    INDEX idx_nguyen_lieu (nguyen_lieu_id)
);

-- ==============================================
-- BẢNG QUẢN LÝ THỰC ĐƠN
-- ==============================================

-- G. Bảng Thực đơn
CREATE TABLE thuc_don (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    ten_thuc_don NVARCHAR(100) NOT NULL,
    ngay_ap_dung DATE NOT NULL,
    loai_bua_an ENUM('breakfast', 'lunch', 'dinner', 'snack') NOT NULL,
    lop_ap_dung NVARCHAR(50), -- Lớp áp dụng
    so_tre_du_kien INT DEFAULT 0,
    
    trang_thai ENUM('draft', 'approved', 'active', 'completed') DEFAULT 'draft',
    created_by CHAR(36), -- Người tạo
    approved_by CHAR(36), -- Người phê duyệt
    approved_at TIMESTAMP NULL,
    
    ghi_chu NVARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),
    
    INDEX idx_ngay_ap_dung (ngay_ap_dung),
    INDEX idx_loai_bua_an (loai_bua_an),
    INDEX idx_trang_thai (trang_thai)
);

-- H. Bảng Chi tiết thực đơn
CREATE TABLE chi_tiet_thuc_don (
    id INT AUTO_INCREMENT PRIMARY KEY,
    thuc_don_id CHAR(36) NOT NULL,
    mon_an_id CHAR(36) NOT NULL,
    so_khau_phan INT NOT NULL DEFAULT 1,
    ghi_chu NVARCHAR(200),
    
    FOREIGN KEY (thuc_don_id) REFERENCES thuc_don(id) ON DELETE CASCADE,
    FOREIGN KEY (mon_an_id) REFERENCES mon_an(id) ON DELETE CASCADE,
    
    INDEX idx_thuc_don (thuc_don_id),
    INDEX idx_mon_an (mon_an_id)
);

-- ==============================================
-- BẢNG QUẢN LÝ KHO & NHẬP HÀNG
-- ==============================================

-- I. Bảng Kho hàng
CREATE TABLE kho_hang (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nguyen_lieu_id CHAR(36) NOT NULL,
    so_luong_ton FLOAT DEFAULT 0,
    suc_chua_toi_da FLOAT DEFAULT 0,
    muc_canh_bao_ton_it FLOAT DEFAULT 0, -- Mức cảnh báo hết hàng
    vi_tri_kho NVARCHAR(50), -- A1, B2, etc.
    
    ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (nguyen_lieu_id) REFERENCES nguyen_lieu(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_nguyen_lieu_kho (nguyen_lieu_id),
    INDEX idx_so_luong_ton (so_luong_ton)
);

-- J. Bảng Phiếu nhập hàng
CREATE TABLE phieu_nhap_hang (
    id INT AUTO_INCREMENT PRIMARY KEY,
    so_phieu VARCHAR(20) UNIQUE NOT NULL,
    nha_cung_cap_id INT NOT NULL,
    ngay_nhap DATETIME DEFAULT CURRENT_TIMESTAMP,
    nguoi_nhap CHAR(36), -- FK đến users
    tong_tien DECIMAL(12,2) DEFAULT 0,
    trang_thai ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
    ghi_chu NVARCHAR(500),
    
    FOREIGN KEY (nha_cung_cap_id) REFERENCES nha_cung_cap(id),
    FOREIGN KEY (nguoi_nhap) REFERENCES users(id),
    
    INDEX idx_so_phieu (so_phieu),
    INDEX idx_ngay_nhap (ngay_nhap),
    INDEX idx_trang_thai (trang_thai)
);

-- K. Bảng Chi tiết phiếu nhập
CREATE TABLE chi_tiet_phieu_nhap (
    id INT AUTO_INCREMENT PRIMARY KEY,
    phieu_nhap_id INT NOT NULL,
    nguyen_lieu_id CHAR(36) NOT NULL,
    so_luong FLOAT NOT NULL,
    don_gia DECIMAL(10,2) NOT NULL,
    thanh_tien DECIMAL(12,2) GENERATED ALWAYS AS (so_luong * don_gia) STORED,
    han_su_dung DATE,
    
    FOREIGN KEY (phieu_nhap_id) REFERENCES phieu_nhap_hang(id) ON DELETE CASCADE,
    FOREIGN KEY (nguyen_lieu_id) REFERENCES nguyen_lieu(id),
    
    INDEX idx_phieu_nhap (phieu_nhap_id),
    INDEX idx_nguyen_lieu (nguyen_lieu_id)
);

-- ==============================================
-- BẢNG THEO DÕI SỨC KHỎE & ĐÁNH GIÁ
-- ==============================================

-- L. Bảng Đánh giá sức khỏe
CREATE TABLE danh_gia_suc_khoe (
    id INT AUTO_INCREMENT PRIMARY KEY,
    child_id CHAR(36) NOT NULL,
    teacher_id CHAR(36) NOT NULL,
    ngay_danh_gia DATE DEFAULT (CURRENT_DATE),
    
    -- Thông số đo đạc
    chieu_cao FLOAT, -- cm
    can_nang FLOAT, -- kg
    bmi FLOAT GENERATED ALWAYS AS (can_nang / POWER(chieu_cao/100, 2)) STORED,
    
    -- Đánh giá tổng quan
    tinh_trang_suc_khoe NVARCHAR(500),
    ket_luan NVARCHAR(500),
    khuyen_cao NVARCHAR(500),
    
    -- Đánh giá chi tiết
    an_uong ENUM('excellent', 'good', 'average', 'poor') DEFAULT 'good',
    hoat_dong ENUM('very_active', 'active', 'normal', 'inactive') DEFAULT 'normal',
    tinh_than ENUM('happy', 'normal', 'sad', 'anxious') DEFAULT 'normal',
    
    lan_danh_gia_tiep_theo DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES users(id),
    
    INDEX idx_child_date (child_id, ngay_danh_gia),
    INDEX idx_ngay_danh_gia (ngay_danh_gia)
);

-- M. Bảng Kế hoạch dinh dưỡng
CREATE TABLE ke_hoach_dinh_duong (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ten_ke_hoach NVARCHAR(100) NOT NULL,
    child_id CHAR(36), -- Nếu NULL thì áp dụng cho nhóm
    nhom_doi_tuong NVARCHAR(50), -- "3-4 tuổi", "Trẻ béo phì", etc.
    teacher_id CHAR(36) NOT NULL,
    parent_id CHAR(36),
    
    muc_tieu NVARCHAR(500), -- Mục tiêu dinh dưỡng
    thoi_gian_bat_dau DATE NOT NULL,
    thoi_gian_ket_thuc DATE NOT NULL,
    
    -- Nhu cầu dinh dưỡng hàng ngày
    calories_target FLOAT DEFAULT 0,
    protein_target FLOAT DEFAULT 0,
    fat_target FLOAT DEFAULT 0,
    carbs_target FLOAT DEFAULT 0,
    
    trang_thai ENUM('draft', 'active', 'completed', 'cancelled') DEFAULT 'draft',
    ghi_chu NVARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES users(id),
    FOREIGN KEY (parent_id) REFERENCES users(id),
    
    INDEX idx_child_id (child_id),
    INDEX idx_thoi_gian (thoi_gian_bat_dau, thoi_gian_ket_thuc),
    INDEX idx_trang_thai (trang_thai)
);

-- N. Bảng Ý kiến phụ huynh
CREATE TABLE y_kien_phu_huynh (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parent_id CHAR(36) NOT NULL,
    child_id CHAR(36),
    thuc_don_id CHAR(36),
    mon_an_id CHAR(36),
    
    loai_y_kien ENUM('compliment', 'suggestion', 'complaint', 'question') DEFAULT 'suggestion',
    tieu_de NVARCHAR(100),
    noi_dung NVARCHAR(1000) NOT NULL,
    danh_gia_sao INT CHECK (danh_gia_sao BETWEEN 1 AND 5),
    
    trang_thai ENUM('new', 'processing', 'resolved', 'closed') DEFAULT 'new',
    phan_hoi NVARCHAR(1000),
    nguoi_phan_hoi CHAR(36), -- FK đến users (teacher/admin)
    ngay_phan_hoi TIMESTAMP NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE SET NULL,
    FOREIGN KEY (thuc_don_id) REFERENCES thuc_don(id) ON DELETE SET NULL,
    FOREIGN KEY (mon_an_id) REFERENCES mon_an(id) ON DELETE SET NULL,
    FOREIGN KEY (nguoi_phan_hoi) REFERENCES users(id),
    
    INDEX idx_parent_id (parent_id),
    INDEX idx_child_id (child_id),
    INDEX idx_trang_thai (trang_thai),
    INDEX idx_created_at (created_at)
);

-- O. Bảng Lịch sử sử dụng nguyên liệu
CREATE TABLE lich_su_su_dung_nguyen_lieu (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nguyen_lieu_id CHAR(36) NOT NULL,
    thuc_don_id CHAR(36),
    mon_an_id CHAR(36),
    so_luong_su_dung FLOAT NOT NULL,
    ly_do ENUM('cooking', 'waste', 'expired', 'damaged') DEFAULT 'cooking',
    ngay_su_dung DATETIME DEFAULT CURRENT_TIMESTAMP,
    nguoi_su_dung CHAR(36), -- FK đến users
    ghi_chu NVARCHAR(200),
    
    FOREIGN KEY (nguyen_lieu_id) REFERENCES nguyen_lieu(id),
    FOREIGN KEY (thuc_don_id) REFERENCES thuc_don(id) ON DELETE SET NULL,
    FOREIGN KEY (mon_an_id) REFERENCES mon_an(id) ON DELETE SET NULL,
    FOREIGN KEY (nguoi_su_dung) REFERENCES users(id),
    
    INDEX idx_nguyen_lieu_date (nguyen_lieu_id, ngay_su_dung),
    INDEX idx_ngay_su_dung (ngay_su_dung)
);

-- ==============================================
-- VIEWS & SAMPLE DATA
-- ==============================================

-- View: Thống kê tồn kho
CREATE VIEW v_ton_kho AS
SELECT 
    nl.id,
    nl.ten_nguyen_lieu,
    nl.don_vi_tinh,
    COALESCE(kh.so_luong_ton, 0) as so_luong_ton,
    COALESCE(kh.muc_canh_bao_ton_it, 0) as muc_canh_bao_ton_it,
    CASE 
        WHEN COALESCE(kh.so_luong_ton, 0) <= COALESCE(kh.muc_canh_bao_ton_it, 0) THEN 'LOW'
        WHEN COALESCE(kh.so_luong_ton, 0) <= COALESCE(kh.muc_canh_bao_ton_it, 0) * 2 THEN 'WARNING'
        ELSE 'OK'
    END as trang_thai_ton
FROM nguyen_lieu nl
LEFT JOIN kho_hang kh ON nl.id = kh.nguyen_lieu_id;

-- View: Thống kê dinh dưỡng theo thực đơn
CREATE VIEW v_thong_ke_dinh_duong_thuc_don AS
SELECT 
    td.id as thuc_don_id,
    td.ten_thuc_don,
    td.ngay_ap_dung,
    td.loai_bua_an,
    SUM(ma.total_calories * cttd.so_khau_phan) as tong_calories,
    SUM(ma.total_protein * cttd.so_khau_phan) as tong_protein,
    SUM(ma.total_fat * cttd.so_khau_phan) as tong_fat,
    SUM(ma.total_carbs * cttd.so_khau_phan) as tong_carbs
FROM thuc_don td
JOIN chi_tiet_thuc_don cttd ON td.id = cttd.thuc_don_id
JOIN mon_an ma ON cttd.mon_an_id = ma.id
GROUP BY td.id, td.ten_thuc_don, td.ngay_ap_dung, td.loai_bua_an;

-- ==============================================
-- SAMPLE DATA
-- ==============================================

-- Sample Users với password đã hash (bcrypt)
INSERT INTO users (id, username, email, password_hash, full_name, role, phone, address) VALUES
(UUID(), 'admin', 'admin@kindergarten.com', '$2a$10$LvyJV6/.PbSa8UfPYhSwReRnOlsokOzr7J3QRGvr9xJgEu1qGwZhG', 'Hiệu trưởng Nguyễn Văn A', 'admin', '0901234567', '123 Đường ABC, Hà Nội'),
(UUID(), 'teacher1', 'teacher1@kindergarten.com', '$2a$10$LvyJV6/.PbSa8UfPYhSwReRnOlsokOzr7J3QRGvr9xJgEu1qGwZhG', 'Cô Nguyễn Thị Lan', 'teacher', '0907654321', '456 Đường DEF, Hà Nội'),
(UUID(), 'parent1', 'parent1@gmail.com', '$2a$10$LvyJV6/.PbSa8UfPYhSwReRnOlsokOzr7J3QRGvr9xJgEu1qGwZhG', 'Anh Trần Văn Minh', 'parent', '0912345678', '789 Đường GHI, Hà Nội'),
(UUID(), 'nutritionist1', 'nutritionist@kindergarten.com', '$2a$10$LvyJV6/.PbSa8UfPYhSwReRnOlsokOzr7J3QRGvr9xJgEu1qGwZhG', 'Chuyên viên Lê Thị Hương', 'nutritionist', '0998765432', '321 Đường JKL, Hà Nội');

-- Sample Nhà cung cấp
INSERT INTO nha_cung_cap (ten_ncc, phone, dia_chi, email) VALUES
('Công ty Thực phẩm An Toàn', '0243123456', '12 Phố Huế, Hà Nội', 'info@antoan.com'),
('Trang trại Organic Green', '0243654321', '45 Nguyễn Trãi, Hà Nội', 'sales@organic.com'),
('Siêu thị Metro Wholesale', '0243999888', '78 Láng Hạ, Hà Nội', 'wholesale@metro.com');

-- Sample Nguyên liệu
INSERT INTO nguyen_lieu (id, ten_nguyen_lieu, mo_ta, don_vi_tinh, gia_mua, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g, nha_cung_cap_id) VALUES
(UUID(), 'Gạo tẻ', 'Gạo trắng thường dùng nấu cơm', 'kg', 25000, 130, 2.7, 0.3, 28, 1),
(UUID(), 'Thịt heo nạc', 'Thịt heo phần nạc vai', 'kg', 180000, 143, 20.9, 6.2, 0, 2),
(UUID(), 'Cà rốt', 'Cà rốt tươi màu cam', 'kg', 15000, 41, 0.9, 0.2, 10, 2),
(UUID(), 'Trứng gà', 'Trứng gà tươi size L', 'quả', 3500, 155, 13, 11, 1.1, 1),
(UUID(), 'Sữa tươi', 'Sữa tươi không đường 3.25% béo', 'lít', 45000, 42, 3.4, 1.0, 5, 3),
(UUID(), 'Rau cải xanh', 'Rau cải xanh tươi', 'kg', 12000, 20, 1.5, 0.2, 4, 2),
(UUID(), 'Dầu ăn', 'Dầu đậu nành cao cấp', 'lít', 55000, 884, 0, 100, 0, 3),
(UUID(), 'Muối', 'Muối iod tinh khiết', 'kg', 8000, 0, 0, 0, 0, 1);

-- Sample Món ăn
INSERT INTO mon_an (id, ten_mon_an, mo_ta, loai_mon, do_tuoi_phu_hop, khau_phan_chuan, total_calories, total_protein, created_by) VALUES
(UUID(), 'Cơm thịt heo xào cà rốt', 'Món chính đầy đủ dinh dưỡng cho bữa trưa', 'main_dish', '3-5 tuổi', 1, 320, 18.5, (SELECT id FROM users WHERE role = 'nutritionist' LIMIT 1)),
(UUID(), 'Canh trứng rau cải', 'Canh nhẹ bổ sung vitamin và protein', 'soup', '3-5 tuổi', 1, 85, 8.2, (SELECT id FROM users WHERE role = 'nutritionist' LIMIT 1)),
(UUID(), 'Sữa tươi', 'Đồ uống bổ sung canxi cho trẻ', 'drink', 'Tất cả độ tuổi', 1, 168, 13.6, (SELECT id FROM users WHERE role = 'nutritionist' LIMIT 1));

-- Console output
SELECT 'Enhanced Database Schema created successfully!' as message;
SELECT 'Sample data inserted for testing!' as message;
SELECT CONCAT('Total users: ', COUNT(*)) as user_count FROM users;
SELECT CONCAT('Total ingredients: ', COUNT(*)) as ingredient_count FROM nguyen_lieu;
SELECT CONCAT('Total suppliers: ', COUNT(*)) as supplier_count FROM nha_cung_cap;
