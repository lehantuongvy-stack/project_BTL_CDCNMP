import apiService from './api.js';

class HealthService {
  // Tạo đánh giá sức khỏe mới
  async createHealthAssessment(assessmentData) {
    try {
      const response = await apiService.post('/api/nutrition/records', assessmentData);
      return response;
    } catch (error) {
      console.error('Create health assessment error:', error);
      throw error;
    }
  }

  // Lấy đánh giá sức khỏe theo child ID
  async getHealthAssessmentsByChild(childId, params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString 
        ? `/api/nutrition/child/${childId}/records?${queryString}` 
        : `/api/nutrition/child/${childId}/records`;
      
      const response = await apiService.get(endpoint);
      return response;
    } catch (error) {
      console.error('Get health assessments by child error:', error);
      throw error;
    }
  }

  // Lấy đánh giá sức khỏe theo ID
  async getHealthAssessmentById(assessmentId) {
    try {
      const response = await apiService.get(`/api/nutrition/records/${assessmentId}`);
      return response;
    } catch (error) {
      console.error('Get health assessment by ID error:', error);
      throw error;
    }
  }

  // Cập nhật đánh giá sức khỏe
  async updateHealthAssessment(assessmentId, assessmentData) {
    try {
      const response = await apiService.put(`/api/nutrition/records/${assessmentId}`, assessmentData);
      return response;
    } catch (error) {
      console.error('Update health assessment error:', error);
      throw error;
    }
  }

  // Xóa đánh giá sức khỏe
  async deleteHealthAssessment(assessmentId) {
    try {
      const response = await apiService.delete(`/api/nutrition/records/${assessmentId}`);
      return response;
    } catch (error) {
      console.error('Delete health assessment error:', error);
      throw error;
    }
  }

  // Tính BMI
  async calculateBMI(bmiData) {
    try {
      const response = await apiService.post('/api/nutrition/calculate-bmi', bmiData);
      return response;
    } catch (error) {
      console.error('Calculate BMI error:', error);
      throw error;
    }
  }

  // Lấy đánh giá sức khỏe theo phụ huynh (cho parent xem)
  async getHealthAssessmentsByParent(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString 
        ? `/api/nutrition/parent/records?${queryString}` 
        : `/api/nutrition/parent/records`;
      
      const response = await apiService.get(endpoint);
      return response;
    } catch (error) {
      console.error('Get health assessments by parent error:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const healthService = new HealthService();
export default healthService;