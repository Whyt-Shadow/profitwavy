// js/login.js  —  Login page logic for ProfitWavy
(function () {
  'use strict';

  // ── DOM refs ───────────────────────────────────────────────────────────────
  const loginForm     = document.getElementById('loginForm');
  const phoneInput    = document.getElementById('loginPhone');
  const passwordInput = document.getElementById('loginPassword');
  const loginButton   = document.getElementById('loginButton');
  const toggleBtn     = document.getElementById('passwordToggle');
  const toastEl       = document.getElementById('toast');
  const toastTitle    = document.getElementById('toastTitle');
  const toastMessage  = document.getElementById('toastMessage');

  // ── Toast helper ───────────────────────────────────────────────────────────
  function showToast(message, type = 'success') {
    toastTitle.textContent  = type === 'success' ? '✅ Success' : '⚠️ Error';
    toastMessage.textContent = message;
    toastEl.className        = 'toast show';
    toastEl.classList.add(type === 'success' ? 'bg-success' : 'bg-danger', 'text-white');

    // Auto-hide after 4 seconds
    setTimeout(() => { toastEl.classList.remove('show'); }, 4000);
  }

  // ── Password visibility toggle ─────────────────────────────────────────────
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      toggleBtn.querySelector('i').classList.toggle('fa-eye', !isPassword);
      toggleBtn.querySelector('i').classList.toggle('fa-eye-slash', isPassword);
    });
  }

  // ── Form submit ────────────────────────────────────────────────────────────
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const phone    = phoneInput.value.trim();
    const password = passwordInput.value;

    // ── Basic front-end validation ─────────────────────────────────────────
    if (!/^0\d{9}$/.test(phone)) {
      phoneInput.classList.add('is-invalid');
      return;
    } else {
      phoneInput.classList.remove('is-invalid');
    }

    if (password.length < 8) {
      passwordInput.classList.add('is-invalid');
      return;
    } else {
      passwordInput.classList.remove('is-invalid');
    }

    // ── Disable button while request is in flight ──────────────────────────
    loginButton.disabled = true;
    loginButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span> Logging in…';

    try {
      await window.ProfitWavyAPI.login(phone, password);

      showToast('Login successful! Redirecting…', 'success');

      // Redirect after a short delay so the toast is visible
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1200);

    } catch (error) {
      showToast(error.message || 'Login failed. Please try again.', 'error');

      // Re-enable button
      loginButton.disabled = false;
      loginButton.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i> Login';
    }
  });

  // ── If user is already logged in, redirect immediately ─────────────────────
  if (window.ProfitWavyAPI && window.ProfitWavyAPI.getToken()) {
    window.location.href = 'dashboard.html';
  }
})();
