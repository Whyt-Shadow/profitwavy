// js/api.js  —  Shared frontend API utility for ProfitWavy
(function () {
  'use strict';

  // ── Resolve the backend base URL ───────────────────────────────────────────
  // In production the backend runs on the same origin so we use "" (relative).
  // Set a <meta name="api-base" content="https://..."> in HTML to override.
  const metaTag = document.querySelector('meta[name="api-base"]');
  const BASE_URL = metaTag ? metaTag.getAttribute('content') : '';

  // ── Read / write the JWT token ─────────────────────────────────────────────
  const TOKEN_KEY = 'profitwavy_token';
  const USER_KEY  = 'profitwavy_user';

  function setAuth(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function getUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY));
    } catch {
      return null;
    }
  }

  function clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  // ── Generic fetch wrapper ──────────────────────────────────────────────────
  async function request(method, path, body = null, requiresAuth = false) {
    const headers = { 'Content-Type': 'application/json' };

    if (requiresAuth) {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = { method, headers };
    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${path}`, options);
    const data = await response.json();

    // If the server says the token is bad, clear local auth
    if (response.status === 401) {
      clearAuth();
    }

    if (!response.ok) {
      const err = new Error(data.message || 'Request failed');
      err.status = response.status;
      err.data = data;
      throw err;
    }

    return data;
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  /**
   * Register a new account.
   * @param {string} fullName
   * @param {string} phone
   * @param {string} password
   * @param {string} [referralCode]
   * @returns {Promise<{token, user}>}
   */
  async function register(fullName, phone, password, referralCode) {
    const payload = { fullName, phone, password };
    if (referralCode) payload.referralCode = referralCode;

    const data = await request('POST', '/api/auth/register', payload);
    setAuth(data.token, data.user);
    return data;
  }

  /**
   * Login with phone + password.
   * @param {string} phone
   * @param {string} password
   * @returns {Promise<{token, user}>}
   */
  async function login(phone, password) {
    const data = await request('POST', '/api/auth/login', { phone, password });
    setAuth(data.token, data.user);
    return data;
  }

  /**
   * Fetch the currently authenticated user's profile.
   * @returns {Promise<{user}>}
   */
  async function getMe() {
    return request('GET', '/api/auth/me', null, true);
  }

  /**
   * Logout — just wipe local auth state.
   */
  function logout() {
    clearAuth();
    window.location.href = 'login.html';
  }

  // Expose on window so login.js / register.js can use it
  window.ProfitWavyAPI = {
    register,
    login,
    getMe,
    logout,
    getToken,
    getUser,
    clearAuth
  };
})();
