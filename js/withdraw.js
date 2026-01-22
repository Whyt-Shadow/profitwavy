// Initialize Toast
        const toastEl = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        const toast = new bootstrap.Toast(toastEl, { delay: 5000 });
        
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
        
        // Go back function
        function goBack() {
            window.history.back();
        }
        
        // Form validation and submission
        document.getElementById('withdrawForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const network = document.getElementById('withdrawNetwork').value;
            const phone = document.getElementById('withdrawPhone').value;
            const amount = parseFloat(document.getElementById('withdrawAmount').value);
            const balance = parseFloat(document.getElementById('availableBalance').textContent.replace(/,/g, ''));
            
            // Reset validation
            document.getElementById('withdrawNetwork').classList.remove('is-invalid');
            document.getElementById('withdrawPhone').classList.remove('is-invalid');
            document.getElementById('withdrawAmount').classList.remove('is-invalid');
            
            let isValid = true;
            
            // Validate network
            if (!network) {
                document.getElementById('withdrawNetwork').classList.add('is-invalid');
                isValid = false;
            }
            
            // Validate phone
            const phonePattern = /^0\d{9}$/;
            if (!phonePattern.test(phone)) {
                document.getElementById('withdrawPhone').classList.add('is-invalid');
                isValid = false;
            }
            
            // Validate amount
            if (isNaN(amount) || amount < 100 || amount > 5000) {
                document.getElementById('withdrawAmount').classList.add('is-invalid');
                document.getElementById('amountError').textContent = 
                    amount < 100 ? 'Minimum withdrawal amount is GH₵100' : 
                    amount > 5000 ? 'Maximum withdrawal amount is GH₵5,000' : 
                    'Please enter a valid amount';
                isValid = false;
            } else if (amount > balance) {
                document.getElementById('withdrawAmount').classList.add('is-invalid');
                document.getElementById('amountError').textContent = 'Insufficient balance';
                isValid = false;
            }
            
            if (!isValid) return;
            
            // Simulate withdrawal processing
            simulateWithdrawal(network, phone, amount);
        });
        
        // Simulate withdrawal process
        function simulateWithdrawal(network, phone, amount) {
            // Disable form during processing
            const submitBtn = document.querySelector('#withdrawForm button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Processing...';
            
            // Simulate API call delay
            setTimeout(() => {
                // Update balance
                const currentBalance = parseFloat(document.getElementById('availableBalance').textContent.replace(/,/g, ''));
                const newBalance = currentBalance - amount;
                document.getElementById('availableBalance').textContent = newBalance.toFixed(2);
                
                // Show success message
                showToast(`Success! GH₵${amount.toFixed(2)} has been sent to your ${network} account (${phone}).`);
                
                // Reset form
                document.getElementById('withdrawForm').reset();
                
                // Re-enable button
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-wallet me-2"></i> Withdraw Now';
                
                // Add to transaction history (in a real app)
                addToTransactionHistory(amount, phone, network);
            }, 2000);
        }
        
        // Add to transaction history (simulated)
        function addToTransactionHistory(amount, phone, network) {
            // In a real app, this would send data to a server
            console.log(`Withdrawal of GH₵${amount} to ${network} (${phone}) recorded`);
        }
        
        // Input validation helpers
        document.getElementById('withdrawAmount').addEventListener('input', function() {
            const amount = parseFloat(this.value);
            if (!isNaN(amount) && amount > 5000) {
                this.value = 5000;
            }
        });
        
        document.getElementById('withdrawPhone').addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '');
            if (this.value.length > 10) {
                this.value = this.value.slice(0, 10);
            }
        });
        
        // Initialize page
        document.addEventListener('DOMContentLoaded', function() {
            // Any initialization code can go here
        });