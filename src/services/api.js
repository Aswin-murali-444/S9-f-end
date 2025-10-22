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

  async getServiceCategories() {
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

  async createService({ categoryId, name, description, iconBase64, iconFileName, iconMimeType, duration, price, offerPrice, offerPercentage, offerEnabled, serviceType = 'individual', active = true }) {
    return this.request('/services', {
      method: 'POST',
      body: JSON.stringify({ categoryId, name, description, iconBase64, iconFileName, iconMimeType, duration, price, offerPrice, offerPercentage, offerEnabled, serviceType, active })
    });
  }

  async getService(id) {
    return this.request(`/services/${encodeURIComponent(id)}`);
  }

  async checkServiceNameAvailability(name, categoryId, excludeId = null) {
    return this.request('/services/check-name', {
      method: 'POST',
      body: JSON.stringify({ name, categoryId, excludeId })
    });
  }

  async updateService(id, updates) {
    const { categoryId, name, description, iconBase64, iconFileName, iconMimeType, duration, price, offerPrice, offerPercentage, offerEnabled, serviceType, active } = updates;
    return this.request(`/services/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify({ categoryId, name, description, iconBase64, iconFileName, iconMimeType, duration, price, offerPrice, offerPercentage, offerEnabled, serviceType, active })
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

  async adminCreateProvider(payload) {
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    };
    try {
      // Primary: direct to API_BASE_URL (e.g., http://localhost:3001)
      return await this.request('/admin/providers', options);
    } catch (err) {
      // Fallback: try through dev proxy at /api
      try {
        const resp = await fetch(`/api/admin/providers`, options);
        const contentType = resp.headers.get('content-type') || '';
        const isJson = contentType.includes('application/json');
        if (!isJson) {
          const t = await resp.text();
          throw new Error(t || `HTTP error! status: ${resp.status}`);
        }
        const data = await resp.json();
        if (!resp.ok) {
          throw new Error(data?.error || `HTTP error! status: ${resp.status}`);
        }
        return data;
      } catch (fallbackErr) {
        console.error('adminCreateProvider fallback failed:', fallbackErr);
        throw err; // surface original
      }
    }
  }

  async adminUpdateProvider(userId, payload) {
    return this.request(`/admin/providers/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }

  async listProviders() {
    return this.request('/admin/providers');
  }

  // Bookings
  async createBooking(payload) {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // Get bookings for a specific service provider
  async getProviderBookings(providerId, filters = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/bookings/provider/${providerId}?${queryString}` : `/bookings/provider/${providerId}`;
    return this.request(endpoint);
  }

  // Get bookings matching service provider's specialization
  async getMatchingBookings(providerId, filters = {}) {
    const params = new URLSearchParams();
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/bookings/matching/${providerId}?${queryString}` : `/bookings/matching/${providerId}`;
    return this.request(endpoint);
  }

  // Update booking status
  async updateBookingStatus(bookingId, status, notes = null) {
    return this.request(`/bookings/${bookingId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes })
    });
  }

  // Assign booking to service provider
  async assignBooking(bookingId, providerId) {
    return this.request(`/bookings/${bookingId}/assign`, {
      method: 'PUT',
      body: JSON.stringify({ providerId })
    });
  }

  // Payments (Razorpay)
  async createRazorpayOrder({ amount, currency = 'INR', receipt, notes }) {
    return this.request('/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ amount, currency, receipt, notes })
    });
  }

  async verifyRazorpayPayment(payload) {
    return this.request('/payments/verify', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async confirmBookingAfterPayment(payload) {
    return this.request('/payments/confirm-booking', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // Multi-service booking confirmation helper
  async confirmMultipleBookingsAfterPayment({ razorpay_order_id, razorpay_payment_id, razorpay_signature, bookings }) {
    return this.request('/payments/confirm-booking', {
      method: 'POST',
      body: JSON.stringify({ razorpay_order_id, razorpay_payment_id, razorpay_signature, bookings })
    });
  }

  // Team management endpoints
  async createTeam(teamData) {
    return this.request('/teams', {
      method: 'POST',
      body: JSON.stringify(teamData)
    });
  }

  async getTeams(filters = {}) {
    const params = new URLSearchParams();
    if (filters.category_id) params.append('category_id', filters.category_id);
    if (filters.status) params.append('status', filters.status);
    if (filters.include_inactive) params.append('include_inactive', filters.include_inactive);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/teams?${queryString}` : '/teams';
    return this.request(endpoint);
  }

  async getTeamById(teamId) {
    return this.request(`/teams/${encodeURIComponent(teamId)}`);
  }

  async updateTeam(teamId, updates) {
    return this.request(`/teams/${encodeURIComponent(teamId)}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteTeam(teamId) {
    return this.request(`/teams/${encodeURIComponent(teamId)}`, {
      method: 'DELETE'
    });
  }

  async addTeamMember(teamId, memberData) {
    return this.request(`/teams/${encodeURIComponent(teamId)}/members`, {
      method: 'POST',
      body: JSON.stringify(memberData)
    });
  }

  async removeTeamMember(teamId, memberId) {
    return this.request(`/teams/${encodeURIComponent(teamId)}/members/${encodeURIComponent(memberId)}`, {
      method: 'DELETE'
    });
  }

  async getAvailableProviders(excludeTeamId = null) {
    const params = new URLSearchParams();
    if (excludeTeamId) params.append('exclude_team_id', excludeTeamId);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/teams/available-providers?${queryString}` : '/teams/available-providers';
    return this.request(endpoint);
  }

  // Team booking management endpoints
  async assignTeamToBooking(assignmentData) {
    return this.request('/team-bookings/assign', {
      method: 'POST',
      body: JSON.stringify(assignmentData)
    });
  }

  async getBookingTeamAssignments(bookingId) {
    return this.request(`/team-bookings/booking/${encodeURIComponent(bookingId)}`);
  }

  async updateTeamAssignmentStatus(assignmentId, status, notes = null) {
    return this.request(`/team-bookings/assignment/${encodeURIComponent(assignmentId)}/status`, {
      method: 'PUT',
      body: JSON.stringify({ assignment_status: status, notes })
    });
  }

  async getAvailableTeamsForService(serviceId = null, categoryId = null) {
    const params = new URLSearchParams();
    if (serviceId) params.append('serviceId', serviceId);
    if (categoryId) params.append('categoryId', categoryId);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/team-bookings/available?${queryString}` : '/team-bookings/available';
    return this.request(endpoint);
  }

  async getTeamAssignmentStats(teamId, period = '30') {
    const params = new URLSearchParams();
    params.append('period', period);
    
    const queryString = params.toString();
    return this.request(`/team-bookings/stats/${encodeURIComponent(teamId)}?${queryString}`);
  }

  // Profile completion (NEW - for provider_profiles table)
  async completeServiceProviderProfile(profileData) {
    return this.request('/users/profile/complete-provider', {
      method: 'POST',
      body: JSON.stringify(profileData)
    });
  }

  // Upload provider profile picture
  async uploadProviderProfilePicture(file, providerId) {
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
    return this.request('/users/provider/profile-picture-upload', {
      method: 'POST',
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type || 'image/png',
        base64,
        providerId
      })
    });
  }

  // Get provider profile
  async getProviderProfile(providerId) {
    return this.request(`/users/profile/provider/${providerId}`);
  }

  // Update provider profile
  async updateProviderProfile(providerId, profileData) {
    try {
      console.log('📡 API: Updating provider profile:', providerId, profileData);
      const result = await this.request(`/users/profile/provider/${providerId}`, {
        method: 'PUT',
        body: JSON.stringify(profileData)
      });
      console.log('📡 API: Update profile response:', result);
      return result;
    } catch (error) {
      console.error('📡 API: Update profile failed:', error);
      throw error;
    }
  }

  // Update provider profile status (Admin function)
  async updateProviderProfileStatus(providerId, status, reason = null) {
    return this.request(`/users/admin/profile/${providerId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, reason })
    });
  }

  // Get provider profile status
  async getProviderProfileStatus(providerId) {
    return this.request(`/users/profile/${providerId}/status`);
  }

  // Get service provider details from service_provider_details table
  async getServiceProviderDetails(providerId) {
    return this.request(`/users/service-provider-details/${providerId}`);
  }

  // Get live activity feed for admin dashboard
  async getAdminActivityFeed(limit = 50) {
    return this.request(`/admin/activity-feed?limit=${limit}`);
  }

  // Notification methods
  async getNotifications(page = 1, limit = 20, type = null, status = null) {
    const params = new URLSearchParams({ page, limit });
    if (type) params.append('type', type);
    if (status) params.append('status', status);
    return this.request(`/notifications?${params}`);
  }

  async getUnreadNotificationsCount() {
    return this.request('/notifications/unread-count');
  }

  // User-specific notification methods
  async getUserNotifications(userId, page = 1, limit = 20, status = null) {
    const params = new URLSearchParams({ page, limit });
    if (status) params.append('status', status);
    return this.request(`/notifications/user/${userId}?${params}`);
  }

  async getUserUnreadCount(userId) {
    return this.request(`/notifications/user/${userId}/unread-count`);
  }

  // Admin notification methods
  async markNotificationAsRead(notificationId, adminUserId) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PUT',
      body: JSON.stringify({ adminUserId })
    });
  }

  async markAllNotificationsAsRead(adminUserId) {
    return this.request('/notifications/mark-all-read', {
      method: 'PUT',
      body: JSON.stringify({ adminUserId })
    });
  }

  async dismissNotification(notificationId, adminUserId) {
    return this.request(`/notifications/${notificationId}/dismiss`, {
      method: 'PUT',
      body: JSON.stringify({ adminUserId })
    });
  }

  // User notification methods
  async markUserNotificationAsRead(userId, notificationId) {
    return this.request(`/notifications/user/${userId}/${notificationId}/read`, {
      method: 'PUT'
    });
  }

  async markAllUserNotificationsAsRead(userId) {
    return this.request(`/notifications/user/${userId}/mark-all-read`, {
      method: 'PUT'
    });
  }

  async dismissUserNotification(userId, notificationId) {
    return this.request(`/notifications/user/${userId}/${notificationId}/dismiss`, {
      method: 'PUT'
    });
  }

  async getProviderNotifications(providerId, page = 1, limit = 20) {
    const params = new URLSearchParams({ page, limit });
    return this.request(`/notifications/provider/${providerId}?${params}`);
  }

  // Change password
  async changePassword(passwordData) {
    return this.request('/users/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData)
    });
  }

  // Cart operations
  async clearCart() {
    return this.request('/cart-wishlist/cart/clear', {
      method: 'DELETE'
    });
  }
}

export const apiService = new ApiService(); 