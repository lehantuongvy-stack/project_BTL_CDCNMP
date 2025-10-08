import apiService from './api.js';

const reportService = {
  getAllReports: () => apiService.get('/api/nutritionrp'),
  getReportById: (id) => apiService.get(`/api/nutritionrp/${id}`),
  createReport: (data) => apiService.post('/api/nutritionrp', data),
  deleteReport: (id) => apiService.delete(`/api/nutritionrp/${id}`),
  searchReports: (query) => apiService.get(`/api/nutritionrp/search?${query}`)
};

export default reportService;

