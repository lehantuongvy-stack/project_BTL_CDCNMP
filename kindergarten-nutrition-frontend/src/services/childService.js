import apiService from './api.js';

class ChildService {
  // Lấy danh sách tất cả trẻ em
  async getAllChildren(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString ? `/api/children?${queryString}` : '/api/children';
      
      const response = await apiService.get(endpoint);
      return response;
    } catch (error) {
      console.error('Get all children error:', error);
      throw error;
    }
  }

  // Lấy trẻ em theo class ID
  async getChildrenByClass(classId, params = {}) {
    try {
      const queryParams = { ...params, class_id: classId };
      const queryString = new URLSearchParams(queryParams).toString();
      
      const response = await apiService.get(`/api/children?${queryString}`);
      return response;
    } catch (error) {
      console.error('Get children by class error:', error);
      throw error;
    }
  }

  // Lấy thống kê tổng số trẻ em
  async getChildrenStats() {
    try {
      const response = await apiService.get('/api/children/stats');
      return response;
    } catch (error) {
      console.error('Get children stats error:', error);
      throw error;
    }
  }

  // Lấy chi tiết 1 trẻ em
  async getChildById(childId) {
    try {
      const response = await apiService.get(`/api/children/${childId}`);
      return response;
    } catch (error) {
      console.error('Get child by ID error:', error);
      throw error;
    }
  }

  // Tạo trẻ em mới
  async createChild(childData) {
    try {
      const response = await apiService.post('/api/children', childData);
      return response;
    } catch (error) {
      console.error('Create child error:', error);
      throw error;
    }
  }

  // Cập nhật thông tin trẻ em
  async updateChild(childId, childData) {
    try {
      console.log('🔧 childService.updateChild called with:');
      console.log('🔧 childId:', childId, 'type:', typeof childId);
      console.log('🔧 childData:', childData, 'type:', typeof childData);
      console.log('🔧 childData stringified:', JSON.stringify(childData));
      console.log('🔧 childData keys:', Object.keys(childData));
      console.log('🔧 childData values:', Object.values(childData));
      
      const response = await apiService.put(`/api/children/${childId}`, childData);
      console.log('🔧 childService.updateChild response:', response);
      return response;
    } catch (error) {
      console.error('Update child error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  }

  // Lấy danh sách học sinh của teacher đang đăng nhập
  async getMyClassChildren() {
    try {
      const response = await apiService.get('/api/children/my-class');
      return response;
    } catch (error) {
      console.error('Get my class children error:', error);
      throw error;
    }
  }

  // Xóa trẻ em
  async deleteChild(childId) {
    try {
      const response = await apiService.delete(`/api/children/${childId}`);
      return response;
    } catch (error) {
      console.error('Delete child error:', error);
      throw error;
    }
  }

  // Tìm kiếm trẻ em với bộ lọc
  async searchChildren(queryString) {
    try {
      const response = await apiService.get(`/api/children/search?${queryString}`);
      return response;
    } catch (error) {
      console.error('Search children error:', error);
      throw error;
    }
  }

  // Lấy trẻ em có dị ứng
  async getChildrenWithAllergies() {
    try {
      const response = await apiService.get('/api/children/allergies');
      return response;
    } catch (error) {
      console.error('Get children with allergies error:', error);
      throw error;
    }
  }

  // Lấy thống kê trẻ em theo lớp
  async getChildrenStatsByClass() {
    try {
      const response = await apiService.get('/api/children/stats/class');
      return response;
    } catch (error) {
      console.error('Get children stats by class error:', error);
      throw error;
    }
  }

  // Lấy danh sách sinh nhật trong tháng
  async getBirthdaysInMonth(month, year = null) {
    try {
      const params = new URLSearchParams({ month: month.toString() });
      if (year) {
        params.append('year', year.toString());
      }
      
      const response = await apiService.get(`/api/children/birthdays?${params.toString()}`);
      return response;
    } catch (error) {
      console.error('Get birthdays in month error:', error);
      throw error;
    }
  }

  // Cập nhật thông tin trẻ em
  async updateChild(id, childData) {
    try {
      const response = await apiService.put(`/api/children/${id}`, childData);
      return response;
    } catch (error) {
      console.error('Update child error:', error);
      throw error;
    }
  }

  // Xóa trẻ em
  async deleteChild(id) {
    try {
      const response = await apiService.delete(`/api/children/${id}`);
      return response;
    } catch (error) {
      console.error('Delete child error:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const childService = new ChildService();
export default childService;
