-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 17, 2025 at 10:36 AM
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
  `full_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_of_birth` date NOT NULL,
  `gender` enum('male','female') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `class_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nhom` enum('nha_tre','mau_giao') NOT NULL,
  `parent_id` char(36) DEFAULT NULL,
  `teacher_id` char(36) DEFAULT NULL,
  `height` float DEFAULT 0,
  `weight` float DEFAULT 0,
  `allergies` text DEFAULT NULL,
  `medical_conditions` text DEFAULT NULL,
  `admission_date` date DEFAULT curdate(),
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `children`
--

INSERT INTO `children` (`id`, `student_id`, `full_name`, `date_of_birth`, `gender`, `class_name`, `nhom`, `parent_id`, `teacher_id`, `height`, `weight`, `allergies`, `medical_conditions`, `admission_date`, `is_active`, `created_at`, `updated_at`) VALUES
('0b206ca0-388a-499d-a4dd-1fb39d231e4f', '002', 'seconda', '2024-02-21', 'male', 'Lá', 'nha_tre', '40f72795-a466-11f0-b215-a036bc312358', 'a76399b6-9577-11f0-8f71-a036bc312358', 99, 18, NULL, NULL, '2025-10-12', 1, '2025-10-12 17:34:00', '2025-10-14 10:01:00'),
('0c4d20f1-9f9d-4a46-ae08-b90992c99ab7', '010', '111', '2025-10-16', 'male', 'Lá', 'nha_tre', '43ec99fe-a846-11f0-862e-a036bc312358', '17959160-a846-11f0-862e-a036bc312358', 123, 12, NULL, NULL, '2025-10-16', 1, '2025-10-16 14:01:31', '2025-10-16 14:01:31'),
('33d4cebe-303b-422c-823f-51c0895e5641', '003', 'tretest', '2025-10-13', 'female', 'Lá', 'nha_tre', '43ec99fe-a846-11f0-862e-a036bc312358', 'a76399b6-9577-11f0-8f71-a036bc312358', 123, 12, 'Cá, tôm, cua', NULL, '2025-10-13', 1, '2025-10-13 15:07:37', '2025-10-14 09:45:18'),
('521f4f1e-b6dc-4385-abe4-5d97993f2802', '008', '1112', '2025-10-15', 'female', 'Lá', 'nha_tre', '43ec99fe-a846-11f0-862e-a036bc312358', '17959160-a846-11f0-862e-a036bc312358', 111, 11, NULL, NULL, '2025-10-14', 1, '2025-10-14 17:01:57', '2025-10-14 17:01:57'),
('55111926-471b-4b18-9ead-f490de061f10', '004', 'ádas', '2025-10-13', 'male', 'Lá', 'nha_tre', '43ec99fe-a846-11f0-862e-a036bc312358', 'a76399b6-9577-11f0-8f71-a036bc312358', 111, 10.8, NULL, NULL, '2025-10-13', 1, '2025-10-13 16:33:00', '2025-10-14 10:00:21'),
('79c97672-819b-44d4-a5a4-cdcd60e0ef90', '007', '123', '2025-10-15', 'female', 'Lá', 'nha_tre', '43ec99fe-a846-11f0-862e-a036bc312358', '17959160-a846-11f0-862e-a036bc312358', 111, 11, NULL, NULL, '2025-10-14', 1, '2025-10-14 17:01:22', '2025-10-14 17:01:22'),
('9ad9769b-0dd3-402b-a1dd-b2ebcf61ffac', '005', '1111', '2025-10-14', 'male', 'Lá', 'nha_tre', '43ec99fe-a846-11f0-862e-a036bc312358', '17959160-a846-11f0-862e-a036bc312358', 111, 11, NULL, NULL, '2025-10-14', 1, '2025-10-14 16:57:00', '2025-10-14 16:57:00'),
('ada0f6d7-a907-4eb1-8421-c31810a72a2d', '006', '111', '2025-10-14', 'male', 'Hoa', 'nha_tre', '43ec99fe-a846-11f0-862e-a036bc312358', '17959160-a846-11f0-862e-a036bc312358', 111, 11, NULL, NULL, '2025-10-14', 1, '2025-10-14 16:58:01', '2025-10-14 16:58:01'),
('dcee766e-0996-4b77-9eab-d0e22a35b7ae', '009', '12312', '2025-10-15', 'male', 'Lá', 'nha_tre', '43ec99fe-a846-11f0-862e-a036bc312358', '17959160-a846-11f0-862e-a036bc312358', 111, 11, NULL, NULL, '2025-10-14', 1, '2025-10-14 17:06:18', '2025-10-14 17:06:18'),
('f43d62b2-6dd8-446c-a002-0821c788bfcd', '001', 'first', '2023-10-13', 'female', 'Lá', 'nha_tre', '40f72795-a466-11f0-b215-a036bc312358', 'a76399b6-9577-11f0-8f71-a036bc312358', 102, 15, 'Cá, tôm', NULL, '2025-10-12', 1, '2025-10-12 17:32:27', '2025-10-14 07:42:27');

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

