// ============================================================
// PROFITWAVY REGISTRATION MODULE - Production Ready
// ============================================================
(function() {
  'use strict';

  // ──────────────────────────────────────────────────────────
  // CONFIGURATION & CONSTANTS
  // ──────────────────────────────────────────────────────────
  const RATE_LIMIT_KEY = 'profitwavy_register_attempts';
  const MAX_ATTEMPTS = 5;
  const LOCK_TIME = 15 * 60 * 1000; // 15 minutes
  const DEBOUNCE_DELAY = 300;

  // ──────────────────────────────────────────────────────────
  // UTILITY FUNCTIONS
  // ──────────────────────────────────────────────────────────
  
  // Debounce for performance
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

  // Toast notifications
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
    
    const closeBtn = toast.querySelector('.toast-close');
    if (closeBtn) closeBtn.onclick = () => { toast.className = 'toast'; };
  }

  // Button loading state
  function setButtonLoading(button, isLoading, loadingText = 'Loading...') {
    if (!button) return;
    
    if (isLoading) {
      button.disabled = true;
      button.dataset.originalText = button.innerHTML;
      button.innerHTML = `<i class="fas fa-spinner fa-spin me-2"></i>${loadingText}`;
      button.style.cursor = 'not-allowed';
    } else {
      button.disabled = false;
      button.innerHTML = button.dataset.originalText || button.innerHTML;
      button.style.cursor = 'pointer';
    }
  }

  // Rate limiting
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
  
  function validateAllFields(name, phone, password, confirmPassword = '') {
    // Name validation
    if (!name || name.length < 2) {
      return { isValid: false, message: 'Please enter your full name (at least 2 characters)' };
    }
    
    if (name.length > 100) {
      return { isValid: false, message: 'Name is too long (maximum 100 characters)' };
    }
    
    if (!/^[a-zA-Z\s'-]+$/.test(name)) {
      return { isValid: false, message: 'Name can only contain letters, spaces, hyphens and apostrophes' };
    }
    
    // Phone validation
    if (!phone) {
      return { isValid: false, message: 'Please enter your phone number' };
    }
    
    const cleanPhone = phone.replace(/\D/g, '');
    if (!/^0(20|23|24|25|26|27|28|50|54|55|56|57|59)\d{7}$/.test(cleanPhone)) {
      return { isValid: false, message: 'Please enter a valid Ghanaian phone number (e.g., 0241234567)' };
    }
    
    // Password validation
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) return passwordValidation;
    
    // Password confirmation (if field exists)
    if (confirmPassword && password !== confirmPassword) {
      return { isValid: false, message: 'Passwords do not match' };
    }
    
    return { isValid: true };
  }

  function validatePassword(password) {
    if (!password) {
      return { isValid: false, message: 'Please enter a password' };
    }
    
    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters long' };
    }
    
    if (password.length > 128) {
      return { isValid: false, message: 'Password is too long (maximum 128 characters)' };
    }
    
    if (!/[a-zA-Z]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one letter' };
    }
    
    if (!/[0-9]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one number' };
    }
    
    const commonPasswords = ['password', '12345678', 'qwerty', 'abc123', 'profitwavy123'];
    if (commonPasswords.includes(password.toLowerCase())) {
      return { isValid: false, message: 'This password is too common. Please choose a stronger password' };
    }
    
    return { isValid: true };
  }

  function validateField(input, type) {
    const value = input.value.trim();
    let isValid = true;
    let message = '';
    
    switch(type) {
      case 'name':
        if (value.length < 2) {
          isValid = false;
          message = 'Name must be at least 2 characters';
        } else if (!/^[a-zA-Z\s'-]+$/.test(value)) {
          isValid = false;
          message = 'Name can only contain letters';
        }
        break;
        
      case 'phone':
        const phone = value.replace(/\D/g, '');
        if (!/^0(20|23|24|25|26|27|28|50|54|55|56|57|59)\d{7}$/.test(phone)) {
          isValid = false;
          message = 'Invalid Ghanaian phone number format';
        }
        break;
        
      case 'password':
        if (value.length < 8) {
          isValid = false;
          message = 'Password must be at least 8 characters';
        }
        break;
    }
    
    const errorElement = input.parentElement.querySelector('.error-message');
    if (errorElement) {
      if (!isValid) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        input.classList.add('is-invalid');
      } else {
        errorElement.style.display = 'none';
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
      }
    }
    
    return isValid;
  }

  // ──────────────────────────────────────────────────────────
  // UI COMPONENT FUNCTIONS
  // ──────────────────────────────────────────────────────────
  
  function updatePasswordStrength() {
    const password = document.getElementById('registerPassword')?.value || '';
    const strengthBar = document.getElementById('passwordStrengthBar');
    const strengthText = document.getElementById('passwordStrengthText');
    
    if (!strengthBar || !strengthText) return;
    
    if (password.length === 0) {
      strengthBar.style.width = '0%';
      strengthText.textContent = '';
      return;
    }
    
    let strength = 0;
    let feedback = [];
    
    // Length checks
    if (password.length >= 8) {
      strength += 20;
    } else {
      feedback.push('Use at least 8 characters');
    }
    
    if (password.length >= 12) strength += 10;
    
    // Complexity checks
    if (/[A-Z]/.test(password)) {
      strength += 20;
    } else {
      feedback.push('Add uppercase letters');
    }
    
    if (/[a-z]/.test(password)) {
      strength += 20;
    } else {
      feedback.push('Add lowercase letters');
    }
    
    if (/[0-9]/.test(password)) {
      strength += 20;
    } else {
      feedback.push('Add numbers');
    }
    
    if (/[^A-Za-z0-9]/.test(password)) {
      strength += 20;
    } else {
      feedback.push('Add special characters (!@#$%^&*)');
    }
    
    // Bonus for variety
    const uniqueChars = new Set(password).size;
    if (uniqueChars > 8) strength += 10;
    
    // Cap at 100
    strength = Math.min(strength, 100);
    
    // Update UI
    strengthBar.style.width = strength + '%';
    strengthBar.style.transition = 'width 0.3s ease';
    
    // Set strength level and color
    if (strength < 40) {
      strengthBar.style.backgroundColor = '#e74c3c';
      strengthText.textContent = 'Weak';
      strengthText.style.color = '#e74c3c';
    } else if (strength < 70) {
      strengthBar.style.backgroundColor = '#f39c12';
      strengthText.textContent = 'Medium';
      strengthText.style.color = '#f39c12';
    } else if (strength < 90) {
      strengthBar.style.backgroundColor = '#3498db';
      strengthText.textContent = 'Good';
      strengthText.style.color = '#3498db';
    } else {
      strengthBar.style.backgroundColor = '#27ae60';
      strengthText.textContent = 'Strong';
      strengthText.style.color = '#27ae60';
    }
    
    // Show feedback
    const feedbackElement = document.getElementById('passwordFeedback');
    if (feedbackElement) {
      if (feedback.length > 0 && strength < 70) {
        feedbackElement.textContent = feedback.join(', ');
        feedbackElement.style.display = 'block';
      } else {
        feedbackElement.style.display = 'none';
      }
    }
  }

  function initPhoneFormatting() {
    const phoneInput = document.getElementById('registerPhone');
    if (!phoneInput) return;
    
    phoneInput.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length > 10) value = value.slice(0, 10);
      
      if (value.length > 3 && value.length <= 6) {
        value = value.slice(0, 3) + ' ' + value.slice(3);
      } else if (value.length > 6) {
        value = value.slice(0, 3) + ' ' + value.slice(3, 6) + ' ' + value.slice(6);
      }
      
      e.target.value = value;
    });
  }

  function initPasswordToggle() {
    document.querySelectorAll('.password-toggle').forEach(button => {
      button.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        const input = document.getElementById(targetId);
        const icon = this.querySelector('i');
        
        if (!input || !icon) return;
        
        if (input.type === 'password') {
          input.type = 'text';
          icon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
          input.type = 'password';
          icon.classList.replace('fa-eye-slash', 'fa-eye');
        }
      });
    });
  }

  function populateReferralFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const referralCode = urlParams.get('ref') || urlParams.get('referral');
    
    if (referralCode) {
      const referralInput = document.getElementById('registerReferral');
      if (referralInput) {
        referralInput.value = referralCode;
        referralInput.readOnly = true;
        showToast('Referral code applied: ' + referralCode, 'info');
      }
    }
  }

  // ──────────────────────────────────────────────────────────
  // FORM RECOVERY & SESSION MANAGEMENT
  // ──────────────────────────────────────────────────────────
  
  function setupFormRecovery() {
    const form = document.getElementById('registerForm');
    if (!form) return;
    
    // Restore saved data
    restoreFormData();
    
    // Save data on input with debounce
    const inputs = form.querySelectorAll('input');
    const saveFormData = debounce(() => {
      const formData = {
        name: document.getElementById('registerName')?.value || '',
        phone: document.getElementById('registerPhone')?.value || '',
        referral: document.getElementById('registerReferral')?.value || ''
      };
      sessionStorage.setItem('register_form_data', JSON.stringify(formData));
    }, 500);
    
    inputs.forEach(input => input.addEventListener('input', saveFormData));
    
    // Clear on successful submission
    form.addEventListener('submit', () => {
      sessionStorage.removeItem('register_form_data');
    });
  }

  function restoreFormData() {
    const savedData = sessionStorage.getItem('register_form_data');
    if (!savedData) return;
    
    try {
      const data = JSON.parse(savedData);
      if (data.name) document.getElementById('registerName').value = data.name;
      if (data.phone) document.getElementById('registerPhone').value = data.phone;
      if (data.referral) document.getElementById('registerReferral').value = data.referral;
    } catch (error) {
      console.error('Failed to restore form data:', error);
    }
  }

  // ──────────────────────────────────────────────────────────
  // ERROR HANDLING
  // ──────────────────────────────────────────────────────────
  
  function getErrorMessage(error) {
    const message = error.message || 'An error occurred';
    
    if (message.toLowerCase().includes('already registered') || 
        message.toLowerCase().includes('already exists') ||
        message.toLowerCase().includes('duplicate')) {
      return 'This phone number is already registered. Please log in instead or use a different number.';
    }
    
    if (message.toLowerCase().includes('network') || 
        message.toLowerCase().includes('fetch')) {
      return 'Network error. Please check your internet connection and try again.';
    }
    
    if (message.toLowerCase().includes('cors')) {
      return 'Connection error. Please try again or contact support.';
    }
    
    if (message.toLowerCase().includes('phone') || 
        message.toLowerCase().includes('invalid number')) {
      return 'Please enter a valid phone number.';
    }
    
    if (message.toLowerCase().includes('password')) {
      return 'Password does not meet requirements.';
    }
    
    if (message.toLowerCase().includes('500') || 
        message.toLowerCase().includes('server error')) {
      return 'Server error. Please try again in a few moments.';
    }
    
    if (message.toLowerCase().includes('rate limit') || 
        message.toLowerCase().includes('too many')) {
      return 'Too many attempts. Please wait a few minutes.';
    }
    
    if (message.toLowerCase().includes('referral')) {
      return 'Invalid referral code. You can continue without one.';
    }
    
    return message || 'Registration failed. Please try again or contact support.';
  }

  // ──────────────────────────────────────────────────────────
  // MAIN REGISTRATION HANDLER
  // ──────────────────────────────────────────────────────────
  
  async function handleRegistration(e) {
    e.preventDefault();
    
    // Check rate limit
    const rateLimit = checkRateLimit();
    if (!rateLimit.allowed) {
      showToast(rateLimit.message, 'error');
      return;
    }
    
    // Record attempt
    recordAttempt();
    
    // Get form values
    const name = document.getElementById('registerName')?.value.trim() || '';
    const phone = document.getElementById('registerPhone')?.value.replace(/\D/g, '') || '';
    const password = document.getElementById('registerPassword')?.value || '';
    const confirmPassword = document.getElementById('confirmPassword')?.value || '';
    const referral = document.getElementById('registerReferral')?.value.trim() || '';
    const termsCheckbox = document.getElementById('agreeTerms');
    
    // Validate terms
    if (termsCheckbox && !termsCheckbox.checked) {
      showToast('Please accept the Terms & Conditions to continue', 'error');
      termsCheckbox.focus();
      return;
    }
    
    // Validate fields
    const validationResult = validateAllFields(fullname, phone, password, confirmPassword);
    if (!validationResult.isValid) {
      showToast(validationResult.message, 'error');
      return;
    }
    
    // Show loading state
    const submitBtn = document.querySelector('#registerForm button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    setButtonLoading(submitBtn, true, 'Creating Account...');
    
    try {
      // Analytics tracking
      if (window.gtag) {
        gtag('event', 'registration_attempt', {
          'event_category': 'authentication',
          'event_label': 'register_form_submit'
        });
      }
      
      // Call API
      console.log('Registration attempt:', { fullname, phone: phone.substring(0, 4) + '***' });
      const result = await window.ProfitWavyAPI.register(fullname, phone, password, referral);
      
      console.log('Registration successful:', result);
      
      // Analytics success
      if (window.gtag) {
        gtag('event', 'registration_success', {
          'event_category': 'authentication',
          'event_label': 'new_user'
        });
      }
      
      // Show success and redirect
      showToast('🎉 Account created successfully! Redirecting to dashboard...', 'success');
      document.getElementById('registerForm').reset();
      localStorage.removeItem(RATE_LIMIT_KEY);
      
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 2000);
      
    } catch (error) {
      console.error('Registration error:', error);
      
      // Analytics failure
      if (window.gtag) {
        gtag('event', 'registration_failed', {
          'event_category': 'authentication',
          'event_label': error.message.substring(0, 50)
        });
      }
      
      // Show error
      const errorMessage = getErrorMessage(error);
      showToast(errorMessage, 'error');
      
    } finally {
      setButtonLoading(submitBtn, false, originalText);
    }
  }

  // ──────────────────────────────────────────────────────────
  // INITIALIZATION & SETUP
  // ──────────────────────────────────────────────────────────
  
  function initRegistration() {
    // Check if user is already logged in
    if (window.ProfitWavyAPI && window.ProfitWavyAPI.isAuthenticated()) {
      console.log('User already logged in, redirecting...');
      window.location.href = 'dashboard.html';
      return;
    }
    
    // Setup form validation
    const form = document.getElementById('registerForm');
    if (!form) {
      console.error('Registration form not found');
      return;
    }
    
    // Password strength indicator
    const passwordInput = document.getElementById('registerPassword');
    if (passwordInput) {
      passwordInput.addEventListener('input', updatePasswordStrength);
    }
    
    // Real-time validation with debounce
    const nameInput = document.getElementById('registerName');
    const phoneInput = document.getElementById('registerPhone');
    
    if (nameInput) {
      nameInput.addEventListener('input', debounce(() => validateField(nameInput, 'name'), DEBOUNCE_DELAY));
    }
    
    if (phoneInput) {
      phoneInput.addEventListener('input', debounce(() => validateField(phoneInput, 'phone'), DEBOUNCE_DELAY));
    }
    
    if (passwordInput) {
      passwordInput.addEventListener('input', debounce(() => validateField(passwordInput, 'password'), DEBOUNCE_DELAY));
    }
    
    // Initialize components
    initPhoneFormatting();
    initPasswordToggle();
    populateReferralFromURL();
    setupFormRecovery();
    
    // Network status detection
    window.addEventListener('online', () => showToast('You are back online', 'info', 3000));
    window.addEventListener('offline', () => showToast('You are offline. Please check connection.', 'error'));
    
    if (!navigator.onLine) {
      showToast('You appear to be offline. Please check connection.', 'warning');
    }
    
    // Form submission
    form.addEventListener('submit', handleRegistration);
    
    // Show form with animation
    const mainContent = document.getElementById('registerForm');
    if (mainContent) {
      mainContent.style.opacity = '0';
      setTimeout(() => {
        mainContent.style.transition = 'opacity 0.3s ease';
        mainContent.style.opacity = '1';
      }, 100);
    }
  }

  // ──────────────────────────────────────────────────────────
  // STARTUP
  // ──────────────────────────────────────────────────────────
  
  document.addEventListener('DOMContentLoaded', function() {
    // Check API availability
    if (!window.ProfitWavyAPI) {
      console.error('ProfitWavyAPI not loaded');
      showToast('System error. Please refresh the page.', 'error');
      return;
    }
    
    // Initialize registration
    initRegistration();
    
    // API error listener
    window.addEventListener('profitwavy:api:error', function(e) {
      console.error('API Error:', e.detail);
      showToast('Connection error. Please try again.', 'error');
    });
  });

})();




