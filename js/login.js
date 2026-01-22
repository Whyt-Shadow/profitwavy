        // Toast functionality
        function showToast(message, type = 'success') {
            const toast = new bootstrap.Toast(document.getElementById('toast'));
            const toastTitle = document.getElementById('toastTitle');
            const toastMessage = document.getElementById('toastMessage');
            const toastHeader = document.querySelector('.toast-header');
            
            toastMessage.textContent = message;
            
            // Set color based on type
            toastHeader.className = 'toast-header';
            if (type === 'error') {
                toastHeader.classList.add('bg-danger', 'text-white');
            } else if (type === 'warning') {
                toastHeader.classList.add('bg-warning', 'text-dark');
            } else {
                toastHeader.classList.add('bg-success', 'text-white');
            }
            
            toast.show();
        }

        // Set loading state
        function setLoading(button, isLoading) {
            if (isLoading) {
                button.disabled = true;
                button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Logging in...';
                button.closest('form').classList.add('loading');
            } else {
                button.disabled = false;
                button.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i> Login';
                button.closest('form').classList.remove('loading');
            }
        }

        // Login form handler
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const phone = document.getElementById('loginPhone').value;
            const password = document.getElementById('loginPassword').value;
            const loginButton = document.getElementById('loginButton');
            
            // Basic validation
            if (!phone || !password) {
                showToast('Please fill in all fields', 'error');
                return;
            }

            setLoading(loginButton, true);

            try {
                const result = await api.login(phone, password);
                
                if (result.success) {
                    showToast('Login successful! Redirecting...');
                    
                    // Redirect to dashboard after short delay
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1500);
                } else {
                    showToast(result.message || 'Login failed', 'error');
                }
            } catch (error) {
                console.error('Login error:', error);
                showToast(error.message || 'Login failed. Please try again.', 'error');
            } finally {
                setLoading(loginButton, false);
            }
        });

        // Check if user is already logged in
        document.addEventListener('DOMContentLoaded', () => {
            const token = localStorage.getItem('authToken');
            if (token) {
                // Optional: Validate token and redirect if valid
                window.location.href = 'dashboard.html';
            }
        });

        // Add this to your login form handler
const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const loginBtn = document.getElementById('loginButton');
  loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
  loginBtn.disabled = true;

  try {
    const result = await api.login(phone, password);
    if (result.success) {
      // Show success message
      showToast('Login successful! Redirecting...', 'success');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1500);
    }
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
    loginBtn.disabled = false;
  }
});