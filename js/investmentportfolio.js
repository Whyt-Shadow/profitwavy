// Back button functionality
        function goBack() {
            window.history.back();
        }
        
        document.addEventListener('DOMContentLoaded', function() {
            // Simulate loading animation
            const cards = document.querySelectorAll('.investment-card');
            cards.forEach((card, index) => {
                card.style.animationDelay = `${index * 0.1}s`;
            });
            
            // Add click handlers for view details buttons
            document.querySelectorAll('.btn-outline-primary, .btn-outline-secondary').forEach(button => {
                button.addEventListener('click', function() {
                    const planName = this.closest('.investment-card').querySelector('.card-header').textContent;
                    alert(`Viewing details for ${planName}`);
                });
            });
        });