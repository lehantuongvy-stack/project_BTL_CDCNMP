/**
 * Class Model
 * Xử lý các thao tác với bảng classes
 */

class Class {
    constructor(db) {
        this.db = db;
    }

    // Lấy tất cả classes
    async findAll() {
        try {
            const query = `
                SELECT id, name, description, nhom_lop, created_at, updated_at, id_teacher
                FROM classes 
                ORDER BY name ASC
            `;
            
            const [rows] = await this.db.pool.execute(query);
            return rows;
        } catch (error) {
            console.error('Error in Class.findAll:', error);
            throw error;
        }
    }

    // Lấy class theo ID
    async findById(id) {
        try {
            const query = `
                SELECT id, name, description, nhom_lop, created_at, updated_at, id_teacher
                FROM classes 
                WHERE id = ?
            `;
            
            const [rows] = await this.db.pool.execute(query, [id]);
            return rows[0] || null;
        } catch (error) {
            console.error('Error in Class.findById:', error);
            throw error;
        }
    }
}

module.exports = Class;