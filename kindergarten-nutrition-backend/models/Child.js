/**
 * Child Model
 * Mô hình dữ liệu cho trẻ em
 */

class Child {
    constructor(db) {
        this.db = db;
        this.tableName = 'children';
    }

    // Tạo child mới
    async create(childData) {
        const {
            full_name,
            date_of_birth,
            gender,
            parent_id,
            class_id,
            weight,
            height,
            allergies,
            medical_notes,
            emergency_contact,
            is_active = true
        } = childData;

        const query = `
            INSERT INTO ${this.tableName} 
            (full_name, date_of_birth, gender, parent_id, class_id, weight, height, 
             allergies, medical_notes, emergency_contact, is_active, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;

        const values = [
            full_name, date_of_birth, gender, parent_id, class_id, 
            weight, height, allergies, medical_notes, emergency_contact, is_active
        ];
        
        const result = await this.db.execute(query, values);
        
        return {
            id: result.insertId,
            ...childData
        };
    }

    // Tìm child theo ID
    async findById(id) {
        const query = `
            SELECT c.*, 
                   cl.ten_lop as class_name,
                   u.full_name as parent_name,
                   u.phone_number as parent_phone
            FROM ${this.tableName} c
            LEFT JOIN lop_hoc cl ON c.class_id = cl.id
            LEFT JOIN users u ON c.parent_id = u.id
            WHERE c.id = ? AND c.is_active = 1
        `;
        
        const [rows] = await this.db.execute(query, [id]);
        return rows[0] || null;
    }

    // Lấy tất cả children
    async findAll(limit = 50, offset = 0) {
        const query = `
            SELECT c.*, 
                   cl.ten_lop as class_name,
                   u.full_name as parent_name,
                   u.phone_number as parent_phone
            FROM ${this.tableName} c
            LEFT JOIN lop_hoc cl ON c.class_id = cl.id
            LEFT JOIN users u ON c.parent_id = u.id
            WHERE c.is_active = 1
            ORDER BY c.created_at DESC
            LIMIT ? OFFSET ?
        `;
        
        const [rows] = await this.db.execute(query, [limit, offset]);
        return rows;
    }

    // Tìm children theo class_id
    async findByClassId(classId) {
        const query = `
            SELECT c.*, 
                   cl.ten_lop as class_name,
                   u.full_name as parent_name,
                   u.phone_number as parent_phone
            FROM ${this.tableName} c
            LEFT JOIN lop_hoc cl ON c.class_id = cl.id
            LEFT JOIN users u ON c.parent_id = u.id
            WHERE c.class_id = ? AND c.is_active = 1
            ORDER BY c.full_name
        `;
        
        const [rows] = await this.db.execute(query, [classId]);
        return rows;
    }

    // Tìm children theo parent_id
    async findByParentId(parentId) {
        const query = `
            SELECT c.*, 
                   cl.ten_lop as class_name
            FROM ${this.tableName} c
            LEFT JOIN lop_hoc cl ON c.class_id = cl.id
            WHERE c.parent_id = ? AND c.is_active = 1
            ORDER BY c.full_name
        `;
        
        const [rows] = await this.db.execute(query, [parentId]);
        return rows;
    }

    // Tìm children theo tên
    async findByName(name) {
        const query = `
            SELECT c.*, 
                   cl.ten_lop as class_name,
                   u.full_name as parent_name,
                   u.phone_number as parent_phone
            FROM ${this.tableName} c
            LEFT JOIN lop_hoc cl ON c.class_id = cl.id
            LEFT JOIN users u ON c.parent_id = u.id
            WHERE c.full_name LIKE ? AND c.is_active = 1
            ORDER BY c.full_name
        `;
        
        const [rows] = await this.db.execute(query, [`%${name}%`]);
        return rows;
    }

    // Cập nhật child
    async updateById(id, updateData) {
        const allowedFields = [
            'full_name', 'date_of_birth', 'gender', 'class_id', 'weight', 
            'height', 'allergies', 'medical_notes', 'emergency_contact', 'is_active'
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

    // Soft delete child
    async deleteById(id) {
        const query = `
            UPDATE ${this.tableName}
            SET is_active = 0, updated_at = NOW()
            WHERE id = ?
        `;

        await this.db.execute(query, [id]);
        return true;
    }

    // Lấy children có dị ứng
    async findWithAllergies() {
        const query = `
            SELECT c.*, 
                   cl.ten_lop as class_name,
                   u.full_name as parent_name,
                   u.phone_number as parent_phone
            FROM ${this.tableName} c
            LEFT JOIN lop_hoc cl ON c.class_id = cl.id
            LEFT JOIN users u ON c.parent_id = u.id
            WHERE c.allergies IS NOT NULL AND c.allergies != '' AND c.is_active = 1
            ORDER BY c.full_name
        `;
        
        const [rows] = await this.db.execute(query);
        return rows;
    }

    // Lấy children theo độ tuổi
    async findByAgeRange(minAge, maxAge) {
        const query = `
            SELECT c.*, 
                   cl.ten_lop as class_name,
                   u.full_name as parent_name,
                   u.phone_number as parent_phone,
                   TIMESTAMPDIFF(YEAR, c.date_of_birth, CURDATE()) as age
            FROM ${this.tableName} c
            LEFT JOIN lop_hoc cl ON c.class_id = cl.id
            LEFT JOIN users u ON c.parent_id = u.id
            WHERE c.is_active = 1
            HAVING age BETWEEN ? AND ?
            ORDER BY age, c.full_name
        `;
        
        const [rows] = await this.db.execute(query, [minAge, maxAge]);
        return rows;
    }

    // Thống kê children theo class
    async getStatsByClass() {
        const query = `
            SELECT cl.ten_lop as class_name, COUNT(c.id) as count,
                   AVG(TIMESTAMPDIFF(YEAR, c.date_of_birth, CURDATE())) as avg_age
            FROM ${this.tableName} c
            LEFT JOIN lop_hoc cl ON c.class_id = cl.id
            WHERE c.is_active = 1
            GROUP BY c.class_id, cl.ten_lop
            ORDER BY cl.ten_lop
        `;

        const [rows] = await this.db.execute(query);
        return rows;
    }

    // Lấy children sinh nhật trong tháng
    async findBirthdaysInMonth(month, year = null) {
        let query = `
            SELECT c.*, 
                   cl.ten_lop as class_name,
                   u.full_name as parent_name,
                   u.phone_number as parent_phone,
                   DAY(c.date_of_birth) as birth_day
            FROM ${this.tableName} c
            LEFT JOIN lop_hoc cl ON c.class_id = cl.id
            LEFT JOIN users u ON c.parent_id = u.id
            WHERE MONTH(c.date_of_birth) = ? AND c.is_active = 1
        `;
        
        const values = [month];
        
        if (year) {
            query += ' AND YEAR(c.date_of_birth) = ?';
            values.push(year);
        }
        
        query += ' ORDER BY DAY(c.date_of_birth), c.full_name';
        
        const [rows] = await this.db.execute(query, values);
        return rows;
    }
}

module.exports = Child;
