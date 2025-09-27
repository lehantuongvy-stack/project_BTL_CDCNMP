import apiService from './api.js';

class AuthService {
  // Đăng nhập
  async login(credentials) {
    try {
      const response = await apiService.post('/api/auth/login', credentials);
      
      if (response.success && response.data) {
        // Lưu token và thông tin user vào localStorage
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        return response;
      } else {
        throw new Error(response.message || 'Đăng nhập thất bại');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Đăng ký (Admin only)
  async register(userData) {
    try {
      const response = await apiService.post('/api/auth/register', userData);
      
      if (response.success) {
        return response;
      } else {
        throw new Error(response.message || 'Đăng ký thất bại');
      }
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }

  // Đăng xuất
  async logout() {
    try {
      // Gọi API logout nếu cần
      await apiService.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout API error:', error);
      // Vẫn thực hiện logout local ngay cả khi API fail
    }
    
    // Luôn xóa thông tin local bất kể API có thành công hay không
    this.clearAuthData();
  }

  // Clear authentication data
  clearAuthData() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  // Lấy thông tin user hiện tại
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Kiểm tra xem user có đang đăng nhập không
  isAuthenticated() {
    const token = localStorage.getItem('authToken');
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  // Lấy token
  getToken() {
    return localStorage.getItem('authToken');
  }

  // Lấy thông tin user từ server
  async fetchCurrentUser() {
    try {
      const response = await apiService.get('/api/auth/me');
      if (response.success && response.data && response.data.user) {
        const userData = response.data.user;
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
      }
      return null;
    } catch (error) {
      console.error('Fetch current user error:', error);
      // Nếu token không hợp lệ, logout
      this.logout();
      return null;
    }
  }

  // Đổi mật khẩu
  async changePassword(passwordData) {
    try {
      const response = await apiService.post('/api/auth/change-password', passwordData);
      return response;
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  // Đăng ký (chỉ admin)
  async register(userData) {
    try {
      console.log(' Registering user with data:', userData);
      console.log(' Current auth token:', localStorage.getItem('authToken'));
      console.log(' Current user:', localStorage.getItem('user'));
      
      const response = await apiService.post('/api/auth/register', userData);
      console.log(' Registration response:', response);
      
      return response;
    } catch (error) {
      console.error(' Register error:', error);
      console.error(' Error message:', error.message);
      console.error(' Error stack:', error.stack);
      throw new Error(error.message || 'Lỗi khi tạo tài khoản');
    }
  }
}

// Create and export a singleton instance
const authService = new AuthService();
export default authService;