// js/api.js — Optimized & Fixed Version
(function () {
  'use strict';

  const BASE_URL = 'https://profit-wavy.onrender.com/api';
  const TOKEN_KEY = 'profitwavy_token';
  const REFRESH_TOKEN_KEY = 'profitwavy_refresh_token';
  const USER_KEY = 'profitwavy_user';

  /**
   * Core Request Wrapper
   * @param {boolean} isRetry - Prevents infinite recursion on 401 errors
   */
  async function request(method, path, body = null, requiresAuth = false, isRetry = false) {
    const url = `${BASE_URL}${path}`;
    
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (requiresAuth) {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
      method,
      headers,
      // Removed credentials: 'include' to avoid CORS issues with wildcard origins
      mode: 'cors'
    };

    if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);

      // 1. Handle 401 Unauthorized (Expired Token)
      if (response.status === 401 && !isRetry) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          // Retry once with the new token
          return request(method, path, body, requiresAuth, true);
        }
        
        // If refresh fails, clear and redirect
        handleAuthFailure();
        throw new Error('Session expired. Please log in again.');
      }

      // 2. Handle 404 Not Found
      if (response.status === 404) {
        throw new Error(`API endpoint not found: ${path}`);
      }

      // 3. Parse Response
      const contentType = response.headers.get('content-type');
      let data = (contentType && contentType.includes('application/json')) 
                 ? await response.json() 
                 : { message: await response.text() };

      // 4. Handle non-2xx responses
      if (!response.ok) {
        const error = new Error(data.message || data.error || `Error: ${response.status}`);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      if (error.name === 'TypeError') {
        throw new Error('Network error or CORS block. Check connection.');
      }
      throw error;
    }
  }

  /**
   * Refreshes the Access Token
   * Uses raw fetch to avoid interceptor recursion
   */
  async function refreshAccessToken() {
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) return false;

      const response = await fetch(`${BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.accessToken) {
          localStorage.setItem(TOKEN_KEY, data.accessToken);
          if (data.refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
          return true;
        }
      }
      return false;
    } catch (err) {
      return false;
    }
  }

  function handleAuthFailure() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    
    if (!window.location.pathname.includes('login') && !window.location.pathname.includes('register')) {
      window.location.href = 'login.html?session=expired';
    }
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  const API = {
    async register(registerName, phone, password, referralCode = '') {
      const cleanPhone = phone.replace(/\D/g, '');
      
      if (!registerName || registerName.length < 2) throw new Error('Invalid Name');
      if (!/^0\d{9}$/.test(cleanPhone)) throw new Error('Invalid Phone');
      if (password.length < 8) throw new Error('Password too short');

      const data = await request('POST', '/auth/register', {
        fullName: registerName.trim(),
        phone: cleanPhone,
        password,
        referralCode: referralCode.trim() || undefined
      });

      if (data.accessToken) localStorage.setItem(TOKEN_KEY, data.accessToken);
      if (data.data) localStorage.setItem(USER_KEY, JSON.stringify(data.data));
      return data;
    },

    async login(identifier, password) {
      const data = await request('POST', '/auth/login', {
        identifier: identifier.trim(),
        password
      });

      if (data.accessToken) localStorage.setItem(TOKEN_KEY, data.accessToken);
      if (data.refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
      if (data.data) localStorage.setItem(USER_KEY, JSON.stringify(data.data));
      return data;
    },

    async logout() {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        // Attempt clean logout but don't block if it fails
        try { await fetch(`${BASE_URL}/auth/logout`, { 
          method: 'POST', 
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ refreshToken }) 
        }); } catch(e) {}
      }
      handleAuthFailure();
      window.location.href = 'login.html?loggedout=true';
    },

    isAuthenticated: () => !!localStorage.getItem(TOKEN_KEY),
    getCurrentUser: () => JSON.parse(localStorage.getItem(USER_KEY) || 'null'),
    request // Expose for custom calls
  };

  window.ProfitWavyAPI = API;
})();