--
-- Dumping data for table `chi_tiet_thuc_don`
--

INSERT INTO `chi_tiet_thuc_don` (`id`, `thuc_don_id`, `mon_an_id`, `buoi`, `so_khau_phan`, `kcal`, `ghi_chu`) VALUES
(897, '73325b14-380c-4e37-a09b-523e4e66b65e', '2a57d7a2-a918-11f0-b3e8-a036bc312358', 'Sáng', 30, 0, ''),
(898, '509bcbff-aa2c-4e35-b78f-609032321a08', '2a5786e4-a918-11f0-b3e8-a036bc312358', 'Sáng', 30, 0, ''),
(899, 'fe3f5bfb-e4c4-4479-a7e5-bcff4d459e64', '2a5786e4-a918-11f0-b3e8-a036bc312358', 'Trưa', 30, 0, ''),
(900, '46d82c9f-f369-42f7-b000-595d4af49d82', '2a5786e4-a918-11f0-b3e8-a036bc312358', 'Sáng', 30, 0, '');

-- --------------------------------------------------------

--
-- Table structure for table `classes`
--

CREATE TABLE `classes` (
  `id` char(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `nhom_lop` enum('nha_tre','mau_giao') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `id_tre` char(36) DEFAULT NULL,
  `id_teacher` char(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `classes`
--

INSERT INTO `classes` (`id`, `name`, `description`, `nhom_lop`, `created_at`, `updated_at`, `id_tre`, `id_teacher`) VALUES
('1a9a342f-98a3-11f0-9a5b-a036bc312358', 'Lá', NULL, 'nha_tre', '2025-10-12 17:23:26', '2025-10-12 17:23:26', NULL, NULL),
('1a9a3487-98a3-11f0-9a5b-a036bc312358', 'Hoa', NULL, 'nha_tre', '2025-10-12 17:23:26', '2025-10-12 17:23:26', NULL, NULL),
('771fc0e3-a4ec-11f0-8498-a036bc312358', 'Mầm', NULL, 'nha_tre', '2025-10-12 17:23:26', '2025-10-12 17:23:26', NULL, NULL),
('771fdaee-a4ec-11f0-8498-a036bc312358', 'Chồi', NULL, 'nha_tre', '2025-10-12 17:23:26', '2025-10-12 17:23:26', NULL, NULL);

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

INSERT INTO `danh_gia_suc_khoe` (`id`, `child_id`, `teacher_id`, `ngay_danh_gia`, `chieu_cao`, `can_nang`, `tinh_trang_suc_khoe`, `khuyen_cao`, `an_uong`, `hoat_dong`, `tinh_than`, `an_tai_truong`, `muc_do_khau_phan`, `ghi_chu_bua_an`, `created_at`) VALUES
(14, '55111926-471b-4b18-9ead-f490de061f10', 'a76399b6-9577-11f0-8f71-a036bc312358', '2025-10-16', 123, 12, '', '', 'Vừa đủ', 'Có vận động', 'Bình thường', 0, 0, NULL, '2025-10-16 09:21:39'),
(15, '33d4cebe-303b-422c-823f-51c0895e5641', 'a76399b6-9577-11f0-8f71-a036bc312358', '2025-10-16', 122, 12, '123', '123', 'Vừa đủ', 'Có vận động', 'Bình thường', 0, 0, NULL, '2025-10-16 13:25:10'),
(16, '55111926-471b-4b18-9ead-f490de061f10', 'a76399b6-9577-11f0-8f71-a036bc312358', '2025-10-17', 123, 12, 'ád', 'áddas', 'Đầy đủ', 'Năng động', 'Vui vẻ', 0, 0, NULL, '2025-10-17 07:18:16');

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
  `nguyen_lieu_ton` varchar(50) DEFAULT NULL,
  `suc_chua_toi_da` float DEFAULT 0,
  `ngay_cap_nhat` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `tinh_trang` varchar(50) DEFAULT 'good',
  `ngay_xuat` timestamp NULL DEFAULT current_timestamp(),
  `tong_so_luong` float DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `kho_hang`
--

INSERT INTO `kho_hang` (`id`, `nguyen_lieu`, `nguyen_lieu_ton`, `suc_chua_toi_da`, `ngay_cap_nhat`, `tinh_trang`, `ngay_xuat`, `tong_so_luong`) VALUES
(201372, 'ads', 'ads', 0, '2025-10-16 04:50:00', 'ads', '2025-10-16 04:50:00', 12),
(201373, '123', '123', 123, '2025-10-16 14:06:50', '123', '2025-10-16 14:06:00', 123),
(201374, '1234', '1234', 1234, '2025-10-16 15:02:11', '1234', '2025-10-16 15:02:00', 1234),
(201375, '12345', '12345', 12345, '2025-10-16 15:02:35', '12345', '2025-10-16 15:02:00', 12345),
(201376, '3838', '2928', 238, '2025-10-17 07:18:37', '282', '2025-10-17 07:18:00', 2312);

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
('2a5786e4-a918-11f0-b3e8-a036bc312358', 'Cháo gà', 'Cháo mềm với thịt gà băm, phù hợp cho trẻ nhỏ', 'main_dish', '3-5 tuổi', 30, 1, 180, 8.5, 6.2, 22.8, 'Nấu cháo lâu để mềm. Thịt gà bằm phi thơm rồi cho vào cháo.', 'active', 'd37fd91e-8ab8-11f0-913c-a036bc312358', '2025-10-14 16:09:33', '2025-10-14 16:09:33'),
('2a57d7a2-a918-11f0-b3e8-a036bc312358', 'Canh rau ngót', 'Canh ngon ngọt', 'main_dish', '3-6 tuổi', 20, 1, 220, 15.2, 8.1, 25.5, 'Thịt bằm xào thơm, nấu canh với rau ngót.', 'active', 'd37fd91e-8ab8-11f0-913c-a036bc312358', '2025-10-14 16:09:33', '2025-10-14 16:09:33'),
('2a57d851-a918-11f0-b3e8-a036bc312358', 'Sữa chua', 'Sữa chua tự nhiên, bổ sung canxi', 'dessert', '2-6 tuổi', 10, 1, 120, 6.8, 4.5, 12.8, 'Sữa chua tự nhiên, không đường hoặc ít đường.', 'active', 'd37fd91e-8ab8-11f0-913c-a036bc312358', '2025-10-14 16:09:33', '2025-10-14 16:09:33'),
('2a57d8aa-a918-11f0-b3e8-a036bc312358', 'Cơm trắng', 'Cơm trắng dẻo thơm', 'main_dish', '4-6 tuổi', 40, 1, 450, 30.5, 14.2, 55.8, 'Cơm nấu dẻo, thơm. Ăn kèm với các món mặn.', 'active', 'd37fd91e-8ab8-11f0-913c-a036bc312358', '2025-10-14 16:09:33', '2025-10-14 16:09:33'),
('2a57d901-a918-11f0-b3e8-a036bc312358', 'Thịt kho trứng', 'Thịt ba chỉ kho với trứng cút', 'main_dish', '3-6 tuổi', 60, 1, 380, 25.8, 28.5, 8.2, 'Thịt cắt miếng vừa, kho với nước dừa và trứng cút.', 'active', 'd37fd91e-8ab8-11f0-913c-a036bc312358', '2025-10-14 16:09:33', '2025-10-14 16:09:33'),
('2a57d951-a918-11f0-b3e8-a036bc312358', 'Canh rau ngót', 'Canh rau ngót thanh mát, bổ dưỡng', 'soup', '3-6 tuổi', 15, 1, 85, 4.2, 2.1, 12.5, 'Rau ngót rửa sạch, nấu canh với tôm khô.', 'active', 'd37fd91e-8ab8-11f0-913c-a036bc312358', '2025-10-14 16:09:33', '2025-10-14 16:09:33'),
('2a57d999-a918-11f0-b3e8-a036bc312358', 'Canh cà chua', 'Canh cà chua chua ngọt, kích thích ăn uống', 'soup', '3-6 tuổi', 15, 1, 95, 3.8, 1.2, 18.5, 'Cà chua chín phi thơm, nấu canh với thịt bằm.', 'active', 'd37fd91e-8ab8-11f0-913c-a036bc312358', '2025-10-14 16:09:33', '2025-10-14 16:09:33'),
('2a57d9f1-a918-11f0-b3e8-a036bc312358', 'Thịt băm xào ngô', 'Thịt băm xào với ngô ngọt, thơm ngon', 'main_dish', '3-6 tuổi', 25, 1, 320, 22.4, 18.6, 15.2, 'Phi thơm hành, cho thịt vào xào chín, thêm ngô ngọt, nêm gia vị, đảo đều 5 phút là xong.', 'active', 'd37fd91e-8ab8-11f0-913c-a036bc312358', '2025-10-14 16:09:33', '2025-10-14 16:09:33'),
('2a57da4b-a918-11f0-b3e8-a036bc312358', 'Rau bắp cải luộc', 'Rau bắp cải luộc xanh, giàu vitamin', 'soup', '3-6 tuổi', 10, 1, 60, 2.8, 0.5, 12.8, 'Bắp cải rửa sạch, luộc với nước muối vừa chín tới.', 'active', 'd37fd91e-8ab8-11f0-913c-a036bc312358', '2025-10-14 16:09:33', '2025-10-14 16:09:33'),
('2a57db51-a918-11f0-b3e8-a036bc312358', 'Giá xào thịt bò', 'Giá đỗ xào với thịt bò mềm', 'main_dish', '4-6 tuổi', 20, 1, 285, 20.5, 15.8, 18.2, 'Thịt bò thái mỏng xào với giá đỗ tươi.', 'active', 'd37fd91e-8ab8-11f0-913c-a036bc312358', '2025-10-14 16:09:33', '2025-10-14 16:09:33'),
('2a57db99-a918-11f0-b3e8-a036bc312358', 'Xôi gấc', 'Xôi đỏ từ quả gấc, bổ dưỡng', 'snack', '3-6 tuổi', 45, 1, 190, 4.5, 3.2, 38.5, 'Gấc cạo lấy thịt, trộn đều với gạo nếp nấu chín.', 'active', 'd37fd91e-8ab8-11f0-913c-a036bc312358', '2025-10-14 16:09:33', '2025-10-14 16:09:33'),
('2a57dbde-a918-11f0-b3e8-a036bc312358', 'Xôi lạc', 'Xôi với đậu phộng thơm bùi', 'snack', '4-6 tuổi', 45, 1, 235, 8.2, 9.8, 32.5, 'Lạc rang chín, trộn với xôi nấu mềm.', 'active', 'd37fd91e-8ab8-11f0-913c-a036bc312358', '2025-10-14 16:09:33', '2025-10-14 16:09:33'),
('2a57dc29-a918-11f0-b3e8-a036bc312358', 'Dưa hấu', 'Trái cây tươi giàu nước và vitamin', 'dessert', '2-6 tuổi', 5, 1, 45, 0.8, 0.2, 11.2, 'Rửa sạch, cắt miếng vừa ăn, bỏ hạt.', 'active', 'd37fd91e-8ab8-11f0-913c-a036bc312358', '2025-10-14 16:09:33', '2025-10-14 16:09:33'),
('2a57dc74-a918-11f0-b3e8-a036bc312358', 'Cháo hến', 'Cháo hến thơm ngon, bổ dưỡng', 'main_dish', '3-6 tuổi', 35, 1, 280, 8.5, 4.2, 52.8, 'Hến làm sạch, luộc lấy nước, nấu cháo bằng nước hến, xào hến với hành, cho vào cháo.', 'active', 'd37fd91e-8ab8-11f0-913c-a036bc312358', '2025-10-14 16:09:33', '2025-10-14 16:09:33'),
('e4f546b5-a370-11f0-82fb-a036bc312358', 'Cháo thịt bằm', 'Cháo thịt heo xay nấu cùng gạo tẻ và rau xanh', 'main_dish', '1-3 tuổi', 30, 1, 180, 8, 6, 22, 'Nấu chín thịt bằm, cho gạo vào ninh nhừ cùng rau.', 'active', 'd37fd91e-8ab8-11f0-913c-a036bc312358', '2025-10-07 04:29:32', '2025-10-07 04:29:32'),
('e4f59394-a370-11f0-82fb-a036bc312358', 'Cơm gà xé', 'Cơm trắng ăn cùng thịt gà luộc xé nhỏ', 'main_dish', '3-5 tuổi', 40, 1, 350, 22, 10, 45, 'Luộc gà, xé nhỏ và ăn cùng cơm trắng, có thể chan nước luộc gà.', 'active', 'd37fd91e-8ab8-11f0-913c-a036bc312358', '2025-10-07 04:29:32', '2025-10-07 04:29:32'),
('e4f59436-a370-11f0-82fb-a036bc312358', 'Canh rau ngót thịt bằm', 'Canh rau ngót nấu cùng thịt heo xay', 'soup', '2-5 tuổi', 25, 1, 120, 7, 4, 10, 'Xào thịt bằm, thêm nước, nấu chín rau ngót.', 'active', 'd37fd91e-8ab8-11f0-913c-a036bc312358', '2025-10-07 04:29:32', '2025-10-07 04:29:32'),
('e4f594a5-a370-11f0-82fb-a036bc312358', 'Sữa tươi ít đường', 'Sữa tươi thanh trùng ít đường', 'drink', '1-5 tuổi', 0, 1, 110, 5, 4, 12, 'Dùng trực tiếp sau khi làm lạnh.', 'active', 'd37fd91e-8ab8-11f0-913c-a036bc312358', '2025-10-07 04:29:32', '2025-10-07 04:29:32'),
('e4f5950e-a370-11f0-82fb-a036bc312358', 'Bánh mì trứng', 'Bánh mì sandwich kẹp trứng chiên', 'snack', '3-6 tuổi', 15, 1, 220, 10, 8, 25, 'Chiên trứng, kẹp cùng bánh mì, cắt nhỏ.', 'active', 'd37fd91e-8ab8-11f0-913c-a036bc312358', '2025-10-07 04:29:32', '2025-10-07 04:29:32'),
('e4f5ea79-a370-11f0-82fb-a036bc312358', 'Phở bò', 'Phở nước với thịt bò thái lát mỏng', 'main_dish', '4-6 tuổi', 45, 1, 310, 18, 9, 40, 'Hầm xương lấy nước dùng, trụng bánh phở, thêm thịt bò.', 'active', 'd37fd91e-8ab8-11f0-913c-a036bc312358', '2025-10-07 04:29:32', '2025-10-07 04:29:32'),
('e4f5eb0d-a370-11f0-82fb-a036bc312358', 'Bún cá', 'Bún với cá phi lê và rau thơm', 'main_dish', '4-6 tuổi', 40, 1, 280, 20, 6, 38, 'Luộc cá, lọc xương, nấu nước lèo và chan lên bún.', 'active', 'd37fd91e-8ab8-11f0-913c-a036bc312358', '2025-10-07 04:29:32', '2025-10-07 04:29:32'),
('e4f5eb6b-a370-11f0-82fb-a036bc312358', 'Cơm tấm trứng chiên', 'Cơm tấm ăn với trứng chiên và dưa leo', 'main_dish', '3-6 tuổi', 25, 1, 330, 14, 10, 42, 'Chiên trứng, dùng với cơm tấm và rau.', 'active', 'd37fd91e-8ab8-11f0-913c-a036bc312358', '2025-10-07 04:29:32', '2025-10-07 04:29:32'),
('e4f5ebdd-a370-11f0-82fb-a036bc312358', 'Canh bí đỏ', 'Canh bí đỏ nấu với thịt bằm', 'soup', '2-5 tuổi', 25, 1, 130, 6, 4, 15, 'Nấu bí đỏ mềm với thịt bằm và nêm nhẹ.', 'active', 'd37fd91e-8ab8-11f0-913c-a036bc312358', '2025-10-07 04:29:32', '2025-10-07 04:29:32'),
('e4f5ec4c-a370-11f0-82fb-a036bc312358', 'Cháo cá hồi rau củ', 'Cháo nấu cùng cá hồi và rau củ xay nhuyễn', 'main_dish', '1-3 tuổi', 35, 1, 200, 10, 7, 23, 'Nấu cháo nhừ, cho cá hồi và rau củ vào ninh.', 'active', 'd37fd91e-8ab8-11f0-913c-a036bc312358', '2025-10-07 04:29:32', '2025-10-07 04:29:32'),
('e4f5eca0-a370-11f0-82fb-a036bc312358', 'Bánh bao nhân thịt', 'Bánh bao hấp nhân thịt bằm trứng cút', 'snack', '3-6 tuổi', 25, 1, 250, 9, 8, 34, 'Hấp bánh bao chín, ăn nóng.', 'active', 'd37fd91e-8ab8-11f0-913c-a036bc312358', '2025-10-07 04:29:32', '2025-10-07 04:29:32'),
('e4f5eceb-a370-11f0-82fb-a036bc312358', 'Cơm chiên trứng', 'Cơm chiên với trứng và rau củ', 'main_dish', '3-6 tuổi', 20, 1, 280, 12, 7, 38, 'Chiên cơm với trứng và rau củ, nêm nhẹ.', 'active', 'd37fd91e-8ab8-11f0-913c-a036bc312358', '2025-10-07 04:29:32', '2025-10-07 04:29:32'),
('e4f5ed5d-a370-11f0-82fb-a036bc312358', 'Súp gà ngô non', 'Súp gà nấu cùng bắp ngọt và trứng', 'soup', '2-5 tuổi', 30, 1, 150, 9, 5, 16, 'Luộc gà, xé sợi, nấu cùng bắp ngọt, khuấy trứng.', 'active', 'd37fd91e-8ab8-11f0-913c-a036bc312358', '2025-10-07 04:29:32', '2025-10-07 04:29:32'),
('e4f5edb0-a370-11f0-82fb-a036bc312358', 'Nước cam tươi', 'Nước cam vắt tươi không đường', 'drink', '2-6 tuổi', 10, 1, 60, 1, 0, 15, 'Vắt cam, lọc hạt, dùng tươi.', 'active', 'd37fd91e-8ab8-11f0-913c-a036bc312358', '2025-10-07 04:29:32', '2025-10-07 04:29:32'),
('e4f5ee01-a370-11f0-82fb-a036bc312358', 'Sữa chua', 'Sữa chua lên men tự nhiên, vị nhẹ', 'dessert', '2-6 tuổi', 0, 1, 100, 4, 3, 14, 'Dùng lạnh sau bữa ăn.', 'active', 'd37fd91e-8ab8-11f0-913c-a036bc312358', '2025-10-07 04:29:32', '2025-10-07 04:29:32');

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
-- Table structure for table `nutrition_reports`
--

CREATE TABLE `nutrition_reports` (
  `id` char(36) NOT NULL,
  `report_name` varchar(200) NOT NULL DEFAULT 'Báo cáo dinh dưỡng',
  `school_name` varchar(255) DEFAULT NULL,
  `report_date` date DEFAULT NULL,
  `num_children` int(11) DEFAULT NULL,
  `meals_per_day` int(11) DEFAULT NULL,
  `nutrition_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `growth_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `menu_reviews` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `nutrition_reports`
--

INSERT INTO `nutrition_reports` (`id`, `report_name`, `school_name`, `report_date`, `num_children`, `meals_per_day`, `nutrition_data`, `growth_data`, `menu_reviews`, `created_by`, `created_at`, `updated_at`) VALUES
('fb9da7bf-d738-43c0-8853-7a750c843764', '123', '12123', '0000-00-00', 2147483647, 2147483647, '{\"nangLuong\":900,\"nangLuongReq\":1000,\"protein\":34,\"proteinReq\":35,\"lipid\":28,\"lipidReq\":30,\"glucid\":126,\"glucidReq\":140}', '[{\"name\":\"2-3 tuổi\",\"soTre\":\"50\",\"canNang\":\"12.5\",\"chieuCao\":\"88\",\"tyLe\":\"92\"},{\"name\":\"3-4 tuổi\",\"soTre\":\"60\",\"canNang\":\"14.2\",\"chieuCao\":\"96\",\"tyLe\":\"90\"},{\"name\":\"5 tuổi\",\"soTre\":\"55\",\"canNang\":\"17.5\",\"chieuCao\":\"107\",\"tyLe\":\"94\"}]', '[\"Đa dạng thực phẩm: 8/10 nhóm thực phẩm trong tuần.\",\"Rau củ quả chiếm 15% chi phí → cần tăng lên 20%.\",\"Chế độ ăn nhìn chung cân đối, nhưng nên bổ sung thêm các món từ đậu, hạt.\"]', '123', '2025-10-13 15:57:13', '2025-10-13 15:57:13'),
('4121ee63-65b0-4add-8c88-1dda970ea1cd', 'test', 'abc', '2025-10-28', 300, 3, '{\"nangLuong\":900,\"nangLuongReq\":1000,\"protein\":34,\"proteinReq\":35,\"lipid\":28,\"lipidReq\":30,\"glucid\":126,\"glucidReq\":140}', '[{\"name\":\"2-3 tuổi\",\"soTre\":\"50\",\"canNang\":\"12.5\",\"chieuCao\":\"88\",\"tyLe\":\"92\"},{\"name\":\"3-4 tuổi\",\"soTre\":\"60\",\"canNang\":\"14.2\",\"chieuCao\":\"96\",\"tyLe\":\"90\"},{\"name\":\"5 tuổi\",\"soTre\":\"55\",\"canNang\":\"17.5\",\"chieuCao\":\"107\",\"tyLe\":\"94\"}]', '[\"Đa dạng thực phẩm: 8/10 nhóm thực phẩm trong tuần.\",\"Rau củ quả chiếm 15% chi phí → cần tăng lên 20%.\",\"Chế độ ăn nhìn chung cân đối, nhưng nên bổ sung thêm các món từ đậu, hạt.\",\"abc\"]', 'hh', '2025-10-16 15:02:52', '2025-10-16 15:02:52');

-- --------------------------------------------------------

--
-- Table structure for table `thuc_don`
--

CREATE TABLE `thuc_don` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `ten_thuc_don` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `ngay_ap_dung` date NOT NULL,
  `loai_bua_an` enum('breakfast','lunch','dinner','snack') NOT NULL,
  `class_id` char(36) DEFAULT NULL,
  `nhom_lop` enum('nha_tre','mau_giao') DEFAULT NULL,
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

INSERT INTO `thuc_don` (`id`, `ten_thuc_don`, `ngay_ap_dung`, `loai_bua_an`, `class_id`, `nhom_lop`, `so_tre_du_kien`, `trang_thai`, `created_by`, `approved_by`, `approved_at`, `ghi_chu`, `created_at`, `updated_at`) VALUES
('46d82c9f-f369-42f7-b000-595d4af49d82', 'Bữa sáng - Nhà Trẻ - 2025-10-16', '2025-10-16', 'breakfast', NULL, 'nha_tre', 30, 'active', 'a76399b6-9577-11f0-8f71-a036bc312358', NULL, NULL, '', '2025-10-16 09:56:13', '2025-10-16 09:56:13'),
('509bcbff-aa2c-4e35-b78f-609032321a08', 'Bữa sáng - Nhà Trẻ - 2025-10-15', '2025-10-15', 'breakfast', NULL, 'nha_tre', 30, 'active', 'a76399b6-9577-11f0-8f71-a036bc312358', NULL, NULL, '', '2025-10-15 09:07:44', '2025-10-15 11:49:33'),
('73325b14-380c-4e37-a09b-523e4e66b65e', 'Bữa sáng - Mẫu Giáo - 2025-10-14', '2025-10-14', 'breakfast', NULL, 'mau_giao', 30, 'active', 'a76399b6-9577-11f0-8f71-a036bc312358', NULL, NULL, '', '2025-10-14 16:13:43', '2025-10-14 16:13:43'),
('f22cc1a3-6179-4e55-b25d-cd45bfe29fe1', 'Bữa sáng - Nhà Trẻ - 2025-10-12', '2025-10-12', 'breakfast', NULL, 'nha_tre', 30, 'active', 'a76399b6-9577-11f0-8f71-a036bc312358', NULL, NULL, '', '2025-10-12 16:00:42', '2025-10-12 16:00:42'),
('fe3f5bfb-e4c4-4479-a7e5-bcff4d459e64', 'Bữa trưa - Nhà Trẻ - 2025-10-15', '2025-10-15', 'lunch', NULL, 'nha_tre', 30, 'active', 'a76399b6-9577-11f0-8f71-a036bc312358', NULL, NULL, '', '2025-10-15 11:49:33', '2025-10-15 11:49:33');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `username` varchar(50) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `full_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
('17959160-a846-11f0-862e-a036bc312358', 'gvtesst', 'gvtest@gmail.com', '$2b$10$B0aRmsDAEmyQo9YjtoJj3u9GFv5.3BzhldYj/nuyLDKAx6DSLpUSu', 'gvtest', 'teacher', '1a9a3487-98a3-11f0-9a5b-a036bc312358', '09238293923', 'hjh', NULL, 1, '2025-10-13 15:05:44', '2025-10-14 05:30:35'),
('2410f576-a751-11f0-a22f-a036bc312358', 'teacher_gv5', 'giaovien3@gmail.com', '$2b$10$NzsmGfNKohErVISZ.xUU5.kd4pZukedOYpXmo7PnXmVBsttAlKDku', 'Giáo viên', 'teacher', '771fc0e3-a4ec-11f0-8498-a036bc312358', '09238102812', '123 hàng bài', NULL, 1, '2025-10-12 09:52:18', '2025-10-14 07:02:30'),
('40f72795-a466-11f0-b215-a036bc312358', 'parent_tuan', 'tuan@gmail.com', '$2b$10$DUw0BCj.h53PDGB/Wl82u.gKCxVWyn8D4he7BUQJ/SBpUPSrfXI.K', 'Triệu Anh Tuấn', 'parent', NULL, '0321399231', NULL, NULL, 1, '2025-10-08 16:45:53', '2025-10-12 16:01:53'),
('43ec99fe-a846-11f0-862e-a036bc312358', 'phtest', 'phtest@gmail.com', '$2b$10$Tvs6olGDntoYWp6JDNiA9udPy/xA5HcBxt4vXmPptxpDhr1Xu8CWG', 'phtest', 'parent', NULL, '0931293812', NULL, NULL, 1, '2025-10-13 15:06:58', '2025-10-13 15:06:58'),
('45bf3004-a790-11f0-a22f-a036bc312358', 'tuan', 'tuan120@gmail.com', '$2b$10$gYIynTrgtdpOqwCjKRiVdOtkmrdouXyYYM7EhVVkMuynm/Vx7Lnea', 'tuan1', 'teacher', '1a9a342f-98a3-11f0-9a5b-a036bc312358', '02183192312', NULL, NULL, 1, '2025-10-12 17:24:13', '2025-10-12 17:24:13'),
('60db3d8c-a51c-11f0-8498-a036bc312358', 'teacher_gv', 'giaovien123@gmail.com', '$2b$10$FKHVKvob2JhJIPcR5AafR.lsYgTxU4nsKm47NLd1A/Ao48.3gYuYW', 'giaovien', 'teacher', NULL, '0972782612', '', NULL, 1, '2025-10-09 14:29:35', '2025-10-14 16:46:42'),
('68a56cb8-a506-11f0-8498-a036bc312358', 'parent_tu', 'tu@gmail.com', '$2b$10$eholqrv6pdgaRwbGPtNc3.2xXKPz9XTA0L8UlURnTY2w94/eoDpJS', 'Đinh Văn Tú ', 'parent', NULL, '0348788937', NULL, NULL, 1, '2025-10-09 11:52:19', '2025-10-09 11:52:19'),
('a76399b6-9577-11f0-8f71-a036bc312358', 'teacher_li', 'lili@gmail.com', '$2b$10$DbWG5icHajavH560wVUXaeLxqoAP8jZMIHGXqnWXIgknrx5YB7gry', 'Li Li', 'teacher', '1a9a342f-98a3-11f0-9a5b-a036bc312358', '1235546456', '123 Dự báo, Hà Nội', NULL, 1, '2025-09-19 16:42:39', '2025-10-14 07:04:27'),
('c6d1963a-a4fa-11f0-8498-a036bc312358', 'teacher_ly', 'ly@gmail.com', '$2b$10$EiCNLGiEpY2GnDFfu/AOmeXCk/pASwagxitlXn/8hyi8TtWLg9/Sa', 'Ly Thi Ly', 'teacher', NULL, '0928391232', '123 Hoàn Kiếm', NULL, 1, '2025-10-09 10:29:03', '2025-10-09 10:30:01'),
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

--
-- Dumping data for table `y_kien_phu_huynh`
--

INSERT INTO `y_kien_phu_huynh` (`id`, `parent_id`, `child_id`, `thuc_don_id`, `mon_an_id`, `loai_y_kien`, `tieu_de`, `noi_dung`, `danh_gia_sao`, `trang_thai`, `phan_hoi`, `nguoi_phan_hoi`, `ngay_phan_hoi`, `created_at`) VALUES
(2, '43ec99fe-a846-11f0-862e-a036bc312358', NULL, NULL, NULL, 'suggestion', 'aoodasdasd', 'ádasdasd', 5, 'new', NULL, NULL, NULL, '2025-10-13 15:46:38');

-- --------------------------------------------------------

--
-- Structure for view `v_thong_ke_dinh_duong_thuc_don`
--
DROP TABLE IF EXISTS `v_thong_ke_dinh_duong_thuc_don`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_thong_ke_dinh_duong_thuc_don`  AS SELECT `td`.`id` AS `thuc_don_id`, `td`.`ten_thuc_don` AS `ten_thuc_don`, `td`.`ngay_ap_dung` AS `ngay_ap_dung`, `td`.`loai_bua_an` AS `loai_bua_an`, sum(`ma`.`total_calories` * `cttd`.`so_khau_phan`) AS `tong_calories`, sum(`ma`.`total_protein` * `cttd`.`so_khau_phan`) AS `tong_protein`, sum(`ma`.`total_fat` * `cttd`.`so_khau_phan`) AS `tong_fat`, sum(`ma`.`total_carbs` * `cttd`.`so_khau_phan`) AS `tong_carbs` FROM ((`thuc_don` `td` join `chi_tiet_thuc_don` `cttd` on(`td`.`id` = `cttd`.`thuc_don_id`)) join `mon_an` `ma` on(`cttd`.`mon_an_id` = `ma`.`id`)) GROUP BY `td`.`id`, `td`.`ten_thuc_don`, `td`.`ngay_ap_dung`, `td`.`loai_bua_an` ;

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
  ADD UNIQUE KEY `unique_nguyen_lieu_kho` (`nguyen_lieu`),
  ADD KEY `idx_so_luong_ton` (`nguyen_lieu_ton`);

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
-- Indexes for table `thuc_don`
--
ALTER TABLE `thuc_don`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `approved_by` (`approved_by`),
  ADD KEY `idx_ngay_ap_dung` (`ngay_ap_dung`),
  ADD KEY `idx_loai_bua_an` (`loai_bua_an`),
  ADD KEY `idx_trang_thai` (`trang_thai`),
  ADD KEY `fk_thucdon_classes` (`class_id`),
  ADD KEY `idx_thuc_don_ngay_nhom` (`ngay_ap_dung`,`nhom_lop`);

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
-- AUTO_INCREMENT for table `chi_tiet_thuc_don`
--
ALTER TABLE `chi_tiet_thuc_don`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=901;

--
-- AUTO_INCREMENT for table `danh_gia_suc_khoe`
--
ALTER TABLE `danh_gia_suc_khoe`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=201377;

--
-- AUTO_INCREMENT for table `nha_cung_cap`
--
ALTER TABLE `nha_cung_cap`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `y_kien_phu_huynh`
--
ALTER TABLE `y_kien_phu_huynh`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

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
-- Constraints for table `ke_hoach_dinh_duong`
--
ALTER TABLE `ke_hoach_dinh_duong`
  ADD CONSTRAINT `ke_hoach_dinh_duong_ibfk_1` FOREIGN KEY (`child_id`) REFERENCES `children` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ke_hoach_dinh_duong_ibfk_2` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `ke_hoach_dinh_duong_ibfk_3` FOREIGN KEY (`parent_id`) REFERENCES `users` (`id`);

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
-- Constraints for table `thuc_don`
--
ALTER TABLE `thuc_don`
  ADD CONSTRAINT `fk_thucdon_classes` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
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
