-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 29, 2025 at 05:50 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `kindergarten_nutrition`
--

-- --------------------------------------------------------

--
-- Table structure for table `children`
--

CREATE TABLE `children` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `student_id` varchar(20) NOT NULL,
  `full_name` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `date_of_birth` date NOT NULL,
  `gender` enum('male','female') NOT NULL,
  `class_name` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `parent_id` char(36) DEFAULT NULL,
  `teacher_id` char(36) DEFAULT NULL,
  `height` float DEFAULT 0,
  `weight` float DEFAULT 0,
  `allergies` text DEFAULT NULL,
  `medical_conditions` text DEFAULT NULL,
  `emergency_contact` text DEFAULT NULL,
  `admission_date` date DEFAULT curdate(),
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `children`
--

INSERT INTO `children` (`id`, `student_id`, `full_name`, `date_of_birth`, `gender`, `class_name`, `parent_id`, `teacher_id`, `height`, `weight`, `allergies`, `medical_conditions`, `emergency_contact`, `admission_date`, `is_active`, `created_at`, `updated_at`) VALUES
('28989c30-41bb-465a-ac0a-42f3b4bff82c', 'ST003', 'TEst', '2004-01-02', 'male', '', 'a1c50782-9a37-11f0-ba52-a036bc312358', NULL, NULL, NULL, '', NULL, NULL, '2025-09-25', 1, '2025-09-25 17:46:59', '2025-09-29 08:55:01'),
('324a385f-2ff0-41c4-b021-6069c598d729', 'ST001', 'Nguyễn Văn Minh', '2020-01-15', 'male', 'Lớp Mầm', '3ca5ca7c-9574-11f0-8f71-a036bc312358', 'a76399b6-9577-11f0-8f71-a036bc312358', 100, 100, 'Tôm,Cua', '[\"Yếu\"]', NULL, '2025-09-11', 1, '2025-09-11 11:48:32', '2025-09-26 14:55:12'),
('a5de9420-8d6a-11f0-a629-a036bc312358', 'HS001', 'Nguyễn Văn An', '2021-05-15', 'male', 'Lớp Mầm', '3ca5ca7c-9574-11f0-8f71-a036bc312358', 'a76399b6-9577-11f0-8f71-a036bc312358', 105.5, 18, 'Tôm, Cua, Cá', 'Khỏe mạnh', '{\"name\":\"Nguyễn Thị B\",\"phone\":\"0987654321\",\"relationship\":\"Mẹ\"}', '2025-09-09', 1, '2025-09-09 10:49:23', '2025-09-26 14:58:09'),
('f59b0164-9984-4010-8599-9b2f2e5500cd', 'ST002', 'Test', '1111-01-01', 'female', 'Lớp Lá', '30cd2e6d-9a37-11f0-ba52-a036bc312358', '9ba8d2ee-9d37-11f0-afa0-a036bc312358', NULL, NULL, NULL, NULL, NULL, '2025-09-25', 1, '2025-09-25 17:43:49', '2025-09-29 13:25:46');

-- --------------------------------------------------------

--
-- Table structure for table `chi_tiet_mon_an`
--

