/**
 * User Model
 * Mô hình dữ liệu cho người dùng
 */

class User {
    constructor(db) {
        this.db = db;
        this.tableName = 'users';
    }

    // Tạo user mới
    async create(userData) {
        const {
            username,
            password_hash,
            full_name,
            email,
            phone_number,
            role,
            is_active = true
        } = userData;

        const query = `
            INSERT INTO ${this.tableName} 
            (username, password_hash, full_name, email, phone_number, role, is_active, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        `;

        const values = [username, password_hash, full_name, email, phone_number, role, is_active];
        const result = await this.db.execute(query, values);
        
        return {
            id: result.insertId,
            ...userData,
            password_hash: undefined // Don't return password
        };
    }

    // Tìm user theo ID
    async findById(id) {
        const query = `
            SELECT id, username, full_name, email, phone_number, role, is_active, created_at, updated_at
            FROM ${this.tableName} 
            WHERE id = ? AND is_active = 1
        `;
        
        const [rows] = await this.db.execute(query, [id]);
        return rows[0] || null;
    }

    // Tìm user theo username
    async findByUsername(username) {
        const query = `
            SELECT id, username, password_hash, full_name, email, phone_number, role, is_active, created_at, updated_at
            FROM ${this.tableName} 
            WHERE username = ? AND is_active = 1
        `;
        
        const [rows] = await this.db.execute(query, [username]);
        return rows[0] || null;
    }

    // Tìm user theo email
    async findByEmail(email) {
        const query = `
            SELECT id, username, full_name, email, phone_number, role, is_active, created_at, updated_at
            FROM ${this.tableName} 
            WHERE email = ? AND is_active = 1
        `;
        
        const [rows] = await this.db.execute(query, [email]);
        return rows[0] || null;
    }

    // Lấy tất cả users
    async findAll(limit = 50, offset = 0) {
        const query = `
            SELECT id, username, full_name, email, phone_number, role, is_active, created_at, updated_at
            FROM ${this.tableName} 
            WHERE is_active = 1
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `;
        
        const [rows] = await this.db.execute(query, [limit, offset]);
        return rows;
    }

    // Lấy users theo role
    async findByRole(role) {
        const query = `
            SELECT id, username, full_name, email, phone_number, role, is_active, created_at, updated_at
            FROM ${this.tableName} 
            WHERE role = ? AND is_active = 1
            ORDER BY created_at DESC
        `;
        
        const [rows] = await this.db.execute(query, [role]);
        return rows;
    }

    // Cập nhật user
    async updateById(id, updateData) {
        const allowedFields = ['full_name', 'email', 'phone_number', 'role', 'is_active'];
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

    // Cập nhật password
    async updatePassword(id, newPasswordHash) {
        const query = `
            UPDATE ${this.tableName}
            SET password_hash = ?, updated_at = NOW()
            WHERE id = ?
        `;

        await this.db.execute(query, [newPasswordHash, id]);
        return true;
    }

    // Soft delete user
    async deleteById(id) {
        const query = `
            UPDATE ${this.tableName}
            SET is_active = 0, updated_at = NOW()
            WHERE id = ?
        `;

        await this.db.execute(query, [id]);
        return true;
    }

    // Kiểm tra username có tồn tại không
    async isUsernameExists(username, excludeId = null) {
        let query = `
            SELECT COUNT(*) as count
            FROM ${this.tableName} 
            WHERE username = ? AND is_active = 1
        `;
        let values = [username];

        if (excludeId) {
            query += ' AND id != ?';
            values.push(excludeId);
        }

        const [rows] = await this.db.execute(query, values);
        return rows[0].count > 0;
    }

    // Kiểm tra email có tồn tại không
    async isEmailExists(email, excludeId = null) {
        let query = `
            SELECT COUNT(*) as count
            FROM ${this.tableName} 
            WHERE email = ? AND is_active = 1
        `;
        let values = [email];

        if (excludeId) {
            query += ' AND id != ?';
            values.push(excludeId);
        }

        const [rows] = await this.db.execute(query, values);
        return rows[0].count > 0;
    }

    // Thống kê số lượng users theo role
    async getStatsByRole() {
        const query = `
            SELECT role, COUNT(*) as count
            FROM ${this.tableName}
            WHERE is_active = 1
            GROUP BY role
        `;

        const [rows] = await this.db.execute(query);
        return rows;
    }
}

module.exports = User;
