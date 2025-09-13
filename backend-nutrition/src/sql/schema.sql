CREATE DATABASE IF NOT EXISTS quanlythucdon CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE quanlythucdon;

-- Món ăn
CREATE TABLE IF NOT EXISTS foods (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  group_name VARCHAR(100),
  kcal INT,
  price DECIMAL(12,2) DEFAULT 0,
  status ENUM('active','inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Nguyên liệu
CREATE TABLE IF NOT EXISTS ingredients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Công thức món (món dùng nguyên liệu gì, cho 1 khẩu phần)
CREATE TABLE IF NOT EXISTS recipes (
  food_id INT NOT NULL,
  ingredient_id INT NOT NULL,
  qty_per_portion DECIMAL(12,3) NOT NULL,
  note TEXT,
  PRIMARY KEY (food_id, ingredient_id),
  FOREIGN KEY (food_id) REFERENCES foods(id) ON DELETE CASCADE,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Kho (tồn kho hiện tại + ngưỡng cảnh báo)
CREATE TABLE IF NOT EXISTS inventory (
  ingredient_id INT PRIMARY KEY,
  quantity DECIMAL(12,3) NOT NULL DEFAULT 0,
  min_threshold DECIMAL(12,3) NOT NULL DEFAULT 0,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Phiếu nhập (đầu vào)
CREATE TABLE IF NOT EXISTS receipts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  supplier VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS receipt_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  receipt_id INT NOT NULL,
  ingredient_id INT NOT NULL,
  qty DECIMAL(12,3) NOT NULL,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  FOREIGN KEY (receipt_id) REFERENCES receipts(id) ON DELETE CASCADE,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- (Tuỳ chọn) Nhật ký tiêu hao để làm báo cáo "usage"
CREATE TABLE IF NOT EXISTS consumption (
  id INT AUTO_INCREMENT PRIMARY KEY,
  note VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS consumption_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  consumption_id INT NOT NULL,
  ingredient_id INT NOT NULL,
  qty DECIMAL(12,3) NOT NULL,
  FOREIGN KEY (consumption_id) REFERENCES consumption(id) ON DELETE CASCADE,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Dữ liệu mẫu (chạy 1 lần)
INSERT INTO ingredients (name, unit) VALUES
('Gạo', 'kg'), ('Thịt gà', 'kg'), ('Rau', 'kg');

INSERT INTO inventory (ingredient_id, quantity, min_threshold) VALUES
(1, 10, 2), (2, 5, 1), (3, 3, 1);

INSERT INTO foods (name, description, group_name, kcal, price) VALUES
('Cơm gà', 'Cơm + gà + rau', 'Món chính', 600, 25000),
('Canh rau', 'Canh rau theo mùa', 'Canh', 80, 12000);

INSERT INTO recipes (food_id, ingredient_id, qty_per_portion) VALUES
(1,1,0.25),(1,2,0.30),(1,3,0.10), -- Cơm gà
(2,3,0.20);                        -- Canh rau
