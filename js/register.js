document.addEventListener('DOMContentLoaded', function() {
  // ✅ FIXED: Check if user is already authenticated
  if (window.ProfitWavyAPI && window.ProfitWavyAPI.isAuthenticated()) {
    console.log('User already logged in, redirecting to dashboard...');
    window.location.href = 'dashboard.html';
    return;
  }
  
  // Initialize form validation
  initFormValidation();
});

function initFormValidation() {
  const form = document.getElementById('registerForm');
  if (!form) return;
  
  // Password strength indicator
  const passwordInput = document.getElementById('registerPassword');
  if (passwordInput) {
    passwordInput.addEventListener('input', updatePasswordStrength);
  }
  
  // Phone number formatting
  const phoneInput = document.getElementById('registerPhone');
  if (phoneInput) {
    phoneInput.addEventListener('input', formatPhoneNumber);
  }
  
  // Form submission
  form.addEventListener('submit', handleRegistration);
}

async function handleRegistration(e) {
  e.preventDefault();
  
  // Get form values
  const name = document.getElementById('registerName')?.value.trim() || '';
  const phone = document.getElementById('registerPhone')?.value.replace(/\D/g, '') || '';
  const password = document.getElementById('registerPassword')?.value || '';
  const referral = document.getElementById('registerReferral')?.value.trim() || '';
  
  // Validate
  if (!validateForm(name, phone, password)) {
    return;
  }
  
  // Show loading
  const submitBtn = document.querySelector('#registerForm button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Creating Account...';
  
  try {
    // ✅ FIXED: Use the correct API call
    const result = await window.ProfitWavyAPI.register(name, phone, password, referral);
    
    // Show success message
    showToast('Account created successfully! Redirecting...', 'success');
    
    // Redirect to dashboard after delay
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 2000);
    
  } catch (error) {
    console.error('Registration error:', error);
    
    // Show error message
    let errorMessage = error.message || 'Registration failed. Please try again.';
    
    // Specific error handling
    if (error.message.includes('already registered')) {
      errorMessage = 'This phone number is already registered. Please log in instead.';
    } else if (error.message.includes('Network error')) {
      errorMessage = 'Network error. Please check your internet connection.';
    } else if (error.message.includes('CORS')) {
      errorMessage = 'Connection error. Please try again.';
    }
    
    showToast(errorMessage, 'error');
    
  } finally {
    // Reset button
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
}

function validateForm(name, phone, password) {
  let isValid = true;
  let message = '';
  
  // Name validation
  if (name.length < 2) {
    message = 'Please enter your full name (at least 2 characters)';
    isValid = false;
  }
  
  // Phone validation
  else if (!/^0\d{9}$/.test(phone)) {
    message = 'Please enter a valid phone number (10 digits starting with 0)';
    isValid = false;
  }
  
  // Password validation
  else if (password.length < 8) {
    message = 'Password must be at least 8 characters';
    isValid = false;
  }
  
  if (!isValid) {
    showToast(message, 'error');
  }
  
  return isValid;
}

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
  
  // Length check
  if (password.length >= 8) strength += 20;
  if (password.length >= 12) strength += 10;
  
  // Complexity checks
  if (/[A-Z]/.test(password)) strength += 20;
  if (/[a-z]/.test(password)) strength += 20;
  if (/[0-9]/.test(password)) strength += 20;
  if (/[^A-Za-z0-9]/.test(password)) strength += 20;
  
  // Cap at 100
  strength = Math.min(strength, 100);
  
  // Update UI
  strengthBar.style.width = strength + '%';
  
  if (strength < 40) {
    strengthBar.style.backgroundColor = '#e74c3c';
    strengthText.textContent = 'Weak';
    strengthText.style.color = '#e74c3c';
  } else if (strength < 80) {
    strengthBar.style.backgroundColor = '#f39c12';
    strengthText.textContent = 'Medium';
    strengthText.style.color = '#f39c12';
  } else {
    strengthBar.style.backgroundColor = '#27ae60';
    strengthText.textContent = 'Strong';
    strengthText.style.color = '#27ae60';
  }
}

function formatPhoneNumber(e) {
  const input = e.target;
  let value = input.value.replace(/\D/g, '');
  
  // Format as 0XXX XXX XXX
  if (value.length > 0) {
    value = value.substring(0, 10);
    
    if (value.length > 3) {
      value = value.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
    } else if (value.length > 1) {
      value = value.replace(/(\d{3})/, '$1');
    }
  }
  
  input.value = value;
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');
  
  if (!toast || !toastMessage) return;
  
  toastMessage.textContent = message;
  
  // Set color based on type
  toast.className = 'toast show';
  if (type === 'error') {
    toast.style.backgroundColor = '#f8d7da';
    toast.style.color = '#721c24';
    toast.style.borderColor = '#f5c6cb';
  } else if (type === 'warning') {
    toast.style.backgroundColor = '#fff3cd';
    toast.style.color = '#856404';
    toast.style.borderColor = '#ffeaa7';
  } else {
    toast.style.backgroundColor = '#d4edda';
    toast.style.color = '#155724';
    toast.style.borderColor = '#c3e6cb';
  }
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    toast.className = 'toast';
  }, 5000);
}
