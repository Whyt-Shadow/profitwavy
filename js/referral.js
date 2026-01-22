        // Back button functionality
        function goBack() {
            window.history.back();
        }
        
        // DOM elements
        const referralLink = document.getElementById('referralLink');
        const copyButton = document.getElementById('copyButton');
        const toast = document.querySelector('.toast');
        const toastBody = document.querySelector('.toast-body');
        const bsToast = new bootstrap.Toast(toast);
        const shareButtons = document.querySelectorAll('.share-btn');
        
        // Copy referral link
        copyButton.addEventListener('click', function() {
            referralLink.select();
            document.execCommand('copy');
            
            showToast('Referral link copied to clipboard!', 'success');
        });
        
        // Share buttons functionality
        shareButtons.forEach(button => {
            button.addEventListener('click', function() {
                const platform = this.textContent.trim();
                showToast(`Sharing via ${platform} would be enabled in a live app`, 'info');
            });
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
        
        // Simulate loading animation
        document.addEventListener('DOMContentLoaded', function() {
            const elements = document.querySelectorAll('.stat-card, .referral-link-section, .referrals-section, .step-card');
            elements.forEach((element, index) => {
                element.style.animationDelay = `${index * 0.1}s`;
            });
        });