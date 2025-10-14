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

}

module.exports = Ingredient;
