/**
 * Child Service
 * Quản lý thông tin trẻ em/học sinh với phân quyền
 */

const { v4: uuidv4 } = require('uuid');

class ChildService {
    constructor(db) {
        this.db = db;
    }

    // Lấy tất cả trẻ em (có phân quyền)
    async getAllChildren(userRole, parentId = null) {
        try {
            let query = `
                SELECT 
                    c.*,
                    p.full_name as parent_name,
                    p.email as parent_email,
                    p.phone as parent_phone,
                    t.full_name as teacher_name
                FROM children c
                LEFT JOIN users p ON c.parent_id = p.id
                LEFT JOIN users t ON c.teacher_id = t.id
                WHERE c.is_active = true
            `;
            const params = [];

            // Phụ huynh chỉ xem được con mình
            if (userRole === 'parent' && parentId) {
                query += ' AND c.parent_id = ?';
                params.push(parentId);
            }

            query += ' ORDER BY c.full_name ASC';

            const children = await this.db.select(query, params);

            return {
                success: true,
                data: children,
                count: children.length,
                message: userRole === 'parent' ? 'Danh sách con em của bạn' : 'Danh sách trẻ em'
            };
        } catch (error) {
            console.error('❌ Get all children error:', error);
            return {
                success: false,
                message: 'Lỗi khi lấy danh sách trẻ em'
            };
        }
    }

    // Kiểm tra quyền truy cập thông tin trẻ em
    async canAccessChildInfo(childId, userRole, parentId = null) {
        try {
            // Admin, teacher, nutritionist có thể truy cập tất cả
            if (['admin', 'teacher', 'nutritionist'].includes(userRole)) {
                return { canAccess: true, reason: 'Staff access' };
            }

            // Parent chỉ có thể truy cập thông tin con mình
            if (userRole === 'parent' && parentId) {
                const child = await this.db.findById('children', childId);
                if (child && child.parent_id === parentId) {
                    return { canAccess: true, reason: 'Parent access to own child' };
                }
                return { canAccess: false, reason: 'Not your child' };
            }

            return { canAccess: false, reason: 'No permission' };
        } catch (error) {
            return { canAccess: false, reason: 'Error checking access' };
        }
    }

    // Tạo hồ sơ trẻ em mới
    async createChild(childData) {
        try {
            const {
                studentId,
                fullName,
                dateOfBirth,
                gender,
                parentId,
                teacherId,
                className,
                allergies = [],
                medicalConditions = [],
                emergencyContact
            } = childData;

            // Validation
            if (!studentId || !fullName || !dateOfBirth || !gender) {
                return {
                    success: false,
                    message: 'Thiếu thông tin bắt buộc'
                };
            }

            // Kiểm tra student_id đã tồn tại
            const existingChild = await this.db.findWhere('children', { student_id: studentId });
            if (existingChild.length > 0) {
                return {
                    success: false,
                    message: 'Mã học sinh đã tồn tại'
                };
            }

            // Tạo record mới
            const newChild = {
                id: uuidv4(),
                student_id: studentId,
                full_name: fullName,
                date_of_birth: dateOfBirth,
                gender,
                parent_id: parentId || null,
                teacher_id: teacherId || null,
                class_name: className || null,
                allergies: JSON.stringify(allergies),
                medical_conditions: JSON.stringify(medicalConditions),
                emergency_contact: emergencyContact ? JSON.stringify(emergencyContact) : null,
                admission_date: new Date().toISOString().split('T')[0],
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            };

            const result = await this.db.create('children', newChild);

            if (result.affectedRows > 0) {
                return {
                    success: true,
                    message: 'Tạo hồ sơ trẻ em thành công',
                    data: {
                        id: newChild.id,
                        studentId,
                        fullName
                    }
                };
            } else {
                return {
                    success: false,
                    message: 'Tạo hồ sơ trẻ em thất bại'
                };
            }

        } catch (error) {
            console.error('❌ Create child error:', error);
            return {
                success: false,
                message: 'Lỗi server khi tạo hồ sơ trẻ em'
            };
        }
    }

