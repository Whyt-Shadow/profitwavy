// ========================================
// ProfitWavy Registration Module
// ========================================

document.addEventListener('DOMContentLoaded', function() {
  // Check if user is already authenticated
  if (window.ProfitWavyAPI && window.ProfitWavyAPI.isAuthenticated()) {
    console.log('User already logged in, redirecting to dashboard...');
    window.location.href = 'dashboard.html';
    return;
  }
  
  // Initialize registration functionality
  initRegistration();
});

// ========================================
// Initialization
// ========================================

function initRegistration() {
  // Initialize form validation
  initFormValidation();
  
  // Initialize password toggle
  initPasswordToggle();
  
  // Auto-populate referral code from URL
  populateReferralFromURL();
  
  // Initialize phone number formatting
  initPhoneFormatting();
  
  // Add loading state handler
  handlePageLoading();
}

// ========================================
// Form Validation Setup
// ========================================

function initFormValidation() {
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
  
  // Real-time validation
  const nameInput = document.getElementById('registerName');
  const phoneInput = document.getElementById('registerPhone');
  
  if (nameInput) {
    nameInput.addEventListener('blur', () => validateField(nameInput, 'name'));
  }
  
  if (phoneInput) {
    phoneInput.addEventListener('blur', () => validateField(phoneInput, 'phone'));
  }
  
  if (passwordInput) {
    passwordInput.addEventListener('blur', () => validateField(passwordInput, 'password'));
  }
  
  // Form submission
  form.addEventListener('submit', handleRegistration);
}

// ========================================
// Phone Number Formatting
// ========================================

function initPhoneFormatting() {
  const phoneInput = document.getElementById('registerPhone');
  if (!phoneInput) return;
  
  phoneInput.addEventListener('input', function(e) {
    // Remove non-digits
    let value = e.target.value.replace(/\D/g, '');
    
    // Limit to 11 digits
    if (value.length > 11) {
      value = value.slice(0, 11);
    }
    
    // Format as: 0XXX-XXX-XXXX
    if (value.length > 4 && value.length <= 7) {
      value = value.slice(0, 4) + '-' + value.slice(4);
    } else if (value.length > 7) {
      value = value.slice(0, 4) + '-' + value.slice(4, 7) + '-' + value.slice(7);
    }
    
    e.target.value = value;
  });
}

// ========================================
// Password Toggle
// ========================================

function initPasswordToggle() {
  const toggleButtons = document.querySelectorAll('.password-toggle');
  
  toggleButtons.forEach(button => {
    button.addEventListener('click', function() {
      const targetId = this.getAttribute('data-target');
      const input = document.getElementById(targetId);
      const icon = this.querySelector('i');
      
      if (!input || !icon) return;
      
      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      }
    });
  });
}

// ========================================
// Referral Code from URL
// ========================================

function populateReferralFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const referralCode = urlParams.get('ref') || urlParams.get('referral');
  
  if (referralCode) {
    const referralInput = document.getElementById('registerReferral');
    if (referralInput) {
      referralInput.value = referralCode;
      referralInput.readOnly = true; // Prevent editing
      
      // Show info message
      showToast('Referral code applied: ' + referralCode, 'info');
    }
  }
}

// ========================================
// Registration Handler
// ========================================

async function handleRegistration(e) {
  e.preventDefault();
  
  // Get form values
  const name = document.getElementById('registerName')?.value.trim() || '';
  const phone = document.getElementById('registerPhone')?.value.replace(/\D/g, '') || '';
  const password = document.getElementById('registerPassword')?.value || '';
  const referral = document.getElementById('registerReferral')?.value.trim() || '';
  const termsCheckbox = document.getElementById('termsCheckbox');
  
  // Validate terms acceptance
  if (termsCheckbox && !termsCheckbox.checked) {
    showToast('Please accept the Terms & Conditions to continue', 'error');
    termsCheckbox.focus();
    return;
  }
  
  // Validate all fields
  const validationResult = validateAllFields(name, phone, password);
  if (!validationResult.isValid) {
    showToast(validationResult.message, 'error');
    return;
  }
  
  // Show loading state
  const submitBtn = document.querySelector('#registerForm button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  setButtonLoading(submitBtn, true, 'Creating Account...');
  
  try {
    // Call API
    console.log('Attempting registration...', { name, phone: phone.substring(0, 4) + '***' });
    
    const result = await window.ProfitWavyAPI.register(name, phone, password, referral);
    
    console.log('Registration successful:', result);
    
    // Show success message
    showToast('🎉 Account created successfully! Redirecting to dashboard...', 'success');
    
    // Clear form
    document.getElementById('registerForm').reset();
    
    // Redirect to dashboard after delay
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 2000);
    
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific errors
    const errorMessage = getErrorMessage(error);
    showToast(errorMessage, 'error');
    
    // Log error for debugging
    if (window.ProfitWavyAPI && window.ProfitWavyAPI.logError) {
      window.ProfitWavyAPI.logError('registration', error);
    }
    
  } finally {
    // Reset button state
    setButtonLoading(submitBtn, false, originalText);
  }
}

