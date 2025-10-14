import apiService from './api.js';

const classService = {
  getAllClasses: () => apiService.get('/api/classes'),
  getClassById: (id) => apiService.get(`/api/classes/${id}`),
  createClass: (data) => apiService.post('/api/classes', data),
  updateClass: (id, data) => apiService.put(`/api/classes/${id}`, data),
  deleteClass: (id) => apiService.delete(`/api/classes/${id}`)
};

export default classService;