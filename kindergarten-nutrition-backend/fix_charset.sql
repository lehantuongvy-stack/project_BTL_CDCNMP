-- Fix database charset for Unicode support
ALTER DATABASE kindergarten_nutrition CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Fix children table charset  
ALTER TABLE children CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Fix users table charset
ALTER TABLE users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Show current charset
SHOW VARIABLES LIKE 'character_set%';
SHOW VARIABLES LIKE 'collation%';
