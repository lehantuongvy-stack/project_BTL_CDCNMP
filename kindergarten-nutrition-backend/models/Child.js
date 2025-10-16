/**
 * Child Model
 * Mô hình dữ liệu cho trẻ em
 */

class Child {
    constructor(db) {
        this.db = db;
        this.tableName = 'children';
    }

    // Helper method to generate student_id
    async generateStudentId() {
        try {
            // Lấy student_id cuối cùng
            const query = `
                SELECT student_id 
                FROM ${this.tableName} 
                WHERE student_id LIKE 'ST%'
                ORDER BY student_id DESC 
                LIMIT 1
            `;
            
            const result = await this.db.query(query);
            let nextNumber = 1;
            
            if (result && result.length > 0) {
                const lastId = result[0].student_id;
                const numberPart = lastId.replace('ST', '');
                nextNumber = parseInt(numberPart) + 1;
            }
            
            // Format: ST001, ST002, ST003...
            return `ST${nextNumber.toString().padStart(3, '0')}`;
        } catch (error) {
            console.error('Error generating student_id:', error);
            // Fallback: random number
            return `ST${Date.now().toString().slice(-3)}`;
        }
    }

    // Tạo child mới
    async create(childData) {
        // Generate UUID for the child
        const { v4: uuidv4 } = require('uuid');
        const childId = uuidv4();
        
        const {
            student_id,
            full_name,
            date_of_birth,
            gender,
            class_name,
            parent_id,
            teacher_id,
            weight,
            height,
            allergies,
            medical_conditions,
            admission_date,
            is_active = true
        } = childData;

        // Auto-generate student_id if not provided
        const finalStudentId = student_id || await this.generateStudentId();

        const query = `
            INSERT INTO ${this.tableName} 
            (id, student_id, full_name, date_of_birth, gender, class_name, parent_id, teacher_id,
             weight, height, allergies, medical_conditions, admission_date, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        // Convert arrays/objects to JSON strings và handle undefined values
        const allergiesJson = allergies ? 
            (Array.isArray(allergies) ? JSON.stringify(allergies) : 
             typeof allergies === 'string' ? allergies : JSON.stringify([allergies])) : 
            null; // Set to null for JSON fields instead of empty string
        const medicalConditionsJson = medical_conditions ? 
            (Array.isArray(medical_conditions) ? JSON.stringify(medical_conditions) : 
             typeof medical_conditions === 'string' ? medical_conditions : JSON.stringify([medical_conditions])) : 
            null; // Set to null for JSON fields
        const values = [
            childId, // UUID
            finalStudentId, // Auto-generated or provided student_id
            full_name || null,
            date_of_birth || null,
            gender || null,
            class_name || null,
            parent_id || null,
            teacher_id || null,
            weight || null,
            height || null,
            allergiesJson,
            medicalConditionsJson,
            admission_date || new Date().toISOString().split('T')[0],
            is_active !== undefined ? is_active : true
        ];
        
        try {
            const result = await this.db.query(query, values);
            
            // Use the generated UUID to retrieve the created child
            const newChild = await this.findById(childId);

        } catch (error) {

            // Provide more specific error message
            if (error.message.includes('allergies')) {
                throw new Error(`Database constraint error for allergies field: ${error.message}`);
            } else if (error.message.includes('CONSTRAINT')) {
                throw new Error(`Database constraint violation: ${error.message}`);
            } else {
                throw error;
            }
        }
    }

    // Lấy tất cả children với phân trang và join với parent/teacher names
    async findAll(limit = 50, offset = 0) {
        const query = `
            SELECT c.*,
                   p.full_name as parent_name,
                   p.phone as parent_phone,
                   t.full_name as teacher_name,
                   FLOOR(DATEDIFF(CURDATE(), c.date_of_birth) / 365.25) as age
            FROM ${this.tableName} c
            LEFT JOIN users p ON c.parent_id = p.id
            LEFT JOIN users t ON c.teacher_id = t.id
            WHERE c.is_active = 1
            ORDER BY c.full_name
            LIMIT ? OFFSET ?
        `;
        
        try {
            const result = await this.db.query(query, [limit, offset]);
            // Handle different MySQL2 response formats
            if (Array.isArray(result)) {
                const rows = result.length > 0 && Array.isArray(result[0]) ? result[0] : result;
                return this.parseJsonFields(rows);
            }
            return this.parseJsonFields(result) || [];
        } catch (error) {
            return [];
        }
    }

    // Tìm child theo ID
    async findById(id) {
        const query = `
            SELECT c.id, c.student_id, c.full_name, c.date_of_birth, c.gender, 
                   c.class_name, c.nhom, c.parent_id, c.teacher_id, c.height, c.weight,
                   c.allergies, c.medical_conditions, c.admission_date,
                   c.is_active, c.created_at, c.updated_at,
                   u.full_name as parent_name,
                   u.phone as parent_phone,
                   t.full_name as teacher_name,
                   FLOOR(DATEDIFF(CURDATE(), c.date_of_birth) / 365.25) as age
            FROM ${this.tableName} c
            LEFT JOIN users u ON c.parent_id = u.id
            LEFT JOIN users t ON c.teacher_id = t.id
            WHERE c.id = ? AND c.is_active = 1
        `;
        
        try {
            // Test direct query first
            const directQuery = `SELECT class_name FROM children WHERE id = ?`;
            const directResult = await this.db.query(directQuery, [id]);
            
            const result = await this.db.query(query, [id]);
            // Handle different MySQL2 response formats
            if (Array.isArray(result) && result.length > 0) {
                const rows = Array.isArray(result[0]) ? result[0] : result;
                if (Array.isArray(rows) && rows.length > 0) {
                    const child = rows[0];
                    // Parse JSON fields
                    if (child.allergies && typeof child.allergies === 'string') {
                        try {
                            child.allergies = JSON.parse(child.allergies);
                        } catch (e) {
                            child.allergies = [];
                        }
                    }
                    if (child.medical_conditions && typeof child.medical_conditions === 'string') {
                        try {
                            child.medical_conditions = JSON.parse(child.medical_conditions);
                        } catch (e) {
                            child.medical_conditions = [];
                        }
                    }
                    return child;
                }
            }
            return null;
        } catch (error) {
            return null;
        }
    }

    // Tìm children theo class_id  
    async findByClassId(classId) {
        const query = `
            SELECT c.*, 
                   u.full_name as parent_name,
                   u.phone as parent_phone,
                   FLOOR(DATEDIFF(CURDATE(), c.date_of_birth) / 365.25) as age
            FROM ${this.tableName} c
            LEFT JOIN users u ON c.parent_id = u.id
            WHERE c.class_name = ? AND c.is_active = 1
            ORDER BY c.full_name
        `;
        
        try {
            const result = await this.db.query(query, [classId]);
            // Handle different MySQL2 response formats
            if (Array.isArray(result)) {
                return result.length > 0 && Array.isArray(result[0]) ? result[0] : result;
            }
            return result || [];
        } catch (error) {
            return [];
        }
    }

    // Tìm children theo parent_id
    async findByParentId(parentId) {
        const query = `
            SELECT c.*,
                   u.full_name as parent_name,
                   u.phone as parent_phone,
                   t.full_name as teacher_name,
                   FLOOR(DATEDIFF(CURDATE(), c.date_of_birth) / 365.25) as age
            FROM ${this.tableName} c
            LEFT JOIN users u ON c.parent_id = u.id
            LEFT JOIN users t ON c.teacher_id = t.id
            WHERE c.parent_id = ? AND c.is_active = 1
            ORDER BY c.full_name
        `;
        
        try {
            const result = await this.db.query(query, [parentId]);
            // Handle different MySQL2 response formats
            if (Array.isArray(result)) {
                const rows = result.length > 0 && Array.isArray(result[0]) ? result[0] : result;
                return this.parseJsonFields(rows);
            }
            return this.parseJsonFields(result) || [];
        } catch (error) {
            return [];
        }
    }

    // Helper method to parse JSON fields
    parseJsonFields(children) {
        if (!Array.isArray(children)) {
            return children;
        }
        
        return children.map(child => {
            // Handle allergies - could be JSON array or plain text
            if (child.allergies && typeof child.allergies === 'string') {
                try {
                    // Try to parse as JSON first
                    child.allergies = JSON.parse(child.allergies);
                } catch (e) {
                    // If not JSON, treat as plain text and split by comma
                    child.allergies = child.allergies.split(',').map(a => a.trim()).filter(a => a);
                }
            }
            
            // Handle medical_conditions - keep as string for display
            if (child.medical_conditions && typeof child.medical_conditions === 'string') {
                try {
                    // Try to parse as JSON first
                    const parsed = JSON.parse(child.medical_conditions);
                    child.medical_conditions = Array.isArray(parsed) ? parsed.join(', ') : parsed;
                } catch (e) {
                    // If not JSON, keep as plain text
                    // child.medical_conditions stays as is
                }
            }
            return child;
        });
    }

    // Tìm children theo tên
    async findByName(name) {
        const query = `
            SELECT c.*,
                   u.full_name as parent_name,
                   u.phone as parent_phone
            FROM ${this.tableName} c
            LEFT JOIN users u ON c.parent_id = u.id
            WHERE c.full_name LIKE ? AND c.is_active = 1
            ORDER BY c.full_name
        `;
        
        try {
            const result = await this.db.query(query, [`%${name}%`]);
            // Handle different MySQL2 response formats
            if (Array.isArray(result)) {
                return result.length > 0 && Array.isArray(result[0]) ? result[0] : result;
            }
            return result || [];
        } catch (error) {
            return [];
        }
    }

    // Cập nhật child
    async updateById(id, updateData) {
        const allowedFields = [
            'full_name', 'date_of_birth', 'gender', 'class_name', 'teacher_id', 'weight', 
            'height', 'allergies', 'medical_conditions', 'is_active'
        ];
        const setClause = [];
        const values = [];

        for (const [key, value] of Object.entries(updateData)) {
            
            if (allowedFields.includes(key)) {
                setClause.push(`${key} = ?`);
                
                // Handle JSON fields properly
                if (['allergies', 'medical_conditions'].includes(key)) {
                    // For JSON fields, accept empty string and convert to null
                    if (value !== null && value !== undefined && value !== '') {
                        if (typeof value === 'string') {
                            // If it's a non-empty string, keep it as is
                            values.push(value);
                        } else if (Array.isArray(value) || typeof value === 'object') {
                            values.push(JSON.stringify(value));
                        } else {
                            values.push(JSON.stringify([value]));
                        }
                    } else {
                        values.push(null); // Use null for empty JSON fields
                    }
                } else if (['height', 'weight'].includes(key)) {
                    // For numeric fields, ensure proper type
                    if (value !== null && value !== undefined && value !== '') {
                        const numValue = parseFloat(value);
                        values.push(isNaN(numValue) ? null : numValue);
                    } else {
                        values.push(null);
                    }
                } else {
                    // For other fields, accept all values including empty string and null
                    values.push(value === undefined ? null : value);
                }
            } else {
                console.log(` Field ${key} is NOT allowed`);
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

        await this.db.query(query, values);
        return this.findById(id);
    }

    // Soft delete child
    async deleteById(id) {
        const query = `
            UPDATE ${this.tableName}
            SET is_active = 0, updated_at = NOW()
            WHERE id = ?
        `;

        await this.db.query(query, [id]);
        return true;
    }

    // Thống kê children theo class
    async getStatsByClass() {
        const query = `
            SELECT COUNT(c.id) as count,
                   AVG(TIMESTAMPDIFF(YEAR, c.date_of_birth, CURDATE())) as avg_age
            FROM ${this.tableName} c
            WHERE c.is_active = 1
            GROUP BY c.class_id, cl.ten_lop
            ORDER BY cl.ten_lop
        `;

        try {
            const result = await this.db.query(query);
            // Handle different MySQL2 response formats
            if (Array.isArray(result)) {
                return result.length > 0 && Array.isArray(result[0]) ? result[0] : result;
            }
            return result || [];
        } catch (error) {
            console.error('Database query error:', error);
            return [];
        }
    }

    // Tìm kiếm children theo tiêu chí
    async search(criteria) {
        try {
            const { searchTerm, className, hasAllergy, age, gender, limit, offset } = criteria;
            
            let whereConditions = [];
            let queryParams = [];
            let paramIndex = 1;

            // Search in child name or parent name
            if (searchTerm) {
                whereConditions.push(`(c.full_name LIKE ? OR u.full_name LIKE ?)`);
                const searchPattern = `%${searchTerm}%`;
                queryParams.push(searchPattern, searchPattern);
                paramIndex += 2;
            }

            // Filter by class - support both exact match and LIKE pattern
            if (className) {
                // Check if className contains specific class names
                if (className.includes('Mầm')) {
                    whereConditions.push(`c.class_name LIKE ?`);
                    queryParams.push('%Mầm%');
                } else {
                    whereConditions.push(`c.class_name LIKE ?`);
                    queryParams.push(`%${className}%`);
                }
                paramIndex++;
            }

            // Filter by allergy status
            if (hasAllergy !== undefined) {
                if (hasAllergy) {
                    // Has allergy: allergies field is not null and not empty
                    whereConditions.push(`(c.allergies IS NOT NULL AND c.allergies != '' AND c.allergies != '[]' AND JSON_LENGTH(c.allergies) > 0)`);
                } else {
                    // No allergy: allergies field is null, empty string, or empty array
                    whereConditions.push(`(c.allergies IS NULL OR c.allergies = '' OR c.allergies = '[]' OR JSON_LENGTH(c.allergies) = 0)`);
                }
            }

            // Filter by age
            if (age) {
                whereConditions.push(`FLOOR(DATEDIFF(CURDATE(), c.date_of_birth) / 365.25) = ?`);
                queryParams.push(age);
                paramIndex++;
            }

            // Filter by gender - support both Vietnamese and English values
            if (gender) {
                whereConditions.push(`(c.gender = ? OR c.gender = ?)`);
                if (gender === 'Nam' || gender === 'M' || gender === 'male') {
                    queryParams.push('Nam', 'male');
                } else if (gender === 'Nữ' || gender === 'F' || gender === 'female') {
                    queryParams.push('Nữ', 'female');
                } else {
                    // If gender value is not recognized, try both the original value and fallback
                    queryParams.push(gender, gender);
                }
                paramIndex += 2;
            }

            const whereClause = whereConditions.length > 0 ? 
                `WHERE ${whereConditions.join(' AND ')} AND c.is_active = 1` : 'WHERE c.is_active = 1';

            // Count total results
            const countQuery = `
                SELECT COUNT(*) as total 
                FROM ${this.tableName} c
                LEFT JOIN users u ON c.parent_id = u.id
                ${whereClause}
            `;
            
            const countResult = await this.db.query(countQuery, queryParams);
            const total = countResult[0]?.total || 0;

            // Get paginated results
            const searchQuery = `
                SELECT c.id, c.student_id, c.full_name, c.date_of_birth, c.gender, 
                       c.class_name, c.height, c.weight, c.allergies, c.medical_conditions,
                       c.admission_date, c.created_at, c.updated_at,
                       u.full_name as parent_name, u.phone as parent_phone,
                       FLOOR(DATEDIFF(CURDATE(), c.date_of_birth) / 365.25) as age
                FROM ${this.tableName} c
                LEFT JOIN users u ON c.parent_id = u.id
                ${whereClause}
                ORDER BY c.full_name ASC
                LIMIT ? OFFSET ?
            `;
            
            const searchParams = [...queryParams, limit, offset];
            const children = await this.db.query(searchQuery, searchParams);

            // Parse JSON fields
            const parsedChildren = (children || []).map(child => {
                if (child.allergies && typeof child.allergies === 'string') {
                    try {
                        child.allergies = JSON.parse(child.allergies);
                    } catch (e) {
                        child.allergies = [];
                    }
                }
                if (child.medical_conditions && typeof child.medical_conditions === 'string') {
                    try {
                        child.medical_conditions = JSON.parse(child.medical_conditions);
                    } catch (e) {
                        child.medical_conditions = [];
                    }
                }
                return child;
            });

            return {
                children: parsedChildren,
                total: total
            };

        } catch (error) {
            console.error('Error in Child.search:', error);
            throw error;
        }
    }
}

module.exports = Child;
