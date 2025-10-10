-- Fix charset for MariaDB compatibility

-- Step 1: Disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;

-- Step 2: Fix database charset (MariaDB syntax)
ALTER DATABASE kindergarten_nutrition CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Step 3: Fix class_name column specifically (MariaDB syntax)
ALTER TABLE children MODIFY class_name VARCHAR(50) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Step 4: Fix other text columns
ALTER TABLE children MODIFY full_name VARCHAR(100) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE users MODIFY full_name VARCHAR(100) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Step 5: Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Step 6: Test insert to verify
SELECT @@character_set_database, @@collation_database;
