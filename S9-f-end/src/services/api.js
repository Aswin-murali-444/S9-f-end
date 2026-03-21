// API service for backend communication
import { resolveApiBaseUrl } from '../lib/apiBaseUrl.js';
import { supabase } from '../lib/supabase.js';
import { PRODUCTION_API_FALLBACK } from '../lib/apiBaseUrl.js';

const API_BASE_URL = resolveApiBaseUrl();
const normalizeBase = (base) => String(base || '').replace(/\/$/, '');
const joinUrl = (base, endpoint) => `${normalizeBase(base)}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
const toggleApiPrefix = (base) => {
  const normalized = normalizeBase(base);
  if (normalized.endsWith('/api')) return normalized.slice(0, -4);
  return `${normalized}/api`;
};
const isNonLocalBrowser = () => {
  if (typeof window === 'undefined') return false;
  const host = String(window.location?.hostname || '').toLowerCase();
  return host !== 'localhost' && host !== '127.0.0.1';
};
const isLocalTarget = (urlOrBase) => {
  const value = String(urlOrBase || '').toLowerCase();
  return value.includes('localhost') || value.includes('127.0.0.1');
};
const DEFAULT_REQUEST_TIMEOUT_MS = 15000;

// Debug logging for production troubleshooting
if (typeof window !== 'undefined') {
  console.log('🔍 API Configuration:', {
    envBase: import.meta.env.VITE_API_URL,
    resolvedBase: API_BASE_URL,
    hostname: window.location?.hostname,
    href: window.location?.href
  });
}

class ApiService {
  async request(endpoint, options = {}) {
    const initialUrl = joinUrl(API_BASE_URL, endpoint);
    // Hard guard: never call localhost from deployed/browser non-local environments.
    const url = isNonLocalBrowser() && isLocalTarget(initialUrl)
      ? joinUrl(PRODUCTION_API_FALLBACK, endpoint)
      : initialUrl;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };
    const timeoutMs = Number.isFinite(options?.timeoutMs) ? Number(options.timeoutMs) : DEFAULT_REQUEST_TIMEOUT_MS;
    delete config.timeoutMs;

    try {
      const readJsonResponse = async (response) => {
        const contentType = response.headers.get('content-type') || '';
        const isJson = contentType.includes('application/json');
        if (!isJson) {
          const text = await response.text();
          const snippet = text ? text.slice(0, 200) : '';
          throw new Error(`Non-JSON response (status ${response.status}). Body: ${snippet}`);
        }
        return response.json();
      };

      const buildRequestError = (response, data) => {
        const err = new Error(data?.error || `HTTP error! status: ${response.status}`);
        // Attach extra metadata so callers can react based on status/details
        err.status = response.status;
        err.details = data?.details;
        err.hint = data?.hint;
        err.code = data?.code;
        err.missingFields = data?.missingFields;
        err.fieldValues = data?.fieldValues;
        // Provide a lightweight response-like object for compatibility with code that expects error.response
        err.response = {
          status: response.status,
          data
        };
        return err;
      };

      const doFetch = async (targetUrl) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        try {
          return await fetch(targetUrl, { ...config, signal: controller.signal });
        } catch (fetchErr) {
          if (fetchErr?.name === 'AbortError') {
            throw new Error(`Request timed out after ${timeoutMs}ms`);
          }
          throw fetchErr;
        } finally {
          clearTimeout(timeoutId);
        }
      };

      let response = await doFetch(url);
      let data = await readJsonResponse(response);

      if (!response.ok && response.status === 404 && data?.error === 'Route not found') {
        const fallbackBase = toggleApiPrefix(API_BASE_URL);
        const fallbackUrl = joinUrl(fallbackBase, endpoint);
        if (fallbackUrl !== url) {
          response = await doFetch(fallbackUrl);
          data = await readJsonResponse(response);
        }
      }

      if (!response.ok) {
        throw buildRequestError(response, data);
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

  // ML: personalized service recommendations for a user
  async getServiceRecommendations(userId, { limit = 5, currentServiceId = null } = {}) {
    const params = new URLSearchParams();
    if (limit != null) params.set('limit', String(limit));
    if (currentServiceId) params.set('currentServiceId', currentServiceId);
    const q = params.toString();
    const endpoint = q
      ? `/services/user/${encodeURIComponent(userId)}/recommendations?${q}`
      : `/services/user/${encodeURIComponent(userId)}/recommendations`;
    return this.request(endpoint);
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

  async resendProviderCredentials(userId, sendEmail = true) {
    return this.request(`/admin/providers/${userId}/resend-credentials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sendEmail })
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
    if (filters.scope) params.append('scope', filters.scope);
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

  // ML: recommended providers for a booking (for admin/assignment UIs)
  async getRecommendedProviders(bookingId, topK = 5) {
    const params = new URLSearchParams();
    if (topK != null) params.set('topK', String(topK));
    const q = params.toString();
    const endpoint = q
      ? `/bookings/${encodeURIComponent(bookingId)}/recommended-providers?${q}`
      : `/bookings/${encodeURIComponent(bookingId)}/recommended-providers`;
    return this.request(endpoint);
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

  // Provider salary & payout APIs
  async getProviderSalarySummary(providerId) {
    return this.request(`/payments/provider/${encodeURIComponent(providerId)}/salary-summary`);
  }

  async getProviderBankDetails(providerId) {
    return this.request(`/payments/provider/${encodeURIComponent(providerId)}/bank-details`);
  }

  async updateProviderBankDetails(providerId, details) {
    return this.request(`/payments/provider/${encodeURIComponent(providerId)}/bank-details`, {
      method: 'PUT',
      body: JSON.stringify(details)
    });
  }

  // Team management endpoints
  async createTeam(teamData) {
    return this.request('/teams', {
      method: 'POST',
      body: JSON.stringify(teamData)
    });
  }

  async createTeamWithExistingProviders(teamData) {
    return this.request('/teams/with-existing-providers', {
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

  async getAvailableTeamsForService(serviceId = null, categoryId = null, options = {}) {
    const params = new URLSearchParams();
    if (serviceId) params.append('serviceId', serviceId);
    if (categoryId) params.append('categoryId', categoryId);
    if (options.scheduled_date) params.append('scheduled_date', options.scheduled_date);
    if (options.scheduled_time) params.append('scheduled_time', options.scheduled_time);
    if (options.exclude_booking_id) params.append('exclude_booking_id', options.exclude_booking_id);

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

  async getCustomerBookingTeamDetails(userId) {
    return this.request(`/team-bookings/customer/${encodeURIComponent(userId)}/bookings`);
  }

  // Team job: get assignments pending current user's accept/decline
  async getMyPendingTeamResponses(userId) {
    return this.request(`/team-bookings/my-pending-responses/${encodeURIComponent(userId)}`);
  }

  // Team job: accept or decline an assignment (user must be in assigned_members)
  async respondToTeamAssignment(assignmentId, userId, accept, notes = null) {
    return this.request(`/team-bookings/assignment/${encodeURIComponent(assignmentId)}/respond`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, accept, notes })
    });
  }

  async getAssignmentAcceptances(assignmentId) {
    return this.request(`/team-bookings/assignment/${encodeURIComponent(assignmentId)}/acceptances`);
  }

  // Profile completion (NEW - for provider_profiles table)
  async completeServiceProviderProfile(profileData) {
    return this.request('/users/profile/complete-provider', {
      method: 'POST',
      body: JSON.stringify(profileData)
    });
  }

  getBaseUrl() {
    return resolveApiBaseUrl();
  }

  async aadhaarExtract(formData) {
    const base = this.getBaseUrl();
    const path = base.endsWith('/api') || base === '/api' ? '/aadhaar/extract' : '/api/aadhaar/extract';
    const url = `${base.replace(/\/$/, '')}${path}`;
    const res = await fetch(url, { method: 'POST', body: formData });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || `Aadhaar API failed: ${res.status}`);
    return data;
  }

  async aadhaarExtractBoth(formData) {
    const base = this.getBaseUrl();
    const path = base.endsWith('/api') || base === '/api' ? '/aadhaar/extract-both' : '/api/aadhaar/extract-both';
    const url = `${base.replace(/\/$/, '')}${path}`;
    const res = await fetch(url, { method: 'POST', body: formData });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || `Aadhaar API failed: ${res.status}`);
    return data;
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

  // Create a wage increase request for a provider (worker dashboard)
  async createProviderWageRequest(providerId, { requestedHourlyRate, reason }) {
    return this.request(`/users/provider/${encodeURIComponent(providerId)}/wage-requests`, {
      method: 'POST',
      body: JSON.stringify({
        requested_hourly_rate: requestedHourlyRate,
        reason: reason || null
      })
    });
  }

  // Update availability for a provider (worker dashboard)
  async updateProviderAvailability(providerId, availability) {
    return this.request(`/users/provider/${encodeURIComponent(providerId)}/availability`, {
      method: 'PUT',
      body: JSON.stringify({ availability })
    });
  }

  // Create a time off / leave request for a provider (worker dashboard)
  async createProviderTimeOff(providerId, { start_date, end_date, reason }) {
    return this.request(`/users/provider/${encodeURIComponent(providerId)}/time-off`, {
      method: 'POST',
      body: JSON.stringify({
        start_date,
        end_date,
        reason: reason || null
      })
    });
  }

  // Get time off / leave requests for a provider (worker dashboard)
  async getProviderTimeOff(providerId) {
    return this.request(`/users/provider/${encodeURIComponent(providerId)}/time-off`);
  }

  // Update provider profile status (Admin function)
  async updateProviderProfileStatus(providerId, status, reason = null) {
    return this.request(`/users/admin/profile/${providerId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, reason })
    });
  }

  // Admin: approve or reject a wage increase request
  async decideWageRequest(requestId, { decision, adminUserId, comment, newHourlyRate } = {}) {
    return this.request(`/admin/wage-requests/${encodeURIComponent(requestId)}/decision`, {
      method: 'POST',
      body: JSON.stringify({
        decision,
        adminUserId: adminUserId || null,
        comment: comment || null,
        new_hourly_rate: newHourlyRate
      })
    });
  }

  // Admin: get a single wage increase request
  async getWageRequest(requestId) {
    return this.request(`/admin/wage-requests/${encodeURIComponent(requestId)}`);
  }

  // Admin: approve or reject a provider leave request
  async decideLeaveRequest(leaveId, { decision } = {}) {
    return this.request(`/admin/leave-requests/${encodeURIComponent(leaveId)}/decision`, {
      method: 'POST',
      body: JSON.stringify({
        decision
      })
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

  // Get DB-backed security events for admin dashboard
  async getAdminSecurityEvents(limit = 30) {
    return this.request(`/admin/security-events?limit=${limit}`);
  }

  // Get overall rating summary for admin dashboard
  async getAdminRatingSummary() {
    return this.request('/admin/rating-summary');
  }

  // Get DB-backed analytics summary for analytics tab
  async getAdminAnalyticsSummary(days = 30) {
    return this.request(`/admin/analytics-summary?days=${encodeURIComponent(days)}`);
  }

  // Get provider time off / leave for admin dashboard
  async getAdminProviderTimeOff() {
    return this.request('/admin/provider-time-off');
  }

  // Get provider availability (next 7 days) for admin dashboard
  async getAdminProviderAvailability() {
    return this.request('/admin/provider-availability');
  }

   // Get unified allocations (individual + team assignments) for admin Allocation tab
  async getAdminAllocations(limit = 200) {
    const params = new URLSearchParams();
    if (limit != null) params.set('limit', limit);
    const q = params.toString();
    return this.request(q ? `/admin/allocations?${q}` : '/admin/allocations');
  }

  // Get billing summary for admin dashboard (customer payments + provider payouts + transactions)
  async getAdminBillingSummary(limit = 200) {
    const params = new URLSearchParams();
    if (limit != null) params.set('limit', limit);
    const q = params.toString();
    return this.request(q ? `/admin/billing-summary?${q}` : '/admin/billing-summary');
  }

  // Get all bookings for admin (customer, service, who accepted, when)
  async getAdminBookings(params = {}) {
    const searchParams = new URLSearchParams();
    if (params.limit != null) searchParams.set('limit', params.limit);
    if (params.status) searchParams.set('status', params.status);
    const q = searchParams.toString();
    return this.request(q ? `/admin/bookings?${q}` : '/admin/bookings');
  }

  // Public contact form + admin feedback inbox
  async submitContactMessage(payload) {
    try {
      return await this.request('/contact/message', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    } catch (error) {
      if (!(error?.status === 404 && String(error?.message || '').toLowerCase().includes('route not found'))) {
        throw error;
      }

      const fullName = String(payload?.fullName || '').trim();
      const email = String(payload?.email || '').trim().toLowerCase();
      const phoneNumber = String(payload?.phoneNumber || '').trim();
      const serviceType = String(payload?.serviceType || '').trim();
      const message = String(payload?.message || '').trim();
      const authUserId = payload?.authUserId ? String(payload.authUserId) : null;

      let linkedUserId = null;
      if (authUserId) {
        const { data: userRow } = await supabase
          .from('users')
          .select('id')
          .eq('auth_user_id', authUserId)
          .maybeSingle();
        linkedUserId = userRow?.id || null;
      }

      const { data, error: insertError } = await supabase
        .from('contact_messages')
        .insert({
          user_id: linkedUserId,
          full_name: fullName,
          email,
          phone_number: phoneNumber,
          service_type: serviceType,
          message,
          source: payload?.source || 'website_contact_form',
          page: payload?.page || '/contact',
          status: 'new',
          metadata: {
            fallback: 'frontend_supabase',
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null
          }
        })
        .select('*')
        .single();

      if (insertError) {
        throw insertError;
      }

      return {
        success: true,
        data,
        message: 'Message submitted successfully'
      };
    }
  }

  async getAdminContactMessages(limit = 100, status = null, adminAuthUserId = null) {
    const params = new URLSearchParams();
    if (limit != null) params.set('limit', String(limit));
    if (status) params.set('status', status);
    if (adminAuthUserId) params.set('adminAuthUserId', adminAuthUserId);
    const q = params.toString();
    const endpoint = q ? `/contact/admin/messages?${q}` : '/contact/admin/messages';
    try {
      return await this.request(endpoint);
    } catch (error) {
      // Graceful fallback while backend rollout is in progress
      if (error?.status === 404) {
        try {
          return await this.request(q ? `/api/contact/admin/messages?${q}` : '/api/contact/admin/messages');
        } catch (fallbackError) {
          if (fallbackError?.status === 404 && adminAuthUserId) {
            const { data: adminUser, error: adminLookupError } = await supabase
              .from('users')
              .select('id, role')
              .eq('auth_user_id', adminAuthUserId)
              .maybeSingle();
            if (adminLookupError || !adminUser || String(adminUser.role || '').toLowerCase() !== 'admin') {
              return { success: true, data: [] };
            }

            let query = supabase
              .from('contact_messages')
              .select('*')
              .order('created_at', { ascending: false })
              .limit(limit ?? 100);
            if (status) query = query.eq('status', status);

            const { data } = await query;
            return { success: true, data: data || [] };
          }
          throw fallbackError;
        }
      }
      throw error;
    }
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

  // Reviews and ratings
  async getProviderReviews(providerId, page = 1, limit = 20) {
    const params = new URLSearchParams({ page, limit });
    return this.request(`/reviews/provider/${providerId}?${params}`);
  }

  async getProviderRatingStats(providerId) {
    return this.request(`/reviews/provider/${providerId}/stats`);
  }

  async submitServiceReview(payload) {
    return this.request('/reviews/service', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async getServiceReviews(serviceId, page = 1, limit = 20) {
    const params = new URLSearchParams({ page, limit });
    return this.request(`/reviews/service/${encodeURIComponent(serviceId)}?${params}`);
  }

  // Team and provider details
  async getProviderTeamMembers(providerId) {
    return this.request(`/teams/provider/${providerId}/team`);
  }

  async getProviderDetails(providerId) {
    const encodedProviderId = encodeURIComponent(providerId);
    try {
      return await this.request(`/users/service-provider-details/${encodedProviderId}`);
    } catch (error) {
      if (error?.status === 404) {
        return this.request(`/users/profile/provider/${encodedProviderId}`);
      }
      throw error;
    }
  }

  // Cart operations
  async clearCart() {
    return this.request('/cart-wishlist/cart/clear', {
      method: 'DELETE'
    });
  }
}

export const apiService = new ApiService(); 