// ========================================
// Validation Functions
// ========================================

function validateAllFields(name, phone, password) {
  // Name validation
  if (!name || name.length < 2) {
    return {
      isValid: false,
      message: 'Please enter your full name (at least 2 characters)'
    };
  }
  
  if (name.length > 100) {
    return {
      isValid: false,
      message: 'Name is too long (maximum 100 characters)'
    };
  }
  
  // Check for valid name characters
  if (!/^[a-zA-Z\s'-]+$/.test(name)) {
    return {
      isValid: false,
      message: 'Name can only contain letters, spaces, hyphens and apostrophes'
    };
  }
  
  // Phone validation
  if (!phone) {
    return {
      isValid: false,
      message: 'Please enter your phone number'
    };
  }
  
  // Nigerian phone number validation
  if (!/^0[789][01]\d{8}$/.test(phone)) {
    return {
      isValid: false,
      message: 'Please enter a valid Nigerian phone number (e.g., 0803 123 4567)'
    };
  }
  
  // Password validation
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return passwordValidation;
  }
  
  return { isValid: true };
}

function validatePassword(password) {
  if (!password) {
    return {
      isValid: false,
      message: 'Please enter a password'
    };
  }
  
  if (password.length < 8) {
    return {
      isValid: false,
      message: 'Password must be at least 8 characters long'
    };
  }
  
  if (password.length > 128) {
    return {
      isValid: false,
      message: 'Password is too long (maximum 128 characters)'
    };
  }
  
  // Check for at least one letter and one number
  if (!/[a-zA-Z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one letter'
    };
  }
  
  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one number'
    };
  }
  
  // Check for common passwords
  const commonPasswords = ['password', '12345678', 'qwerty', 'abc123'];
  if (commonPasswords.includes(password.toLowerCase())) {
    return {
      isValid: false,
      message: 'This password is too common. Please choose a stronger password'
    };
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
      if (!/^0[789][01]\d{8}$/.test(phone)) {
        isValid = false;
        message = 'Invalid phone number format';
      }
      break;
      
    case 'password':
      if (value.length < 8) {
        isValid = false;
        message = 'Password must be at least 8 characters';
      }
      break;
  }
  
  // Show/hide error message
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

// ========================================
// Password Strength Indicator
// ========================================

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
  
  if (password.length >= 12) {
    strength += 10;
  }
  
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
  if (uniqueChars > 8) {
    strength += 10;
  }
  
  // Cap at 100
  strength = Math.min(strength, 100);
  
  // Update progress bar
  strengthBar.style.width = strength + '%';
  strengthBar.style.transition = 'width 0.3s ease';
  
  // Update text and color
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
  
  // Show feedback if available
  const feedbackElement = document.getElementById('passwordFeedback');
  if (feedbackElement && feedback.length > 0 && strength < 70) {
    feedbackElement.textContent = feedback.join(', ');
    feedbackElement.style.display = 'block';
  } else if (feedbackElement) {
    feedbackElement.style.display = 'none';
  }
}

// ========================================
// Error Message Handler
// ========================================

