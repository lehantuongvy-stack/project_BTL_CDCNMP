import apiService from './api.js';

const userService = {
  getAllUsers: () => apiService.get('/api/users'),
  getUserById: (id) => apiService.get(`/api/users/${id}`),
  getUsersByRole: (role) => apiService.get(`/api/users?role=${role}`),
  getUserStats: () => apiService.get('/api/users/stats'),
  createUser: (data) => apiService.post('/api/users', data),
  updateUser: (id, data) => apiService.put(`/api/users/${id}`, data),
  deleteUser: (id) => apiService.delete(`/api/users/${id}`),
  searchUsers: (query) => apiService.get(`/api/users/search?${query}`)
};

export default userService;