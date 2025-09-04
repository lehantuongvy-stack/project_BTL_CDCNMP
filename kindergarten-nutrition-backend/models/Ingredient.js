/**
 * Ingredient Model
 * Mô hình dữ liệu cho nguyên liệu
 */

class Ingredient {
    constructor(db) {
        this.db = db;
        this.tableName = 'nguyen_lieu';
    }

    // Tạo nguyên liệu mới
    async create(ingredientData) {
        const {
            ten_nguyen_lieu,
            loai_nguyen_lieu,
            don_vi_tinh,
            gia_tien,
            nha_cung_cap,
            so_luong_ton_kho = 0,
            ngay_het_han,
            thong_tin_dinh_duong,
            is_active = true
        } = ingredientData;

        const query = `
            INSERT INTO ${this.tableName} 
            (ten_nguyen_lieu, loai_nguyen_lieu, don_vi_tinh, gia_tien, nha_cung_cap, 
             so_luong_ton_kho, ngay_het_han, thong_tin_dinh_duong, is_active, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;

        const values = [
            ten_nguyen_lieu, loai_nguyen_lieu, don_vi_tinh, gia_tien, nha_cung_cap,
            so_luong_ton_kho, ngay_het_han, thong_tin_dinh_duong, is_active
        ];
        
        const result = await this.db.execute(query, values);
        
        return {
            id: result.insertId,
            ...ingredientData
        };
    }

    // Tìm nguyên liệu theo ID
    async findById(id) {
        const query = `
            SELECT * FROM ${this.tableName} 
            WHERE id = ? AND is_active = 1
        `;
        
        const [rows] = await this.db.execute(query, [id]);
        return rows[0] || null;
    }

    // Lấy tất cả nguyên liệu
    async findAll(limit = 50, offset = 0) {
        const query = `
            SELECT * FROM ${this.tableName} 
            WHERE is_active = 1
            ORDER BY ten_nguyen_lieu
            LIMIT ? OFFSET ?
        `;
        
        const [rows] = await this.db.execute(query, [limit, offset]);
        return rows;
    }

    // Tìm nguyên liệu theo loại
    async findByCategory(category) {
        const query = `
            SELECT * FROM ${this.tableName} 
            WHERE loai_nguyen_lieu = ? AND is_active = 1
            ORDER BY ten_nguyen_lieu
        `;
        
        const [rows] = await this.db.execute(query, [category]);
        return rows;
    }

    // Tìm nguyên liệu theo tên
    async findByName(name) {
        const query = `
            SELECT * FROM ${this.tableName} 
            WHERE ten_nguyen_lieu LIKE ? AND is_active = 1
            ORDER BY ten_nguyen_lieu
        `;
        
        const [rows] = await this.db.execute(query, [`%${name}%`]);
        return rows;
    }

    // Tìm nguyên liệu sắp hết hạn
    async findExpiringSoon(days = 7) {
        const query = `
            SELECT * FROM ${this.tableName} 
            WHERE ngay_het_han IS NOT NULL 
            AND ngay_het_han <= DATE_ADD(CURDATE(), INTERVAL ? DAY)
            AND ngay_het_han >= CURDATE()
            AND is_active = 1
            ORDER BY ngay_het_han
        `;
        
        const [rows] = await this.db.execute(query, [days]);
        return rows;
    }

    // Tìm nguyên liệu tồn kho thấp
    async findLowStock(threshold = 10) {
        const query = `
            SELECT * FROM ${this.tableName} 
            WHERE so_luong_ton_kho <= ? AND is_active = 1
            ORDER BY so_luong_ton_kho, ten_nguyen_lieu
        `;
        
        const [rows] = await this.db.execute(query, [threshold]);
        return rows;
    }

    // Cập nhật nguyên liệu
    async updateById(id, updateData) {
        const allowedFields = [
            'ten_nguyen_lieu', 'loai_nguyen_lieu', 'don_vi_tinh', 'gia_tien', 
            'nha_cung_cap', 'so_luong_ton_kho', 'ngay_het_han', 'thong_tin_dinh_duong', 'is_active'
        ];
        const setClause = [];
        const values = [];

        for (const [key, value] of Object.entries(updateData)) {
            if (allowedFields.includes(key)) {
                setClause.push(`${key} = ?`);
                values.push(value);
            }
        }

        if (setClause.length === 0) {
            throw new Error('No valid fields to update');
        }

        setClause.push('updated_at = NOW()');
        values.push(id);

        const query = `
            UPDATE ${this.tableName}
            SET ${setClause.join(', ')}
            WHERE id = ?
        `;

        await this.db.execute(query, values);
        return this.findById(id);
    }

    // Cập nhật số lượng tồn kho
    async updateStock(id, quantity, operation = 'set') {
        let query;
        let values;

        if (operation === 'add') {
            query = `
                UPDATE ${this.tableName}
                SET so_luong_ton_kho = so_luong_ton_kho + ?, updated_at = NOW()
                WHERE id = ?
            `;
            values = [quantity, id];
        } else if (operation === 'subtract') {
            query = `
                UPDATE ${this.tableName}
                SET so_luong_ton_kho = GREATEST(0, so_luong_ton_kho - ?), updated_at = NOW()
                WHERE id = ?
            `;
            values = [quantity, id];
        } else {
            query = `
                UPDATE ${this.tableName}
                SET so_luong_ton_kho = ?, updated_at = NOW()
                WHERE id = ?
            `;
            values = [quantity, id];
        }

        await this.db.execute(query, values);
        return this.findById(id);
    }

    // Soft delete nguyên liệu
    async deleteById(id) {
        const query = `
            UPDATE ${this.tableName}
            SET is_active = 0, updated_at = NOW()
            WHERE id = ?
        `;

        await this.db.execute(query, [id]);
        return true;
    }

    // Lấy các loại nguyên liệu
    async getCategories() {
        const query = `
            SELECT DISTINCT loai_nguyen_lieu as category, COUNT(*) as count
            FROM ${this.tableName}
            WHERE is_active = 1
            GROUP BY loai_nguyen_lieu
            ORDER BY loai_nguyen_lieu
        `;

        const [rows] = await this.db.execute(query);
        return rows;
    }

    // Lấy các nhà cung cấp
    async getSuppliers() {
        const query = `
            SELECT DISTINCT nha_cung_cap as supplier, COUNT(*) as count
            FROM ${this.tableName}
            WHERE is_active = 1 AND nha_cung_cap IS NOT NULL
            GROUP BY nha_cung_cap
            ORDER BY nha_cung_cap
        `;

        const [rows] = await this.db.execute(query);
        return rows;
    }

    // Thống kê nguyên liệu
    async getStatistics() {
        const query = `
            SELECT 
                COUNT(*) as total_ingredients,
                COUNT(CASE WHEN so_luong_ton_kho <= 10 THEN 1 END) as low_stock_count,
                COUNT(CASE WHEN ngay_het_han <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) AND ngay_het_han >= CURDATE() THEN 1 END) as expiring_soon_count,
                SUM(so_luong_ton_kho * gia_tien) as total_inventory_value,
                COUNT(DISTINCT loai_nguyen_lieu) as total_categories
            FROM ${this.tableName}
            WHERE is_active = 1
        `;

        const [rows] = await this.db.execute(query);
        return rows[0];
    }

    // Tìm nguyên liệu theo filter phức tạp
    async findWithFilters(filters = {}) {
        let query = `SELECT * FROM ${this.tableName} WHERE is_active = 1`;
        const values = [];
        const conditions = [];

        if (filters.category) {
            conditions.push('loai_nguyen_lieu = ?');
            values.push(filters.category);
        }

        if (filters.supplier) {
            conditions.push('nha_cung_cap = ?');
            values.push(filters.supplier);
        }

        if (filters.name) {
            conditions.push('ten_nguyen_lieu LIKE ?');
            values.push(`%${filters.name}%`);
        }

        if (filters.min_price) {
            conditions.push('gia_tien >= ?');
            values.push(filters.min_price);
        }

        if (filters.max_price) {
            conditions.push('gia_tien <= ?');
            values.push(filters.max_price);
        }

        if (filters.low_stock_only) {
            conditions.push('so_luong_ton_kho <= 10');
        }

        if (filters.expiring_soon) {
            conditions.push('ngay_het_han <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) AND ngay_het_han >= CURDATE()');
        }

        if (conditions.length > 0) {
            query += ' AND ' + conditions.join(' AND ');
        }

        query += ' ORDER BY ten_nguyen_lieu';

        if (filters.limit) {
            query += ' LIMIT ?';
            values.push(parseInt(filters.limit));
        }

        const [rows] = await this.db.execute(query, values);
        return rows;
    }
}

module.exports = Ingredient;
