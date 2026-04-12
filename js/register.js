// ============================================================
// PROFITWAVY REGISTRATION MODULE - Fixed & Optimized
// ============================================================
(function() {
  'use strict';

  const RATE_LIMIT_KEY = 'profitwavy_register_attempts';
  const MAX_ATTEMPTS = 5;
  const LOCK_TIME = 15 * 60 * 1000;
  const DEBOUNCE_DELAY = 300;

  // ──────────────────────────────────────────────────────────
  // UTILITY FUNCTIONS
  // ──────────────────────────────────────────────────────────
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (!toast || !toastMessage) {
      alert(message);
      return;
    }
    
    toastMessage.textContent = message;
    toast.className = 'toast show';
    
    const styles = {
      success: { bg: '#d4edda', color: '#155724', border: '#c3e6cb', icon: 'fa-check-circle' },
      error: { bg: '#f8d7da', color: '#721c24', border: '#f5c6cb', icon: 'fa-exclamation-circle' },
      warning: { bg: '#fff3cd', color: '#856404', border: '#ffeaa7', icon: 'fa-exclamation-triangle' },
      info: { bg: '#d1ecf1', color: '#0c5460', border: '#bee5eb', icon: 'fa-info-circle' }
    };
    
    const style = styles[type] || styles.success;
    toast.style.backgroundColor = style.bg;
    toast.style.color = style.color;
    toast.style.borderColor = style.border;
    
    const iconElement = toast.querySelector('.toast-icon');
    if (iconElement) iconElement.className = `fas ${style.icon} toast-icon me-2`;
    
    setTimeout(() => { toast.className = 'toast'; }, 5000);
  }

  function setButtonLoading(button, isLoading, loadingText = 'Loading...') {
    if (!button) return;
    if (isLoading) {
      button.disabled = true;
      button.dataset.originalText = button.innerHTML;
      button.innerHTML = `<i class="fas fa-spinner fa-spin me-2"></i>${loadingText}`;
    } else {
      button.disabled = false;
      button.innerHTML = button.dataset.originalText || button.innerHTML;
    }
  }

  function checkRateLimit() {
    const attempts = JSON.parse(localStorage.getItem(RATE_LIMIT_KEY) || '[]');
    const now = Date.now();
    const recentAttempts = attempts.filter(time => now - time < LOCK_TIME);
    
    if (recentAttempts.length >= MAX_ATTEMPTS) {
      const oldestAttempt = Math.min(...recentAttempts);
      const lockRemaining = Math.ceil((LOCK_TIME - (now - oldestAttempt)) / 60000);
      return { allowed: false, message: `Too many attempts. Please wait ${lockRemaining} minutes.` };
    }
    return { allowed: true };
  }

  function recordAttempt() {
    const attempts = JSON.parse(localStorage.getItem(RATE_LIMIT_KEY) || '[]');
    attempts.push(Date.now());
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(attempts));
  }

  // ──────────────────────────────────────────────────────────
  // VALIDATION FUNCTIONS
  // ──────────────────────────────────────────────────────────
  function validateAllFields(registerName, phone, password, confirmPassword = '') {
    if (!registerName || registerName.length < 2) return { isValid: false, message: 'Please enter your full name' };
    if (!/^[a-zA-Z\s'-]+$/.test(registerName)) return { isValid: false, message: 'Name contains invalid characters' };
    
    const cleanPhone = phone.replace(/\D/g, '');
    if (!/^0(20|23|24|25|26|27|28|50|54|55|56|57|59)\d{7}$/.test(cleanPhone)) {
      return { isValid: false, message: 'Invalid Ghanaian phone number' };
    }
    
    const pwdVal = validatePassword(password);
    if (!pwdVal.isValid) return pwdVal;
    if (confirmPassword && password !== confirmPassword) return { isValid: false, message: 'Passwords do not match' };
    
    return { isValid: true };
  }

  function validatePassword(password) {
    if (!password || password.length < 8) return { isValid: false, message: 'Password must be 8+ characters' };
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      return { isValid: false, message: 'Password needs letters and numbers' };
    }
    return { isValid: true };
  }

  function validateField(input, type) {
    const value = input.value.trim();
    let isValid = true;
    let message = '';
    
    switch(type) {
      case 'fullName':
        isValid = value.length >= 2 && /^[a-zA-Z\s'-]+$/.test(value);
        message = 'Invalid name format';
        break;
      case 'phone':
        const clean = value.replace(/\D/g, ''); // Fix: Strip spaces for validation
        isValid = /^0(20|23|24|25|26|27|28|50|54|55|56|57|59)\d{7}$/.test(clean);
        message = 'Invalid phone number';
        break;
      case 'password':
        isValid = value.length >= 8;
        message = 'Min 8 characters';
        break;
    }
    
    const errorElement = input.parentElement.querySelector('.error-message');
    if (errorElement) {
      errorElement.textContent = isValid ? '' : message;
      errorElement.style.display = isValid ? 'none' : 'block';
      input.classList.toggle('is-invalid', !isValid);
      input.classList.toggle('is-valid', isValid);
    }
    return isValid;
  }

  // ──────────────────────────────────────────────────────────
  // UI & FEATURES
  // ──────────────────────────────────────────────────────────
  function initPhoneFormatting() {
    const phoneInput = document.getElementById('registerPhone');
    if (!phoneInput) return;
    phoneInput.addEventListener('input', function(e) {
      let val = e.target.value.replace(/\D/g, '').slice(0, 10);
      if (val.length > 6) val = val.slice(0, 3) + ' ' + val.slice(3, 6) + ' ' + val.slice(6);
      else if (val.length > 3) val = val.slice(0, 3) + ' ' + val.slice(3);
      e.target.value = val;
    });
  }

  function setupFormRecovery() {
    const form = document.getElementById('registerForm');
    if (!form) return;
    
    // Safety check on restore
    const saved = sessionStorage.getItem('register_form_data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        const nameInput = document.getElementById('registerName');
        const phoneInput = document.getElementById('registerPhone');
        if (nameInput && data.fullName) nameInput.value = data.fullName;
        if (phoneInput && data.phone) phoneInput.value = data.phone;
      } catch (e) { console.error(e); }
    }

    form.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', debounce(() => {
        const data = {
          fullName: document.getElementById('registerName')?.value || '',
          phone: document.getElementById('registerPhone')?.value || ''
        };
        sessionStorage.setItem('register_form_data', JSON.stringify(data));
      }, 500));
    });
  }

  // ──────────────────────────────────────────────────────────
  // REGISTRATION HANDLER
  // ──────────────────────────────────────────────────────────
  async function handleRegistration(e) {
    e.preventDefault();
    
    const rateLimit = checkRateLimit();
    if (!rateLimit.allowed) return showToast(rateLimit.message, 'error');
    recordAttempt();

    // FIXED: Corrected IDs to match initialization
    const fullName = document.getElementById('registerName')?.value.trim() || '';
    const phone = document.getElementById('registerPhone')?.value.replace(/\D/g, '') || '';
    const password = document.getElementById('registerPassword')?.value || '';
    const confirmPassword = document.getElementById('confirmPassword')?.value || '';
    const referral = document.getElementById('registerReferral')?.value.trim() || '';
    const terms = document.getElementById('agreeTerms');

    if (terms && !terms.checked) return showToast('Accept terms to continue', 'error');

    const validation = validateAllFields(fullName, phone, password, confirmPassword);
    if (!validation.isValid) return showToast(validation.message, 'error');

    const submitBtn = e.target.querySelector('button[type="submit"]');
    setButtonLoading(submitBtn, true, 'Creating Account...');

    try {
      const result = await window.ProfitWavyAPI.register(fullName, phone, password, referral);
      showToast('🎉 Success! Redirecting...', 'success');
      sessionStorage.removeItem('register_form_data');
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 2000);
    } catch (error) {
      showToast(error.message || 'Registration failed', 'error');
    } finally {
      setButtonLoading(submitBtn, false);
    }
  }

  // ──────────────────────────────────────────────────────────
  // INITIALIZATION
  // ──────────────────────────────────────────────────────────
  function init() {
    if (window.ProfitWavyAPI?.isAuthenticated()) {
      window.location.href = 'dashboard.html';
      return;
    }

    const form = document.getElementById('registerForm');
    if (!form) return;

    initPhoneFormatting();
    setupFormRecovery();
    
    const nameInput = document.getElementById('registerName');
    const phoneInput = document.getElementById('registerPhone');
    
    if (nameInput) nameInput.addEventListener('input', debounce(() => validateField(nameInput, 'fullName'), DEBOUNCE_DELAY));
    if (phoneInput) phoneInput.addEventListener('input', debounce(() => validateField(phoneInput, 'phone'), DEBOUNCE_DELAY));

    form.addEventListener('submit', handleRegistration);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
