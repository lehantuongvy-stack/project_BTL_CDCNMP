import apiService from './api.js';

const healthService = {
  createHealthAssessment: (data) => apiService.post('/api/nutrition/records', data),
  getHealthAssessmentsByChild: (childId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString 
      ? `/api/nutrition/child/${childId}/records?${queryString}` 
      : `/api/nutrition/child/${childId}/records`;
    return apiService.get(endpoint);
  },
  getHealthAssessmentById: (id) => apiService.get(`/api/nutrition/records/${id}`),
  updateHealthAssessment: (id, data) => apiService.put(`/api/nutrition/records/${id}`, data),
  deleteHealthAssessment: (id) => apiService.delete(`/api/nutrition/records/${id}`),
  calculateBMI: (data) => apiService.post('/api/nutrition/calculate-bmi', data),
  getHealthAssessmentsByParent: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString 
      ? `/api/nutrition/parent/records?${queryString}` 
      : `/api/nutrition/parent/records`;
    return apiService.get(endpoint);
  }
};

export default healthService;