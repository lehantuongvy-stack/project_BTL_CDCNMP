/**
 * Child Controller
 * Xử lý logic quản lý children
 */

const BaseController = require('./BaseController');
const Child = require('../models/Child');
const url = require('url');

class ChildController extends BaseController {
    constructor(db) {
        super();
        this.db = db;
        this.childModel = new Child(db);
    }

    // Lấy danh sách children
    async getChildren(req, res) {
        try {
            const { page = 1, limit = 50, class_id, parent_id } = req.query;
            const offset = (page - 1) * limit;

            let children = [];

            if (class_id) {
                children = await this.childModel.findByClassId(class_id) || [];
            } else if (parent_id) {
                // Kiểm tra quyền: chỉ parent hoặc admin/teacher mới xem được children theo parent_id
                if (req.user.role === 'parent' && req.user.id !== parent_id) {
                    return this.sendResponse(res, 403, {
                        success: false,
                        message: 'Không có quyền xem thông tin này'
                    });
                }
                children = await this.childModel.findByParentId(parent_id) || [];
            } else {
                // Nếu là parent, chỉ xem children của mình
                if (req.user.role === 'parent') {
                    children = await this.childModel.findByParentId(req.user.id) || [];
                } else {
                    children = await this.childModel.findAll(parseInt(limit), offset) || [];
                }
            }

            // Đếm tổng số children trong database
            let totalCount = 0;
            try {
                if (class_id) {
                    // Đếm theo class_id
                    const countResult = await this.db.query('SELECT COUNT(*) as count FROM children WHERE class_id = ? AND is_active = 1', [class_id]);
                    totalCount = countResult[0]?.count || 0;
                } else if (parent_id) {
                    // Đếm theo parent_id
                    const countResult = await this.db.query('SELECT COUNT(*) as count FROM children WHERE parent_id = ? AND is_active = 1', [parent_id]);
                    totalCount = countResult[0]?.count || 0;
                } else if (req.user.role === 'parent') {
                    // Đếm children của parent hiện tại
                    const countResult = await this.db.query('SELECT COUNT(*) as count FROM children WHERE parent_id = ? AND is_active = 1', [req.user.id]);
                    totalCount = countResult[0]?.count || 0;
                } else {
                    // Đếm tất cả children
                    const countResult = await this.db.query('SELECT COUNT(*) as count FROM children WHERE is_active = 1');
                    totalCount = countResult[0]?.count || 0;
                }
            } catch (countError) {
                console.error('Count children error:', countError);
                totalCount = (children && children.length) || 0; // Fallback
            }

            this.sendResponse(res, 200, {
                success: true,
                data: {
                    children: children || [],
                    pagination: {
                        current_page: parseInt(page),
                        items_per_page: parseInt(limit),
                        total_items: totalCount,
                        total_pages: Math.ceil(totalCount / parseInt(limit))
                    }
                }
            });

        } catch (error) {
            console.error('Get children error:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server khi lấy danh sách children',
                error: error.message
            });
        }
    }

    // Lấy danh sách học sinh của teacher đang đăng nhập
    async getMyClassChildren(req, res) {
        try {
            console.log(' getMyClassChildren called for teacher:', req.user.id);
            
            if (req.user.role !== 'teacher') {
                return this.sendResponse(res, 403, {
                    success: false,
                    message: 'Chỉ giáo viên mới có quyền xem danh sách lớp của mình'
                });
            }

            const teacherId = req.user.id;

            const query = `
                SELECT 
                    c.id as child_id,
                    c.student_id,
                    c.full_name,
                    c.date_of_birth,
                    c.gender,
                    c.class_name,
                    FLOOR(DATEDIFF(CURDATE(), c.date_of_birth) / 365.25) as age,
                    p.full_name as parent_name,
                    p.phone as parent_phone
                FROM children c
                LEFT JOIN users p ON c.parent_id = p.id
                WHERE c.teacher_id = ? AND c.is_active = true
                ORDER BY c.class_name ASC, c.full_name ASC
            `;

            console.log(' Executing query with teacherId:', teacherId);
            const result = await this.db.query(query, [teacherId]);
            
            let children = [];
            if (Array.isArray(result)) {
                children = result.length > 0 && Array.isArray(result[0]) ? result[0] : result;
            } else {
                children = result || [];
            }

            console.log(` Found ${children.length} children for teacher ${teacherId}`);

            this.sendResponse(res, 200, {
                success: true,
                data: { 
                    children: children,
                    count: children.length
                }
            });

        } catch (error) {
            console.error(' Error in getMyClassChildren:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server khi lấy danh sách học sinh',
                error: error.message
            });
        }
    }

    // Lấy thông tin cơ bản của children (cho parent filtering)
    async getBasicInfo(req, res) {
        try {
            console.log(' getBasicInfo called by user:', req.user);

            // Chỉ parent mới được gọi API này
            if (req.user.role !== 'parent') {
                return this.sendResponse(res, 403, {
                    success: false,
                    message: 'Chỉ phụ huynh mới có thể truy cập API này'
                });
            }

            const children = await this.childModel.findByParentId(req.user.id) || [];
            console.log(` Found ${children.length} children for parent ${req.user.id}`);

            // Trả về thông tin đầy đủ cho trang thông tin trẻ
            const basicInfo = children.map(child => ({
                id: child.id,
                student_id: child.student_id,
                full_name: child.full_name,
                date_of_birth: child.date_of_birth,
                gender: child.gender,
                class_name: child.class_name,
                height: child.height,
                weight: child.weight,
                allergies: child.allergies,
                medical_conditions: child.medical_conditions,
                nhom: child.nhom || 'nha_tre', 
                age: child.age
            }));

            console.log(' Basic info:', basicInfo);

            this.sendResponse(res, 200, {
                success: true,
                data: {
                    children: basicInfo,
                    count: basicInfo.length
                }
            });

        } catch (error) {
            console.error('Get basic info error:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server khi lấy thông tin cơ bản children',
                error: error.message
            });
        }
    }

    // Lấy child theo ID
    async getChildById(req, res) {
        try {
            const { id } = req.params;

            const child = await this.childModel.findById(id);
            if (!child) {
                return this.sendResponse(res, 404, {
                    success: false,
                    message: 'Không tìm thấy child'
                });
            }

            // Kiểm tra quyền: parent chỉ xem được children của mình
            if (req.user.role === 'parent' && child.parent_id !== req.user.id) {
                return this.sendResponse(res, 403, {
                    success: false,
                    message: 'Không có quyền xem thông tin này'
                });
            }

            this.sendResponse(res, 200, {
                success: true,
                data: { child }
            });

        } catch (error) {
            console.error('Get child by ID error:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server khi lấy thông tin child',
                error: error.message
            });
        }
    }

    // Tạo child mới
    async createChild(req, res) {
        try {
            const childData = req.body;
            // Validate required fields
            const requiredFields = ['full_name', 'date_of_birth', 'gender'];
            for (const field of requiredFields) {
                if (!childData[field]) {
                    console.log(`Missing required field: ${field}`);
                    return this.sendResponse(res, 400, {
                        success: false,
                        message: `Trường ${field} là bắt buộc`
                    });
                }
            }

            // Kiểm tra quyền và set parent_id
            if (req.user.role === 'parent') {
                childData.parent_id = req.user.id;
                console.log('Set parent_id from user:', req.user.id);
            } else if (req.user.role === 'admin' || req.user.role === 'teacher') {
                // Admin/teacher có thể tạo child cho parent khác
                if (!childData.parent_id) {
                    console.log('Missing parent_id for admin/teacher');
                    return this.sendResponse(res, 400, {
                        success: false,
                        message: 'parent_id là bắt buộc'
                    });
                }
                console.log('Using provided parent_id:', childData.parent_id);
            } else {
                console.log('Unauthorized role:', req.user.role);
                return this.sendResponse(res, 403, {
                    success: false,
                    message: 'Không có quyền tạo child'
                });
            }

            console.log('Calling childModel.create...');
            const newChild = await this.childModel.create(childData);
            console.log('Child created:', newChild);

            this.sendResponse(res, 201, {
                success: true,
                message: 'Tạo child thành công',
                data: { child: newChild }
            });

        } catch (error) {
            console.error('Create child error:', error);
            
            // Parse error message for better user feedback
            let errorMessage = 'Lỗi server khi tạo child';
            let statusCode = 500;
            
            // Check for duplicate entry error
            if (error.message && error.message.includes('Duplicate entry')) {
                const match = error.message.match(/Duplicate entry '([^']+)' for key '([^']+)'/);
                if (match) {
                    const duplicateValue = match[1];
                    const keyName = match[2];
                    
                    if (keyName.includes('student_id')) {
                        errorMessage = `Mã học sinh "${duplicateValue}" đã tồn tại trong hệ thống`;
                        statusCode = 409; // Conflict
                    } else {
                        errorMessage = `Giá trị "${duplicateValue}" đã tồn tại trong hệ thống`;
                        statusCode = 409;
                    }
                }
            }
            
            this.sendResponse(res, statusCode, {
                success: false,
                message: errorMessage,
                error: error.message
            });
        }
    }

    // Cập nhật child
    async updateChild(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // Check if updateData is empty or invalid
            if (!updateData || typeof updateData !== 'object' || Object.keys(updateData).length === 0) {
                return this.sendResponse(res, 400, {
                    success: false,
                    message: 'Dữ liệu cập nhật không hợp lệ hoặc rỗng',
                    received_data: updateData
                });
            }

            // Kiểm tra child tồn tại
            const existingChild = await this.childModel.findById(id);
            if (!existingChild) {
                return this.sendResponse(res, 404, {
                    success: false,
                    message: 'Không tìm thấy child'
                });
            }

            // Kiểm tra quyền
            if (req.user.role === 'parent' && existingChild.parent_id !== req.user.id) {
                return this.sendResponse(res, 403, {
                    success: false,
                    message: 'Không có quyền cập nhật child này'
                });
            }

            // Parent không được thay đổi class_id
            if (req.user.role === 'parent' && updateData.class_id) {
                delete updateData.class_id;
            }

            const updatedChild = await this.childModel.updateById(id, updateData);

            this.sendResponse(res, 200, {
                success: true,
                message: 'Cập nhật child thành công',
                data: { child: updatedChild }
            });

        } catch (error) {
            console.error('Update child error:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server khi cập nhật child',
                error: error.message
            });
        }
    }

    // Xóa child (soft delete)
    async deleteChild(req, res) {
        try {
            const { id } = req.params;

            // Kiểm tra child tồn tại
            const existingChild = await this.childModel.findById(id);
            if (!existingChild) {
                return this.sendResponse(res, 404, {
                    success: false,
                    message: 'Không tìm thấy child'
                });
            }

            // Chỉ admin hoặc teacher mới được xóa child
            if (!['admin', 'teacher'].includes(req.user.role)) {
                return this.sendResponse(res, 403, {
                    success: false,
                    message: 'Không có quyền xóa child'
                });
            }
            await this.childModel.deleteById(id);
            this.sendResponse(res, 200, {
                success: true,
                message: 'Xóa child thành công'
            });

        } catch (error) {
            console.error('Delete child error:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server khi xóa child',
                error: error.message
            });
        }
    }

    // Tìm kiếm children với handler
    async searchChildrenHandler(req, res) {
        try {
            // Parse query parameters
            const urlParts = url.parse(req.url, true);
            const query = urlParts.query;
            
            console.log('Search children with query:', query);
            
            const searchTerm = query.q || query.search || '';
            const className = query.class || query.lop || '';
            const hasAllergy = query.has_allergy;
            const age = query.age;
            const gender = query.gender;
            const page = parseInt(query.page) || 1;
            const limit = parseInt(query.limit) || 10;
            const offset = (page - 1) * limit;

            // Allow search with any parameter combination
            console.log('Search parameters received:', { searchTerm, className, hasAllergy, age, gender });

            // Build search criteria
            const searchCriteria = {
                searchTerm: searchTerm.trim(),
                className: className,
                hasAllergy: hasAllergy !== undefined ? hasAllergy === 'true' : undefined,
                age: age ? parseInt(age) : undefined,
                gender: gender,
                limit: limit,
                offset: offset
            };

            console.log('Search criteria:', searchCriteria);

            const result = await this.searchChildren(searchCriteria);

            this.sendResponse(res, 200, {
                success: true,
                message: `Tìm kiếm trẻ em thành công. Tìm thấy ${result.total} kết quả`,
                data: {
                    children: result.children,
                    pagination: {
                        current_page: page,
                        total_pages: Math.ceil(result.total / limit),
                        total_items: result.total,
                        items_per_page: limit,
                        has_next: page * limit < result.total,
                        has_prev: page > 1
                    },
                    search_criteria: {
                        search_term: searchTerm,
                        class: className || 'all',
                        has_allergy: hasAllergy || 'all',
                        age: age || 'all',
                        gender: gender || 'all'
                    }
                }
            });

        } catch (error) {
            console.error('Error in searchChildrenHandler:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server',
                error: 'Lỗi khi tìm kiếm trẻ em: ' + error.message
            });
        }
    }

    async searchChildren(criteria) {
        try {
            const result = await this.childModel.search(criteria);
            return result || { children: [], total: 0 };
        } catch (error) {
            console.error('Error searching children:', error);
            throw error;
        }
    }

}

module.exports = ChildController;
