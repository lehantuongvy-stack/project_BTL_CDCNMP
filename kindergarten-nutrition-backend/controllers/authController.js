/**
 * Auth Controller
 * Xử lý logic authentication và authorization
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthController {
    constructor(db) {
        this.db = db;
        this.userModel = new User(db);
    }

    // Đăng nhập
    async login(req, res) {
        try {
            const { username, password } = req.body;

            // Validate input
            if (!username || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Username và password là bắt buộc'
                });
            }

            // Tìm user
            const user = await this.userModel.findByUsername(username);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Tên đăng nhập hoặc mật khẩu không đúng'
                });
            }

            // Kiểm tra password
            const isValidPassword = await bcrypt.compare(password, user.password_hash);
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Tên đăng nhập hoặc mật khẩu không đúng'
                });
            }

            // Tạo JWT token
            const token = jwt.sign(
                { 
                    id: user.id, 
                    username: user.username, 
                    role: user.role 
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRY || '24h' }
            );

            res.status(200).json({
                success: true,
                message: 'Đăng nhập thành công',
                data: {
                    token,
                    user: {
                        id: user.id,
                        username: user.username,
                        full_name: user.full_name,
                        email: user.email,
                        role: user.role
                    }
                }
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi đăng nhập',
                error: error.message
            });
        }
    }

    // Đăng ký (chỉ admin)
    async register(req, res) {
        try {
            const { username, password, full_name, email, phone_number, role } = req.body;

            // Validate input
            if (!username || !password || !full_name || !role) {
                return res.status(400).json({
                    success: false,
                    message: 'Username, password, full_name và role là bắt buộc'
                });
            }

            // Kiểm tra quyền admin
            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Chỉ admin mới có thể tạo tài khoản'
                });
            }

            // Kiểm tra username đã tồn tại
            const existingUser = await this.userModel.findByUsername(username);
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Username đã tồn tại'
                });
            }

            // Kiểm tra email đã tồn tại
            if (email) {
                const existingEmail = await this.userModel.findByEmail(email);
                if (existingEmail) {
                    return res.status(400).json({
                        success: false,
                        message: 'Email đã tồn tại'
                    });
                }
            }

            // Hash password
            const saltRounds = 10;
            const password_hash = await bcrypt.hash(password, saltRounds);

            // Tạo user mới
            const newUser = await this.userModel.create({
                username,
                password_hash,
                full_name,
                email,
                phone_number,
                role
            });

            res.status(201).json({
                success: true,
                message: 'Tạo tài khoản thành công',
                data: {
                    user: {
                        id: newUser.id,
                        username: newUser.username,
                        full_name: newUser.full_name,
                        email: newUser.email,
                        phone_number: newUser.phone_number,
                        role: newUser.role
                    }
                }
            });

        } catch (error) {
            console.error('Register error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi tạo tài khoản',
                error: error.message
            });
        }
    }

    // Lấy thông tin user hiện tại
    async getCurrentUser(req, res) {
        try {
            const user = await this.userModel.findById(req.user.id);
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy thông tin user'
                });
            }

            res.status(200).json({
                success: true,
                data: { user }
            });

        } catch (error) {
            console.error('Get current user error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi lấy thông tin user',
                error: error.message
            });
        }
    }

    // Đổi mật khẩu
    async changePassword(req, res) {
        try {
            const { current_password, new_password } = req.body;

            if (!current_password || !new_password) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password và new password là bắt buộc'
                });
            }

            // Lấy thông tin user hiện tại
            const user = await this.userModel.findByUsername(req.user.username);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy user'
                });
            }

            // Kiểm tra mật khẩu hiện tại
            const isValidPassword = await bcrypt.compare(current_password, user.password_hash);
            if (!isValidPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Mật khẩu hiện tại không đúng'
                });
            }

            // Hash mật khẩu mới
            const saltRounds = 10;
            const newPasswordHash = await bcrypt.hash(new_password, saltRounds);

            // Cập nhật mật khẩu
            await this.userModel.updatePassword(req.user.id, newPasswordHash);

            res.status(200).json({
                success: true,
                message: 'Đổi mật khẩu thành công'
            });

        } catch (error) {
            console.error('Change password error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi đổi mật khẩu',
                error: error.message
            });
        }
    }

    // Verify token (middleware)
    async verifyToken(token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await this.userModel.findById(decoded.id);
            
            if (!user) {
                return null;
            }

            return {
                id: user.id,
                username: user.username,
                full_name: user.full_name,
                role: user.role
            };
        } catch (error) {
            return null;
        }
    }

    // Middleware authentication
    authenticate() {
        return async (req, res, next) => {
            try {
                const authHeader = req.headers.authorization;
                
                if (!authHeader || !authHeader.startsWith('Bearer ')) {
                    return res.status(401).json({
                        success: false,
                        message: 'Access token is required'
                    });
                }

                const token = authHeader.substring(7);
                const user = await this.verifyToken(token);

                if (!user) {
                    return res.status(401).json({
                        success: false,
                        message: 'Invalid or expired token'
                    });
                }

                req.user = user;
                next();
            } catch (error) {
                console.error('Authentication error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Authentication error',
                    error: error.message
                });
            }
        };
    }

    // Middleware authorization
    authorize(roles = []) {
        return (req, res, next) => {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }

            if (roles.length > 0 && !roles.includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    message: 'Insufficient permissions'
                });
            }

            next();
        };
    }
}

module.exports = AuthController;
