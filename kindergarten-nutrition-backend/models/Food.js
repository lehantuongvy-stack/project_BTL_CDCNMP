/**
 * Food Model - Quản lý thực phẩm và món ăn
 */

const DatabaseManager = require('../database/DatabaseManager');

class Food {
    constructor(db = null) {
        this.db = db || new DatabaseManager();
    }

    /**
     * Tạo món ăn mới
     */
    async create(foodData) {
        try {
            const {
                ten_mon,
                mo_ta,
                loai_mon, // 'sang', 'trua', 'chieu', 'phu'
                calories_per_serving,
                protein_per_serving,
                carbs_per_serving,
                fat_per_serving,
                fiber_per_serving,
                vitamin_c,
                calcium,
                iron,
                serving_size,
                preparation_time,
                difficulty_level,
                allergens,
                is_vegetarian,
                is_halal,
                image_url,
                recipe_instructions,
                created_by
            } = foodData;

            const query = `
                INSERT INTO mon_an (
                    ten_mon, mo_ta, loai_mon, calories_per_serving,
                    protein_per_serving, carbs_per_serving, fat_per_serving,
                    fiber_per_serving, vitamin_c, calcium, iron,
                    serving_size, preparation_time, difficulty_level,
                    allergens, is_vegetarian, is_halal, image_url,
                    recipe_instructions, created_by, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            `;

            const values = [
                ten_mon, mo_ta, loai_mon, calories_per_serving || 0,
                protein_per_serving || 0, carbs_per_serving || 0, 
                fat_per_serving || 0, fiber_per_serving || 0,
                vitamin_c || 0, calcium || 0, iron || 0,
                serving_size || '1 phần', preparation_time || 30,
                difficulty_level || 'easy', allergens || '',
                is_vegetarian || false, is_halal || true,
                image_url || '', recipe_instructions || '', created_by
            ];

            const result = await this.db.query(query, values);
            return { id: result.insertId, ...foodData };

        } catch (error) {
            console.error('Error creating food:', error);
            throw new Error('Lỗi khi tạo món ăn: ' + error.message);
        }
    }

    /**
     * Lấy danh sách món ăn
     */
    async findAll(filters = {}) {
        try {
            let query = 'SELECT * FROM mon_an WHERE 1=1';
            const values = [];

            // Filter theo loại món
            if (filters.loai_mon) {
                query += ' AND loai_mon = ?';
                values.push(filters.loai_mon);
            }

            // Filter theo vegetarian
            if (filters.is_vegetarian !== undefined) {
                query += ' AND is_vegetarian = ?';
                values.push(filters.is_vegetarian);
            }

            // Filter theo allergens
            if (filters.no_allergens) {
                query += ' AND (allergens IS NULL OR allergens = "")';
            }

            // Sắp xếp
            query += ' ORDER BY created_at DESC';

            // Phân trang
            if (filters.limit) {
                query += ' LIMIT ?';
                values.push(parseInt(filters.limit));
                
                if (filters.offset) {
                    query += ' OFFSET ?';
                    values.push(parseInt(filters.offset));
                }
            }

            const foods = await this.db.query(query, values);
            return foods;

        } catch (error) {
            console.error('Error finding foods:', error);
            throw new Error('Lỗi khi lấy danh sách món ăn');
        }
    }

    /**
     * Lấy món ăn theo ID
     */
    async findById(id) {
        try {
            const query = 'SELECT * FROM mon_an WHERE id = ?';
            const foods = await this.db.query(query, [id]);
            
            if (foods.length === 0) {
                return null;
            }

            // Lấy thêm nguyên liệu của món ăn
            const ingredients = await this.getFoodIngredients(id);
            
            return {
                ...foods[0],
                ingredients
            };

        } catch (error) {
            console.error('Error finding food by ID:', error);
            throw new Error('Lỗi khi lấy thông tin món ăn');
        }
    }

