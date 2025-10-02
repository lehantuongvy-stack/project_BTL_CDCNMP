import apiService from './api.js';

class MealService {
  /**
   * Lấy thông tin cơ bản của children cho parent (security filtering)
   * @returns {Promise} Thông tin children với nhom và class_id
   */
  async getChildrenBasicInfo() {
    try {
      console.log('[mealService] getChildrenBasicInfo for parent security');
      const response = await apiService.get('/api/children/basic-info');
      return response;
    } catch (error) {
      console.error('Error fetching children basic info:', error);
      throw new Error('Không thể tải thông tin con em. Vui lòng thử lại.');
    }
  }
  /**
   * Lấy thực đơn theo tuần cho phụ huynh (read-only) với parent security filtering
   * @param {string} startDate - Ngày bắt đầu tuần (YYYY-MM-DD)
   * @param {string} endDate - Ngày kết thúc tuần (YYYY-MM-DD) - optional
   * @param {string} nhom - Nhóm lớp filter (nha_tre | mau_giao) - optional for parent security
   * @param {number} classId - Class ID filter - optional for parent security
   * @returns {Promise} Dữ liệu thực đơn theo tuần
   */
  async getWeeklyMeals(startDate, endDate = null, nhom = null, classId = null) {
    try {
      let url;
      
      // Build URL with security filters - avoid fallback that loses parameters
      if (nhom || classId) {
        // Parent security mode - always use new format to preserve security parameters
        url = `/api/meals/weekly?start_date=${startDate}`;
        if (endDate) {
          url += `&end_date=${endDate}`;
        }
        if (nhom) {
          url += `&nhom=${nhom}`;
        }
        if (classId) {
          url += `&class_id=${classId}`;
        }
      } else {
        // Teacher/admin mode - use preferred format
        if (endDate) {
          url = `/api/meals/weekly?start_date=${startDate}&end_date=${endDate}`;
        } else {
          // Fallback to old format for backward compatibility
          url = `/api/meals/weekly?date=${startDate}`;
        }
      }
      
      console.log('[mealService] getWeeklyMeals with security filters:', { startDate, endDate, nhom, classId });
      const response = await apiService.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching weekly meals:', error);
      throw new Error('Không thể tải thực đơn tuần. Vui lòng thử lại.');
    }
  }

  /**
   * Lấy danh sách món ăn cho dropdown (teacher)
   * @returns {Promise} Danh sách món ăn
   */
  async getFoods() {
    try {
      const response = await apiService.get('/api/meals/foods');
      return response;
    } catch (error) {
      console.error('Error fetching foods:', error);
      throw new Error('Không thể tải danh sách món ăn. Vui lòng thử lại.');
    }
  }

  /**
   * Cập nhật thực đơn (teacher only)
   * @param {Object} payload - Payload theo format backend
   * @param {string} payload.ngay_ap_dung - Ngày áp dụng (YYYY-MM-DD)
   * @param {string} payload.nhom - Nhóm lớp (nha_tre | mau_giao)
   * @param {Array} payload.chi_tiet - Chi tiết bữa ăn
   * @returns {Promise} Kết quả cập nhật
   */
  async updateMealPlan(payload) {
    try {
      console.log('mealService.updateMealPlan payload:', payload);
      const response = await apiService.put('/api/meals/update', payload);
      return response;
    } catch (error) {
      console.error('Error updating meal plan:', error);
      throw new Error('Không thể cập nhật thực đơn. Vui lòng thử lại.');
    }
  }

  /**
   * Lấy thực đơn theo ngày cho một lớp cụ thể với parent security filtering
   * @param {string} date - Ngày (YYYY-MM-DD)
   * @param {number} classId - ID lớp học (optional)
   * @param {string} nhom - Nhóm lớp filter (nha_tre | mau_giao) - optional for parent security
   * @returns {Promise} Dữ liệu thực đơn theo ngày
   */
  async getDailyMeals(date, classId = null, nhom = null) {
    try {
      // Use new dedicated endpoint for date-based meals with security
      let endpoint = `/api/meals/date?date=${date}`;
      if (classId) {
        endpoint += `&class_id=${classId}`;
      }
      if (nhom) {
        endpoint += `&nhom=${nhom}`;
      }
      
      console.log('[mealService] getDailyMeals with security filters:', { date, classId, nhom });
      const response = await apiService.get(endpoint);
      return response;
    } catch (error) {
      console.error('Error fetching daily meals:', error);
      throw new Error('Không thể tải thực đơn ngày. Vui lòng thử lại.');
    }
  }

  /**
   * Helper function để chuyển đổi ngày thành tên thứ
   * @param {string} dateString - Ngày dạng YYYY-MM-DD
   * @returns {string} Tên thứ
   */
  getDayName(dateString) {
    const days = [
      "Chủ Nhật",
      "Thứ Hai", 
      "Thứ Ba",
      "Thứ Tư",
      "Thứ Năm",
      "Thứ Sáu",
      "Thứ Bảy"
    ];
    const date = new Date(dateString);
    return days[date.getDay()];
  }

  /**
   * Helper function để lấy ngày đầu tuần (Thứ Hai)
   * @param {string} dateString - Ngày dạng YYYY-MM-DD
   * @returns {string} Ngày đầu tuần
   */
  getWeekStart(dateString) {
    const date = new Date(dateString);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is sunday
    const weekStart = new Date(date.setDate(diff));
    return weekStart.toISOString().split('T')[0];
  }

  /**
   * Helper function để format dữ liệu meal cho UI
   * @param {Object} mealData - Raw meal data từ API
   * @returns {Object} Formatted meal data
   */
  formatMealData(mealData) {
    if (!mealData || !mealData.success || !mealData.data) {
      return {};
    }

    return mealData.data;
  }
}

// Export singleton instance
const mealService = new MealService();
export default mealService;
