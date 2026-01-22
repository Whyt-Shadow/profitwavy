// Back button functionality
        function goBack() {
            window.history.back();
        }
        
        // Search functionality
        document.querySelector('.search-box button').addEventListener('click', function() {
            const searchTerm = document.querySelector('.search-box input').value;
            if (searchTerm) {
                alert(`Searching for: ${searchTerm}`);
                // In a real application, this would filter the FAQ items
            }
        });
        
        // Live chat function
        function openLiveChat() {
            alert("Live chat would open in a real application. For now, please use email or phone support.");
        }
        
        // Enter key for search
        document.querySelector('.search-box input').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                document.querySelector('.search-box button').click();
            }
        });