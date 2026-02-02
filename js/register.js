// js/register.js  —  Registration page logic for ProfitWavy
(function () {
  'use strict';

  // ── DOM refs ───────────────────────────────────────────────────────────────
  const registerForm       = document.getElementById('registerForm');
  const nameInput          = document.getElementById('registerName');
  const phoneInput         = document.getElementById('registerPhone');
  const passwordInput      = document.getElementById('registerPassword');
  const referralInput      = document.getElementById('registerReferral');
  const toggleBtn          = document.getElementById('passwordToggle');
  const strengthBar        = document.getElementById('passwordStrengthBar');
  const strengthText       = document.getElementById('passwordStrengthText');
  const toastMessage       = document.getElementById('toastMessage');
  const toastEl            = document.getElementById('toast');
  const submitBtn          = registerForm.querySelector('button[type="submit"]');

  // ── Toast helper ───────────────────────────────────────────────────────────
  function showToast(message, type = 'success') {
    toastMessage.textContent = message;
    toastEl.className = 'toast show';
    toastEl.classList.add(type === 'success' ? 'bg-success' : 'bg-danger', 'text-white');
    setTimeout(() => { toastEl.classList.remove('show'); }, 4000);
  }

  // ── Password toggle ────────────────────────────────────────────────────────
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      toggleBtn.querySelector('i').classList.toggle('fa-eye', !isPassword);
      toggleBtn.querySelector('i').classList.toggle('fa-eye-slash', isPassword);
    });
  }

  // ── Password strength meter ────────────────────────────────────────────────
  function evaluateStrength(password) {
    let score = 0;
    if (password.length >= 8)           score++;
    if (password.length >= 12)          score++;
    if (/[A-Z]/.test(password))         score++;
    if (/[a-z]/.test(password))         score++;
    if (/[0-9]/.test(password))         score++;
    if (/[^A-Za-z0-9]/.test(password))  score++;
    return score; // 0-6
  }

  passwordInput.addEventListener('input', () => {
    const password = passwordInput.value;
    const score    = evaluateStrength(password);

    // Map score to a width percentage and label
    let width, label, color;
    if (score <= 2)      { width = '25%'; label = 'Weak';   color = '#dc3545'; }
    else if (score <= 3) { width = '40%'; label = 'Fair';   color = '#fd7e14'; }
    else if (score <= 4) { width = '60%'; label = 'Good';   color = '#ffc107'; }
    else if (score <= 5) { width = '80%'; label = 'Strong'; color = '#28a745'; }
    else                 { width = '100%'; label = 'Very Strong'; color = '#198754'; }

    strengthBar.style.width        = width;
    strengthBar.style.backgroundColor = color;
    strengthText.textContent       = label;
    strengthText.style.color       = color;
  });

  // ── Form submit ────────────────────────────────────────────────────────────
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullName     = nameInput.value.trim();
    const phone        = phoneInput.value.trim();
    const password     = passwordInput.value;
    const referralCode = referralInput ? referralInput.value.trim() : '';

    // ── Front-end validation ─────────────────────────────────────────────
    let valid = true;

    if (fullName.length < 2) {
      nameInput.classList.add('is-invalid');
      valid = false;
    } else {
      nameInput.classList.remove('is-invalid');
    }

    if (!/^0\d{9}$/.test(phone)) {
      phoneInput.classList.add('is-invalid');
      valid = false;
    } else {
      phoneInput.classList.remove('is-invalid');
    }

    if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) ||
        !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      passwordInput.classList.add('is-invalid');
      valid = false;
    } else {
      passwordInput.classList.remove('is-invalid');
    }

    if (!valid) return;

    // ── Disable button ───────────────────────────────────────────────────
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span> Creating account…';

    try {
      await window.ProfitWavyAPI.register(fullName, phone, password, referralCode || undefined);

      showToast('Account created successfully! Redirecting…', 'success');

      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1200);

    } catch (error) {
      showToast(error.message || 'Registration failed. Please try again.', 'error');

      // Re-enable button
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-user-plus me-2"></i> Create Account';
    }
  });

  // ── If already logged in, skip to dashboard ───────────────────────────────
  if (window.ProfitWavyAPI && window.ProfitWavyAPI.getToken()) {
    window.location.href = 'dashboard.html';
  }
})();



