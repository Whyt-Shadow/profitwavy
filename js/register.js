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
  document.getElementById('registerForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  // Get form values
  const name = document.getElementById('registerName').value.trim();
  const phone = document.getElementById('registerPhone').value.replace(/\D/g, '');
  const password = document.getElementById('registerPassword').value;
  const referral = document.getElementById('registerReferral').value.trim();
  
  // Validate phone format
  if (!/^0\d{9}$/.test(phone)) {
    showToast('Please enter a valid phone number (0244123456)', 'error');
    return;
  }
  
  // Show loading
  const submitBtn = this.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Creating Account...';
  
  try {
    // Call API
    const result = await api.register({
      name,
      phone,
      password,
      referral
    });
    
    console.log('Registration result:', result);
    
    // ✅ FIX: Check result.status instead of just result.success
    if (result.status === 409) {
      // Phone already exists
      showToast('This phone number is already registered. Please login instead.', 'error');
      
      // Clear phone field and focus
      document.getElementById('registerPhone').value = '';
      document.getElementById('registerPhone').focus();
      
    } else if (result.data && result.data.success) {
      // Registration successful
      localStorage.setItem('authToken', result.data.token);
      localStorage.setItem('user', JSON.stringify(result.data.user));
      
      showToast('Account created successfully! Redirecting...', 'success');
      
      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 2000);
      
    } else if (result.data && result.data.message) {
      // Other error from backend
      showToast(result.data.message, 'error');
    } else {
      showToast('Registration failed. Please try again.', 'error');
    }
    
  } catch (error) {
    console.error('Registration error:', error);
    
    // ✅ FIX: Better error messages
    if (error.message.includes('Network') || error.message.includes('Failed to fetch')) {
      showToast('Network error. Please check your connection.', 'error');
    } else if (error.message.includes('CORS')) {
      showToast('Connection error. Please try again.', 'error');
    } else {
      showToast(error.message || 'Registration failed. Please try again.', 'error');
    }
    
  } finally {
    // Reset button
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
})
})();
