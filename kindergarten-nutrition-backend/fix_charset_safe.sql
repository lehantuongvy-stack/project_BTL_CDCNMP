-- Fix database charset for Unicode support (with foreign key handling)

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Fix database charset
ALTER DATABASE kindergarten_nutrition CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Fix children table charset  
ALTER TABLE children CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Fix users table charset
ALTER TABLE users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Fix other related tables if they exist
ALTER TABLE danh_gia_suc_khoe CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Show current charset to verify
SHOW VARIABLES LIKE 'character_set_database';
SHOW TABLE STATUS FROM kindergarten_nutrition WHERE Name = 'children';
