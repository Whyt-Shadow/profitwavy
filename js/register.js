// Initialize Toast
        const toastEl = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        const toast = new bootstrap.Toast(toastEl, { delay: 5000 });
        
        // Initialize Modals
        const termsModal = new bootstrap.Modal(document.getElementById('termsModal'));
        
        // Function to show toast notification
        function showToast(message, type = 'success') {
            toastMessage.textContent = message;
            
            // Set background color based on type
            const header = toastEl.querySelector('.toast-header');
            header.className = 'toast-header';
            
            if (type === 'error') {
                header.classList.add('bg-danger');
            } else if (type === 'warning') {
                header.classList.add('bg-warning');
            } else {
                header.classList.add('bg-success');
            }
            
            header.classList.add('text-white');
            toast.show();
        }
        
        // Password strength calculator
        function calculatePasswordStrength(password) {
            let strength = 0;
            let tips = "";
            
            // Check password length
            if (password.length >= 8) {
                strength += 20;
            } else {
                tips += "Make the password longer. ";
            }
            
            // Check for mixed case
            if (password.match(/[a-z]/) && password.match(/[A-Z]/)) {
                strength += 20;
            } else {
                tips += "Use both uppercase and lowercase letters. ";
            }
            
            // Check for numbers
            if (password.match(/\d/)) {
                strength += 20;
            } else {
                tips += "Include at least one number. ";
            }
            
            // Check for special characters
            if (password.match(/[^a-zA-Z\d]/)) {
                strength += 20;
            } else {
                tips += "Include at least one special character. ";
            }
            
            // Check for common patterns
            if (!password.match(/123|abc|qwert|password|admin/i)) {
                strength += 20;
            } else {
                tips += "Avoid common patterns and words. ";
            }
            
            return { strength, tips };
        }
        
        // Update password strength indicator
        function updatePasswordStrength() {
            const password = document.getElementById('registerPassword').value;
            const strengthBar = document.getElementById('passwordStrengthBar');
            const strengthText = document.getElementById('passwordStrengthText');
            
            if (password.length === 0) {
                strengthBar.style.width = '0%';
                strengthBar.style.backgroundColor = '#e9ecef';
                strengthText.textContent = '';
                return;
            }
            
            const { strength, tips } = calculatePasswordStrength(password);
            
            // Update strength bar
            strengthBar.style.width = strength + '%';
            
            // Update color and text based on strength
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
        
        // Toggle password visibility
        document.getElementById('passwordToggle').addEventListener('click', function() {
            const passwordInput = document.getElementById('registerPassword');
            const icon = this.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
        
        // Form validation and submission
        document.getElementById('registerForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('registerName').value.trim();
            const phone = document.getElementById('registerPhone').value;
            const password = document.getElementById('registerPassword').value;
            const referral = document.getElementById('registerReferral').value.trim();
            const agreeTerms = document.getElementById('agreeTerms').checked;
            
            // Reset validation
            document.getElementById('registerName').classList.remove('is-invalid');
            document.getElementById('registerPhone').classList.remove('is-invalid');
            document.getElementById('registerPassword').classList.remove('is-invalid');
            document.getElementById('agreeTerms').classList.remove('is-invalid');
            
            let isValid = true;
            
            // Validate name
            if (name.length < 2) {
                document.getElementById('registerName').classList.add('is-invalid');
                isValid = false;
            }
            
            // Validate phone
            const phonePattern = /^0\d{9}$/;
            if (!phonePattern.test(phone)) {
                document.getElementById('registerPhone').classList.add('is-invalid');
                isValid = false;
            }
            
            // Validate password
            if (password.length < 8) {
                document.getElementById('registerPassword').classList.add('is-invalid');
                isValid = false;
            }
            
            // Validate terms
            if (!agreeTerms) {
                document.getElementById('agreeTerms').classList.add('is-invalid');
                isValid = false;
            }
            
            if (!isValid) return;
            
            // Simulate registration process
            simulateRegistration(name, phone, password, referral);
        });
        
        // Simulate registration process
        function simulateRegistration(name, phone, password, referral) {
            // Disable form during processing
            const submitBtn = document.querySelector('#registerForm button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Creating Account...';
            
            // Simulate API call delay
            setTimeout(() => {
                // Show success message
                showToast(`Success! Your account has been created. Welcome to Profitwavy, ${name}!`);
                
                // Redirect to login page after delay
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            }, 1500);
        }
        
        // Initialize page
        document.addEventListener('DOMContentLoaded', function() {
            // Set up password strength monitoring
            document.getElementById('registerPassword').addEventListener('input', updatePasswordStrength);
            
            // Format phone number input
            document.getElementById('registerPhone').addEventListener('input', function() {
                this.value = this.value.replace(/[^0-9]/g, '');
                if (this.value.length > 10) {
                    this.value = this.value.slice(0, 10);
                }
            });
        });