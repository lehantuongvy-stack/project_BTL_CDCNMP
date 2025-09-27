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

    console.log(' API Request:', {
      url,
      method: config.method,
      headers: config.headers,
      body: config.body
    });

    try {
      const response = await fetch(url, config);
      
      console.log(' Response status:', response.status);
      console.log(' Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(' Response error text:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText || 'Server error'}`);
      }

      const data = await response.json();
      console.log(' Response data:', data);

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