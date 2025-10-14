// src/services/warehouseService.js
import apiService from './api.js';

class WarehouseService {
  getAll() {
    return apiService.get('/api/warehouse');
  }

  getById(id) {
    return apiService.get(`/api/warehouse/${id}`);
  }

  create(data) {
    return apiService.post('/api/warehouse', data);
  }

  update(id, data) {
    return apiService.put(`/api/warehouse/${id}`, data);
  }

  delete(id) {
    return apiService.delete(`/api/warehouse/${id}`);
  }
}

const warehouseService = new WarehouseService();
export default warehouseService;
