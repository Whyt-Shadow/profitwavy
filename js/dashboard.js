        // Check authentication
        if (!api.token) {
            window.location.href = 'login.html';
        }

        // Load dashboard data
        async function loadDashboardData() {
            try {
                // Load user data
                const userData = await api.getCurrentUser();
                if (userData.success) {
                    document.getElementById('currentBalance').textContent = userData.user.balance.toFixed(2);
                    document.getElementById('totalReturns').textContent = `GH₵ ${userData.user.totalReturns.toFixed(2)}`;
                }

                // Load investments
                const investmentsData = await api.getMyInvestments();
                displayInvestments(investmentsData);

                // Load transactions for recent returns
                const transactionsData = await api.getTransactions();
                displayRecentReturns(transactionsData);

            } catch (error) {
                console.error('Error loading dashboard data:', error);
                showToast('Error loading dashboard data', 'error');
            }
        }

        function displayInvestments(data) {
            const container = document.getElementById('investmentsList');
            
            if (!data.success || !data.investments || data.investments.length === 0) {
                container.innerHTML = '<p class="text-muted">You have no active investments</p>';
                return;
            }

            const investmentsHtml = data.investments.map(investment => `
                <div class="investment-item">
                    <div class="d-flex justify-content-between">
                        <div>
                            <strong>${investment.planName} Plan</strong>
                            <p class="mb-0 small">Invested: GH₵ ${investment.amount.toFixed(2)}</p>
                        </div>
                        <div class="text-end">
                            <div class="text-success">Returns: GH₵ ${investment.returnsPaid.toFixed(2)}</div>
                            <p class="mb-0 small">Status: ${investment.status}</p>
                        </div>
                    </div>
                </div>
            `).join('');

            container.innerHTML = investmentsHtml;
        }

        function displayRecentReturns(data) {
            const container = document.getElementById('dailyReturnsList');
            
            if (!data.success || !data.transactions || data.transactions.length === 0) {
                container.innerHTML = '<p class="text-muted">No returns yet</p>';
                return;
            }

            const returns = data.transactions.filter(t => t.type === 'return').slice(0, 5);
            
            if (returns.length === 0) {
                container.innerHTML = '<p class="text-muted">No daily returns yet</p>';
                return;
            }

            const returnsHtml = returns.map(transaction => `
                <div class="return-item">
                    <div class="d-flex justify-content-between">
                        <div>
                            <strong>GH₵ ${transaction.amount.toFixed(2)}</strong>
                            <p class="mb-0 small">Daily Return</p>
                        </div>
                        <div class="text-end">
                            <p class="mb-0 small">${new Date(transaction.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            `).join('');

            container.innerHTML = returnsHtml;
        }

        // Logout functionality
        document.getElementById('logoutBtn').addEventListener('click', async (e) => {
            e.preventDefault();
            
            try {
                await api.logout();
                window.location.href = 'login.html';
            } catch (error) {
                console.error('Logout error:', error);
                // Force logout even if API call fails
                api.removeToken();
                window.location.href = 'login.html';
            }
        });

        // Initialize dashboard
        document.addEventListener('DOMContentLoaded', loadDashboardData);

        // Add this script to dashboard
async function loadDashboard() {
  try {
    // Load user data
    const userData = await api.getCurrentUser();
    document.getElementById('currentBalance').textContent = userData.user.balance.toFixed(2);
    
    // Load investments
    const investments = await api.getMyInvestments();
    displayInvestments(investments);
    
    // Load transactions
    const transactions = await api.getTransactions();
    displayRecentReturns(transactions);
    
  } catch (error) {
    console.error('Dashboard error:', error);
    showToast('Error loading dashboard', 'error');
  }
}