    /**
     * Lấy nguyên liệu của món ăn
     */
    async getFoodIngredients(foodId) {
        try {
            const query = `
                SELECT 
                    nl.id, nl.ten_nguyen_lieu, nl.don_vi,
                    mani.so_luong, mani.ghi_chu
                FROM mon_an_nguyen_lieu mani
                JOIN nguyen_lieu nl ON mani.nguyen_lieu_id = nl.id
                WHERE mani.mon_an_id = ?
                ORDER BY nl.ten_nguyen_lieu
            `;
            
            return await this.db.query(query, [foodId]);

        } catch (error) {
            console.error('Error getting food ingredients:', error);
            throw new Error('Lỗi khi lấy nguyên liệu món ăn');
        }
    }

    /**
     * Thêm nguyên liệu vào món ăn
     */
    async addIngredient(foodId, ingredientId, quantity, notes = '') {
        try {
            const query = `
                INSERT INTO mon_an_nguyen_lieu (mon_an_id, nguyen_lieu_id, so_luong, ghi_chu)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE so_luong = ?, ghi_chu = ?
            `;
            
            await this.db.query(query, [foodId, ingredientId, quantity, notes, quantity, notes]);
            return true;

        } catch (error) {
            console.error('Error adding ingredient to food:', error);
            throw new Error('Lỗi khi thêm nguyên liệu vào món ăn');
        }
    }

    /**
     * Cập nhật món ăn
     */
    async update(id, updateData) {
        try {
            const fields = [];
            const values = [];

            // Dynamically build update query
            Object.keys(updateData).forEach(key => {
                if (updateData[key] !== undefined) {
                    fields.push(`${key} = ?`);
                    values.push(updateData[key]);
                }
            });

            if (fields.length === 0) {
                throw new Error('Không có dữ liệu để cập nhật');
            }

            values.push(id);
            const query = `UPDATE mon_an SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`;
            
            await this.db.query(query, values);
            return await this.findById(id);

        } catch (error) {
            console.error('Error updating food:', error);
            throw new Error('Lỗi khi cập nhật món ăn');
        }
    }

    /**
     * Xóa món ăn
     */
    async delete(id) {
        try {
            // Kiểm tra xem món ăn có trong thực đơn không
            const menuCheck = await this.db.query(
                'SELECT COUNT(*) as count FROM thuc_don WHERE mon_an_id = ?', 
                [id]
            );

            if (menuCheck[0].count > 0) {
                throw new Error('Không thể xóa món ăn đang có trong thực đơn');
            }

            // Xóa nguyên liệu của món ăn trước
            await this.db.query('DELETE FROM mon_an_nguyen_lieu WHERE mon_an_id = ?', [id]);
            
            // Xóa món ăn
            await this.db.query('DELETE FROM mon_an WHERE id = ?', [id]);
            return true;

        } catch (error) {
            console.error('Error deleting food:', error);
            throw new Error('Lỗi khi xóa món ăn');
        }
    }

    /**
     * Tìm kiếm món ăn theo tên
     */
    async search(keyword, filters = {}) {
        try {
            let query = 'SELECT * FROM mon_an WHERE ten_mon LIKE ? OR mo_ta LIKE ?';
            const values = [`%${keyword}%`, `%${keyword}%`];

            if (filters.loai_mon) {
                query += ' AND loai_mon = ?';
                values.push(filters.loai_mon);
            }

            query += ' ORDER BY ten_mon ASC';

            return await this.db.query(query, values);

        } catch (error) {
            console.error('Error searching foods:', error);
            throw new Error('Lỗi khi tìm kiếm món ăn');
        }
    }

    /**
     * Lấy thống kê dinh dưỡng theo loại món
     */
    async getNutritionStats() {
        try {
            const query = `
                SELECT 
                    loai_mon,
                    COUNT(*) as total_foods,
                    AVG(calories_per_serving) as avg_calories,
                    AVG(protein_per_serving) as avg_protein,
                    AVG(carbs_per_serving) as avg_carbs,
                    AVG(fat_per_serving) as avg_fat
                FROM mon_an 
                GROUP BY loai_mon
                ORDER BY loai_mon
            `;

            return await this.db.query(query);

        } catch (error) {
            console.error('Error getting nutrition stats:', error);
            throw new Error('Lỗi khi lấy thống kê dinh dưỡng');
        }
    }
}

module.exports = Food;
