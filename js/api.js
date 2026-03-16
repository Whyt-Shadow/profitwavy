need// js/api.js — Fixed version
(function () {
  'use strict';

  // ── Configuration ──────────────────────────────────────────────────────────
  const BASE_URL = 'https://profit-wavy.onrender.com/api';

  // Storage keys
  const TOKEN_KEY = 'profitwavy_token';
  const REFRESH_TOKEN_KEY = 'profitwavy_refresh_token';
  const USER_KEY  = 'profitwavy_user';

  // ── Enhanced Request Wrapper ───────────────────────────────────────────────
  
  async function request(method, path, body = null, requiresAuth = false) {
    const url = `${BASE_URL}${path}`;
    console.log('📤 API Request:', { method, url, body });
    
    const headers = { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // Add auth token
    if (requiresAuth) {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const options = {
      method,
      headers,
      credentials: 'include',
      mode: 'cors'
    };

    if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);
      
      console.log('📥 API Response:', {
        url: response.url,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      // Handle 401 - Try to refresh token
      if (response.status === 401) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          // Retry the request with new token
          return request(method, path, body, requiresAuth);
        }
        
        // Refresh failed - redirect to login
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        
        if (!window.location.pathname.includes('login') && 
            !window.location.pathname.includes('register')) {
          window.location.href = 'login.html?session=expired';
        }
        throw new Error('Session expired. Please log in again.');
      }

      // Handle 404 - Not Found
      if (response.status === 404) {
        console.error('❌ 404 Error - Endpoint not found:', url);
        throw new Error(`API endpoint not found: ${path}`);
      }

      // Parse response
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          data = { message: 'Invalid server response' };
        }
      } else {
        const text = await response.text();
        console.log('Non-JSON response:', text);
        data = { message: text };
      }

      // Handle non-2xx responses
      if (!response.ok) {
        const errorMessage = data.message || data.error || `Request failed with status ${response.status}`;
        const error = new Error(errorMessage);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      console.log('✅ API Success:', data);
      return data;

    } catch (error) {
      console.error('❌ API Error:', error);
      
      // Network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        if (error.message.includes('Failed to fetch')) {
          throw new Error('Network error. Please check your internet connection.');
        }
        if (error.message.includes('CORS')) {
          throw new Error('Cross-origin request blocked. Please try again.');
        }
      }
      
      throw error;
    }
  }

  // ── Token Refresh ───────────────────────────────────────────────────────────
  
  async function refreshAccessToken() {
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) return false;
      
      const data = await request('POST', '/auth/refresh-token', {
        refreshToken
      });
      
      if (data.accessToken) {
        localStorage.setItem(TOKEN_KEY, data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
        }
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  // ── Public API Methods ─────────────────────────────────────────────────────

  async function register(fullName, phone, password, referralCode = '') {
    console.log('📝 Register attempt:', { fullName, phone });
    
    // Validate name length
    if (!fullName || fullName.length < 2) {
      throw new Error('Full name must be at least 2 characters');
    }
    
    // Validate phone format
    const cleanPhone = phone.replace(/\D/g, '');
    if (!/^0\d{9}$/.test(cleanPhone)) {
      throw new Error('Phone must be 10 digits starting with 0 (e.g., 0244123456)');
    }
    
    // Validate password
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    
    // Send data matching backend expectations
    const data = await request('POST', '/auth/register', {
      fullName: fullName.trim(),
      phone: cleanPhone,
      password,
      referralCode: referralCode.trim() || undefined
    });
    
    // Store auth data (backend returns accessToken/refreshToken)
    if (data.accessToken) {
      localStorage.setItem(TOKEN_KEY, data.accessToken);
    }
    if (data.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    }
    if (data.data) {
      localStorage.setItem(USER_KEY, JSON.stringify(data.data));
    }
    
    return data;
  }

  async function login(identifier, password) {
    console.log('🔐 Login attempt:', { identifier });
    
    // Validate identifier
    if (!identifier) {
      throw new Error('Email or phone number is required');
    }
    
    // Send data matching backend expectations
    const data = await request('POST', '/auth/login', {
      identifier: identifier.trim(),
      password
    });
    
    // Store auth data
    if (data.accessToken) {
      localStorage.setItem(TOKEN_KEY, data.accessToken);
    }
    if (data.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    }
    if (data.data) {
      localStorage.setItem(USER_KEY, JSON.stringify(data.data));
    }
    
    return data;
  }

  async function verifyEmail(email, code) {
    console.log('✓ Email verification:', { email, code });
    
    return request('POST', '/auth/verify', {
      email,
      code
    });
  }

  async function resendVerification(email) {
    console.log('📧 Resend verification:', { email });
    
    return request('POST', '/auth/resend-verification', {
      email
    });
  }

  async function forgotPassword(email) {
    console.log('🔑 Forgot password:', { email });
    
    return request('POST', '/auth/forgot-password', {
      email
    });
  }

  async function resetPassword(token, newPassword) {
    console.log('🔐 Reset password');
    
    // Validate password
    if (newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    
    return request('POST', `/auth/reset-password/${token}`, {
      password: newPassword
    });
  }

  async function getMe() {
    return request('GET', '/auth/me', null, true);
  }

  async function logout() {
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        await request('POST', '/auth/logout', { refreshToken }, true);
      }
    } catch (error) {
      console.log('Logout API call failed:', error.message);
    }
    
    // Always clear local storage
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    
    // Redirect to login
    window.location.href = 'login.html?loggedout=true';
  }

  async function changePassword(currentPassword, newPassword) {
    console.log('🔄 Change password');
    
    // Validate new password
    if (newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters');
    }
    
    return request('POST', '/auth/change-password', {
      currentPassword,
      newPassword
    }, true);
  }

  function isAuthenticated() {
    const token = localStorage.getItem(TOKEN_KEY);
    const user = localStorage.getItem(USER_KEY);
    return !!(token && user);
  }

  function getCurrentUser() {
    try {
      const userData = localStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  function getAccessToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  // ── Expose Public API ──────────────────────────────────────────────────────
  
  window.ProfitWavyAPI = {
    // Auth
    register,
    login,
    logout,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    changePassword,
    getMe,
    
    // User
    isAuthenticated,
    getCurrentUser,
    getAccessToken,
    
    // Low-level
    request
  };

  // ── Debug Helper ───────────────────────────────────────────────────────────
  
  window.testAPI = async function() {
    console.group('🔧 API Test');
    
    try {
      // Test 1: Check if backend is accessible
      console.log('Test 1: Backend health check...');
      const health = await fetch('https://profit-wavy.onrender.com/health');
      console.log('Health status:', health.status);
      
      if (health.ok) {
        const healthData = await health.json();
        console.log('Health data:', healthData);
      }
      
      // Test 2: Test API endpoint
      console.log('Test 2: API endpoint check...');
      const apiTest = await fetch('https://profit-wavy.onrender.com/api/health');
      console.log('API status:', apiTest.status);
      
    } catch (error) {
      console.error('Test failed:', error);
    }
    
    console.groupEnd();
  };

  // ── Auto-init on page load ─────────────────────────────────────────────────
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  function init() {
    console.log('🚀 ProfitWavy API initialized');
    console.log('Base URL:', BASE_URL);
    
    // Show API status
    const apiStatus = document.getElementById('api-status');
    if (apiStatus) {
      apiStatus.textContent = `API: ${BASE_URL}`;
      apiStatus.className = 'api-status connected';
    }
  }

})();
