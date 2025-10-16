import apiService from './api.js';

const authService = {
  login: async (credentials) => {
    const response = await apiService.post('/api/auth/login', credentials);
    if (response.success && response.data) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response;
    } else {
      throw new Error(response.message || 'Đăng nhập thất bại');
    }
  },
  
  register: (data) => apiService.post('/api/auth/register', data),
  
  logout: async () => {
    try {
      await apiService.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    }
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },
  
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
  
  isAuthenticated: () => {
    const token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('user');
    return !!(token && userStr);
  },
  
  getToken: () => localStorage.getItem('authToken'),
  
  fetchCurrentUser: async () => {
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
      authService.logout();
      return null;
    }
  },
  
  changePassword: (data) => apiService.post('/api/auth/change-password', data)
};

export default authService;