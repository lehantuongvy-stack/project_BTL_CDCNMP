const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

class AuthService {
  constructor(db) {
    this.db = db;
    this.jwtSecret = process.env.JWT_SECRET || 'kindergarten_secret_key';
    this.jwtExpiry = process.env.JWT_EXPIRY || '24h';
  }

  async register(userData) {
    const { username, email, password, fullName, role = 'teacher', phone } = userData;
    
    if (!username || !email || !password || !fullName) {
      return { success: false, message: 'Thiếu thông tin bắt buộc' };
    }

    const existingUser = await this.db.findWhere('users', { email });
    if (existingUser.length > 0) {
      return { success: false, message: 'Email đã được sử dụng' };
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = {
      id: uuidv4(),
      username, email, password_hash: passwordHash, full_name: fullName,
      role, phone, is_active: true, created_at: new Date(), updated_at: new Date()
    };

    const result = await this.db.create('users', newUser);
    if (result.affectedRows > 0) {
      const token = this.generateToken({ id: newUser.id, username, email, role });
      return {
        success: true, message: 'Đăng ký thành công',
        data: { user: { id: newUser.id, username, email, fullName, role }, token }
      };
    }
    return { success: false, message: 'Đăng ký thất bại' };
  }

  async login(credentials) {
    const { email, password } = credentials;
    if (!email || !password) {
      return { success: false, message: 'Email và password không được để trống' };
    }

    const users = await this.db.findWhere('users', { email, is_active: true });
    if (users.length === 0) {
      return { success: false, message: 'Email hoặc password không đúng' };
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return { success: false, message: 'Email hoặc password không đúng' };
    }

    const token = this.generateToken({ id: user.id, username: user.username, email: user.email, role: user.role });
    await this.db.updateById('users', user.id, { updated_at: new Date() });

    return {
      success: true, message: 'Đăng nhập thành công',
      data: {
        user: { id: user.id, username: user.username, email: user.email, fullName: user.full_name, role: user.role },
        token
      }
    };
  }

  async getProfile(token) {
    if (!token) return { success: false, message: 'Token không được cung cấp' };

    try {
      const decoded = jwt.verify(token, this.jwtSecret);
      const user = await this.db.findById('users', decoded.id);
      if (!user || !user.is_active) {
        return { success: false, message: 'User không tồn tại hoặc đã bị vô hiệu hóa' };
      }

      return {
        success: true,
        data: {
          user: {
            id: user.id, username: user.username, email: user.email,
            fullName: user.full_name, role: user.role, phone: user.phone, address: user.address
          }
        }
      };
    } catch (error) {
      return { success: false, message: error.name === 'TokenExpiredError' ? 'Token đã hết hạn' : 'Token không hợp lệ' };
    }
  }

  generateToken(payload) {
    return jwt.sign(payload, this.jwtSecret, { expiresIn: this.jwtExpiry });
  }

  verifyToken(token) {
    return jwt.verify(token, this.jwtSecret);
  }

  async authenticate(token) {
    if (!token) return { success: false, message: 'Token không được cung cấp' };

    try {
      const decoded = this.verifyToken(token);
      const user = await this.db.findById('users', decoded.id);
      if (!user || !user.is_active) {
        return { success: false, message: 'User không tồn tại hoặc đã bị vô hiệu hóa' };
      }
      return { success: true, user: { id: user.id, username: user.username, email: user.email, role: user.role } };
    } catch (error) {
      return { success: false, message: 'Token không hợp lệ hoặc đã hết hạn' };
    }
  }

  async changePassword(userId, oldPassword, newPassword) {
    const user = await this.db.findById('users', userId);
    if (!user) return { success: false, message: 'User không tồn tại' };

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isOldPasswordValid) return { success: false, message: 'Mật khẩu cũ không đúng' };

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await this.db.updateById('users', userId, { password_hash: newPasswordHash, updated_at: new Date() });
    return { success: true, message: 'Đổi mật khẩu thành công' };
  }
}

module.exports = AuthService;
