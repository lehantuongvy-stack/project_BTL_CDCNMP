/**
 * Authentication Service
 * Xử lý đăng ký, đăng nhập và xác thực người dùng
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

class AuthService {
    constructor(db) {
        this.db = db;
        this.jwtSecret = process.env.JWT_SECRET || 'kindergarten_secret_key';
        this.jwtExpiry = process.env.JWT_EXPIRY || '24h';
    }

    // Đăng ký người dùng mới
    async register(userData) {
        try {
            const { username, email, password, fullName, role = 'teacher', phone } = userData;

            // Validation
            if (!username || !email || !password || !fullName) {
                return {
                    success: false,
                    message: 'Thiếu thông tin bắt buộc'
                };
            }

            // Kiểm tra email đã tồn tại
            const existingUser = await this.db.findWhere('users', { email });
            if (existingUser.length > 0) {
                return {
                    success: false,
                    message: 'Email đã được sử dụng'
                };
            }

            // Kiểm tra username đã tồn tại
            const existingUsername = await this.db.findWhere('users', { username });
            if (existingUsername.length > 0) {
                return {
                    success: false,
                    message: 'Username đã được sử dụng'
                };
            }

            // Hash password
            const saltRounds = 10;
            const passwordHash = await bcrypt.hash(password, saltRounds);

            // Tạo user mới
            const newUser = {
                id: uuidv4(),
                username,
                email,
                password_hash: passwordHash,
                full_name: fullName,
                role,
                phone,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            };

            const result = await this.db.create('users', newUser);

            if (result.affectedRows > 0) {
                // Tạo token
                const token = this.generateToken({ 
                    id: newUser.id, 
                    username, 
                    email, 
                    role 
                });

                return {
                    success: true,
                    message: 'Đăng ký thành công',
                    data: {
                        user: {
                            id: newUser.id,
                            username,
                            email,
                            fullName,
                            role
                        },
                        token
                    }
                };
            } else {
                return {
                    success: false,
                    message: 'Đăng ký thất bại'
                };
            }

        } catch (error) {
            console.error('❌ Registration error:', error);
            return {
                success: false,
                message: 'Lỗi server khi đăng ký'
            };
        }
    }

    // Đăng nhập
    async login(credentials) {
        try {
            const { email, password } = credentials;

            // Validation
            if (!email || !password) {
                return {
                    success: false,
                    message: 'Email và password không được để trống'
                };
            }

            // Tìm user theo email
            const users = await this.db.findWhere('users', { email, is_active: true });
            if (users.length === 0) {
                return {
                    success: false,
                    message: 'Email hoặc password không đúng'
                };
            }

            const user = users[0];

            // Kiểm tra password
            const isPasswordValid = await bcrypt.compare(password, user.password_hash);
            if (!isPasswordValid) {
                return {
                    success: false,
                    message: 'Email hoặc password không đúng'
                };
            }

            // Tạo token
            const token = this.generateToken({
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            });

            // Cập nhật last login (nếu có trường này)
            await this.db.updateById('users', user.id, {
                updated_at: new Date()
            });

            return {
                success: true,
                message: 'Đăng nhập thành công',
                data: {
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        fullName: user.full_name,
                        role: user.role
                    },
                    token
                }
            };

        } catch (error) {
            console.error('❌ Login error:', error);
            return {
                success: false,
                message: 'Lỗi server khi đăng nhập'
            };
        }
    }

    // Lấy thông tin profile từ token
    async getProfile(token) {
        try {
            if (!token) {
                return {
                    success: false,
                    message: 'Token không được cung cấp'
                };
            }

            // Verify token
            const decoded = jwt.verify(token, this.jwtSecret);
            
            // Tìm user trong database
            const user = await this.db.findById('users', decoded.id);
            if (!user || !user.is_active) {
                return {
                    success: false,
                    message: 'User không tồn tại hoặc đã bị vô hiệu hóa'
                };
            }

            return {
                success: true,
                data: {
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        fullName: user.full_name,
                        role: user.role,
                        phone: user.phone,
                        address: user.address
                    }
                }
            };

        } catch (error) {
            if (error.name === 'JsonWebTokenError') {
                return {
                    success: false,
                    message: 'Token không hợp lệ'
                };
            } else if (error.name === 'TokenExpiredError') {
                return {
                    success: false,
                    message: 'Token đã hết hạn'
                };
            }

            console.error('❌ Get profile error:', error);
            return {
                success: false,
                message: 'Lỗi server khi lấy thông tin profile'
            };
        }
    }

    // Tạo JWT token
    generateToken(payload) {
        return jwt.sign(payload, this.jwtSecret, { 
            expiresIn: this.jwtExpiry 
        });
    }

    // Verify JWT token
    verifyToken(token) {
        try {
            return jwt.verify(token, this.jwtSecret);
        } catch (error) {
            throw error;
        }
    }

    // Middleware để xác thực request
    async authenticate(token) {
        try {
            if (!token) {
                return {
                    success: false,
                    message: 'Token không được cung cấp'
                };
            }

            const decoded = this.verifyToken(token);
            const user = await this.db.findById('users', decoded.id);
            
            if (!user || !user.is_active) {
                return {
                    success: false,
                    message: 'User không tồn tại hoặc đã bị vô hiệu hóa'
                };
            }

            return {
                success: true,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                }
            };

        } catch (error) {
            return {
                success: false,
                message: 'Token không hợp lệ hoặc đã hết hạn'
            };
        }
    }

    // Đổi mật khẩu
    async changePassword(userId, oldPassword, newPassword) {
        try {
            // Tìm user
            const user = await this.db.findById('users', userId);
            if (!user) {
                return {
                    success: false,
                    message: 'User không tồn tại'
                };
            }

            // Kiểm tra mật khẩu cũ
            const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password_hash);
            if (!isOldPasswordValid) {
                return {
                    success: false,
                    message: 'Mật khẩu cũ không đúng'
                };
            }

            // Hash mật khẩu mới
            const saltRounds = 10;
            const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

            // Cập nhật mật khẩu
            await this.db.updateById('users', userId, {
                password_hash: newPasswordHash,
                updated_at: new Date()
            });

            return {
                success: true,
                message: 'Đổi mật khẩu thành công'
            };

        } catch (error) {
            console.error('❌ Change password error:', error);
            return {
                success: false,
                message: 'Lỗi server khi đổi mật khẩu'
            };
        }
    }
}

module.exports = AuthService;
