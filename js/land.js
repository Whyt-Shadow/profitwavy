
        // Show toast notification
        function showToast(title, message, type = 'info') {
            const toast = document.getElementById('toast');
            document.getElementById('toastTitle').textContent = title;
            document.getElementById('toastMessage').textContent = message;
            
            // Set background color based on type
            toast.querySelector('.toast-header').className = 'toast-header';
            if (type === 'success') {
                toast.querySelector('.toast-header').classList.add('bg-success', 'text-white');
            } else if (type === 'error') {
                toast.querySelector('.toast-header').classList.add('bg-danger', 'text-white');
            }
            
            toast.classList.remove('hidden');
            
            // Auto hide after 5 seconds
            setTimeout(hideToast, 5000);
        }
        
        // Hide toast notification
        function hideToast() {
            document.getElementById('toast').classList.add('hidden');
        }
        
        // Show learn more message
        function showLearnMore() {
            showToast('Learn More', 'Our investment platform offers various plans with returns between 5-15% monthly. Register to see all available options.', 'info');
        }
        
        // Initialize tooltips
        document.addEventListener('DOMContentLoaded', function() {
            // Initialize any tooltips or popovers if needed
        });

  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');