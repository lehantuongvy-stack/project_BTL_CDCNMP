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
                if (req.user.role === 'parent' && req.user.id !== parseInt(parent_id)) {
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

            this.sendResponse(res, 200, {
                success: true,
                data: {
                    children: children || [],
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total: (children && children.length) || 0
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
            console.log('📝 Creating child with data:', childData);

            // Validate required fields
            const requiredFields = ['full_name', 'date_of_birth', 'gender'];
            for (const field of requiredFields) {
                if (!childData[field]) {
                    console.log(`❌ Missing required field: ${field}`);
                    return this.sendResponse(res, 400, {
                        success: false,
                        message: `Trường ${field} là bắt buộc`
                    });
                }
            }

            // Kiểm tra quyền và set parent_id
            if (req.user.role === 'parent') {
                childData.parent_id = req.user.id;
                console.log('👤 Set parent_id from user:', req.user.id);
            } else if (req.user.role === 'admin' || req.user.role === 'teacher') {
                // Admin/teacher có thể tạo child cho parent khác
                if (!childData.parent_id) {
                    console.log('❌ Missing parent_id for admin/teacher');
                    return this.sendResponse(res, 400, {
                        success: false,
                        message: 'parent_id là bắt buộc'
                    });
                }
                console.log('👤 Using provided parent_id:', childData.parent_id);
            } else {
                console.log('❌ Unauthorized role:', req.user.role);
                return this.sendResponse(res, 403, {
                    success: false,
                    message: 'Không có quyền tạo child'
                });
            }

            console.log('🔧 Calling childModel.create...');
            const newChild = await this.childModel.create(childData);
            console.log('✅ Child created:', newChild);

            this.sendResponse(res, 201, {
                success: true,
                message: 'Tạo child thành công',
                data: { child: newChild }
            });

        } catch (error) {
            console.error('❌ Create child error:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server khi tạo child',
                error: error.message
            });
        }
    }

    // Cập nhật child
    async updateChild(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

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

    // Tìm kiếm children
    async searchChildren(req, res) {
        try {
            // Parse query parameters
            const urlParts = url.parse(req.url, true);
            const query = urlParts.query;
            
            console.log('🔍 Search children with query:', query);
            
            const searchTerm = query.q || query.search || '';
            const className = query.class || query.lop || '';
            const hasAllergy = query.has_allergy;
            const age = query.age;
            const gender = query.gender;
            const page = parseInt(query.page) || 1;
            const limit = parseInt(query.limit) || 10;
            const offset = (page - 1) * limit;

            if (!searchTerm && !className && hasAllergy === undefined && !age && !gender) {
                return this.sendResponse(res, 400, {
                    success: false,
                    message: 'Vui lòng cung cấp ít nhất một tham số tìm kiếm (q, class, has_allergy, age, hoặc gender)'
                });
            }

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

            console.log('🔍 Search criteria:', searchCriteria);

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

    // Lấy children có dị ứng
    async getChildrenWithAllergies(req, res) {
        try {
            // Chỉ admin, teacher, nutritionist mới xem được
            if (!['admin', 'teacher', 'nutritionist'].includes(req.user.role)) {
                return this.sendResponse(res, 403, {
                    success: false,
                    message: 'Không có quyền xem thông tin này'
                });
            }

            const children = await this.childModel.findWithAllergies();

            this.sendResponse(res, 200, {
                success: true,
                data: {
                    children,
                    total: children.length
                }
            });

        } catch (error) {
            console.error('Get children with allergies error:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server khi lấy danh sách children có dị ứng',
                error: error.message
            });
        }
    }

    // Lấy thống kê children theo class
    async getChildrenStatsByClass(req, res) {
        try {
            // Chỉ admin, teacher mới xem được thống kê
            if (!['admin', 'teacher'].includes(req.user.role)) {
                return this.sendResponse(res, 403, {
                    success: false,
                    message: 'Không có quyền xem thống kê'
                });
            }

            const stats = await this.childModel.getStatsByClass();

            this.sendResponse(res, 200, {
                success: true,
                data: { stats }
            });

        } catch (error) {
            console.error('Get children stats error:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server khi lấy thống kê children',
                error: error.message
            });
        }
    }

    // Lấy children sinh nhật trong tháng
    async getBirthdaysInMonth(req, res) {
        try {
            const { month, year } = req.query;

            if (!month) {
                return this.sendResponse(res, 400, {
                    success: false,
                    message: 'Month parameter is required'
                });
            }

            const children = await this.childModel.findBirthdaysInMonth(
                parseInt(month), 
                year ? parseInt(year) : null
            );

            this.sendResponse(res, 200, {
                success: true,
                data: {
                    children,
                    total: children.length,
                    month: parseInt(month),
                    year: year ? parseInt(year) : null
                }
            });

        } catch (error) {
            console.error('Get birthdays error:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server khi lấy danh sách sinh nhật',
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
            
            console.log('🔍 Search children with query:', query);
            
            const searchTerm = query.q || query.search || '';
            const className = query.class || query.lop || '';
            const hasAllergy = query.has_allergy;
            const age = query.age;
            const gender = query.gender;
            const page = parseInt(query.page) || 1;
            const limit = parseInt(query.limit) || 10;
            const offset = (page - 1) * limit;

            if (!searchTerm && !className && hasAllergy === undefined && !age && !gender) {
                return this.sendResponse(res, 400, {
                    success: false,
                    message: 'Vui lòng cung cấp ít nhất một tham số tìm kiếm (q, class, has_allergy, age, hoặc gender)'
                });
            }

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

            console.log('🔍 Search criteria:', searchCriteria);

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
