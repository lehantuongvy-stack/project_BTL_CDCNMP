import apiService from './api.js';

const parentFeedbackService = {
  createFeedback: (data) => apiService.post('/api/feedback', data),
  getMyFeedback: () => apiService.get('/api/feedback'),
  getAllFeedback: () => apiService.get('/api/feedback/all')
};

export default parentFeedbackService;
