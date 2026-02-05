// js/api.js — Fixed version
(function () {
  'use strict';

  // ── Configuration ──────────────────────────────────────────────────────────
  const BASE_URL = 'https://profit-wavy.onrender.com/api';  // ✅ FIXED: Added /api
  
  // Or if you want to detect environment:
  // const BASE_URL = window.location.hostname.includes('profitwavy.com')
  //   ? 'https://profit-wavy.onrender.com/api'  // Production
  //   : 'http://localhost:5000/api';            // Development

  // Storage keys
  const TOKEN_KEY = 'profitwavy_token';
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
      credentials: 'include', // Important for CORS with cookies
      mode: 'cors'           // Explicitly set CORS mode
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

      // Handle 401 - Session expired
      if (response.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
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
      
      // Re-throw with better message
      if (error.message.includes('API endpoint not found')) {
        throw new Error(`Server error: ${path} endpoint is not available. Please contact support.`);
      }
      
      throw error;
    }
  }

  // ── Public API Methods (Updated) ───────────────────────────────────────────

  async function register(fullname, phone, password, referral = '') {
    console.log('📝 Register attempt:', { fullname, phone });
    
    // Validate phone format
    const cleanPhone = phone.replace(/\D/g, '');
    if (!/^0\d{9}$/.test(cleanPhone)) {
      throw new Error('Phone must be 10 digits starting with 0 (e.g., 0244123456)');
    }
    
    // Validate password
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    
    const data = await request('POST', '/auth/register', {
      name,
      phone: cleanPhone,
      password,
      referral
    });
    
    // Store auth data
    if (data.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
    }
    if (data.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    }
    
    return data;
  }

  async function login(phone, password) {
    console.log('🔐 Login attempt:', { phone });
    
    // Clean phone number
    const cleanPhone = phone.replace(/\D/g, '');
    
    const data = await request('POST', '/auth/login', {
      phone: cleanPhone,
      password
    });
    
    // Store auth data
    if (data.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
    }
    if (data.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    }
    
    return data;
  }

  async function getMe() {
    return request('GET', '/auth/me', null, true);
  }

  async function logout() {
    try {
      await request('POST', '/auth/logout', null, true);
    } catch (error) {
      console.log('Logout API call failed (might not be implemented):', error.message);
    }
    
    // Always clear local storage
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    
    // Redirect to login
    window.location.href = 'login.html?loggedout=true';
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

  // ── Expose Public API ──────────────────────────────────────────────────────
  
  window.ProfitWavyAPI = {
    // Auth
    register,
    login,
    logout,
    getMe,
    isAuthenticated,
    getCurrentUser,
    
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
      
      // Test 3: Try register endpoint
      console.log('Test 3: Register endpoint...');
      const testPhone = '0244' + Math.floor(100000 + Math.random() * 900000);
      const registerTest = await fetch('https://profit-wavy.onrender.com/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          phone: testPhone,
          password: 'Test123!'
        })
      });
      
      console.log('Register status:', registerTest.status);
      console.log('Register response:', await registerTest.json());
      
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

