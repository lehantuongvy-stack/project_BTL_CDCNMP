import apiService from './api.js';

const mealService = {
  getChildrenBasicInfo: () => apiService.get('/api/children/basic-info'),
  
  getWeeklyMeals: (startDate, endDate = null, nhom = null, classId = null) => {
    let url;
    if (nhom || classId) {
      url = `/api/meals/weekly?start_date=${startDate}`;
      if (endDate) url += `&end_date=${endDate}`;
      if (nhom) url += `&nhom=${nhom}`;
      if (classId) url += `&class_id=${classId}`;
    } else {
      if (endDate) {
        url = `/api/meals/weekly?start_date=${startDate}&end_date=${endDate}`;
      } else {
        url = `/api/meals/weekly?date=${startDate}`;
      }
    }
    return apiService.get(url);
  },
  
  getFoods: () => apiService.get('/api/meals/foods'),
  updateMealPlan: (data) => apiService.put('/api/meals/update', data),
  getDailyMeals: (date) => apiService.get(`/api/meals/by-date/${date}`),
  
  // Helper functions
  getDayName: (dateString) => {
    const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
    const date = new Date(dateString);
    return days[date.getDay()];
  },
  
  getWeekStart: (dateString) => {
    const date = new Date(dateString);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const weekStart = new Date(date.setDate(diff));
    return weekStart.toISOString().split('T')[0];
  },
  
  formatMealData: (mealData) => {
    if (!mealData || !mealData.success || !mealData.data) {
      return {};
    }
    return mealData.data;
  }
};

export default mealService;