CREATE TABLE `chi_tiet_mon_an` (
  `id` int(11) NOT NULL,
  `mon_an_id` char(36) NOT NULL,
  `nguyen_lieu_id` char(36) NOT NULL,
  `so_luong` float NOT NULL,
  `ghi_chu` varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `chi_tiet_phieu_nhap`
--

CREATE TABLE `chi_tiet_phieu_nhap` (
  `id` int(11) NOT NULL,
  `phieu_nhap_id` int(11) NOT NULL,
  `nguyen_lieu_id` char(36) NOT NULL,
  `so_luong` float NOT NULL,
  `don_gia` decimal(10,2) NOT NULL,
  `thanh_tien` decimal(12,2) GENERATED ALWAYS AS (`so_luong` * `don_gia`) STORED,
  `han_su_dung` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `chi_tiet_thuc_don`
--

CREATE TABLE `chi_tiet_thuc_don` (
  `id` int(11) NOT NULL,
  `thuc_don_id` char(36) NOT NULL,
  `mon_an_id` char(36) NOT NULL,
  `buoi` enum('Sáng','Trưa','Xế','Tối') NOT NULL,
  `so_khau_phan` int(11) NOT NULL DEFAULT 1,
  `kcal` int(11) DEFAULT 0,
  `ghi_chu` varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `classes`
--

CREATE TABLE `classes` (
  `id` char(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `id_tre` char(36) DEFAULT NULL,
  `id_teacher` char(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `classes`
--

INSERT INTO `classes` (`id`, `name`, `description`, `created_at`, `updated_at`, `id_tre`, `id_teacher`) VALUES
('1a9a329d-98a3-11f0-9a5b-a036bc312358', 'Lớp Mầm', 'Lớp cho nhà trẻ từ 3 tháng đến 3 tuổi', '2025-09-23 17:31:14', '2025-09-26 14:47:50', '324a385f-2ff0-41c4-b021-6069c598d729', 'a76399b6-9577-11f0-8f71-a036bc312358'),
('1a9a342f-98a3-11f0-9a5b-a036bc312358', 'Lớp Lá', 'Lớp cho trẻ mẫu giáo từ 3-4 tuổi', '2025-09-23 17:31:14', '2025-09-26 14:05:02', NULL, NULL),
('1a9a3487-98a3-11f0-9a5b-a036bc312358', 'Lớp Chồi', 'Lớp cho trẻ mẫu giáo từ 4-5 tuổi', '2025-09-23 17:31:14', '2025-09-26 14:05:05', NULL, NULL),
('8935fe86-99ca-11f0-bacc-a036bc312358', 'Lớp Hoa', 'Lớp cho trẻ mẫu giáo 5-6 tuổi', '2025-09-25 04:46:01', '2025-09-26 14:03:39', 'a5de9420-8d6a-11f0-a629-a036bc312358', 'a76399b6-9577-11f0-8f71-a036bc312358');

-- --------------------------------------------------------

--
-- Table structure for table `danh_gia_suc_khoe`
--

CREATE TABLE `danh_gia_suc_khoe` (
  `id` int(11) NOT NULL,
  `child_id` char(36) NOT NULL,
  `teacher_id` char(36) NOT NULL,
  `ngay_danh_gia` date DEFAULT curdate(),
  `chieu_cao` float DEFAULT NULL,
  `can_nang` float DEFAULT NULL,
  `bmi` float GENERATED ALWAYS AS (`can_nang` / pow(`chieu_cao` / 100,2)) STORED,
  `tinh_trang_suc_khoe` varchar(500) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `ket_luan` varchar(500) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `khuyen_cao` varchar(500) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `an_uong` enum('Đầy đủ','Vừa đủ','Ăn ít','Kén ăn') DEFAULT 'Vừa đủ',
  `hoat_dong` enum('Năng động','Có vận động','Ít vận động') DEFAULT 'Có vận động',
  `tinh_than` enum('Vui vẻ','Bình thường','Buồn') DEFAULT 'Bình thường',
  `an_tai_truong` tinyint(1) DEFAULT 0,
  `muc_do_khau_phan` int(11) DEFAULT 0,
  `ghi_chu_bua_an` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `danh_gia_suc_khoe`
--

INSERT INTO `danh_gia_suc_khoe` (`id`, `child_id`, `teacher_id`, `ngay_danh_gia`, `chieu_cao`, `can_nang`, `tinh_trang_suc_khoe`, `ket_luan`, `khuyen_cao`, `an_uong`, `hoat_dong`, `tinh_than`, `an_tai_truong`, `muc_do_khau_phan`, `ghi_chu_bua_an`, `created_at`) VALUES
(1, 'a5de9420-8d6a-11f0-a629-a036bc312358', 'd37fd91e-8ab8-11f0-913c-a036bc312358', '2025-09-09', 105.5, 100, 'binh_thuong', 'Trẻ phát triển tốt, ăn uống đều đặn', 'ănc ư', 'Đầy đủ', 'Năng động', 'Vui vẻ', 0, 0, NULL, '2025-09-09 16:26:24'),
(4, '324a385f-2ff0-41c4-b021-6069c598d729', 'a76399b6-9577-11f0-8f71-a036bc312358', '2025-09-29', 105, 24, 'ăn ít', 'BMI: 21.8 (Thừa cân)', 'ăn nhiều lên', '', '', '', 0, 0, NULL, '2025-09-29 10:58:16'),
(5, 'a5de9420-8d6a-11f0-a629-a036bc312358', 'a76399b6-9577-11f0-8f71-a036bc312358', '2025-09-29', 101, 19, 'Khỏe mạnh, vận động tốt ', 'BMI: 18.6 (Thừa cân)', 'tiếp tục phát huy ', 'Đầy đủ', 'Năng động', 'Vui vẻ', 0, 0, NULL, '2025-09-29 10:59:54');

-- --------------------------------------------------------

--
-- Table structure for table `danh_muc_nguyen_lieu`
--

CREATE TABLE `danh_muc_nguyen_lieu` (
  `id` int(11) NOT NULL,
  `ten_danh_muc` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `mo_ta` varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `mau_sac` varchar(7) DEFAULT '#007bff',
  `icon` varchar(50) DEFAULT 'category',
  `thu_tu_hien_thi` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `danh_muc_nguyen_lieu`
--

INSERT INTO `danh_muc_nguyen_lieu` (`id`, `ten_danh_muc`, `mo_ta`, `mau_sac`, `icon`, `thu_tu_hien_thi`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Rau củ quả', 'Các loại rau, củ và trái cây tươi', '#28a745', 'leaf', 1, 1, '2025-09-11 04:06:33', '2025-09-11 04:06:33'),
(2, 'Thịt và hải sản', 'Thịt bò, thịt heo, gà, cá và hải sản', '#dc3545', 'meat', 2, 1, '2025-09-11 04:06:33', '2025-09-11 04:06:33'),
(3, 'Ngũ cốc', 'Gạo, lúa mì, yến mạch, bánh mì', '#ffc107', 'grain', 3, 1, '2025-09-11 04:06:33', '2025-09-11 04:06:33'),
(4, 'Sữa và chế phẩm', 'Sữa tươi, sữa chua, phô mai', '#17a2b8', 'milk', 4, 1, '2025-09-11 04:06:33', '2025-09-11 04:06:33'),
(5, 'Gia vị và đồ khô', 'Muối, đường, dầu ăn, gia vị', '#6f42c1', 'spice', 5, 1, '2025-09-11 04:06:33', '2025-09-11 04:06:33'),
(6, 'Đồ uống', 'Nước ép, trà, các loại đồ uống không cồn', '#20c997', 'drink', 6, 1, '2025-09-11 04:06:33', '2025-09-11 04:06:33'),
(7, 'Đồ đông lạnh', 'Thực phẩm đông lạnh, kem', '#6c757d', 'frozen', 7, 1, '2025-09-11 04:06:33', '2025-09-11 04:06:33'),
(8, 'Bánh kẹo', 'Bánh ngọt, kẹo, snack', '#fd7e14', 'cake', 8, 1, '2025-09-11 04:06:33', '2025-09-11 04:06:33');

-- --------------------------------------------------------

--
-- Table structure for table `foodingredient`
--

CREATE TABLE `foodingredient` (
  `ID_MA` int(11) NOT NULL COMMENT 'Mã món ăn (khóa ngoại)',
  `ID_NL` int(11) NOT NULL COMMENT 'Mã nguyên liệu (khóa ngoại)',
  `SO_LUONG` decimal(8,2) NOT NULL COMMENT 'Số lượng nguyên liệu cần dùng',
  `DON_VI` varchar(20) NOT NULL DEFAULT 'kg' COMMENT 'Đơn vị tính của nguyên liệu',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Bảng quan hệ giữa món ăn và nguyên liệu';

-- --------------------------------------------------------

--
-- Table structure for table `ke_hoach_dinh_duong`
--

CREATE TABLE `ke_hoach_dinh_duong` (
  `id` int(11) NOT NULL,
  `ten_ke_hoach` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `child_id` char(36) DEFAULT NULL,
  `nhom_doi_tuong` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `teacher_id` char(36) NOT NULL,
  `parent_id` char(36) DEFAULT NULL,
  `muc_tieu` varchar(500) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `thoi_gian_bat_dau` date NOT NULL,
  `thoi_gian_ket_thuc` date NOT NULL,
  `calories_target` float DEFAULT 0,
  `protein_target` float DEFAULT 0,
  `fat_target` float DEFAULT 0,
  `carbs_target` float DEFAULT 0,
  `trang_thai` enum('draft','active','completed','cancelled') DEFAULT 'draft',
  `ghi_chu` varchar(500) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `kho_hang`
--

CREATE TABLE `kho_hang` (
  `id` int(11) NOT NULL,
  `nguyen_lieu` varchar(36) NOT NULL,
  `nguyen_lieu_ton` varchar(50) DEFAULT 0,
  `tinh_trang` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT 'good',
  `suc_chua_toi_da` float DEFAULT 0,
  `ngay_cap_nhat` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `ngay_xuat` timestamp NOT NULL DEFAULT current_timestamp(),
  `tong_so_luong` float DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lich_su_su_dung_nguyen_lieu`
--

CREATE TABLE `lich_su_su_dung_nguyen_lieu` (
  `id` int(11) NOT NULL,
  `nguyen_lieu_id` char(36) NOT NULL,
  `thuc_don_id` char(36) DEFAULT NULL,
  `mon_an_id` char(36) DEFAULT NULL,
  `so_luong_su_dung` float NOT NULL,
  `ly_do` enum('cooking','waste','expired','damaged') DEFAULT 'cooking',
  `ngay_su_dung` datetime DEFAULT current_timestamp(),
  `nguoi_su_dung` char(36) DEFAULT NULL,
  `ghi_chu` varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `meal_schedule`
--

CREATE TABLE `meal_schedule` (
  `id` char(36) NOT NULL,
  `child_id` char(36) NOT NULL,
  `week_start` date NOT NULL,
  `day_of_week` enum('Mon','Tue','Wed','Thu','Fri','Sat','Sun') NOT NULL,
  `breakfast` varchar(255) DEFAULT NULL,
  `lunch` varchar(255) DEFAULT NULL,
  `dinner` varchar(255) DEFAULT NULL,
  `snacks` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mon_an`
--

CREATE TABLE `mon_an` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `ten_mon_an` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `mo_ta` varchar(500) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `loai_mon` enum('main_dish','soup','dessert','drink','snack') DEFAULT 'main_dish',
  `do_tuoi_phu_hop` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `thoi_gian_che_bien` int(11) DEFAULT 0,
  `khau_phan_chuan` int(11) DEFAULT 1,
  `total_calories` float DEFAULT 0,
  `total_protein` float DEFAULT 0,
  `total_fat` float DEFAULT 0,
  `total_carbs` float DEFAULT 0,
  `huong_dan_che_bien` text DEFAULT NULL,
  `trang_thai` enum('active','inactive','seasonal') DEFAULT 'active',
  `created_by` char(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `mon_an`
--

INSERT INTO `mon_an` (`id`, `ten_mon_an`, `mo_ta`, `loai_mon`, `do_tuoi_phu_hop`, `thoi_gian_che_bien`, `khau_phan_chuan`, `total_calories`, `total_protein`, `total_fat`, `total_carbs`, `huong_dan_che_bien`, `trang_thai`, `created_by`, `created_at`, `updated_at`) VALUES
('b0ea328c-8ef3-11f0-a751-a036bc312358', 'Cơm gà xối mỏ UPDATED', 'Món cơm gà truyền thống Hội An với công thức cải tiến cho trẻ em', 'main_dish', '4-6 tuổi', 35, 1, 450, 30.5, 14.2, 55.8, '1. Nấu cơm thơm\n2. Luộc gà với gừng và hành\n3. Xắt gà và trộn với gia vị đặc biệt\n4. Trang trí đẹp mắt cho trẻ\n5. Phục vụ ấm', 'active', 'd37fd91e-8ab8-11f0-913c-a036bc312358', '2025-09-11 09:42:52', '2025-09-11 09:51:47');

-- --------------------------------------------------------

--
-- Table structure for table `nguyenlieu`
--

CREATE TABLE `nguyenlieu` (
  `ID_NL` int(11) NOT NULL COMMENT 'Mã định danh duy nhất của nguyên liệu',
  `TEN_NL` varchar(100) NOT NULL,
  `MO_TA` text DEFAULT NULL,
  `TRANG_THAI` enum('Còn hàng','Hết hàng','Sắp hết') NOT NULL DEFAULT 'Còn hàng',
  `DON_VI` varchar(20) DEFAULT 'gram',
  `CALORIES_PER_UNIT` float DEFAULT NULL,
  `PROTEIN_PER_UNIT` float DEFAULT NULL,
  `CARBS_PER_UNIT` float DEFAULT NULL,
  `FAT_PER_UNIT` float DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Bảng lưu trữ thông tin nguyên liệu';

--
-- Dumping data for table `nguyenlieu`
--

INSERT INTO `nguyenlieu` (`ID_NL`, `TEN_NL`, `MO_TA`, `TRANG_THAI`, `DON_VI`, `CALORIES_PER_UNIT`, `PROTEIN_PER_UNIT`, `CARBS_PER_UNIT`, `FAT_PER_UNIT`) VALUES
(5, 'Gạo tẻ', 'Gạo tẻ loại 1, nguồn gốc Việt Nam', '', 'kg', NULL, NULL, NULL, NULL),
(6, 'Thịt heo', 'Thịt heo tươi, không chất bảo quản', '', 'kg', NULL, NULL, NULL, NULL),
(7, 'Cà rót', 'Cà rốt tươi, giàu vitamin A', '', 'kg', NULL, NULL, NULL, NULL),
(8, 'Trứng gà', 'Trứng gà tươi, nguồn protein chất lượng', '', 'quả', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `nguyen_lieu`
--

CREATE TABLE `nguyen_lieu` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `ten_nguyen_lieu` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `mo_ta` varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `don_vi_tinh` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT 'kg',
  `gia_mua` decimal(10,2) DEFAULT 0.00,
  `nha_cung_cap_id` int(11) DEFAULT NULL,
  `calories_per_100g` float DEFAULT 0,
  `protein_per_100g` float DEFAULT 0,
  `fat_per_100g` float DEFAULT 0,
  `carbs_per_100g` float DEFAULT 0,
  `fiber_per_100g` float DEFAULT 0,
  `vitamin_a` float DEFAULT 0,
  `vitamin_c` float DEFAULT 0,
  `calcium` float DEFAULT 0,
  `iron` float DEFAULT 0,
  `allergens` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`allergens`)),
  `trang_thai` enum('available','out_of_stock','discontinued') DEFAULT 'available',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `danh_muc_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `nguyen_lieu`
--

INSERT INTO `nguyen_lieu` (`id`, `ten_nguyen_lieu`, `mo_ta`, `don_vi_tinh`, `gia_mua`, `nha_cung_cap_id`, `calories_per_100g`, `protein_per_100g`, `fat_per_100g`, `carbs_per_100g`, `fiber_per_100g`, `vitamin_a`, `vitamin_c`, `calcium`, `iron`, `allergens`, `trang_thai`, `created_at`, `updated_at`, `danh_muc_id`) VALUES
('3af8a724-b475-4418-adde-4c86d8471d81', 'Gạo tẻ ST25', 'Gạo tẻ thơm ngon, hạt dài', 'kg', 35000.00, NULL, 365, 7.1, 0.7, 80, 1.3, 0, 0, 0, 0, '[]', 'available', '2025-09-09 16:36:55', '2025-09-09 16:36:55', NULL),
('5601157d-3530-4dd2-a69c-91f01d708884', 'Cá thu', 'Cá thu tươi giàu omega-3, tốt cho não bộ', 'kg', 150000.00, NULL, 184, 25.4, 8.2, 0, 0, 58, 0.4, 12, 1.1, '[\"Cá\"]', 'available', '2025-09-09 15:03:13', '2025-09-09 15:03:13', NULL),
('ac616260-bef1-4941-85fb-d29e3abad674', 'Cà rốt', 'Cà rốt tươi giàu vitamin A, tốt cho mắt', 'kg', 20000.00, NULL, 41, 0.9, 0.2, 9.6, 2.8, 16706, 5.9, 33, 0.3, '[]', 'available', '2025-09-09 15:00:32', '2025-09-09 15:00:32', NULL),
('d1ef1916-cd03-4ae5-b861-f3dcb86dc7b0', 'Cà rốt Việt nam', 'Cà rốt hữu cơ tươi ngon, giàu vitamin A', 'kg', 25000.00, NULL, 41, 0.9, 0.2, 9.6, 2.8, 16706, 5.9, 33, 0.3, '[]', 'available', '2025-09-11 06:08:15', '2025-09-11 06:08:15', NULL),
('f0799605-4994-41ae-b52e-c0a960f4d2a4', 'Thịt gà', 'Thịt gà tươi sạch, giàu protein', 'kg', 120000.00, NULL, 165, 31, 3.6, 0, 0, 50, 1.2, 15, 0.9, '[]', 'available', '2025-09-09 14:58:46', '2025-09-09 14:58:46', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `nha_cung_cap`
--

CREATE TABLE `nha_cung_cap` (
  `id` int(11) NOT NULL,
  `ten_ncc` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `dia_chi` varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `trang_thai` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `phieu_nhap_hang`
--

CREATE TABLE `phieu_nhap_hang` (
  `id` int(11) NOT NULL,
  `so_phieu` varchar(20) NOT NULL,
  `nha_cung_cap_id` int(11) NOT NULL,
  `ngay_nhap` datetime DEFAULT current_timestamp(),
  `nguoi_nhap` char(36) DEFAULT NULL,
  `tong_tien` decimal(12,2) DEFAULT 0.00,
  `trang_thai` enum('pending','completed','cancelled') DEFAULT 'pending',
  `ghi_chu` varchar(500) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `teacher_reports`
--

CREATE TABLE `teacher_reports` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `teacher_id` char(36) NOT NULL,
  `class_id` char(36) NOT NULL,
  `report_date` date NOT NULL,
  `attendance` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`attendance`)),
  `health` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`health`)),
  `activities` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `summary` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`summary`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------


--
-- table structure for table `nutrition_reports`
--
-- Tạo bảng nutrition_reports để lưu báo cáo dinh dưỡng
CREATE TABLE IF NOT EXISTS nutrition_reports (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    report_name NVARCHAR(200) NOT NULL,
    school_name NVARCHAR(200) NOT NULL,
    report_date DATE NOT NULL,
    num_children INT DEFAULT 0,
    meals_per_day INT DEFAULT 0,
    nutrition_data JSON,
    growth_data JSON,
    menu_reviews JSON,
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_report_date (report_date),
    INDEX idx_school_name (school_name),
    INDEX idx_created_by (created_by)
);

-- Thêm dữ liệu mẫu
INSERT INTO nutrition_reports (
    id, 
    report_name,
    school_name, 
    report_date, 
    num_children, 
    meals_per_day, 
    nutrition_data, 
    growth_data, 
    menu_reviews, 
    created_by
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'Báo cáo dinh dưỡng tháng 9',
    'Trường Mầm Non ABC',
    '2025-09-30',
    25,
    3,
    '[]',
    '[]',
    '[]',
    'admin'
) ON DUPLICATE KEY UPDATE id=id;

-- --------------------------------------------------------
--
-- Table structure for table `thucdon`
--

CREATE TABLE `thucdon` (
  `ID_TD` int(11) NOT NULL COMMENT 'Mã định danh duy nhất của thực đơn',
  `TONG_NL` decimal(8,2) DEFAULT NULL COMMENT 'Tổng lượng dinh dưỡng (calo) của thực đơn',
  `NGAY_AP_DUNG` date NOT NULL COMMENT 'Ngày áp dụng thực đơn',
  `BUOI_AN` enum('Sáng','Trưa','Chiều','Phụ') NOT NULL COMMENT 'Buổi ăn (Sáng/Trưa/Chiều/Phụ)',
  `GHI_CHU` text DEFAULT NULL COMMENT 'Ghi chú thêm về thực đơn',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Bảng lưu trữ thông tin thực đơn';

--
-- Dumping data for table `thucdon`
--

INSERT INTO `thucdon` (`ID_TD`, `TONG_NL`, `NGAY_AP_DUNG`, `BUOI_AN`, `GHI_CHU`, `createdAt`, `updatedAt`) VALUES
(3, 570.00, '2024-09-06', 'Trưa', 'Thực đơn cân bằng dinh dưỡng', '2025-09-05 18:21:58', '2025-09-05 18:21:58'),
(4, 190.00, '2024-09-06', 'Chiều', 'Bữa phụ nhẹ nhàng', '2025-09-05 18:21:58', '2025-09-05 18:21:58');

-- --------------------------------------------------------

--
-- Table structure for table `thucdon_monan`
--

CREATE TABLE `thucdon_monan` (
  `ID` int(11) NOT NULL,
  `ID_TD` int(11) NOT NULL,
  `ID_MA` int(11) NOT NULL,
  `SO_PHAN` int(11) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `thuc_don`
--

CREATE TABLE `thuc_don` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `ten_thuc_don` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `ngay_ap_dung` date NOT NULL,
  `loai_bua_an` enum('breakfast','lunch','dinner','snack') NOT NULL,
  `lop_ap_dung` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `so_tre_du_kien` int(11) DEFAULT 0,
  `trang_thai` enum('draft','approved','active','completed') DEFAULT 'draft',
  `created_by` char(36) DEFAULT NULL,
  `approved_by` char(36) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `ghi_chu` varchar(500) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `thuc_don`
--

INSERT INTO `thuc_don` (`id`, `ten_thuc_don`, `ngay_ap_dung`, `loai_bua_an`, `lop_ap_dung`, `so_tre_du_kien`, `trang_thai`, `created_by`, `approved_by`, `approved_at`, `ghi_chu`, `created_at`, `updated_at`) VALUES
('170359c3-176d-4e30-91f9-9ee5e5a312ea', 'Thực đơn lunch 2025-09-09', '2025-09-09', 'lunch', 'Tất cả các lớp', 30, 'draft', 'd37fd91e-8ab8-11f0-913c-a036bc312358', NULL, NULL, '', '2025-09-09 15:31:55', '2025-09-09 15:31:55'),
('29aec2c4-660f-4962-b724-dcd955d44576', 'Thực đơn breakfast 2025-09-09', '2025-09-10', 'breakfast', 'Lớp nhà trẻ', 20, 'active', 'd37fd91e-8ab8-11f0-913c-a036bc312358', NULL, NULL, 'Cháo mềm dễ tiêu hóa, giàu protein và vitamin A', '2025-09-09 15:37:57', '2025-09-09 15:37:57'),
('36c35a8e-34d9-4bba-9a77-9419a951387d', 'Cơm gà xối mỏ', '2025-09-09', 'lunch', 'Tất cả các lớp', 30, 'active', 'd37fd91e-8ab8-11f0-913c-a036bc312358', NULL, NULL, 'Phù hợp cho trẻ từ 2 tuổi trở lên', '2025-09-09 15:31:50', '2025-09-09 15:31:50'),
('4afec8ab-3092-4cb7-8976-c1324cd76a65', 'Thực đơn lunch 2025-09-09', '2025-09-10', 'lunch', 'Lớp mẫu giáo', 30, 'active', 'd37fd91e-8ab8-11f0-913c-a036bc312358', NULL, NULL, 'Cá thu giàu omega-3 tốt cho não bộ trẻ em', '2025-09-09 15:38:06', '2025-09-09 15:38:06'),
('93521d11-63dd-492a-ad04-1735933f2ec0', 'Cơm gà xối mỏ', '2025-09-09', 'lunch', 'Lớp mầm', 25, 'active', 'd37fd91e-8ab8-11f0-913c-a036bc312358', NULL, NULL, 'Món ăn bổ dưỡng cho trẻ', '2025-09-09 15:36:40', '2025-09-09 15:36:40'),
('ef8eb921-fd5f-4b04-b677-53901f8d20a2', 'Cơm gà xối mỏ', '2025-09-09', 'lunch', 'Tất cả các lớp', 30, 'active', 'd37fd91e-8ab8-11f0-913c-a036bc312358', NULL, NULL, 'Phù hợp cho trẻ từ 2 tuổi trở lên', '2025-09-09 15:31:30', '2025-09-09 15:31:30'),
('f0715644-a361-4682-8b03-b61dc63df914', 'Cơm gà xối mỏ', '2025-09-09', 'lunch', 'Tất cả các lớp', 30, 'active', 'd37fd91e-8ab8-11f0-913c-a036bc312358', NULL, NULL, 'Phù hợp cho trẻ từ 2 tuổi trở lên', '2025-09-09 15:31:48', '2025-09-09 15:31:48'),
('f34c55ee-97d9-471d-9f4a-e7deaa429db9', 'Thực đơn lunch 2025-09-09', '2025-09-09', 'lunch', 'Tất cả các lớp', 30, 'draft', 'd37fd91e-8ab8-11f0-913c-a036bc312358', NULL, NULL, '', '2025-09-09 15:33:10', '2025-09-09 15:33:10');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `username` varchar(50) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `full_name` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `role` enum('admin','teacher','parent','nutritionist') DEFAULT 'teacher',
  `class_id` char(36) DEFAULT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `address` varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `chuc_vu` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `full_name`, `role`, `class_id`, `phone`, `address`, `chuc_vu`, `is_active`, `created_at`, `updated_at`) VALUES
('30cd2e6d-9a37-11f0-ba52-a036bc312358', 'parent_test', 'test@gmail.com', '$2b$10$LoaOODom2oOVZe0I2EBATuXdSUSJYjsV0Cv7WiE2opCuIW8CG9v2q', 'Test', 'parent', NULL, '09213123123', NULL, NULL, 1, '2025-09-25 17:43:49', '2025-09-25 17:45:24'),
('3ca5ca7c-9574-11f0-8f71-a036bc312358', 'parent_tuan', 'tuanbom1235@gmal.com', '$2b$10$NbW.tai382Xtk/AQCsDWPO7Cvgh0AqWJ4DTpEFcADd9plMWRgeZB6', 'Triệu Anh Tuấn', 'parent', NULL, '0293812012', '456 Lê Lợi, Hà Nội', NULL, 1, '2025-09-19 16:18:11', '2025-09-25 17:48:09'),
('9ba8d2ee-9d37-11f0-afa0-a036bc312358', 'teacher_test', 'teachertest@gmail.com', '$2b$10$Ktur3cLcCO9xMNW3wqef4.lAoKjw/jJsbKHd4VDwyYVrhnzN8Grlm', 'teacher test', 'teacher', '1a9a342f-98a3-11f0-9a5b-a036bc312358', '0128912812', NULL, NULL, 1, '2025-09-29 13:24:20', '2025-09-29 13:24:54'),
('a1c50782-9a37-11f0-ba52-a036bc312358', 'parent_test1', 'test1@gmail.com', '$2b$10$hCR4OxD4HC2oI37pnUuCs.3Fd1PVnSBn0xAHJTKQ7HiKrybf18wi2', 'Test1', 'parent', NULL, '0123818242', NULL, NULL, 1, '2025-09-25 17:46:59', '2025-09-25 17:46:59'),
('a76399b6-9577-11f0-8f71-a036bc312358', 'teacher_li', 'lili@gmail.com', '$2b$10$CRr6ULaoFJplITrEUm2WYO0axEwr6Igej0x5GEqoH7hQTSzPajdsm', 'Li Li', 'teacher', '1a9a329d-98a3-11f0-9a5b-a036bc312358', '1235546456', '123 Dự báo, Hà Nội', NULL, 1, '2025-09-19 16:42:39', '2025-09-25 11:28:54'),
('d37fd91e-8ab8-11f0-913c-a036bc312358', 'admin', 'admin@kindergarten.com', '$2b$10$ZhIyVmGgD5kzcjOr2q3FdO4YSQIzab9Y6be/tDZOegbtjn2lTBtha', 'Administrator', 'admin', NULL, '0123456789', NULL, NULL, 1, '2025-09-06 00:31:27', '2025-09-19 11:54:44');

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_thong_ke_dinh_duong_thuc_don`
-- (See below for the actual view)
--
CREATE TABLE `v_thong_ke_dinh_duong_thuc_don` (
`thuc_don_id` char(36)
,`ten_thuc_don` varchar(100)
,`ngay_ap_dung` date
,`loai_bua_an` enum('breakfast','lunch','dinner','snack')
,`tong_calories` double
,`tong_protein` double
,`tong_fat` double
,`tong_carbs` double
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_ton_kho`
-- (See below for the actual view)
--
CREATE TABLE `v_ton_kho` (
`id` char(36)
,`ten_nguyen_lieu` varchar(100)
,`don_vi_tinh` varchar(20)
,`so_luong_ton` double
,`muc_canh_bao_ton_it` double
,`trang_thai_ton` varchar(7)
);

-- --------------------------------------------------------

--
-- Table structure for table `y_kien_phu_huynh`
--

CREATE TABLE `y_kien_phu_huynh` (
  `id` int(11) NOT NULL,
  `parent_id` char(36) NOT NULL,
  `child_id` char(36) DEFAULT NULL,
  `thuc_don_id` char(36) DEFAULT NULL,
  `mon_an_id` char(36) DEFAULT NULL,
  `loai_y_kien` enum('compliment','suggestion','complaint','question') DEFAULT 'suggestion',
  `tieu_de` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `noi_dung` varchar(1000) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `danh_gia_sao` int(11) DEFAULT NULL CHECK (`danh_gia_sao` between 1 and 5),
  `trang_thai` enum('new','processing','resolved','closed') DEFAULT 'new',
  `phan_hoi` varchar(1000) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `nguoi_phan_hoi` char(36) DEFAULT NULL,
  `ngay_phan_hoi` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure for view `v_thong_ke_dinh_duong_thuc_don`
--
DROP TABLE IF EXISTS `v_thong_ke_dinh_duong_thuc_don`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_thong_ke_dinh_duong_thuc_don`  AS SELECT `td`.`id` AS `thuc_don_id`, `td`.`ten_thuc_don` AS `ten_thuc_don`, `td`.`ngay_ap_dung` AS `ngay_ap_dung`, `td`.`loai_bua_an` AS `loai_bua_an`, sum(`ma`.`total_calories` * `cttd`.`so_khau_phan`) AS `tong_calories`, sum(`ma`.`total_protein` * `cttd`.`so_khau_phan`) AS `tong_protein`, sum(`ma`.`total_fat` * `cttd`.`so_khau_phan`) AS `tong_fat`, sum(`ma`.`total_carbs` * `cttd`.`so_khau_phan`) AS `tong_carbs` FROM ((`thuc_don` `td` join `chi_tiet_thuc_don` `cttd` on(`td`.`id` = `cttd`.`thuc_don_id`)) join `mon_an` `ma` on(`cttd`.`mon_an_id` = `ma`.`id`)) GROUP BY `td`.`id`, `td`.`ten_thuc_don`, `td`.`ngay_ap_dung`, `td`.`loai_bua_an` ;

-- --------------------------------------------------------

--
-- Structure for view `v_ton_kho`
--
DROP TABLE IF EXISTS `v_ton_kho`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_ton_kho`  AS SELECT `nl`.`id` AS `id`, `nl`.`ten_nguyen_lieu` AS `ten_nguyen_lieu`, `nl`.`don_vi_tinh` AS `don_vi_tinh`, coalesce(`kh`.`so_luong_ton`,0) AS `so_luong_ton`, coalesce(`kh`.`muc_canh_bao_ton_it`,0) AS `muc_canh_bao_ton_it`, CASE WHEN coalesce(`kh`.`so_luong_ton`,0) <= coalesce(`kh`.`muc_canh_bao_ton_it`,0) THEN 'LOW' WHEN coalesce(`kh`.`so_luong_ton`,0) <= coalesce(`kh`.`muc_canh_bao_ton_it`,0) * 2 THEN 'WARNING' ELSE 'OK' END AS `trang_thai_ton` FROM (`nguyen_lieu` `nl` left join `kho_hang` `kh` on(`nl`.`id` = `kh`.`nguyen_lieu_id`)) ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `children`
--
ALTER TABLE `children`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `student_id` (`student_id`),
  ADD KEY `idx_student_id` (`student_id`),
  ADD KEY `idx_class` (`class_name`),
  ADD KEY `idx_parent` (`parent_id`),
  ADD KEY `idx_teacher` (`teacher_id`);

--
-- Indexes for table `chi_tiet_mon_an`
--
ALTER TABLE `chi_tiet_mon_an`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_mon_nguyen_lieu` (`mon_an_id`,`nguyen_lieu_id`),
  ADD KEY `idx_mon_an` (`mon_an_id`),
  ADD KEY `idx_nguyen_lieu` (`nguyen_lieu_id`);

--
-- Indexes for table `chi_tiet_phieu_nhap`
--
ALTER TABLE `chi_tiet_phieu_nhap`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_phieu_nhap` (`phieu_nhap_id`),
  ADD KEY `idx_nguyen_lieu` (`nguyen_lieu_id`);

--
-- Indexes for table `chi_tiet_thuc_don`
--
ALTER TABLE `chi_tiet_thuc_don`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_thuc_don` (`thuc_don_id`),
  ADD KEY `idx_mon_an` (`mon_an_id`);

--
-- Indexes for table `classes`
--
ALTER TABLE `classes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_classes_children` (`id_tre`),
  ADD KEY `fk_classes_users_teacher` (`id_teacher`);

--
-- Indexes for table `danh_gia_suc_khoe`
--
ALTER TABLE `danh_gia_suc_khoe`
  ADD PRIMARY KEY (`id`),
  ADD KEY `teacher_id` (`teacher_id`),
  ADD KEY `idx_child_date` (`child_id`,`ngay_danh_gia`),
  ADD KEY `idx_ngay_danh_gia` (`ngay_danh_gia`);

--
-- Indexes for table `danh_muc_nguyen_lieu`
--
ALTER TABLE `danh_muc_nguyen_lieu`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ten_danh_muc` (`ten_danh_muc`),
  ADD KEY `idx_ten_danh_muc` (`ten_danh_muc`),
  ADD KEY `idx_thu_tu` (`thu_tu_hien_thi`),
  ADD KEY `idx_active` (`is_active`);

--
-- Indexes for table `foodingredient`
--
ALTER TABLE `foodingredient`
  ADD PRIMARY KEY (`ID_MA`,`ID_NL`),
  ADD UNIQUE KEY `FOODINGREDIENT_ID_NL_ID_MA_unique` (`ID_MA`,`ID_NL`),
  ADD KEY `ID_NL` (`ID_NL`);

--
-- Indexes for table `ke_hoach_dinh_duong`
--
ALTER TABLE `ke_hoach_dinh_duong`
  ADD PRIMARY KEY (`id`),
  ADD KEY `teacher_id` (`teacher_id`),
  ADD KEY `parent_id` (`parent_id`),
  ADD KEY `idx_child_id` (`child_id`),
  ADD KEY `idx_thoi_gian` (`thoi_gian_bat_dau`,`thoi_gian_ket_thuc`),
  ADD KEY `idx_trang_thai` (`trang_thai`);

--
-- Indexes for table `kho_hang`
--
ALTER TABLE `kho_hang`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_nguyen_lieu_kho` (`nguyen_lieu_id`),
  ADD KEY `idx_so_luong_ton` (`so_luong_ton`);

--
-- Indexes for table `lich_su_su_dung_nguyen_lieu`
--
ALTER TABLE `lich_su_su_dung_nguyen_lieu`
  ADD PRIMARY KEY (`id`),
  ADD KEY `thuc_don_id` (`thuc_don_id`),
  ADD KEY `mon_an_id` (`mon_an_id`),
  ADD KEY `nguoi_su_dung` (`nguoi_su_dung`),
  ADD KEY `idx_nguyen_lieu_date` (`nguyen_lieu_id`,`ngay_su_dung`),
  ADD KEY `idx_ngay_su_dung` (`ngay_su_dung`);

--
-- Indexes for table `meal_schedule`
--
ALTER TABLE `meal_schedule`
  ADD PRIMARY KEY (`id`),
  ADD KEY `child_id` (`child_id`);

--
-- Indexes for table `mon_an`
--
ALTER TABLE `mon_an`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_ten_mon_an` (`ten_mon_an`),
  ADD KEY `idx_loai_mon` (`loai_mon`),
  ADD KEY `idx_trang_thai` (`trang_thai`);

--
-- Indexes for table `nguyenlieu`
--
ALTER TABLE `nguyenlieu`
  ADD PRIMARY KEY (`ID_NL`);

--
-- Indexes for table `nguyen_lieu`
--
ALTER TABLE `nguyen_lieu`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_ten_nguyen_lieu` (`ten_nguyen_lieu`),
  ADD KEY `idx_trang_thai` (`trang_thai`),
  ADD KEY `idx_nha_cung_cap` (`nha_cung_cap_id`),
  ADD KEY `idx_danh_muc_id` (`danh_muc_id`);

--
-- Indexes for table `nha_cung_cap`
--
ALTER TABLE `nha_cung_cap`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_ten_ncc` (`ten_ncc`),
  ADD KEY `idx_trang_thai` (`trang_thai`);

--
-- Indexes for table `phieu_nhap_hang`
--
ALTER TABLE `phieu_nhap_hang`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `so_phieu` (`so_phieu`),
  ADD KEY `nha_cung_cap_id` (`nha_cung_cap_id`),
  ADD KEY `nguoi_nhap` (`nguoi_nhap`),
  ADD KEY `idx_so_phieu` (`so_phieu`),
  ADD KEY `idx_ngay_nhap` (`ngay_nhap`),
  ADD KEY `idx_trang_thai` (`trang_thai`);

--
-- Indexes for table `teacher_reports`
--
ALTER TABLE `teacher_reports`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_teacher_class_date` (`teacher_id`,`class_id`,`report_date`),
  ADD KEY `idx_teacher_date` (`teacher_id`,`report_date`),
  ADD KEY `idx_class_date` (`class_id`,`report_date`),
  ADD KEY `idx_report_date` (`report_date`);

--
-- Indexes for table `thucdon`
--
ALTER TABLE `thucdon`
  ADD PRIMARY KEY (`ID_TD`);

--
-- Indexes for table `thucdon_monan`
--
ALTER TABLE `thucdon_monan`
  ADD PRIMARY KEY (`ID`),
  ADD UNIQUE KEY `THUCDON_MONAN_ID_MA_ID_TD_unique` (`ID_TD`,`ID_MA`),
  ADD KEY `ID_MA` (`ID_MA`);

--
-- Indexes for table `thuc_don`
--
ALTER TABLE `thuc_don`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `approved_by` (`approved_by`),
  ADD KEY `idx_ngay_ap_dung` (`ngay_ap_dung`),
  ADD KEY `idx_loai_bua_an` (`loai_bua_an`),
  ADD KEY `idx_trang_thai` (`trang_thai`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role`),
  ADD KEY `idx_active` (`is_active`),
  ADD KEY `fk_users_classes` (`class_id`);

--
-- Indexes for table `y_kien_phu_huynh`
--
ALTER TABLE `y_kien_phu_huynh`
  ADD PRIMARY KEY (`id`),
  ADD KEY `thuc_don_id` (`thuc_don_id`),
  ADD KEY `mon_an_id` (`mon_an_id`),
  ADD KEY `nguoi_phan_hoi` (`nguoi_phan_hoi`),
  ADD KEY `idx_parent_id` (`parent_id`),
  ADD KEY `idx_child_id` (`child_id`),
  ADD KEY `idx_trang_thai` (`trang_thai`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `chi_tiet_mon_an`
--
ALTER TABLE `chi_tiet_mon_an`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `chi_tiet_phieu_nhap`
--
ALTER TABLE `chi_tiet_phieu_nhap`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `chi_tiet_thuc_don`
--
ALTER TABLE `chi_tiet_thuc_don`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `danh_gia_suc_khoe`
--
ALTER TABLE `danh_gia_suc_khoe`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `danh_muc_nguyen_lieu`
--
ALTER TABLE `danh_muc_nguyen_lieu`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `ke_hoach_dinh_duong`
--
ALTER TABLE `ke_hoach_dinh_duong`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `kho_hang`
--
ALTER TABLE `kho_hang`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `lich_su_su_dung_nguyen_lieu`
--
ALTER TABLE `lich_su_su_dung_nguyen_lieu`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nguyenlieu`
--
ALTER TABLE `nguyenlieu`
  MODIFY `ID_NL` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Mã định danh duy nhất của nguyên liệu', AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `nha_cung_cap`
--
ALTER TABLE `nha_cung_cap`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `phieu_nhap_hang`
--
ALTER TABLE `phieu_nhap_hang`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `thucdon`
--
ALTER TABLE `thucdon`
  MODIFY `ID_TD` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Mã định danh duy nhất của thực đơn', AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `thucdon_monan`
--
ALTER TABLE `thucdon_monan`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `y_kien_phu_huynh`
--
ALTER TABLE `y_kien_phu_huynh`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `children`
--
ALTER TABLE `children`
  ADD CONSTRAINT `children_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `children_ibfk_2` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `chi_tiet_mon_an`
--
ALTER TABLE `chi_tiet_mon_an`
  ADD CONSTRAINT `chi_tiet_mon_an_ibfk_1` FOREIGN KEY (`mon_an_id`) REFERENCES `mon_an` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `chi_tiet_mon_an_ibfk_2` FOREIGN KEY (`nguyen_lieu_id`) REFERENCES `nguyen_lieu` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `chi_tiet_phieu_nhap`
--
ALTER TABLE `chi_tiet_phieu_nhap`
  ADD CONSTRAINT `chi_tiet_phieu_nhap_ibfk_1` FOREIGN KEY (`phieu_nhap_id`) REFERENCES `phieu_nhap_hang` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `chi_tiet_phieu_nhap_ibfk_2` FOREIGN KEY (`nguyen_lieu_id`) REFERENCES `nguyen_lieu` (`id`);

--
-- Constraints for table `chi_tiet_thuc_don`
--
ALTER TABLE `chi_tiet_thuc_don`
  ADD CONSTRAINT `chi_tiet_thuc_don_ibfk_1` FOREIGN KEY (`thuc_don_id`) REFERENCES `thuc_don` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `chi_tiet_thuc_don_ibfk_2` FOREIGN KEY (`mon_an_id`) REFERENCES `mon_an` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `classes`
--
ALTER TABLE `classes`
  ADD CONSTRAINT `fk_classes_children` FOREIGN KEY (`id_tre`) REFERENCES `children` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_classes_users_teacher` FOREIGN KEY (`id_teacher`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `danh_gia_suc_khoe`
--
ALTER TABLE `danh_gia_suc_khoe`
  ADD CONSTRAINT `danh_gia_suc_khoe_ibfk_1` FOREIGN KEY (`child_id`) REFERENCES `children` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `danh_gia_suc_khoe_ibfk_2` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `foodingredient`
--
ALTER TABLE `foodingredient`
  ADD CONSTRAINT `foodingredient_ibfk_1` FOREIGN KEY (`ID_MA`) REFERENCES `monan` (`ID_MA`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `foodingredient_ibfk_2` FOREIGN KEY (`ID_NL`) REFERENCES `nguyenlieu` (`ID_NL`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `ke_hoach_dinh_duong`
--
ALTER TABLE `ke_hoach_dinh_duong`
  ADD CONSTRAINT `ke_hoach_dinh_duong_ibfk_1` FOREIGN KEY (`child_id`) REFERENCES `children` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ke_hoach_dinh_duong_ibfk_2` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `ke_hoach_dinh_duong_ibfk_3` FOREIGN KEY (`parent_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `kho_hang`
--
ALTER TABLE `kho_hang`
  ADD CONSTRAINT `kho_hang_ibfk_1` FOREIGN KEY (`nguyen_lieu_id`) REFERENCES `nguyen_lieu` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `lich_su_su_dung_nguyen_lieu`
--
ALTER TABLE `lich_su_su_dung_nguyen_lieu`
  ADD CONSTRAINT `lich_su_su_dung_nguyen_lieu_ibfk_1` FOREIGN KEY (`nguyen_lieu_id`) REFERENCES `nguyen_lieu` (`id`),
  ADD CONSTRAINT `lich_su_su_dung_nguyen_lieu_ibfk_2` FOREIGN KEY (`thuc_don_id`) REFERENCES `thuc_don` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `lich_su_su_dung_nguyen_lieu_ibfk_3` FOREIGN KEY (`mon_an_id`) REFERENCES `mon_an` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `lich_su_su_dung_nguyen_lieu_ibfk_4` FOREIGN KEY (`nguoi_su_dung`) REFERENCES `users` (`id`);

--
-- Constraints for table `meal_schedule`
--
ALTER TABLE `meal_schedule`
  ADD CONSTRAINT `meal_schedule_ibfk_1` FOREIGN KEY (`child_id`) REFERENCES `children` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `mon_an`
--
ALTER TABLE `mon_an`
  ADD CONSTRAINT `mon_an_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `nguyen_lieu`
--
ALTER TABLE `nguyen_lieu`
  ADD CONSTRAINT `fk_nguyen_lieu_danh_muc` FOREIGN KEY (`danh_muc_id`) REFERENCES `danh_muc_nguyen_lieu` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `nguyen_lieu_ibfk_1` FOREIGN KEY (`nha_cung_cap_id`) REFERENCES `nha_cung_cap` (`id`);

--
-- Constraints for table `phieu_nhap_hang`
--
ALTER TABLE `phieu_nhap_hang`
  ADD CONSTRAINT `phieu_nhap_hang_ibfk_1` FOREIGN KEY (`nha_cung_cap_id`) REFERENCES `nha_cung_cap` (`id`),
  ADD CONSTRAINT `phieu_nhap_hang_ibfk_2` FOREIGN KEY (`nguoi_nhap`) REFERENCES `users` (`id`);

--
-- Constraints for table `teacher_reports`
--
ALTER TABLE `teacher_reports`
  ADD CONSTRAINT `teacher_reports_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `teacher_reports_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `thucdon_monan`
--
ALTER TABLE `thucdon_monan`
  ADD CONSTRAINT `thucdon_monan_ibfk_1` FOREIGN KEY (`ID_TD`) REFERENCES `thucdon` (`ID_TD`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `thucdon_monan_ibfk_10` FOREIGN KEY (`ID_MA`) REFERENCES `monan` (`ID_MA`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `thucdon_monan_ibfk_11` FOREIGN KEY (`ID_TD`) REFERENCES `thucdon` (`ID_TD`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `thucdon_monan_ibfk_12` FOREIGN KEY (`ID_MA`) REFERENCES `monan` (`ID_MA`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `thucdon_monan_ibfk_13` FOREIGN KEY (`ID_TD`) REFERENCES `thucdon` (`ID_TD`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `thucdon_monan_ibfk_14` FOREIGN KEY (`ID_MA`) REFERENCES `monan` (`ID_MA`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `thucdon_monan_ibfk_15` FOREIGN KEY (`ID_TD`) REFERENCES `thucdon` (`ID_TD`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `thucdon_monan_ibfk_16` FOREIGN KEY (`ID_MA`) REFERENCES `monan` (`ID_MA`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `thucdon_monan_ibfk_17` FOREIGN KEY (`ID_TD`) REFERENCES `thucdon` (`ID_TD`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `thucdon_monan_ibfk_18` FOREIGN KEY (`ID_MA`) REFERENCES `monan` (`ID_MA`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `thucdon_monan_ibfk_19` FOREIGN KEY (`ID_TD`) REFERENCES `thucdon` (`ID_TD`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `thucdon_monan_ibfk_2` FOREIGN KEY (`ID_MA`) REFERENCES `monan` (`ID_MA`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `thucdon_monan_ibfk_20` FOREIGN KEY (`ID_MA`) REFERENCES `monan` (`ID_MA`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `thucdon_monan_ibfk_3` FOREIGN KEY (`ID_TD`) REFERENCES `thucdon` (`ID_TD`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `thucdon_monan_ibfk_4` FOREIGN KEY (`ID_MA`) REFERENCES `monan` (`ID_MA`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `thucdon_monan_ibfk_5` FOREIGN KEY (`ID_TD`) REFERENCES `thucdon` (`ID_TD`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `thucdon_monan_ibfk_6` FOREIGN KEY (`ID_MA`) REFERENCES `monan` (`ID_MA`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `thucdon_monan_ibfk_7` FOREIGN KEY (`ID_TD`) REFERENCES `thucdon` (`ID_TD`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `thucdon_monan_ibfk_8` FOREIGN KEY (`ID_MA`) REFERENCES `monan` (`ID_MA`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `thucdon_monan_ibfk_9` FOREIGN KEY (`ID_TD`) REFERENCES `thucdon` (`ID_TD`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `thuc_don`
--
ALTER TABLE `thuc_don`
  ADD CONSTRAINT `thuc_don_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `thuc_don_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_classes` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `y_kien_phu_huynh`
--
ALTER TABLE `y_kien_phu_huynh`
  ADD CONSTRAINT `y_kien_phu_huynh_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `y_kien_phu_huynh_ibfk_2` FOREIGN KEY (`child_id`) REFERENCES `children` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `y_kien_phu_huynh_ibfk_3` FOREIGN KEY (`thuc_don_id`) REFERENCES `thuc_don` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `y_kien_phu_huynh_ibfk_4` FOREIGN KEY (`mon_an_id`) REFERENCES `mon_an` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `y_kien_phu_huynh_ibfk_5` FOREIGN KEY (`nguoi_phan_hoi`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
