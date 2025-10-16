import apiService from './api.js';

const childService = {
  getAllChildren: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/api/children?${queryString}` : '/api/children';
    return apiService.get(endpoint);
  },
  
  getChildrenByClass: (classId, params = {}) => {
    const queryParams = { ...params, class_id: classId };
    const queryString = new URLSearchParams(queryParams).toString();
    return apiService.get(`/api/children?${queryString}`);
  },
  
  getChildrenStats: () => apiService.get('/api/children/stats'),
  getChildById: (id) => apiService.get(`/api/children/${id}`),
  createChild: (data) => apiService.post('/api/children', data),
  updateChild: (id, data) => apiService.put(`/api/children/${id}`, data),
  deleteChild: (id) => apiService.delete(`/api/children/${id}`),
  getMyClassChildren: () => apiService.get('/api/children/my-class'),
  
  searchChildren: (queryString) => apiService.get(`/api/children/search?${queryString}`),
  getChildrenWithAllergies: () => apiService.get('/api/children/allergies'),
  getChildrenStatsByClass: () => apiService.get('/api/children/stats/class'),
  
  getBirthdaysInMonth: (month, year = null) => {
    const params = new URLSearchParams({ month: month.toString() });
    if (year) {
      params.append('year', year.toString());
    }
    return apiService.get(`/api/children/birthdays?${params.toString()}`);
  }
};

export default childService;
