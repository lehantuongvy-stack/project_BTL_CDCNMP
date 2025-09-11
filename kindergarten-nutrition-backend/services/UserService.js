/**
 * User Service
 * Quản lý thông tin người dùng
 */

class UserService {
    constructor(db) {
        this.db = db;
    }

    // Lấy tất cả người dùng
    async getAllUsers() {
        try {
            const users = await this.db.select(`
                SELECT 
                    id, username, email, full_name, role, phone, address, 
                    is_active, created_at, updated_at
                FROM users 
                WHERE is_active = true
                ORDER BY created_at DESC
            `);

            return {
                success: true,
                data: users,
                count: users.length
            };
        } catch (error) {
            console.error('❌ Get all users error:', error);
            return {
                success: false,
                message: 'Lỗi khi lấy danh sách người dùng'
            };
        }
    }

    // Lấy thông tin user theo ID
    async getUserById(userId) {
        try {
            const user = await this.db.findById('users', userId);
            
            if (!user || !user.is_active) {
                return {
                    success: false,
                    message: 'Người dùng không tồn tại'
                };
            }

            // Loại bỏ password_hash khỏi response
            const { password_hash, ...userInfo } = user;

            return {
                success: true,
                data: userInfo
            };
        } catch (error) {
            console.error('❌ Get user by ID error:', error);
            return {
                success: false,
                message: 'Lỗi khi lấy thông tin người dùng'
            };
        }
    }

    // Cập nhật thông tin user
    async updateUser(userId, updateData) {
        try {
            const allowedFields = ['full_name', 'phone', 'address'];
            const filteredData = {};
            
            // Chỉ cho phép cập nhật một số trường nhất định
            for (const field of allowedFields) {
                if (updateData[field] !== undefined) {
                    filteredData[field] = updateData[field];
                }
            }

            if (Object.keys(filteredData).length === 0) {
                return {
                    success: false,
                    message: 'Không có dữ liệu để cập nhật'
                };
            }

            filteredData.updated_at = new Date();

            const result = await this.db.updateById('users', userId, filteredData);

            if (result.affectedRows > 0) {
                return {
                    success: true,
                    message: 'Cập nhật thông tin thành công'
                };
            } else {
                return {
                    success: false,
                    message: 'Không tìm thấy người dùng để cập nhật'
                };
            }
        } catch (error) {
            console.error('❌ Update user error:', error);
            return {
                success: false,
                message: 'Lỗi khi cập nhật thông tin người dùng'
            };
        }
    }

    // Lấy danh sách theo role
    async getUsersByRole(role) {
        try {
            const users = await this.db.findWhere('users', { 
                role, 
                is_active: true 
            }, 'created_at DESC');

            return {
                success: true,
                data: users.map(user => {
                    const { password_hash, ...userInfo } = user;
                    return userInfo;
                }),
                count: users.length
            };
        } catch (error) {
            console.error('❌ Get users by role error:', error);
            return {
                success: false,
                message: 'Lỗi khi lấy danh sách người dùng theo vai trò'
            };
        }
    }

    // Vô hiệu hóa user (soft delete)
    async deactivateUser(userId) {
        try {
            const result = await this.db.updateById('users', userId, {
                is_active: false,
                updated_at: new Date()
            });

            if (result.affectedRows > 0) {
                return {
                    success: true,
                    message: 'Vô hiệu hóa người dùng thành công'
                };
            } else {
                return {
                    success: false,
                    message: 'Không tìm thấy người dùng'
                };
            }
        } catch (error) {
            console.error('❌ Deactivate user error:', error);
            return {
                success: false,
                message: 'Lỗi khi vô hiệu hóa người dùng'
            };
        }
    }

    // Kích hoạt lại user
    async activateUser(userId) {
        try {
            const result = await this.db.updateById('users', userId, {
                is_active: true,
                updated_at: new Date()
            });

            if (result.affectedRows > 0) {
                return {
                    success: true,
                    message: 'Kích hoạt người dùng thành công'
                };
            } else {
                return {
                    success: false,
                    message: 'Không tìm thấy người dùng'
                };
            }
        } catch (error) {
            console.error('❌ Activate user error:', error);
            return {
                success: false,
                message: 'Lỗi khi kích hoạt người dùng'
            };
        }
    }

    // Tìm kiếm người dùng
    async searchUsers(searchTerm) {
        try {
            const users = await this.db.select(`
                SELECT 
                    id, username, email, full_name, role, phone, 
                    is_active, created_at
                FROM users 
                WHERE is_active = true 
                AND (
                    full_name LIKE ? OR 
                    email LIKE ? OR 
                    username LIKE ?
                )
                ORDER BY full_name ASC
            `, [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]);

            return {
                success: true,
                data: users,
                count: users.length
            };
        } catch (error) {
            console.error('❌ Search users error:', error);
            return {
                success: false,
                message: 'Lỗi khi tìm kiếm người dùng'
            };
        }
    }

    // Thống kê người dùng theo role
    async getUserStats() {
        try {
            const stats = await this.db.select(`
                SELECT 
                    role,
                    COUNT(*) as count,
                    SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_count
                FROM users 
                GROUP BY role
                ORDER BY role
            `);

            return {
                success: true,
                data: stats
            };
        } catch (error) {
            console.error('❌ Get user stats error:', error);
            return {
                success: false,
                message: 'Lỗi khi lấy thống kê người dùng'
            };
        }
    }
}

module.exports = UserService;