    // Lấy thông tin trẻ theo ID (có phân quyền)
    async getChildById(childId, userRole, parentId = null) {
        try {
            // Kiểm tra quyền truy cập
            const accessCheck = await this.canAccessChildInfo(childId, userRole, parentId);
            if (!accessCheck.canAccess) {
                return {
                    success: false,
                    message: 'Bạn không có quyền xem thông tin trẻ em này'
                };
            }

            const children = await this.db.select(`
                SELECT 
                    c.*,
                    p.full_name as parent_name,
                    p.email as parent_email,
                    p.phone as parent_phone,
                    t.full_name as teacher_name,
                    t.email as teacher_email
                FROM children c
                LEFT JOIN users p ON c.parent_id = p.id
                LEFT JOIN users t ON c.teacher_id = t.id
                WHERE c.id = ? AND c.is_active = true
            `, [childId]);

            if (children.length === 0) {
                return {
                    success: false,
                    message: 'Không tìm thấy trẻ em'
                };
            }

            const child = children[0];
            
            // Parse JSON fields
            if (child.allergies) {
                child.allergies = JSON.parse(child.allergies);
            }
            if (child.medical_conditions) {
                child.medical_conditions = JSON.parse(child.medical_conditions);
            }
            if (child.emergency_contact) {
                child.emergency_contact = JSON.parse(child.emergency_contact);
            }

            return {
                success: true,
                data: child
            };
        } catch (error) {
            console.error('❌ Get child by ID error:', error);
            return {
                success: false,
                message: 'Lỗi khi lấy thông tin trẻ em'
            };
        }
    }

    // Cập nhật thông tin trẻ em
    async updateChild(childId, updateData) {
        try {
            const allowedFields = [
                'full_name', 'class_name', 'teacher_id', 
                'allergies', 'medical_conditions', 'emergency_contact'
            ];
            
            const filteredData = {};
            
            for (const field of allowedFields) {
                if (updateData[field] !== undefined) {
                    if (['allergies', 'medical_conditions', 'emergency_contact'].includes(field)) {
                        filteredData[field] = JSON.stringify(updateData[field]);
                    } else {
                        filteredData[field] = updateData[field];
                    }
                }
            }

            if (Object.keys(filteredData).length === 0) {
                return {
                    success: false,
                    message: 'Không có dữ liệu để cập nhật'
                };
            }

            filteredData.updated_at = new Date();

            const result = await this.db.updateById('children', childId, filteredData);

            if (result.affectedRows > 0) {
                return {
                    success: true,
                    message: 'Cập nhật thông tin trẻ em thành công'
                };
            } else {
                return {
                    success: false,
                    message: 'Không tìm thấy trẻ em để cập nhật'
                };
            }
        } catch (error) {
            console.error('❌ Update child error:', error);
            return {
                success: false,
                message: 'Lỗi khi cập nhật thông tin trẻ em'
            };
        }
    }

    // Lấy danh sách trẻ em theo lớp
    async getChildrenByClass(className) {
        try {
            const children = await this.db.findWhere('children', {
                class_name: className,
                is_active: true
            }, 'full_name ASC');

            return {
                success: true,
                data: children,
                count: children.length
            };
        } catch (error) {
            console.error('❌ Get children by class error:', error);
            return {
                success: false,
                message: 'Lỗi khi lấy danh sách trẻ em theo lớp'
            };
        }
    }

    // Lấy danh sách trẻ em theo phụ huynh
    async getChildrenByParent(parentId) {
        try {
            const children = await this.db.findWhere('children', {
                parent_id: parentId,
                is_active: true
            }, 'full_name ASC');

            return {
                success: true,
                data: children,
                count: children.length
            };
        } catch (error) {
            console.error('❌ Get children by parent error:', error);
            return {
                success: false,
                message: 'Lỗi khi lấy danh sách trẻ em theo phụ huynh'
            };
        }
    }

    // Tìm kiếm trẻ em
    async searchChildren(searchTerm) {
        try {
            const children = await this.db.select(`
                SELECT 
                    c.*,
                    p.full_name as parent_name,
                    t.full_name as teacher_name
                FROM children c
                LEFT JOIN users p ON c.parent_id = p.id
                LEFT JOIN users t ON c.teacher_id = t.id
                WHERE c.is_active = true 
                AND (
                    c.full_name LIKE ? OR 
                    c.student_id LIKE ? OR
                    c.class_name LIKE ?
                )
                ORDER BY c.full_name ASC
            `, [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]);

            return {
                success: true,
                data: children,
                count: children.length
            };
        } catch (error) {
            console.error('❌ Search children error:', error);
            return {
                success: false,
                message: 'Lỗi khi tìm kiếm trẻ em'
            };
        }
    }

    // Thống kê trẻ em
    async getChildrenStats() {
        try {
            const stats = await this.db.select(`
                SELECT 
                    class_name,
                    gender,
                    COUNT(*) as count
                FROM children 
                WHERE is_active = true
                GROUP BY class_name, gender
                ORDER BY class_name, gender
            `);

            const totalCount = await this.db.count('children', { is_active: true });

            return {
                success: true,
                data: {
                    total: totalCount,
                    byClassAndGender: stats
                }
            };
        } catch (error) {
            console.error('❌ Get children stats error:', error);
            return {
                success: false,
                message: 'Lỗi khi lấy thống kê trẻ em'
            };
        }
    }
}

module.exports = ChildService;
