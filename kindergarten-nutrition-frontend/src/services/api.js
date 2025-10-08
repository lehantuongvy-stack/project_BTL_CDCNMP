// Base API configuration
const API_BASE_URL = 'http://localhost:3002';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to make HTTP requests
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      mode: 'cors',
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`
      };
    }

    console.log('🔍 API Request:', {
      url,
      method: config.method || 'GET',
      headers: config.headers,
      body: config.body || null
    });

    try {
      const response = await fetch(url, config);
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error text:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText || 'Server error'}`);
      }

      // Check content type before parsing JSON
      const contentType = response.headers.get('content-type');
      console.log('📡 Content-Type:', contentType);
      
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error('❌ Response is not JSON:', responseText);
        throw new Error('Server did not return JSON');
      }

      const responseText = await response.text();
      console.log('📡 Raw response text:', responseText.substring(0, 500));
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError);
        console.error('❌ Raw response that failed to parse:', responseText);
        throw new Error(`Invalid JSON response: ${parseError.message}`);
      }
      
      console.log('✅ Response data:', data);
      
      // Debug specific fields if it's a report
      if (data.success && data.data) {
        if (Array.isArray(data.data)) {
          console.log('📊 Reports array length:', data.data.length);
          if (data.data.length > 0) {
            console.log('📊 First report sample:', data.data[0]);
          }
        } else {
          console.log('📊 Single report data:', data.data);
          if (data.data.nutrition_data) {
            console.log('📊 Nutrition data type:', typeof data.data.nutrition_data);
            console.log('📊 Nutrition data:', data.data.nutrition_data);
          }
        }
      }

      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw new Error(error.message || 'Lỗi kết nối API');
    }
  }

  // GET request
  get(endpoint, headers = {}) {
    return this.request(endpoint, {
      method: 'GET',
      headers,
    });
  }

  // POST request
  post(endpoint, data, headers = {}) {
    // For auth endpoints, use FormData to avoid CORS issues
    if (endpoint.includes('/auth/login') || endpoint.includes('/auth/register')) {
      const formData = new URLSearchParams();
      Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
      });
      
      return this.request(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          ...headers,
        },
        body: formData.toString(),
      });
    }
    
    return this.request(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(data),
    });
  }

  // PUT request
  put(endpoint, data, headers = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  delete(endpoint, headers = {}) {
    return this.request(endpoint, {
      method: 'DELETE',
      headers,
    });
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;