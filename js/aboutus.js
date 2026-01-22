// Back button functionality
        function goBack() {
            window.history.back();
        }
        
        // Animate stats counting
        document.addEventListener('DOMContentLoaded', function() {
            const statElements = document.querySelectorAll('.stat-number');
            const statsSection = document.querySelector('.stats-section');
            let animated = false;
            
            function animateStats() {
                if (animated) return;
                
                statElements.forEach(stat => {
                    const target = parseInt(stat.textContent);
                    let count = 0;
                    const duration = 2000; // 2 seconds
                    const frameDuration = 1000 / 60; // 60 frames per second
                    const totalFrames = Math.round(duration / frameDuration);
                    const increment = target / totalFrames;
                    
                    const timer = setInterval(() => {
                        count += increment;
                        if (count >= target) {
                            stat.textContent = target.toLocaleString();
                            clearInterval(timer);
                        } else {
                            stat.textContent = Math.round(count).toLocaleString();
                        }
                    }, frameDuration);
                });
                
                animated = true;
            }
            
            // Intersection Observer to animate when section is in view
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateStats();
                    }
                });
            }, { threshold: 0.5 });
            
            observer.observe(statsSection);
            
            // Animate other sections on load
            const elements = document.querySelectorAll('.mission-section, .values-section, .team-section, .cta-section');
            elements.forEach((element, index) => {
                element.style.animationDelay = `${index * 0.2}s`;
            });
        });