function getErrorMessage(error) {
  const message = error.message || 'An error occurred';
  
  // Phone number already registered
  if (message.toLowerCase().includes('already registered') || 
      message.toLowerCase().includes('already exists') ||
      message.toLowerCase().includes('duplicate')) {
    return 'This phone number is already registered. Please log in instead or use a different number.';
  }
  
  // Network errors
  if (message.toLowerCase().includes('network') || 
      message.toLowerCase().includes('fetch')) {
    return 'Network error. Please check your internet connection and try again.';
  }
  
  // CORS errors
  if (message.toLowerCase().includes('cors')) {
    return 'Connection error. Please try again or contact support if the problem persists.';
  }
  
  // Invalid phone number
  if (message.toLowerCase().includes('phone') || 
      message.toLowerCase().includes('invalid number')) {
    return 'Please enter a valid phone number.';
  }
  
  // Password errors
  if (message.toLowerCase().includes('password')) {
    return 'Password does not meet requirements. Please use at least 8 characters.';
  }
  
  // Server errors
  if (message.toLowerCase().includes('500') || 
      message.toLowerCase().includes('server error')) {
    return 'Server error. Please try again in a few moments.';
  }
  
  // Rate limiting
  if (message.toLowerCase().includes('rate limit') || 
      message.toLowerCase().includes('too many')) {
    return 'Too many attempts. Please wait a few minutes and try again.';
  }
  
  // Invalid referral code
  if (message.toLowerCase().includes('referral')) {
    return 'Invalid referral code. You can continue without one or check the code and try again.';
  }
  
  // Default error
  return message || 'Registration failed. Please try again or contact support.';
}

// ========================================
// UI Helper Functions
// ========================================

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

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');
  
  if (!toast || !toastMessage) {
    // Fallback to alert if toast not available
    alert(message);
    return;
  }
  
  toastMessage.textContent = message;
  
  // Reset classes
  toast.className = 'toast show';
  
  // Set styling based on type
  const styles = {
    success: {
      backgroundColor: '#d4edda',
      color: '#155724',
      borderColor: '#c3e6cb',
      icon: 'fa-check-circle'
    },
    error: {
      backgroundColor: '#f8d7da',
      color: '#721c24',
      borderColor: '#f5c6cb',
      icon: 'fa-exclamation-circle'
    },
    warning: {
      backgroundColor: '#fff3cd',
      color: '#856404',
      borderColor: '#ffeaa7',
      icon: 'fa-exclamation-triangle'
    },
    info: {
      backgroundColor: '#d1ecf1',
      color: '#0c5460',
      borderColor: '#bee5eb',
      icon: 'fa-info-circle'
    }
  };
  
  const style = styles[type] || styles.success;
  
  toast.style.backgroundColor = style.backgroundColor;
  toast.style.color = style.color;
  toast.style.borderColor = style.borderColor;
  
  // Add icon if available
  const iconElement = toast.querySelector('.toast-icon');
  if (iconElement) {
    iconElement.className = `fas ${style.icon} toast-icon me-2`;
  }
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    toast.className = 'toast';
  }, 5000);
  
  // Manual close button
  const closeBtn = toast.querySelector('.toast-close');
  if (closeBtn) {
    closeBtn.onclick = () => {
      toast.className = 'toast';
    };
  }
}

// ========================================
// Page Loading Handler
// ========================================

function handlePageLoading() {
  // Hide loading spinner if present
  const loadingSpinner = document.getElementById('loadingSpinner');
  if (loadingSpinner) {
    loadingSpinner.style.display = 'none';
  }
  
  // Show main content
  const mainContent = document.getElementById('registerForm');
  if (mainContent) {
    mainContent.style.opacity = '0';
    mainContent.style.display = 'block';
    
    setTimeout(() => {
      mainContent.style.transition = 'opacity 0.3s ease';
      mainContent.style.opacity = '1';
    }, 100);
  }
}

// ========================================
// Utility Functions
// ========================================

// Check API availability
function checkAPIAvailability() {
  if (!window.ProfitWavyAPI) {
    console.error('ProfitWavyAPI not loaded');
    showToast('System error. Please refresh the page.', 'error');
    return false;
  }
  return true;
}

// Add event listener for API errors
window.addEventListener('profitwavy:api:error', function(e) {
  console.error('API Error:', e.detail);
  showToast('Connection error. Please try again.', 'error');
});

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    validateAllFields,
    validatePassword,
    getErrorMessage
  };
}
