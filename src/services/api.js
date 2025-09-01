// API service for backend communication
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async register(userData) {
    return this.request('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    return this.request('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async checkEmailExists(email) {
    console.log('📡 API: Checking email existence for:', email);
    try {
      // Validate email format before making API call
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return {
          error: 'Invalid email format',
          exists: false,
          message: 'Please enter a valid email address'
        };
      }

      // Normalize email for consistent checking
      const normalizedEmail = email.toLowerCase().trim();
      
      const result = await this.request(`/check-email/${encodeURIComponent(normalizedEmail)}`);
      console.log('📡 API: Email check response:', result);
      
      // Ensure the response has the expected structure
      if (result && typeof result.exists === 'boolean') {
        return {
          exists: result.exists,
          message: result.message || (result.exists ? 'Email already registered' : 'Email available'),
          error: null
        };
      } else {
        console.warn('📡 API: Unexpected response format:', result);
        return {
          error: 'Invalid response format',
          exists: false,
          message: 'Error checking email availability'
        };
      }
    } catch (error) {
      console.error('📡 API: Email check failed:', error);
      // Return a structured error response instead of throwing
      return {
        error: error.message || 'Network error',
        exists: false,
        message: 'Error checking email availability'
      };
    }
  }

  async getUsers() {
    return this.request('/users');
  }
}

export const apiService = new ApiService(); 