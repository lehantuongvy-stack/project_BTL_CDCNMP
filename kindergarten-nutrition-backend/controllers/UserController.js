/**
 * User Controller
 * Xử lý logic quản lý users
 */

const BaseController = require('./BaseController');
const User = require('../models/User');
const url = require('url');

class UserController extends BaseController {
    constructor(db) {
        super();
        this.db = db;
        this.userModel = new User(db);
    }

    // Lấy danh sách users
    async getUsers(req, res) {
        try {
            const { page = 1, limit = 50, role } = req.query;
            const offset = (page - 1) * limit;

            let users;
            if (role) {
                users = await this.userModel.findByRole(role);
            } else {
                users = await this.userModel.findAll(parseInt(limit), offset);
            }

            this.sendResponse(res, 200, {
                success: true,
                data: {
                    users,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total: users.length
                    }
                }
            });

        } catch (error) {
            console.error('Get users error:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server khi lấy danh sách users',
                error: error.message
            });
        }
    }

    // Lấy user theo ID
    async getUserById(req, res) {
        try {
            const { id } = req.params;

            const user = await this.userModel.findById(id);
            if (!user) {
                return this.sendResponse(res, 404, {
                    success: false,
                    message: 'Không tìm thấy user'
                });
            }

            this.sendResponse(res, 200, {
                success: true,
                data: { user }
            });

        } catch (error) {
            console.error('Get user by ID error:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server khi lấy thông tin user',
                error: error.message
            });
        }
    }

    // Tạo user mới  
    async createUser(req, res) {
        try {
            // Chỉ admin mới được tạo user
            if (req.user.role !== 'admin') {
                return this.sendResponse(res, 403, {
                    success: false,
                    message: 'Chỉ admin mới có thể tạo user'
                });
            }

            const { username, email, password, full_name, role = 'teacher', phone, address } = req.body;

            // Validate required fields
            if (!username || !email || !password || !full_name) {
                return this.sendResponse(res, 400, {
                    success: false,
                    message: 'Thiếu thông tin bắt buộc: username, email, password, full_name'
                });
            }

            // Kiểm tra username trùng lặp
            const usernameExists = await this.userModel.isUsernameExists(username);
            if (usernameExists) {
                return this.sendResponse(res, 400, {
                    success: false,
                    message: 'Username đã tồn tại'
                });
            }

            // Kiểm tra email trùng lặp
            const emailExists = await this.userModel.isEmailExists(email);
            if (emailExists) {
                return this.sendResponse(res, 400, {
                    success: false,
                    message: 'Email đã tồn tại'
                });
            }

            // Hash password
            const bcrypt = require('bcrypt');
            const saltRounds = 10;
            const password_hash = await bcrypt.hash(password, saltRounds);

            // Tạo user mới
            const newUser = await this.userModel.create({
                username,
                email,
                password_hash,
                full_name,
                role,
                phone: phone || null,
                address
            });

            this.sendResponse(res, 201, {
                success: true,
                message: 'Tạo user thành công',
                data: { user: newUser }
            });

        } catch (error) {
            console.error('Create user error:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server khi tạo user',
                error: error.message
            });
        }
    }

    // Cập nhật user
    async updateUser(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // Kiểm tra quyền
            if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
                return this.sendResponse(res, 403, {
                    success: false,
                    message: 'Không có quyền cập nhật user này'
                });
            }

            // Kiểm tra user tồn tại
            const existingUser = await this.userModel.findById(id);
            if (!existingUser) {
                return this.sendResponse(res, 404, {
                    success: false,
                    message: 'Không tìm thấy user'
                });
            }

            // Kiểm tra email trùng lặp (nếu có cập nhật email)
            if (updateData.email) {
                const emailExists = await this.userModel.isEmailExists(updateData.email, id);
                if (emailExists) {
                    return this.sendResponse(res, 400, {
                        success: false,
                        message: 'Email đã tồn tại'
                    });
                }
            }

            // Chỉ admin mới được cập nhật role
            if (updateData.role && req.user.role !== 'admin') {
                delete updateData.role;
            }

            const updatedUser = await this.userModel.updateById(id, updateData);

            this.sendResponse(res, 200, {
                success: true,
                message: 'Cập nhật user thành công',
                data: { user: updatedUser }
            });

        } catch (error) {
            console.error('Update user error:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server khi cập nhật user',
                error: error.message
            });
        }
    }

    // Xóa user (soft delete)
    async deleteUser(req, res) {
        try {
            const { id } = req.params;

            // Chỉ admin mới được xóa user
            if (req.user.role !== 'admin') {
                return this.sendResponse(res, 403, {
                    success: false,
                    message: 'Chỉ admin mới có thể xóa user'
                });
            }

            // Không cho phép xóa chính mình
            if (req.user.id === parseInt(id)) {
                return this.sendResponse(res, 400, {
                    success: false,
                    message: 'Không thể xóa chính mình'
                });
            }

            // Kiểm tra user tồn tại
            const existingUser = await this.userModel.findById(id);
            if (!existingUser) {
                return this.sendResponse(res, 404, {
                    success: false,
                    message: 'Không tìm thấy user'
                });
            }

            await this.userModel.deleteById(id);

            this.sendResponse(res, 200, {
                success: true,
                message: 'Xóa user thành công'
            });

        } catch (error) {
            console.error('Delete user error:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server khi xóa user',
                error: error.message
            });
        }
    }

    // Lấy thống kê users
    async getUserStats(req, res) {
        try {
            const stats = await this.userModel.getStatsByRole();

            this.sendResponse(res, 200, {
                success: true,
                data: { stats }
            });

        } catch (error) {
            console.error('Get user stats error:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server khi lấy thống kê users',
                error: error.message
            });
        }
    }

    // Tìm kiếm users
    async searchUsers(req, res) {
        try {
            const { q, role } = req.query;

            if (!q) {
                return this.sendResponse(res, 400, {
                    success: false,
                    message: 'Query parameter "q" is required'
                });
            }

            // Tìm theo username, full_name, email
            let users = await this.userModel.findAll(100, 0);
            
            users = users.filter(user => {
                const searchTerm = q.toLowerCase();
                const matchesSearch = 
                    user.username.toLowerCase().includes(searchTerm) ||
                    user.full_name.toLowerCase().includes(searchTerm) ||
                    (user.email && user.email.toLowerCase().includes(searchTerm));
                
                const matchesRole = !role || user.role === role;
                
                return matchesSearch && matchesRole;
            });

            this.sendResponse(res, 200, {
                success: true,
                data: {
                    users,
                    total: users.length
                }
            });

        } catch (error) {
            console.error('Search users error:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server khi tìm kiếm users',
                error: error.message
            });
        }
    }

    // Tìm kiếm users (phiên bản mới với phân trang và bộ lọc nâng cao)
    async searchUsersHandler(req, res) {
        try {
            // Parse query parameters
            const urlParts = url.parse(req.url, true);
            const query = urlParts.query;
            
            console.log('🔍 Search users with query:', query);
            
            const searchTerm = query.q || query.search || '';
            const role = query.role || '';
            const isActive = query.is_active;
            const page = parseInt(query.page) || 1;
            const limit = parseInt(query.limit) || 10;
            const offset = (page - 1) * limit;

            if (!searchTerm && !role && isActive === undefined) {
                return this.sendResponse(res, 400, {
                    success: false,
                    message: 'Vui lòng cung cấp ít nhất một tham số tìm kiếm (q, role, hoặc is_active)'
                });
            }

            // Build search criteria
            const searchCriteria = {
                searchTerm: searchTerm.trim(),
                role: role,
                isActive: isActive !== undefined ? isActive === 'true' : undefined,
                limit: limit,
                offset: offset
            };

            console.log('🔍 Search criteria:', searchCriteria);

            const result = await this.searchUsers(searchCriteria);
            
            // Remove sensitive information from all users
            const safeUsers = result.users.map(user => {
                const { password, ...safeUser } = user;
                return safeUser;
            });

            this.sendResponse(res, 200, {
                success: true,
                message: `Tìm kiếm users thành công. Tìm thấy ${result.total} kết quả`,
                data: {
                    users: safeUsers,
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
                        role: role || 'all',
                        is_active: isActive || 'all'
                    }
                }
            });

        } catch (error) {
            console.error('Error in searchUsersHandler:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server',
                error: 'Lỗi khi tìm kiếm users: ' + error.message
            });
        }
    }

    async searchUsers(criteria) {
        try {
            const result = await this.userModel.search(criteria);
            return result || { users: [], total: 0 };
        } catch (error) {
            console.error('Error searching users:', error);
            throw error;
        }
    }
}

module.exports = UserController;
