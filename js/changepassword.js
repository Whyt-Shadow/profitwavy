// Back button functionality
        function goBack() {
            window.history.back();
        }
        
        // DOM elements
        const currentPassword = document.getElementById('currentPassword');
        const newPassword = document.getElementById('newPassword');
        const confirmPassword = document.getElementById('confirmPassword');
        const toggleCurrentPassword = document.getElementById('toggleCurrentPassword');
        const toggleNewPassword = document.getElementById('toggleNewPassword');
        const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
        const passwordForm = document.getElementById('passwordForm');
        const passwordMatchError = document.getElementById('passwordMatchError');
        const passwordStrengthMeter = document.getElementById('passwordStrengthMeter');
        const passwordStrengthText = document.getElementById('passwordStrengthText');
        const submitButton = document.getElementById('submitButton');
        const toast = document.querySelector('.toast');
        const toastBody = document.querySelector('.toast-body');
        const bsToast = new bootstrap.Toast(toast);
        
        // Password visibility toggles
        toggleCurrentPassword.addEventListener('click', function() {
            togglePasswordVisibility(currentPassword, toggleCurrentPassword);
        });
        
        toggleNewPassword.addEventListener('click', function() {
            togglePasswordVisibility(newPassword, toggleNewPassword);
        });
        
        toggleConfirmPassword.addEventListener('click', function() {
            togglePasswordVisibility(confirmPassword, toggleConfirmPassword);
        });
        
        function togglePasswordVisibility(passwordField, toggleButton) {
            if (passwordField.type === 'password') {
                passwordField.type = 'text';
                toggleButton.innerHTML = '<i class="fas fa-eye-slash"></i>';
            } else {
                passwordField.type = 'password';
                toggleButton.innerHTML = '<i class="fas fa-eye"></i>';
            }
        }
        
        // Password strength checker
        newPassword.addEventListener('input', function() {
            checkPasswordStrength(newPassword.value);
            checkPasswordMatch();
            validateForm();
        });
        
        confirmPassword.addEventListener('input', function() {
            checkPasswordMatch();
            validateForm();
        });
        
        currentPassword.addEventListener('input', validateForm);
        
        function checkPasswordStrength(password) {
            // Reset classes
            passwordStrengthMeter.className = 'strength-meter';
            
            // Check password requirements
            const hasMinLength = password.length >= 8;
            const hasUppercase = /[A-Z]/.test(password);
            const hasNumber = /[0-9]/.test(password);
            const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
            
            // Update requirement indicators
            document.getElementById('lengthRequirement').className = hasMinLength ? 
                'fas fa-check requirement-valid' : 'fas fa-check requirement-invalid';
                
            document.getElementById('uppercaseRequirement').className = hasUppercase ? 
                'fas fa-check requirement-valid' : 'fas fa-check requirement-invalid';
                
            document.getElementById('numberRequirement').className = hasNumber ? 
                'fas fa-check requirement-valid' : 'fas fa-check requirement-invalid';
                
            document.getElementById('specialRequirement').className = hasSpecial ? 
                'fas fa-check requirement-valid' : 'fas fa-check requirement-invalid';
            
            // Calculate strength score
            let strength = 0;
            if (password.length > 0) strength += 1;
            if (hasMinLength) strength += 1;
            if (hasUppercase) strength += 1;
            if (hasNumber) strength += 1;
            if (hasSpecial) strength += 1;
            
            // Update strength meter and text
            if (strength <= 2) {
                passwordStrengthMeter.classList.add('strength-weak');
                passwordStrengthText.textContent = 'Weak password';
                passwordStrengthText.style.color = '#e74c3c';
            } else if (strength <= 4) {
                passwordStrengthMeter.classList.add('strength-medium');
                passwordStrengthText.textContent = 'Medium strength';
                passwordStrengthText.style.color = '#f39c12';
            } else {
                passwordStrengthMeter.classList.add('strength-strong');
                passwordStrengthText.textContent = 'Strong password';
                passwordStrengthText.style.color = '#27ae60';
            }
        }
        
        function checkPasswordMatch() {
            if (newPassword.value && confirmPassword.value) {
                if (newPassword.value !== confirmPassword.value) {
                    passwordMatchError.style.display = 'block';
                    confirmPassword.style.borderColor = '#e74c3c';
                    return false;
                } else {
                    passwordMatchError.style.display = 'none';
                    confirmPassword.style.borderColor = '#27ae60';
                    return true;
                }
            }
            return false;
        }
        
        function validateForm() {
            const isCurrentPasswordValid = currentPassword.value.length > 0;
            const isNewPasswordValid = newPassword.value.length >= 8;
            const isConfirmPasswordValid = checkPasswordMatch();
            
            if (isCurrentPasswordValid && isNewPasswordValid && isConfirmPasswordValid) {
                submitButton.disabled = false;
            } else {
                submitButton.disabled = true;
            }
        }
        
        // Form submission
        passwordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simulate API call
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Updating...';
            
            setTimeout(() => {
                // Show success message
                showToast('Password updated successfully!', 'success');
                
                // Reset form
                passwordForm.reset();
                passwordStrengthMeter.className = 'strength-meter';
                passwordStrengthText.textContent = 'Password strength';
                passwordStrengthText.style.color = '';
                passwordMatchError.style.display = 'none';
                
                // Reset requirement indicators
                document.querySelectorAll('.requirement-item i').forEach(icon => {
                    icon.className = 'fas fa-check requirement-invalid';
                });
                
                // Reset button
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-lock me-2"></i> Update Password';
            }, 2000);
        });
        
        // Show toast notification
        function showToast(message, type = 'info') {
            toastBody.textContent = message;
            
            // Remove previous color classes
            toast.classList.remove('bg-success', 'bg-danger', 'bg-info', 'bg-warning');
            
            // Add appropriate color class
            switch(type) {
                case 'success':
                    toast.classList.add('bg-success', 'text-white');
                    break;
                case 'error':
                    toast.classList.add('bg-danger', 'text-white');
                    break;
                case 'warning':
                    toast.classList.add('bg-warning');
                    break;
                default:
                    toast.classList.add('bg-info', 'text-white');
            }
            
            bsToast.show();
        }