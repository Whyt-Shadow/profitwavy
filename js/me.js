        // Initialize toast
        const toastEl = document.getElementById('toast');
        const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
        
        // Function to show toast notification
        function showToast(message, type = 'success') {
            const toastMessage = document.getElementById('toastMessage');
            toastMessage.textContent = message;
            
            // Set toast class based on type
            toastEl.className = 'toast';
            if (type === 'error') {
                toastEl.classList.add('error');
            } else if (type === 'warning') {
                toastEl.classList.add('warning');
            }
            
            toast.show();
        }

        // Logout functionality
        function logout() {
            if (confirm('Are you sure you want to log out?')) {
                showToast('Logging out...', 'warning');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            }
        }

        // Avatar change functionality
        function changeAvatar() {
            showToast('Avatar upload feature coming soon!', 'warning');
        }

        // Redirect to referral page
        function goToReferral() {
            window.location.href = 'referral.html';
        }

        // Update balance on page load (simulated)
        document.addEventListener('DOMContentLoaded', function() {
            // Simulate fetching user data
            setTimeout(() => {
                // Update balances
                const availableBalance = document.querySelector('.balance-item:nth-child(1) h3');
                const promotionBalance = document.querySelector('.balance-item:nth-child(2) h3');
                
                // Sample data
                const userData = {
                    available: 1250.75,
                    promotion: 250.50
                };
                
                availableBalance.textContent = `GH₵ ${userData.available.toFixed(2)}`;
                promotionBalance.textContent = `GH₵ ${userData.promotion.toFixed(2)}`;
                
                showToast('Account data loaded successfully!');
            }, 1000);
        });

        // Add hover effects to balance items
        const balanceItems = document.querySelectorAll('.balance-item');
        balanceItems.forEach(item => {
            item.addEventListener('mouseenter', function() {
                this.style.background = 'linear-gradient(120deg, #0d6efd, #6610f2)';
                this.style.color = 'white';
                this.querySelector('h3').style.color = 'white';
                this.querySelector('span').style.color = 'rgba(255, 255, 255, 0.8)';
            });
            
            item.addEventListener('mouseleave', function() {
                this.style.background = '';
                this.style.color = '';
                this.querySelector('h3').style.color = '#28a745';
                this.querySelector('span').style.color = '';
            });
        });

        // Active navigation highlighting
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', function() {
                navItems.forEach(nav => nav.classList.remove('active'));
                this.classList.add('active');
            });
        });

        // Quick action hover effects
        const actionItems = document.querySelectorAll('.action-item');
        actionItems.forEach(item => {
            item.addEventListener('mouseenter', function() {
                const icon = this.querySelector('i');
                icon.style.transform = 'scale(1.1)';
            });
            
            item.addEventListener('mouseleave', function() {
                const icon = this.querySelector('i');
                icon.style.transform = 'scale(1)';
            });
        });

        // Add ripple effect to buttons
        document.querySelectorAll('.menu-item, .action-item, .logout-btn').forEach(button => {
            button.addEventListener('click', function(e) {
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.cssText = `
                    position: absolute;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.3);
                    transform: scale(0);
                    animation: ripple 0.6s linear;
                    width: ${size}px;
                    height: ${size}px;
                    top: ${y}px;
                    left: ${x}px;
                `;
                
                this.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });

        // Add CSS for ripple effect
        const style = document.createElement('style');
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
            
            .menu-item, .action-item, .logout-btn {
                position: relative;
                overflow: hidden;
            }
        `;
        document.head.appendChild(style);