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
            console.log('Login request received:');
            console.log('Body:', req.body);
            console.log('Headers:', req.headers);
            
            const { username, password, email } = req.body;

            console.log('Extracted values:');
            console.log('username:', username);
            console.log('password:', password ? '[HIDDEN]' : 'undefined');
            console.log('email:', email);

            // Validate input - có thể dùng username hoặc email
            if ((!username || username.trim() === '') && (!email || email.trim() === '')) {
                console.log('Validation failed: No username or email');
                return this.sendResponse(res, 400, {
                    success: false,
                    message: 'Username/email là bắt buộc'
                });
            }

            if (!password || password.trim() === '') {
                console.log('Validation failed: No password');
                return this.sendResponse(res, 400, {
                    success: false,
                    message: 'Password là bắt buộc'
                });
            }

            console.log(' Validation passed, searching for user...');

            // Tìm user bằng username hoặc email
            let user;
            if (email && email.trim() !== '') {
                console.log(' Searching by email:', email);
                user = await this.userModel.findByEmail(email.trim());
            } else if (username && username.trim() !== '') {
                console.log(' Searching by username:', username);
                user = await this.userModel.findByUsername(username.trim());
            }
            
            if (!user) {
                console.log(' User not found');
                return this.sendResponse(res, 401, {
                    success: false,
                    message: 'Tên đăng nhập hoặc mật khẩu không đúng'
                });
            }

            console.log(' User found:', { id: user.id, username: user.username, role: user.role });

            // Kiểm tra password
            const isValidPassword = await bcrypt.compare(password, user.password_hash);
            if (!isValidPassword) {
                console.log(' Invalid password');
                return this.sendResponse(res, 401, {
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
                process.env.JWT_SECRET || 'kindergarten_secret_key_2024',
                { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
            );

            this.sendResponse(res, 200, {
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
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server khi đăng nhập',
                error: error.message
            });
        }
    }

    // Send response helper
    sendResponse(res, statusCode, data) {
        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
    }

    // Đăng ký (chỉ admin)
    async register(req, res) {
        try {
            const { username, password, full_name, email, phone_number, role, class_id } = req.body;

            console.log(' === BACKEND REGISTER DEBUG START ===');
            console.log(' Request body:', req.body);
            console.log(' Role:', role);
            console.log(' Class_id:', class_id);
            console.log(' Class_id type:', typeof class_id);
            console.log(' Class_id length:', class_id?.length);
            console.log(' === BACKEND REGISTER DEBUG END ===');

            // Validate input
            if (!username || !password || !full_name || !role) {
                return this.sendResponse(res, 400, {
                    success: false,
                    message: 'Username, password, full_name và role là bắt buộc'
                });
            }

            // Validate class_id for teachers
            if (role === 'teacher' && !class_id) {
                return this.sendResponse(res, 400, {
                    success: false,
                    message: 'Class_id là bắt buộc cho giáo viên'
                });
            }

            // Kiểm tra quyền admin
            if (req.user.role !== 'admin') {
                return this.sendResponse(res, 403, {
                    success: false,
                    message: 'Chỉ admin mới có thể tạo tài khoản'
                });
            }

            // Kiểm tra username đã tồn tại
            const existingUser = await this.userModel.findByUsername(username);
            if (existingUser) {
                return this.sendResponse(res, 400, {
                    success: false,
                    message: 'Username đã tồn tại'
                });
            }

            // Kiểm tra email đã tồn tại
            if (email) {
                const existingEmail = await this.userModel.findByEmail(email);
                if (existingEmail) {
                    return this.sendResponse(res, 400, {
                        success: false,
                        message: 'Email đã tồn tại'
                    });
                }
            }

            // Hash password
            const saltRounds = 10;
            const password_hash = await bcrypt.hash(password, saltRounds);

            // Set class_id for teachers, null for parents
            const finalClassId = (role === 'teacher' && class_id && class_id.trim() !== '') ? class_id : null;
            
            console.log(' Final class_id to save:', finalClassId);

            // Tạo user mới
            const newUser = await this.userModel.create({
                username,
                password_hash,
                full_name,
                email,
                phone_number,
                role,
                class_id: finalClassId
            });

            this.sendResponse(res, 201, {
                success: true,
                message: 'Tạo tài khoản thành công',
                data: {
                    user: {
                        id: newUser.id,
                        username: newUser.username,
                        full_name: newUser.full_name,
                        email: newUser.email,
                        phone_number: newUser.phone_number,
                        role: newUser.role,
                        class_id: newUser.class_id
                    }
                }
            });

        } catch (error) {
            console.error('Register error:', error);
            this.sendResponse(res, 500, {
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
                return this.sendResponse(res, 404, {
                    success: false,
                    message: 'Không tìm thấy thông tin user'
                });
            }

            this.sendResponse(res, 200, {
                success: true,
                data: { user }
            });

        } catch (error) {
            console.error('Get current user error:', error);
            this.sendResponse(res, 500, {
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
                return this.sendResponse(res, 400, {
                    success: false,
                    message: 'Current password và new password là bắt buộc'
                });
            }

            // Lấy thông tin user hiện tại
            const user = await this.userModel.findByUsername(req.user.username);
            if (!user) {
                return this.sendResponse(res, 404, {
                    success: false,
                    message: 'Không tìm thấy user'
                });
            }

            // Kiểm tra mật khẩu hiện tại
            const isValidPassword = await bcrypt.compare(current_password, user.password_hash);
            if (!isValidPassword) {
                return this.sendResponse(res, 400, {
                    success: false,
                    message: 'Mật khẩu hiện tại không đúng'
                });
            }

            // Hash mật khẩu mới
            const saltRounds = 10;
            const newPasswordHash = await bcrypt.hash(new_password, saltRounds);

            // Cập nhật mật khẩu
            await this.userModel.updatePassword(req.user.id, newPasswordHash);

            this.sendResponse(res, 200, {
                success: true,
                message: 'Đổi mật khẩu thành công'
            });

        } catch (error) {
            console.error('Change password error:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server khi đổi mật khẩu',
                error: error.message
            });
        }
    }

    // Verify token (middleware)
    async verifyToken(token) {
        try {
            console.log(' Verifying token with secret:', process.env.JWT_SECRET || 'kindergarten_secret_key_2024');
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'kindergarten_secret_key_2024');
            console.log(' Token decoded:', decoded);
            
            const user = await this.userModel.findById(decoded.id);
            console.log(' User found by ID:', user);
            
            if (!user) {
                console.log(' No user found with ID:', decoded.id);
                return null;
            }

            return {
                id: user.id,
                username: user.username,
                full_name: user.full_name,
                role: user.role
            };
        } catch (error) {
            console.error(' Token verification error:', error.message);
            return null;
        }
    }

    // Verify token from request - used by route handlers
    async verifyTokenFromRequest(req) {
        try {
            console.log(' Auth headers:', req.headers.authorization);
            const authHeader = req.headers.authorization;
            
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                console.log(' No valid auth header found');
                return {
                    success: false,
                    message: 'Access token is required'
                };
            }

            const token = authHeader.substring(7);
            console.log(' Extracted token:', token ? 'Token found' : 'No token');
            console.log(' Token type:', typeof token);
            console.log(' Token length:', token ? token.length : 0);
            
            const user = await this.verifyToken(token);

            if (!user) {
                return {
                    success: false,
                    message: 'Invalid or expired token'
                };
            }

            return {
                success: true,
                user: user
            };
        } catch (error) {
            console.error(' Token verification from request error:', error.message);
            return {
                success: false,
                message: 'Authentication error',
                error: error.message
            };
        }
    }

    // Middleware authentication - Không sử dụng trong Pure Node.js
    authenticate() {
        return async (req, res, next) => {
            try {
                const authHeader = req.headers.authorization;
                
                if (!authHeader || !authHeader.startsWith('Bearer ')) {
                    return this.sendResponse(res, 401, {
                        success: false,
                        message: 'Access token is required'
                    });
                }

                const token = authHeader.substring(7);
                const user = await this.verifyToken(token);

                if (!user) {
                    return this.sendResponse(res, 401, {
                        success: false,
                        message: 'Invalid or expired token'
                    });
                }

                req.user = user;
                next();
            } catch (error) {
                console.error('Authentication error:', error);
                this.sendResponse(res, 500, {
                    success: false,
                    message: 'Authentication error',
                    error: error.message
                });
            }
        };
    }

    // Middleware authorization - Không sử dụng trong Pure Node.js
    authorize(roles = []) {
        return (req, res, next) => {
            if (!req.user) {
                return this.sendResponse(res, 401, {
                    success: false,
                    message: 'User not authenticated'
                });
            }

            if (roles.length > 0 && !roles.includes(req.user.role)) {
                return this.sendResponse(res, 403, {
                    success: false,
                    message: 'Insufficient permissions'
                });
            }

            next();
        };
    }

    // Đăng xuất
    async logoutHandler(req, res) {
        try {
            console.log(' Logout request received');
            
            // Get user info from JWT token (set by auth middleware)
            const userId = req.user?.id;
            const username = req.user?.username;
            
            if (!userId) {
                return this.sendResponse(res, 401, {
                    success: false,
                    message: 'Không tìm thấy thông tin người dùng trong token'
                });
            }

            // Get token from Authorization header
            const authHeader = req.headers.authorization;
            const token = authHeader?.split(' ')[1]; // Bearer TOKEN

            console.log(' Logging out user:', username, 'ID:', userId);

            // Perform logout logic (could blacklist token, update last_logout, etc.)
            const logoutResult = await this.logout(userId, token);
            
            if (!logoutResult.success) {
                return this.sendResponse(res, 400, {
                    success: false,
                    message: logoutResult.message
                });
            }

            this.sendResponse(res, 200, {
                success: true,
                message: 'Đăng xuất thành công',
                data: {
                    logged_out_at: new Date().toISOString(),
                    user_id: userId,
                    username: username
                }
            });

        } catch (error) {
            console.error('Error in logoutHandler:', error);
            this.sendResponse(res, 500, {
                success: false,
                message: 'Lỗi server',
                error: 'Lỗi khi đăng xuất: ' + error.message
            });
        }
    }

    async logout(userId, token) {
        try {
            console.log(' User logout completed:', userId);

            return {
                success: true,
                message: 'Đăng xuất thành công'
            };

        } catch (error) {
            console.error('Error in logout:', error);
            return {
                success: false,
                message: 'Lỗi khi đăng xuất'
            };
        }
    }
}

module.exports = AuthController;

