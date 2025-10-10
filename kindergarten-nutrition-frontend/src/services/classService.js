import apiService from './api';

class ClassService {
    async getAllClasses() {
        try {
            console.log(' ClassService: Getting all classes...');
            const response = await apiService.request('/classes', {
                method: 'GET'
            });
            
            console.log(' ClassService: Classes loaded:', response.data);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error(' ClassService: Get classes error:', error);
            return {
                success: false,
                message: error.message,
                data: []
            };
        }
    }

    async getClassById(id) {
        try {
            console.log(' ClassService: Getting class by ID:', id);
            const response = await apiService.request(`/classes/${id}`, {
                method: 'GET'
            });
            
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error(' ClassService: Get class by ID error:', error);
            return {
                success: false,
                message: error.message,
                data: null
            };
        }
    }
}

export default new ClassService();