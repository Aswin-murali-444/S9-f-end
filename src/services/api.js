// API service for backend communication
// Resolve base URL robustly across dev/preview/prod
const API_BASE_URL = (() => {
  const envBase = import.meta.env.VITE_API_URL;
  if (envBase) return envBase.replace(/\/$/, '');
  if (typeof window !== 'undefined') {
    const host = window.location?.hostname || '';
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:3001';
    }
  }
  return '/api';
})();

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
      const contentType = response.headers.get('content-type') || '';
      const isJson = contentType.includes('application/json');

      if (!isJson) {
        const text = await response.text();
        const snippet = text ? text.slice(0, 200) : '';
        throw new Error(`Non-JSON response (status ${response.status}). Body: ${snippet}`);
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || `HTTP error! status: ${response.status}`);
      }
      return data;
    } catch (error) {
      console.error('API request failed:', { url, error });
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

  async getUserProfile(userId) {
    return this.request(`/profile/${encodeURIComponent(userId)}`);
  }

  // System metrics
  async getSystemMetrics() {
    return this.request('/system/metrics');
  }

  // Service categories
  async getCategories() {
    return this.request('/categories');
  }

  async createCategory({ name, description = null, active = true, iconUrl = null, settings = null, status }) {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify({ name, description, active, iconUrl, settings, status })
    });
  }

  async uploadCategoryIcon(file) {
    // Convert file to base64 (no data URL header)
    const toBase64 = (f) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result || '';
        const base64 = String(result).split(',').pop();
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(f);
    });

    const base64 = await toBase64(file);
    return this.request('/categories/icon-upload', {
      method: 'POST',
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type || 'image/png',
        base64
      })
    });
  }

  async uploadProfilePicture(file, userId) {
    const toBase64 = (f) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result || '';
        const base64 = String(result).split(',').pop();
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(f);
    });

    const base64 = await toBase64(file);
    return this.request('/users/profile-picture-upload', {
      method: 'POST',
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type || 'image/png',
        base64,
        userId
      })
    });
  }

  async getCategory(id) {
    return this.request(`/categories/${encodeURIComponent(id)}`);
  }

  async updateCategory(id, updates) {
    const { name, description, active, iconUrl, settings, status } = updates;
    return this.request(`/categories/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify({ name, description, active, iconUrl, settings, status })
    });
  }

  async blockCategory(id) {
    // Prefer PATCH; fallback to POST if 404 from proxies
    try {
      return await this.request(`/categories/${encodeURIComponent(id)}/block`, { method: 'PATCH' });
    } catch (e) {
      return await this.request(`/categories/${encodeURIComponent(id)}/block`, { method: 'POST' });
    }
  }

  async unblockCategory(id) {
    try {
      return await this.request(`/categories/${encodeURIComponent(id)}/unblock`, { method: 'PATCH' });
    } catch (e) {
      return await this.request(`/categories/${encodeURIComponent(id)}/unblock`, { method: 'POST' });
    }
  }

  async deleteCategory(id) {
    // Try DELETE first; fallback to POST /delete
    let resp = await fetch(`${API_BASE_URL}/categories/${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (!resp.ok) {
      // Fallback
      resp = await fetch(`${API_BASE_URL}/categories/${encodeURIComponent(id)}/delete`, { method: 'POST' });
    }
    if (!resp.ok) {
      const contentType = resp.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await resp.json();
        throw new Error(data?.error || `HTTP error! status: ${resp.status}`);
      }
      const text = await resp.text();
      throw new Error(text || `HTTP error! status: ${resp.status}`);
    }
    return { success: true };
  }

  // Services endpoints
  async getServices() {
    return this.request('/services');
  }

  async createService({ categoryId, name, description, iconBase64, iconFileName, iconMimeType, duration, active = true }) {
    return this.request('/services', {
      method: 'POST',
      body: JSON.stringify({ categoryId, name, description, iconBase64, iconFileName, iconMimeType, duration, active })
    });
  }

  async getService(id) {
    return this.request(`/services/${encodeURIComponent(id)}`);
  }

  async updateService(id, updates) {
    const { categoryId, name, description, iconBase64, iconFileName, iconMimeType, duration, active } = updates;
    return this.request(`/services/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify({ categoryId, name, description, iconBase64, iconFileName, iconMimeType, duration, active })
    });
  }

  async blockService(id) {
    try {
      return await this.request(`/services/${encodeURIComponent(id)}/block`, { method: 'PATCH' });
    } catch (e) {
      return await this.request(`/services/${encodeURIComponent(id)}/block`, { method: 'POST' });
    }
  }

  async unblockService(id) {
    try {
      return await this.request(`/services/${encodeURIComponent(id)}/unblock`, { method: 'PATCH' });
    } catch (e) {
      return await this.request(`/services/${encodeURIComponent(id)}/unblock`, { method: 'POST' });
    }
  }

  async deleteService(id) {
    // Try DELETE first; fallback to POST /delete
    let resp = await fetch(`${API_BASE_URL}/services/${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (!resp.ok) {
      // Fallback
      resp = await fetch(`${API_BASE_URL}/services/${encodeURIComponent(id)}/delete`, { method: 'POST' });
    }
    if (!resp.ok) {
      const contentType = resp.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await resp.json();
        throw new Error(data?.error || `HTTP error! status: ${resp.status}`);
      }
      const text = await resp.text();
      throw new Error(text || `HTTP error! status: ${resp.status}`);
    }
    return { success: true };
  }

  // User management endpoints
  async updateUserStatus(userId, status) {
    return this.request(`/users/${encodeURIComponent(userId)}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  async blockUser(userId) {
    return this.updateUserStatus(userId, 'suspended');
  }

  async unblockUser(userId) {
    return this.updateUserStatus(userId, 'active');
  }
}

export const apiService = new ApiService(); 