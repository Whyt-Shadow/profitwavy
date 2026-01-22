 // Back button functionality
        function goBack() {
            window.history.back();
        }

document.addEventListener('DOMContentLoaded', function() {
            const depositForm = document.getElementById('depositForm');
            const toast = document.querySelector('.toast');
            const toastBody = document.querySelector('.toast-body');
            const bsToast = new bootstrap.Toast(toast);
            
            // Form validation and submission
            depositForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const network = document.getElementById('depositNetwork').value;
                const phone = document.getElementById('depositPhone').value;
                const amount = document.getElementById('depositAmount').value;
                
                // Validate phone number
                const phonePattern = /^0\d{9}$/;
                if (!phonePattern.test(phone)) {
                    showToast('Please enter a valid phone number (e.g., 0244123456)', 'error');
                    return;
                }
                
                // Validate amount
                if (amount < 100) {
                    showToast('Minimum deposit amount is GH₵100', 'error');
                    return;
                }
                
                // Simulate deposit processing
                showToast(`Processing your deposit of GH₵${amount} from ${phone}...`, 'info');
                
                // Simulate successful deposit after 2 seconds
                setTimeout(() => {
                    showToast(`Successfully deposited GH₵${amount} from ${network} Mobile Money!`, 'success');
                    depositForm.reset();
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
            
            // Add input formatting for phone number
            const phoneInput = document.getElementById('depositPhone');
            phoneInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 10) value = value.slice(0, 10);
                e.target.value = value;
            });
        });