// js/api.js  —  Shared frontend API utility for ProfitWavy (Enhanced Security)
(function () {
  'use strict';

  // ── Configuration ──────────────────────────────────────────────────────────
  const metaTag = document.querySelector('meta[name="api-base"]');
  const BASE_URL = metaTag ? metaTag.getAttribute('content') : '';

  // Storage keys (fallback for development - production should use httpOnly cookies)
  const TOKEN_KEY = 'profitwavy_token';
  const USER_KEY  = 'profitwavy_user';

  // ── Token Management ───────────────────────────────────────────────────────
  
  /**
   * Store auth credentials.
   * In production, the token should come from httpOnly cookies set by the server.
   * This localStorage approach is kept for backward compatibility in dev environments.
   */
  function setAuth(token, user) {
    // Only store in localStorage if we're explicitly given a token
    // (server will set httpOnly cookie in production)
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    }
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  }

  /**
   * Get token from localStorage (dev) or rely on httpOnly cookie (production).
   * In production, we don't need to read the token - it's sent automatically.
   */
  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Get user profile from localStorage cache
   */
  function getUser() {
    try {
      const userData = localStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Failed to parse user data:', error);
      return null;
    }
  }

  /**
   * Clear all auth data
   */
  function clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  // ── HTTP Request Wrapper ───────────────────────────────────────────────────
  
  /**
   * Generic fetch wrapper with automatic token handling, error parsing, and retry logic
   */
  async function request(method, path, body = null, requiresAuth = false) {
    const headers = { 'Content-Type': 'application/json' };

    // Add token from localStorage if available (for dev/testing)
    // In production with httpOnly cookies, this is optional - cookie is sent automatically
    if (requiresAuth) {
      const token = getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const options = {
      method,
      headers,
      credentials: 'include', // CRITICAL: Include cookies in requests (for httpOnly auth)
    };

    if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${BASE_URL}${path}`, options);
      
      // Handle 401 Unauthorized
      if (response.status === 401) {
        clearAuth();
        
        // Don't retry if we're already on login/register
        if (!window.location.pathname.includes('login') && 
            !window.location.pathname.includes('register')) {
          window.location.href = 'login.html?session=expired';
        }
        throw new Error('Session expired. Please log in again.');
      }

      // Parse response
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = { message: await response.text() };
      }

      // Handle non-2xx responses
      if (!response.ok) {
        const errorMessage = data.message || data.error || `Request failed with status ${response.status}`;
        const error = new Error(errorMessage);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;

    } catch (error) {
      // Network errors or fetch failures
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your connection.');
      }
      
      // Rethrow API errors as-is
      throw error;
    }
  }

  // ── Public API Methods ─────────────────────────────────────────────────────

  /**
   * Register a new account
   */
  async function register(fullName, phone, password, referralCode) {
    const payload = { fullName, phone, password };
    if (referralCode) {
      payload.referralCode = referralCode.trim();
    }

    const data = await request('POST', '/api/auth/register', payload);
    
    // Store token and user (server might also set httpOnly cookie)
    setAuth(data.token, data.user);
    
    return data;
  }

  /**
   * Login with phone + password
   */
  async function login(phone, password) {
    const data = await request('POST', '/api/auth/login', { phone, password });
    
    // Store token and user (server might also set httpOnly cookie)
    setAuth(data.token, data.user);
    
    return data;
  }

  /**
   * Fetch current authenticated user's profile
   */
  async function getMe() {
    return request('GET', '/api/auth/me', null, true);
  }

  /**
   * Logout - clear local state and optionally call server logout endpoint
   */
  async function logout() {
    try {
      // Call server logout to clear httpOnly cookie (if implemented)
      await request('POST', '/api/auth/logout', null, true);
    } catch (error) {
      console.error('Logout request failed:', error);
      // Continue with local cleanup even if server call fails
    }
    
    clearAuth();
    window.location.href = 'login.html';
  }

  /**
   * Check if user is authenticated
   */
  function isAuthenticated() {
    // In development: check localStorage token
    // In production: this should call a /api/auth/check endpoint
    return !!getToken() || !!getUser();
  }

  /**
   * Refresh authentication state
   */
  async function refreshAuth() {
    try {
      const data = await getMe();
      if (data.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      }
      return data;
    } catch (error) {
      clearAuth();
      throw error;
    }
  }

  // ── Expose Public API ──────────────────────────────────────────────────────
  
  window.ProfitWavyAPI = {
    // Auth methods
    register,
    login,
    logout,
    getMe,
    refreshAuth,
    isAuthenticated,
    
    // Token management (use sparingly - prefer httpOnly cookies)
    getToken,
    getUser,
    clearAuth,
    
    // Low-level request (for extensions)
    request
  };

  // ── Auto-refresh user data on page load (if authenticated) ─────────────────
  
  if (isAuthenticated() && 
      !window.location.pathname.includes('login') && 
      !window.location.pathname.includes('register')) {
    
    refreshAuth().catch(error => {
      console.error('Failed to refresh auth:', error);
      // Don't force logout on every error - could be temporary network issue
    });
  }

})();
