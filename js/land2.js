// Sample user data (in a real application, this would come from a server)
        const userData = {
            balance: 1250.75,
            investments: [
                { id: 1, name: "Agriculture Fund", amount: 500, progress: 65 },
                { id: 2, name: "Real Estate Trust", amount: 750, progress: 40 }
            ],
            returns: [
                { date: "2023-10-15", amount: 12.50, investment: "Agriculture Fund" },
                { date: "2023-10-14", amount: 8.25, investment: "Real Estate Trust" }
            ]
        };
        
        // Initialize the dashboard
        document.addEventListener('DOMContentLoaded', function() {
            updateDashboard();
        });
        
        // Update dashboard with user data
        function updateDashboard() {
            // Update balance
            document.getElementById('currentBalance').textContent = `GH₵ ${userData.balance.toFixed(2)}`;
            
            // Update investments
            const investmentsList = document.getElementById('investmentsList');
            if (userData.investments.length > 0) {
                let investmentsHTML = '';
                userData.investments.forEach(investment => {
                    investmentsHTML += `
                        <div class="investment-item mb-3 p-3 border rounded">
                            <div class="d-flex justify-content-between">
                                <h5>${investment.name}</h5>
                                <span class="text-success">GH₵ ${investment.amount.toFixed(2)}</span>
                            </div>
                            <div class="progress mt-2" style="height: 8px;">
                                <div class="progress-bar bg-success" style="width: ${investment.progress}%"></div>
                            </div>
                            <small class="text-muted">${investment.progress}% complete</small>
                        </div>
                    `;
                });
                investmentsList.innerHTML = investmentsHTML;
            }
            
            // Update returns
            const returnsList = document.getElementById('dailyReturnsList');
            if (userData.returns.length > 0) {
                let returnsHTML = '';
                userData.returns.forEach(returnItem => {
                    returnsHTML += `
                        <div class="return-item mb-3 p-3 border rounded">
                            <div class="d-flex justify-content-between">
                                <h6>${returnItem.investment}</h6>
                                <span class="text-success">+GH₵ ${returnItem.amount.toFixed(2)}</span>
                            </div>
                            <small class="text-muted">${returnItem.date}</small>
                        </div>
                    `;
                });
                returnsList.innerHTML = returnsHTML;
            }
            
            // Update progress bar (average of all investments)
            const totalProgress = userData.investments.reduce((sum, investment) => sum + investment.progress, 0);
            const averageProgress = userData.investments.length > 0 ? totalProgress / userData.investments.length : 0;
            document.getElementById('investmentProgress').style.width = `${averageProgress}%`;
        }
        
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
        
        // Show section (placeholder for navigation)
        function showSection(sectionId) {
            showToast('Navigation', `Showing ${sectionId} section`, 'info');
            // In a real application, this would show the appropriate section
        }
        
        // Logout function
        function logout() {
            showToast('Logged Out', 'You have been successfully logged out.', 'success');
            // In a real application, this would redirect to login page
        }
        
        // Show investment modal (placeholder)
        function showInvestModal() {
            showToast('Investment', 'Investment modal would appear here', 'info');
        }
        
        // Show withdrawal modal (placeholder)
        function showWithdrawModal() {
            showToast('Withdrawal', 'Withdrawal modal would appear here', 'info');
        }