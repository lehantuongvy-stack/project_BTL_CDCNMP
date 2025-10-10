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
            phone,
            role,
            address,
            class_id,
            is_active = true
        } = userData;

        const query = `
            INSERT INTO ${this.tableName} 
            (username, password_hash, full_name, email, phone, role, address, class_id, is_active, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;

        const values = [
            username, 
            password_hash, 
            full_name, 
            email, 
            phone_number || phone || null,
            role, 
            address || null,
            class_id || null,
            is_active
        ];
        
        // Debug log
        console.log('Create user values:', values);
        console.log('Has undefined?', values.some(v => v === undefined));
        
        const result = await this.db.query(query, values);
        
        // Handle different MySQL2 response formats
        let insertId;
        if (Array.isArray(result) && result.length > 0) {
            insertId = result[0].insertId || result.insertId;
        } else {
            insertId = result.insertId;
        }
        
        return {
            id: insertId,
            username,
            full_name,
            email,
            phone: phone_number || phone,
            role,
            address,
            class_id,
            is_active,
            created_at: new Date()
        };
    }

    // Tìm user theo ID
    async findById(id) {
        const query = `
            SELECT id, username, full_name, email, phone, role, address, class_id, is_active, created_at, updated_at
            FROM ${this.tableName} 
            WHERE id = ? AND is_active = 1
        `;
        
        const result = await this.db.query(query, [id]);
        if (Array.isArray(result) && result.length > 0) {
            return Array.isArray(result[0]) ? result[0][0] : result[0];
        }
        return null;
    }

    // Tìm user theo ID với password_hash (dùng cho đổi mật khẩu)
    async findByIdWithPassword(id) {
        const query = `
            SELECT id, username, password_hash, full_name, email, phone, role, address, class_id, is_active, created_at, updated_at
            FROM ${this.tableName} 
            WHERE id = ? AND is_active = 1
        `;
        
        const result = await this.db.query(query, [id]);
        if (Array.isArray(result) && result.length > 0) {
            return Array.isArray(result[0]) ? result[0][0] : result[0];
        }
        return null;
    }

    // Tìm user theo username
    async findByUsername(username) {
        const query = `
            SELECT id, username, password_hash, full_name, email, phone, role, address, class_id, is_active, created_at, updated_at
            FROM ${this.tableName} 
            WHERE username = ? AND is_active = 1
        `;
        
        const result = await this.db.query(query, [username]);
        if (Array.isArray(result) && result.length > 0) {
            return Array.isArray(result[0]) ? result[0][0] : result[0];
        }
        return null;
    }

    // Tìm user theo email
    async findByEmail(email) {
        const query = `
            SELECT id, username, password_hash, full_name, email, phone, role, address, class_id, is_active, created_at, updated_at
            FROM ${this.tableName} 
            WHERE email = ? AND is_active = 1
        `;
        
        const rows = await this.db.query(query, [email]);
        return (Array.isArray(rows) && rows.length > 0 && Array.isArray(rows[0])) ? rows[0][0] : rows[0] || null;
    }

    // Lấy tất cả users
    async findAll(limit = 50, offset = 0) {
        const query = `
            SELECT id, username, full_name, email, phone, role, address, class_id, is_active, created_at, updated_at
            FROM ${this.tableName} 
            WHERE is_active = 1
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `;
        
        const result = await this.db.query(query, [limit, offset]);
        if (Array.isArray(result) && result.length > 0) {
            // Trả về array của tất cả users, không chỉ user đầu tiên
            return Array.isArray(result[0]) ? result[0] : result;
        }
        return [];
    }

    // Lấy users theo role
    async findByRole(role) {
        const query = `
            SELECT id, username, full_name, email, phone, role, address, class_id, is_active, created_at, updated_at
            FROM ${this.tableName} 
            WHERE role = ? AND is_active = 1
            ORDER BY created_at DESC
        `;
        
        console.log(' Finding users by role:', role);
        const result = await this.db.query(query, [role]);
        console.log(' Raw DB result:', result);
        
        if (Array.isArray(result) && result.length > 0) {
            const users = Array.isArray(result[0]) ? result[0] : result;
            console.log(' Processed users:', users);
            console.log(' Users count:', users.length);
            return users;
        }
        console.log(' No users found, returning empty array');
        return [];
    }

    // Cập nhật user
    async updateById(id, updateData) {
        const allowedFields = ['username', 'full_name', 'email', 'phone', 'address', 'role', 'is_active'];
        const setClause = [];
        const values = [];

        console.log(' User.updateById - updateData:', updateData);
        console.log(' User.updateById - allowedFields:', allowedFields);

        for (const [key, value] of Object.entries(updateData)) {
            console.log(` Checking field: ${key} = ${value}, allowed: ${allowedFields.includes(key)}`);
            if (allowedFields.includes(key)) {
                setClause.push(`${key} = ?`);
                values.push(value);
            }
        }

        console.log(' Valid fields for update:', setClause);
        console.log(' Values for update:', values);

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

        await this.db.query(query, values);
        return this.findById(id);
    }

    // Cập nhật password
    async updatePassword(id, newPasswordHash) {
        const query = `
            UPDATE ${this.tableName}
            SET password_hash = ?, updated_at = NOW()
            WHERE id = ?
        `;

        await this.db.query(query, [newPasswordHash, id]);
        return true;
    }

    // Soft delete user
    async deleteById(id) {
        const query = `
            UPDATE ${this.tableName}
            SET is_active = 0, updated_at = NOW()
            WHERE id = ?
        `;

        await this.db.query(query, [id]);
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

        const result = await this.db.query(query, values);
        return (Array.isArray(result) && result.length > 0 && Array.isArray(result[0])) ? result[0][0] : result[0].count > 0;
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

        const result = await this.db.query(query, values);
        return (Array.isArray(result) && result.length > 0 && Array.isArray(result[0])) ? result[0][0] : result[0].count > 0;
    }

    // Thống kê số lượng users theo role
    async getStatsByRole() {
        const query = `
            SELECT role, COUNT(*) as count
            FROM ${this.tableName}
            WHERE is_active = 1
            GROUP BY role
        `;

        const result = await this.db.query(query);
        return (Array.isArray(result) && result.length > 0 && Array.isArray(result[0])) ? result[0] : result;
    }

    // Tìm kiếm user theo tiêu chí
    async search(criteria) {
        try {
            const { searchTerm, role, isActive, limit, offset } = criteria;
            
            let whereConditions = [];
            let queryParams = [];
            let paramIndex = 1;

            // Tìm kiếm theo username, email hoặc full_name
            if (searchTerm) {
                whereConditions.push(`(username LIKE ? OR email LIKE ? OR full_name LIKE ?)`);
                const searchPattern = `%${searchTerm}%`;
                queryParams.push(searchPattern, searchPattern, searchPattern);
                paramIndex += 3;
            }

            // Lọc theo role
            if (role) {
                whereConditions.push(`role = ?`);
                queryParams.push(role);
                paramIndex++;
            }

            // Lọc theo trạng thái kích hoạt
            if (isActive !== undefined) {
                whereConditions.push(`is_active = ?`);
                queryParams.push(isActive ? 1 : 0);
                paramIndex++;
            }

            const whereClause = whereConditions.length > 0 ? 
                `WHERE ${whereConditions.join(' AND ')}` : '';

            // Đếm tổng số kết quả
            const countQuery = `
                SELECT COUNT(*) as total 
                FROM users 
                ${whereClause}
            `;
            
            const countResult = await this.db.query(countQuery, queryParams);
            const total = countResult[0]?.total || 0;

            // Lấy kết quả phân trang
            const searchQuery = `
                SELECT id, username, email, full_name, phone, role, is_active, 
                       created_at, updated_at
                FROM users 
                ${whereClause}
                ORDER BY created_at DESC
                LIMIT ? OFFSET ?
            `;
            
            const searchParams = [...queryParams, limit, offset];
            const users = await this.db.query(searchQuery, searchParams);

            return {
                users: users || [],
                total: total
            };

        } catch (error) {
            console.error('Error in User.search:', error);
            throw error;
        }
    }
}

module.exports = User;
