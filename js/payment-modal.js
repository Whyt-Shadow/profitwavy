        // Get your Paystack public key from dashboard
        const PAYSTACK_PUBLIC_KEY = 'pk_live_1cb12120a572eba93680845bfd1687cb43db3d55'; // Replace with your actual key
        
        // Payment configuration
        let currentMethod = 'mtn';
        let currentAmount = 100;
        
        // Initialize
        document.addEventListener('DOMContentLoaded', function() {
            // Update display amount
            updateDisplayAmount();
            
            // Amount input change
            document.getElementById('amount').addEventListener('input', function() {
                currentAmount = parseFloat(this.value) || 0;
                updateDisplayAmount();
            });
            
            // Amount preset buttons
            document.querySelectorAll('.amount-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const amount = parseFloat(this.getAttribute('data-amount'));
                    document.getElementById('amount').value = amount;
                    currentAmount = amount;
                    updateDisplayAmount();
                    
                    // Update active state
                    document.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                });
            });
            
            // Payment method selection
            document.querySelectorAll('.method-item').forEach(item => {
                item.addEventListener('click', function() {
                    document.querySelectorAll('.method-item').forEach(i => i.classList.remove('active'));
                    this.classList.add('active');
                    
                    currentMethod = this.getAttribute('data-method');
                    
                    // Show/hide phone/email fields
                    const phoneSection = document.getElementById('phoneSection');
                    const emailSection = document.getElementById('emailSection');
                    
                    if (currentMethod === 'card') {
                        phoneSection.classList.add('d-none');
                        emailSection.classList.remove('d-none');
                    } else {
                        phoneSection.classList.remove('d-none');
                        emailSection.classList.add('d-none');
                    }
                });
            });
            
            // Pay button click
            document.getElementById('payButton').addEventListener('click', processPayment);
            
            // Format phone number input
            document.getElementById('phoneNumber').addEventListener('input', function() {
                this.value = this.value.replace(/[^0-9]/g, '');
                if (this.value.length > 10) {
                    this.value = this.value.slice(0, 10);
                }
            });
        });
        
        function updateDisplayAmount() {
            document.getElementById('displayAmount').textContent = currentAmount.toFixed(2);
        }
        
        async function processPayment() {
            // Validate inputs
            if (!validateInputs()) {
                return;
            }
            
            // Show loading state
            const payBtn = document.getElementById('payButton');
            const originalText = payBtn.innerHTML;
            payBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processing...';
            payBtn.disabled = true;
            
            try {
                if (currentMethod === 'card') {
                    // Card payment via Paystack
                    await processCardPayment();
                } else {
                    // Mobile money payment
                    await processMobileMoneyPayment();
                }
            } catch (error) {
                console.error('Payment error:', error);
                alert('Payment failed: ' + error.message);
            } finally {
                // Reset button
                payBtn.innerHTML = originalText;
                payBtn.disabled = false;
            }
        }
        
        function validateInputs() {
            const amount = currentAmount;
            
            // Validate amount
            if (amount < 100) {
                alert('Minimum amount is GH₵100');
                return false;
            }
            
            if (amount > 10000) {
                alert('Maximum amount is GH₵10,000');
                return false;
            }
            
            // Validate phone number for mobile money
            if (currentMethod !== 'card') {
                const phone = document.getElementById('phoneNumber').value.trim();
                const phonePattern = /^0\d{9}$/;
                
                if (!phonePattern.test(phone)) {
                    alert('Please enter a valid 10-digit Ghana phone number starting with 0');
                    return false;
                }
            } else {
                // Validate email for card payments
                const email = document.getElementById('email').value.trim();
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                
                if (!emailPattern.test(email)) {
                    alert('Please enter a valid email address');
                    return false;
                }
            }
            
            return true;
        }
        
        function processCardPayment() {
            return new Promise((resolve, reject) => {
                const email = document.getElementById('email').value.trim();
                const amountInPesewas = currentAmount * 100; // Convert to pesewas
                
                const handler = PaystackPop.setup({
                    key: pk_live_1cb12120a572eba93680845bfd1687cb43db3d55,
                    email: email,
                    amount: amountInPesewas,
                    currency: 'GHS',
                    ref: 'PW' + Date.now(), // Generate unique reference
                    metadata: {
                        custom_fields: [
                            {
                                display_name: "Payment Type",
                                variable_name: "payment_type",
                                value: "investment_deposit"
                            }
                        ]
                    },
                    callback: function(response) {
                        // Payment successful
                        console.log('Payment successful:', response);
                        alert('Payment successful! Reference: ' + response.reference);
                        
                        // In a real app, send reference to your server for verification
                        verifyPayment(response.reference);
                        
                        resolve(response);
                    },
                    onClose: function() {
                        // User closed the payment modal
                        reject(new Error('Payment cancelled by user'));
                    }
                });
                
                handler.openIframe();
            });
        }
        
        function processMobileMoneyPayment() {
            return new Promise((resolve, reject) => {
                const phone = document.getElementById('phoneNumber').value.trim();
                const amountInPesewas = currentAmount * 100;
                
                // Determine network
                let network = '';
                if (phone.startsWith('024') || phone.startsWith('054') || phone.startsWith('055') || phone.startsWith('059') || phone.startsWith('053') || phone.startsWith('025')) {
                    network = 'MTN';
                } else if (phone.startsWith('020') || phone.startsWith('050')) {
                    network = 'Vodafone';
                } else if (phone.startsWith('027') || phone.startsWith('057') || phone.startsWith('026') || phone.startsWith('056')) {
                    network = 'AirtelTigo';
                }
                
                // Create payment request
                const paymentData = {
                    amount: amountInPesewas,
                    email: 'customer@profitwavy.com', // Use a generic email or user's email
                    currency: 'GHS',
                    mobile_money: {
                        phone: phone,
                        provider: network
                    },
                    reference: 'PW' + Date.now(),
                    callback_url: 'https://profitwavy.com/payment-callback', // Your callback URL
                    metadata: {
                        user_id: '512935', // User ID from your system
                        payment_type: 'investment_deposit',
                        network: network
                    }
                };
                
                // In a real implementation, you would send this to your backend
                // which would then make the API call to Paystack
                
                console.log('Mobile money payment data:', paymentData);
                
                // Simulate API call
                setTimeout(() => {
                    // For demo purposes, simulate success
                    const response = {
                        status: true,
                        message: 'Authorization URL created',
                        data: {
                            authorization_url: `https://paystack.com/pay/simulate-mobile-money`,
                            access_code: 'simulated_access_code',
                            reference: paymentData.reference
                        }
                    };
                    
                    // Show instructions to user
                    alert(`Payment request sent to ${phone}. \n\nPlease check your phone for authorization prompt. \n\nReference: ${paymentData.reference}`);
                    
                    // Simulate payment verification after 5 seconds
                    setTimeout(() => {
                        verifyPayment(paymentData.reference);
                    }, 5000);
                    
                    resolve(response);
                }, 1000);
            });
        }
        
        function verifyPayment(reference) {
            // In a real implementation, you would:
            // 1. Send the reference to your backend
            // 2. Backend calls Paystack verify API
            // 3. Update user balance on success
            
            console.log('Verifying payment:', reference);
            
            // Simulate verification
            setTimeout(() => {
                alert('Payment verified successfully! Your account has been credited.');
                
                // Redirect to success page or update UI
                // window.location.href = 'payment-success.html?ref=' + reference;
            }, 2000);
        }
        
        // Simulate backend API endpoint (for testing)
        async function callBackendAPI(endpoint, data) {
            // This would be replaced with actual fetch/axios calls
            console.log('API Call:', endpoint, data);
            
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve({
                        success: true,
                        data: { message: 'API call successful' }
                    });
                }, 1000);
            });
        }