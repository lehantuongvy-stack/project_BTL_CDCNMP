/**
 * Ingredient Model - Fixed cho database schema tiếng Việt
 * Mô hình dữ liệu cho nguyên liệu
 */

class Ingredient {
    constructor(db) {
        this.db = db;
        this.tableName = 'nguyen_lieu';
    }

    // Parse JSON fields nếu cần
    parseJsonFields(ingredient) {
        if (!ingredient) return null;
        
        try {
            if (ingredient.allergens && typeof ingredient.allergens === 'string') {
                ingredient.allergens = JSON.parse(ingredient.allergens);
            }
        } catch (error) {
            console.warn('Error parsing JSON fields:', error);
        }
        
        return ingredient;
    }

    // Tạo nguyên liệu mới
    async create(ingredientData) {
        const { v4: uuidv4 } = require('uuid');
        const ingredientId = uuidv4();
        
        const {
            ten_nguyen_lieu,
            mo_ta,
            don_vi_tinh = 'kg',
            gia_mua = 0,
            nha_cung_cap_id,
            calories_per_100g = 0,
            protein_per_100g = 0,
            fat_per_100g = 0,
            carbs_per_100g = 0,
            fiber_per_100g = 0,
            vitamin_a = 0,
            vitamin_c = 0,
            calcium = 0,
            iron = 0,
            allergens = null,
            trang_thai = 'available'
        } = ingredientData;

        const query = `
            INSERT INTO ${this.tableName} (
                id, ten_nguyen_lieu, mo_ta, don_vi_tinh, gia_mua,
                nha_cung_cap_id, calories_per_100g, protein_per_100g,
                fat_per_100g, carbs_per_100g, fiber_per_100g,
                vitamin_a, vitamin_c, calcium, iron, allergens, trang_thai
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            ingredientId, 
            ten_nguyen_lieu, 
            mo_ta || null, 
            don_vi_tinh, 
            gia_mua,
            nha_cung_cap_id || null, 
            calories_per_100g, 
            protein_per_100g,
            fat_per_100g, 
            carbs_per_100g, 
            fiber_per_100g,
            vitamin_a, 
            vitamin_c, 
            calcium, 
            iron,
            allergens ? JSON.stringify(allergens) : null,
            trang_thai
        ];

        try {
            await this.db.query(query, values);
            return this.findById(ingredientId);
        } catch (error) {
            console.error('Create ingredient error:', error);
            throw error;
        }
    }

    // Tìm nguyên liệu theo ID
    async findById(id) {
        const query = `SELECT * FROM ${this.tableName} WHERE id = ?`;
        
        try {
            const rows = await this.db.query(query, [id]);
            return rows.length > 0 ? this.parseJsonFields(rows[0]) : null;
        } catch (error) {
            console.error('Find ingredient by ID error:', error);
            throw error;
        }
    }

    // Tìm nguyên liệu theo tên
    async findByName(name) {
        const query = `
            SELECT * FROM ${this.tableName} 
            WHERE ten_nguyen_lieu LIKE ? 
            ORDER BY ten_nguyen_lieu ASC
        `;
        
        try {
            const rows = await this.db.query(query, [`%${name}%`]);
            return rows.map(row => this.parseJsonFields(row));
        } catch (error) {
            console.error('Find ingredient by name error:', error);
            throw error;
        }
    }

    // Tìm nguyên liệu theo trạng thái
    async findByStatus(status) {
        const query = `
            SELECT * FROM ${this.tableName} 
            WHERE trang_thai = ? 
            ORDER BY ten_nguyen_lieu ASC
        `;
        
        try {
            const rows = await this.db.query(query, [status]);
            return rows.map(row => this.parseJsonFields(row));
        } catch (error) {
            console.error('Find ingredient by status error:', error);
            throw error;
        }
    }

    // Lấy tất cả nguyên liệu với phân trang
    async findAll(limit = 50, offset = 0) {
        const query = `
            SELECT * FROM ${this.tableName} 
            ORDER BY ten_nguyen_lieu ASC 
            LIMIT ? OFFSET ?
        `;
        
        try {
            const rows = await this.db.query(query, [limit, offset]);
            return rows.map(row => this.parseJsonFields(row));
        } catch (error) {
            console.error('Find all ingredients error:', error);
            throw error;
        }
    }

    // Cập nhật nguyên liệu
    async updateById(id, updateData) {
        const allowedFields = [
            'ten_nguyen_lieu', 'mo_ta', 'don_vi_tinh', 'gia_mua',
            'nha_cung_cap_id', 'calories_per_100g', 'protein_per_100g',
            'fat_per_100g', 'carbs_per_100g', 'fiber_per_100g',
            'vitamin_a', 'vitamin_c', 'calcium', 'iron', 'allergens', 'trang_thai'
        ];

        const updateFields = [];
        const values = [];

        for (const [key, value] of Object.entries(updateData)) {
            if (allowedFields.includes(key)) {
                updateFields.push(`${key} = ?`);
                if (key === 'allergens' && value) {
                    values.push(JSON.stringify(value));
                } else {
                    values.push(value);
                }
            }
        }

        if (updateFields.length === 0) {
            throw new Error('No valid fields to update');
        }

        values.push(id);
        
        const query = `
            UPDATE ${this.tableName} 
            SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `;

        try {
            await this.db.query(query, values);
            return this.findById(id);
        } catch (error) {
            console.error('Update ingredient error:', error);
            throw error;
        }
    }

    // Xóa nguyên liệu
    async deleteById(id) {
        const query = `DELETE FROM ${this.tableName} WHERE id = ?`;
        
        try {
            const result = await this.db.query(query, [id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Delete ingredient error:', error);
            throw error;
        }
    }

    // Đếm tổng số nguyên liệu
    async count() {
        const query = `SELECT COUNT(*) as total FROM ${this.tableName}`;
        
        try {
            const rows = await this.db.query(query);
            return rows[0].total;
        } catch (error) {
            console.error('Count ingredients error:', error);
            throw error;
        }
    }

    // Lấy các danh mục từ database
    async getCategories() {
        try {
            // Trước tiên, tạo bảng categories nếu chưa có
            await this.createCategoriesTableIfNotExists();
            
            // Lấy danh sách categories từ database
            const query = `
                SELECT 
                    id,
                    ten_danh_muc as name,
                    mo_ta as description,
                    mau_sac as color,
                    icon,
                    thu_tu_hien_thi as sort_order,
                    is_active
                FROM danh_muc_nguyen_lieu 
                WHERE is_active = 1
                ORDER BY thu_tu_hien_thi ASC, ten_danh_muc ASC
            `;
            
            const categories = await this.db.query(query);
            return categories;
        } catch (error) {
            console.error('Get categories error:', error);
            
            // Fallback to static data if database fails
            const categories = [
                { id: 1, name: 'Rau củ quả', description: 'Các loại rau, củ và trái cây tươi', color: '#28a745', icon: 'leaf', sort_order: 1, is_active: 1 },
                { id: 2, name: 'Thịt và hải sản', description: 'Thịt bò, thịt heo, gà, cá và hải sản', color: '#dc3545', icon: 'meat', sort_order: 2, is_active: 1 },
                { id: 3, name: 'Ngũ cốc', description: 'Gạo, lúa mì, yến mạch, bánh mì', color: '#ffc107', icon: 'grain', sort_order: 3, is_active: 1 },
                { id: 4, name: 'Sữa và chế phẩm', description: 'Sữa tươi, sữa chua, phô mai', color: '#17a2b8', icon: 'milk', sort_order: 4, is_active: 1 },
                { id: 5, name: 'Gia vị và đồ khô', description: 'Muối, đường, dầu ăn, gia vị', color: '#6f42c1', icon: 'spice', sort_order: 5, is_active: 1 },
                { id: 6, name: 'Đồ uống', description: 'Nước ép, trà, các loại đồ uống không cồn', color: '#20c997', icon: 'drink', sort_order: 6, is_active: 1 }
            ];
            
            return categories;
        }
    }

    // Tạo bảng categories nếu chưa có
    async createCategoriesTableIfNotExists() {
        try {
            // Tạo bảng danh mục nguyên liệu
            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS danh_muc_nguyen_lieu (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    ten_danh_muc NVARCHAR(100) NOT NULL UNIQUE,
                    mo_ta NVARCHAR(200),
                    mau_sac VARCHAR(7) DEFAULT '#007bff',
                    icon VARCHAR(50) DEFAULT 'category',
                    thu_tu_hien_thi INT DEFAULT 0,
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    
                    INDEX idx_ten_danh_muc (ten_danh_muc),
                    INDEX idx_thu_tu (thu_tu_hien_thi),
                    INDEX idx_active (is_active)
                )
            `;
            
            await this.db.query(createTableQuery);
            
            // Kiểm tra xem đã có dữ liệu chưa
            const countQuery = 'SELECT COUNT(*) as count FROM danh_muc_nguyen_lieu';
            const result = await this.db.query(countQuery);
            const count = result[0].count;
            
            // Nếu chưa có dữ liệu, thêm dữ liệu mẫu
            if (count === 0) {
                const insertQuery = `
                    INSERT INTO danh_muc_nguyen_lieu (ten_danh_muc, mo_ta, mau_sac, icon, thu_tu_hien_thi) VALUES
                    ('Rau củ quả', 'Các loại rau, củ và trái cây tươi', '#28a745', 'leaf', 1),
                    ('Thịt và hải sản', 'Thịt bò, thịt heo, gà, cá và hải sản', '#dc3545', 'meat', 2),
                    ('Ngũ cốc', 'Gạo, lúa mì, yến mạch, bánh mì', '#ffc107', 'grain', 3),
                    ('Sữa và chế phẩm', 'Sữa tươi, sữa chua, phô mai', '#17a2b8', 'milk', 4),
                    ('Gia vị và đồ khô', 'Muối, đường, dầu ăn, gia vị', '#6f42c1', 'spice', 5),
                    ('Đồ uống', 'Nước ép, trà, các loại đồ uống không cồn', '#20c997', 'drink', 6),
                    ('Đồ đông lạnh', 'Thực phẩm đông lạnh, kem', '#6c757d', 'frozen', 7),
                    ('Bánh kẹo', 'Bánh ngọt, kẹo, snack', '#fd7e14', 'cake', 8)
                `;
                
                await this.db.query(insertQuery);
                console.log(' Created categories table and inserted sample data');
            }
            
            // Thêm column danh_muc_id vào bảng nguyen_lieu nếu chưa có
            try {
                const addColumnQuery = `
                    ALTER TABLE ${this.tableName} 
                    ADD COLUMN IF NOT EXISTS danh_muc_id INT,
                    ADD INDEX IF NOT EXISTS idx_danh_muc_id (danh_muc_id)
                `;
                await this.db.query(addColumnQuery);
                
                // Tạo foreign key nếu chưa có
                const addFKQuery = `
                    ALTER TABLE ${this.tableName} 
                    ADD CONSTRAINT fk_nguyen_lieu_danh_muc 
                    FOREIGN KEY (danh_muc_id) REFERENCES danh_muc_nguyen_lieu(id) 
                    ON DELETE SET NULL ON UPDATE CASCADE
                `;
                await this.db.query(addFKQuery);
                
                console.log('Added danh_muc_id column and foreign key');
            } catch (fkError) {
                // Foreign key có thể đã tồn tại, bỏ qua lỗi này
                console.log('Column danh_muc_id may already exist');
            }
            
        } catch (error) {
            console.error('Error creating categories table:', error);
            throw error;
        }
    }

    // Lấy nhà cung cấp
    async getSuppliers() {
        const query = `
            SELECT DISTINCT ncc.id, ncc.ten_ncc 
            FROM nha_cung_cap ncc
            INNER JOIN ${this.tableName} nl ON nl.nha_cung_cap_id = ncc.id
            WHERE ncc.trang_thai = 'active'
            ORDER BY ncc.ten_ncc ASC
        `;
        
        try {
            const rows = await this.db.query(query);
            return rows;
        } catch (error) {
            console.error('Get suppliers error:', error);
            throw error;
        }
    }

    // Cập nhật tồn kho (method cần có cho controller)
    async updateStock(id, quantity, operation = 'set') {
        // Vì schema không có field stock riêng, ta sẽ update gia_mua tạm thời
        // Hoặc có thể thêm field mới vào schema sau
        const query = `UPDATE ${this.tableName} SET gia_mua = ? WHERE id = ?`;
        
        try {
            await this.db.query(query, [quantity, id]);
            return this.findById(id);
        } catch (error) {
            console.error('Update stock error:', error);
            throw error;
        }
    }

    // Tìm nguyên liệu tồn kho thấp (tạm thời dựa trên gia_mua)
    async findLowStock(threshold = 10) {
        const query = `
            SELECT * FROM ${this.tableName} 
            WHERE gia_mua < ? AND trang_thai = 'available'
            ORDER BY gia_mua ASC
        `;
        
        try {
            const rows = await this.db.query(query, [threshold]);
            return rows.map(row => this.parseJsonFields(row));
        } catch (error) {
            console.error('Find low stock error:', error);
            throw error;
        }
    }

    // Tìm nguyên liệu sắp hết hạn (mock data)
    async findExpiringSoon(days = 7) {
        // Schema hiện tại không có expiry date, trả về array rỗng
        try {
            return [];
        } catch (error) {
            console.error('Find expiring ingredients error:', error);
            throw error;
        }
    }

    // Lấy thống kê
    async getStatistics() {
        try {
            const total = await this.count();
            const availableQuery = `SELECT COUNT(*) as available FROM ${this.tableName} WHERE trang_thai = 'available'`;
            const outOfStockQuery = `SELECT COUNT(*) as out_of_stock FROM ${this.tableName} WHERE trang_thai = 'out_of_stock'`;
            
            const availableRows = await this.db.query(availableQuery);
            const outOfStockRows = await this.db.query(outOfStockQuery);
            
            return {
                total,
                available: availableRows[0].available,
                out_of_stock: outOfStockRows[0].out_of_stock,
                discontinued: total - availableRows[0].available - outOfStockRows[0].out_of_stock
            };
        } catch (error) {
            console.error('Get statistics error:', error);
            throw error;
        }
    }
}

module.exports = Ingredient;
