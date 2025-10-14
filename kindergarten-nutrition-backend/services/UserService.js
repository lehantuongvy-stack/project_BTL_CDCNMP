class UserService {
  constructor(db) {
    this.db = db;
  }

  async getAllUsers() {
    const users = await this.db.select(`
      SELECT id, username, email, full_name, role, phone, address, is_active, created_at, updated_at
      FROM users WHERE is_active = true ORDER BY created_at DESC
    `);
    return { success: true, data: users, count: users.length };
  }

  async getUserById(userId) {
    const user = await this.db.findById('users', userId);
    if (!user || !user.is_active) {
      return { success: false, message: 'Người dùng không tồn tại' };
    }
    const { password_hash, ...userInfo } = user;
    return { success: true, data: userInfo };
  }

  async updateUser(userId, updateData) {
    const allowedFields = ['full_name', 'phone', 'address'];
    const filteredData = {};
    
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    }

    if (Object.keys(filteredData).length === 0) {
      return { success: false, message: 'Không có dữ liệu để cập nhật' };
    }

    filteredData.updated_at = new Date();
    const result = await this.db.updateById('users', userId, filteredData);
    
    return result.affectedRows > 0 
      ? { success: true, message: 'Cập nhật thông tin thành công' }
      : { success: false, message: 'Không tìm thấy người dùng để cập nhật' };
  }

  async getUsersByRole(role) {
    const users = await this.db.findWhere('users', { role, is_active: true }, 'created_at DESC');
    return {
      success: true,
      data: users.map(user => {
        const { password_hash, ...userInfo } = user;
        return userInfo;
      }),
      count: users.length
    };
  }

  async deactivateUser(userId) {
    const result = await this.db.updateById('users', userId, { is_active: false, updated_at: new Date() });
    return result.affectedRows > 0 
      ? { success: true, message: 'Vô hiệu hóa người dùng thành công' }
      : { success: false, message: 'Không tìm thấy người dùng' };
  }

  async activateUser(userId) {
    const result = await this.db.updateById('users', userId, { is_active: true, updated_at: new Date() });
    return result.affectedRows > 0 
      ? { success: true, message: 'Kích hoạt người dùng thành công' }
      : { success: false, message: 'Không tìm thấy người dùng' };
  }

  async searchUsers(searchTerm) {
    const users = await this.db.select(`
      SELECT id, username, email, full_name, role, phone, is_active, created_at
      FROM users 
      WHERE is_active = true AND (full_name LIKE ? OR email LIKE ? OR username LIKE ?)
      ORDER BY full_name ASC
    `, [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]);
    
    return { success: true, data: users, count: users.length };
  }

    // Thống kê người dùng theo role
    // async getUserStats() {
    //     try {
    //         const stats = await this.db.select(`
    //             SELECT 
    //                 role,
    //                 COUNT(*) as count,
    //                 SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_count
    //             FROM users 
    //             GROUP BY role
    //             ORDER BY role
    //         `);

    //         return {
    //             success: true,
    //             data: stats
    //         };
    //     } catch (error) {
    //         console.error('Get user stats error:', error);
    //         return {
    //             success: false,
    //             message: 'Lỗi khi lấy thống kê người dùng'
    //         };
    //     }
    // }
}

module.exports = UserService;
