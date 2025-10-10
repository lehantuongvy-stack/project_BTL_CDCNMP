-- Fix charset step by step to avoid foreign key issues

-- Step 1: Disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;

-- Step 2: Fix database charset
ALTER DATABASE kindergarten_nutrition CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Step 3: Fix only the class_name column specifically
ALTER TABLE children MODIFY COLUMN class_name NVARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Step 4: Fix other text columns that might need Unicode
ALTER TABLE children MODIFY COLUMN full_name NVARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE users MODIFY COLUMN full_name NVARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Step 5: Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Step 6: Verify the changes
SHOW FULL COLUMNS FROM children WHERE Field = 'class_name';
