/**
 * User Service
 * Xử lý các API calls liên quan đến user management
 */

class UserService {
  constructor() {
    this.baseURL = 'http://localhost:3002/api/users';
  }

  // Helper method to make HTTP requests
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`
      };
    }

    console.log('🔥 UserService Request:', {
      url,
      method: config.method || 'GET',
      headers: config.headers
    });

    try {
      const response = await fetch(url, config);
      
      console.log('📡 UserService Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ UserService Response error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText || 'Server error'}`);
      }

      const data = await response.json();
      console.log('✅ UserService Response data:', data);

      return data;
    } catch (error) {
      console.error('💥 UserService Request failed:', error);
      throw error;
    }
  }

  // Lấy thống kê users theo role
  async getUserStats() {
    try {
      console.log('📊 Getting user statistics...');
      const response = await this.request('/stats');
      return response;
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }

  // Lấy danh sách users theo role
  async getUsersByRole(role) {
    try {
      console.log(`👥 Getting users with role: ${role}`);
      const response = await this.request(`?role=${role}`);
      return response;
    } catch (error) {
      console.error(`Error getting users by role ${role}:`, error);
      throw error;
    }
  }

  // Lấy tất cả users
  async getAllUsers() {
    try {
      console.log('👥 Getting all users...');
      const response = await this.request('');
      return response;
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }
}

const userService = new UserService();
export default userService;