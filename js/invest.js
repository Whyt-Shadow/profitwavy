// Initialize Toast
const toastEl = document.getElementById('toast');
const toastTitle = document.getElementById('toastTitle');
const toastMessage = document.getElementById('toastMessage');
const toast = new bootstrap.Toast(toastEl);

// Registration bonus configuration - 5% bonus
const REGISTRATION_BONUS = {
    percentage: 5, // 5% registration bonus
    maxBonusAmount: 500, // Maximum bonus amount in GHS
    available: true,
    used: false,
    // Store bonus details in localStorage for persistence
    getUsedStatus: function() {
        return localStorage.getItem('registrationBonusUsed') === 'true';
    },
    setUsedStatus: function(status) {
        localStorage.setItem('registrationBonusUsed', status.toString());
    }
};

// Function to calculate 5% bonus on investment amount
function calculateRegistrationBonus(investmentAmount) {
    const bonusAmount = (investmentAmount * REGISTRATION_BONUS.percentage) / 100;
    // Cap the bonus at max amount
    return Math.min(bonusAmount, REGISTRATION_BONUS.maxBonusAmount);
}

// Function to show toast notification
function showToast(title, message, type = 'primary') {
    toastTitle.textContent = title;
    toastMessage.textContent = message;
    
    // Set background color based on type
    const header = toastEl.querySelector('.toast-header');
    header.className = 'toast-header';
    header.classList.add(`bg-${type}`, 'text-white');
    
    toast.show();
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        toast.hide();
    }, 5000);
}

// Function to display bonus information in UI
function displayBonusInfo() {
    // Create or update bonus banner
    const bonusBanner = document.getElementById('bonusBanner') || createBonusBanner();
    
    if (REGISTRATION_BONUS.available && !REGISTRATION_BONUS.getUsedStatus()) {
        bonusBanner.innerHTML = `
            <div class="alert alert-success d-flex align-items-center mb-4" role="alert">
                <div class="me-3">
                    <i class="bi bi-gift-fill fs-4"></i>
                </div>
                <div class="flex-grow-1">
                    <h5 class="alert-heading mb-1">🎉 Welcome Bonus: ${REGISTRATION_BONUS.percentage}% Extra!</h5>
                    <p class="mb-0">Get a ${REGISTRATION_BONUS.percentage}% bonus on your first investment (up to GHS ${REGISTRATION_BONUS.maxBonusAmount}). 
                    This bonus will be added to your investment amount!</p>
                    <small class="d-block mt-1"><i class="bi bi-info-circle me-1"></i>Example: Invest GHS 1000 → Get GHS 1050 total investment</small>
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        bonusBanner.classList.remove('d-none');
    } else {
        bonusBanner.classList.add('d-none');
    }
}

// Function to create bonus banner
function createBonusBanner() {
    const banner = document.createElement('div');
    banner.id = 'bonusBanner';
    banner.className = 'container-fluid px-0';
    
    // Insert at the top of the main content
    const main = document.querySelector('main') || document.querySelector('.container');
    if (main) {
        main.insertBefore(banner, main.firstChild);
    }
    
    return banner;
}

// Investment Modal Handling
const investmentModal = new bootstrap.Modal(document.getElementById('investmentModal'));
const selectedPlanElement = document.getElementById('selectedPlan');
const minAmountElement = document.getElementById('minAmount');
const dailyReturnsElement = document.getElementById('dailyReturns');
const confirmInvestmentBtn = document.getElementById('confirmInvestment');
const bonusDetailsElement = document.getElementById('bonusDetails') || createBonusDetailsElement();

let selectedPlan = '';
let selectedMinAmount = 0;
let calculatedBonus = 0;
let totalWithBonus = 0;

// Create bonus details element for modal
function createBonusDetailsElement() {
    const container = document.createElement('div');
    container.id = 'bonusDetails';
    container.className = 'alert alert-info mt-3';
    
    const modalBody = document.querySelector('#investmentModal .modal-body');
    if (modalBody) {
        const dailyReturnsEl = modalBody.querySelector('#dailyReturns');
        if (dailyReturnsEl && dailyReturnsEl.parentNode) {
            dailyReturnsEl.parentNode.insertBefore(container, dailyReturnsEl.nextSibling);
        }
    }
    
    return container;
}

// Add event listeners to all invest buttons
document.querySelectorAll('.invest-btn').forEach(button => {
    button.addEventListener('click', function() {
        selectedPlan = this.getAttribute('data-plan');
        selectedMinAmount = parseInt(this.getAttribute('data-min'));
        
        // Calculate daily returns based on plan
        const dailyReturns = calculateDailyReturns(selectedMinAmount);
        
        // Calculate 5% bonus
        calculatedBonus = calculateRegistrationBonus(selectedMinAmount);
        totalWithBonus = selectedMinAmount + calculatedBonus;
        
        // Update modal content
        selectedPlanElement.textContent = selectedPlan;
        minAmountElement.textContent = `GHS ${selectedMinAmount}`;
        dailyReturnsElement.textContent = `GHS ${calculateDailyReturns(totalWithBonus)}`;
        
        // Update bonus information in modal
        updateBonusDetails();
        
        // Show modal
        investmentModal.show();
    });
});

// Update bonus details in modal
function updateBonusDetails() {
    if (REGISTRATION_BONUS.available && !REGISTRATION_BONUS.getUsedStatus()) {
        const dailyReturnsOriginal = calculateDailyReturns(selectedMinAmount);
        const dailyReturnsWithBonus = calculateDailyReturns(totalWithBonus);
        
        bonusDetailsElement.innerHTML = `
            <div class="row">
                <div class="col-12">
                    <h6 class="mb-2"><i class="bi bi-gift-fill me-2"></i>${REGISTRATION_BONUS.percentage}% Registration Bonus Applied!</h6>
                </div>
                <div class="col-6">
                    <small class="text-muted d-block">Your Investment:</small>
                    <span class="fw-bold">GHS ${selectedMinAmount}</span>
                </div>
                <div class="col-6">
                    <small class="text-muted d-block">${REGISTRATION_BONUS.percentage}% Bonus:</small>
                    <span class="fw-bold text-success">+ GHS ${calculatedBonus}</span>
                </div>
                <div class="col-12 mt-2 pt-2 border-top">
                    <div class="d-flex justify-content-between">
                        <div>
                            <small class="text-muted d-block">Total Investment:</small>
                            <span class="fw-bold text-primary">GHS ${totalWithBonus}</span>
                        </div>
                        <div class="text-end">
                            <small class="text-muted d-block">Daily Returns:</small>
                            <div>
                                <span class="text-decoration-line-through text-muted small me-2">GHS ${dailyReturnsOriginal}</span>
                                <span class="fw-bold text-success">GHS ${dailyReturnsWithBonus}</span>
                            </div>
                        </div>
                    </div>
                    <small class="text-muted d-block mt-1">
                        <i class="bi bi-info-circle me-1"></i>You'll earn returns on the total amount including bonus
                    </small>
                </div>
            </div>
        `;
        bonusDetailsElement.classList.remove('d-none');
    } else {
        bonusDetailsElement.classList.add('d-none');
    }
}

// Calculate daily returns based on investment amount
function calculateDailyReturns(amount) {
    const amountNum = parseInt(amount);
    // Returns are 25% of investment amount daily
    return Math.round(amountNum * 0.25);
}

// Handle confirmation of investment with bonus
confirmInvestmentBtn.addEventListener('click', async function() {
    investmentModal.hide();
    
    // Check if bonus should be applied
    const applyBonus = REGISTRATION_BONUS.available && !REGISTRATION_BONUS.getUsedStatus();
    const investmentAmount = applyBonus ? totalWithBonus : selectedMinAmount;
    const bonusAmount = applyBonus ? calculatedBonus : 0;
    
    // Simulate processing delay
    setTimeout(async () => {
        try {
            // Call API to create investment with bonus info
            const result = await api.createInvestmentWithBonus(
                selectedPlan, 
                selectedMinAmount, 
                bonusAmount,
                investmentAmount
            );
            
            if (result.success) {
                // Mark bonus as used if applied
                if (applyBonus && bonusAmount > 0) {
                    REGISTRATION_BONUS.setUsedStatus(true);
                    displayBonusInfo(); // Update UI
                }
                
                showToast(
                    'Investment Started Successfully!', 
                    `Your ${selectedPlan} investment of GHS ${selectedMinAmount}${applyBonus ? ` + GHS ${bonusAmount} bonus` : ''} has been initiated.`, 
                    'success'
                );
                
                // Redirect to dashboard after a delay
                setTimeout(() => {
                    window.location.href = 'payment-modal.html';
                }, 2000);
            } else {
                showToast('Investment Failed', result.message || 'Please try again.', 'error');
            }
        } catch (error) {
            console.error('Investment error:', error);
            showToast('Investment Failed', 'Please try again.', 'error');
        }
    }, 1000);
});

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!api.token) {
        window.location.href = 'login.html';
    }
    
    // Load investment plans
    loadInvestmentPlans();
    
    // Display bonus information
    displayBonusInfo();
    
    // Show welcome message with bonus info
    setTimeout(() => {
        if (REGISTRATION_BONUS.available && !REGISTRATION_BONUS.getUsedStatus()) {
            showToast(
                'Welcome Bonus Available!', 
                `Get ${REGISTRATION_BONUS.percentage}% extra on your first investment. Choose a plan to get started.`, 
                'success'
            );
        } else {
            showToast(
                'Investment Plans', 
                'Browse our investment options and choose the plan that fits your goals.', 
                'info'
            );
        }
    }, 1000);
});

// API functions
const api = {
    token: localStorage.getItem('authToken') || '',
    
    getInvestmentPlans: async function() {
        try {
            // Simulated API call
            return {
                success: true,
                plans: [
                    { id: 'starter', name: 'Starter Plan', minAmount: 100, dailyReturns: 25, duration: 7 },
                    { id: 'growth', name: 'Growth Plan', minAmount: 500, dailyReturns: 25, duration: 30 },
                    { id: 'premium', name: 'Premium Plan', minAmount: 1000, dailyReturns: 25, duration: 60 }
                ]
            };
        } catch (error) {
            console.error('API Error:', error);
            return { success: false, message: 'Failed to load plans' };
        }
    },
    
    createInvestmentWithBonus: async function(plan, amount, bonus, total) {
        try {
            // Simulated API call with bonus
            console.log('Creating investment with:', { plan, amount, bonus, total });
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            return {
                success: true,
                message: 'Investment created successfully',
                data: {
                    id: 'INV-' + Date.now(),
                    plan: plan,
                    amount: amount,
                    bonus: bonus,
                    total: total,
                    dailyReturns: calculateDailyReturns(total),
                    created: new Date().toISOString()
                }
            };
        } catch (error) {
            console.error('API Error:', error);
            return { success: false, message: 'Investment creation failed' };
        }
    },
    
    createInvestment: async function(planId, amount) {
        // Keep original function for compatibility
        return this.createInvestmentWithBonus(planId, amount, 0, amount);
    }
};

let investmentPlans = [];

// Load investment plans with bonus indicators
async function loadInvestmentPlans() {
    try {
        const data = await api.getInvestmentPlans();
        if (data.success) {
            investmentPlans = data.plans;
            
            // Update investment cards with bonus information
            updateInvestmentCardsWithBonus();
        }
    } catch (error) {
        console.error('Error loading investment plans:', error);
        showToast('Error loading investment plans', 'error');
    }
}

// Update investment cards to show bonus benefits
function updateInvestmentCardsWithBonus() {
    document.querySelectorAll('.investment-card').forEach(card => {
        const amountElement = card.querySelector('.investment-amount');
        if (amountElement) {
            const originalAmount = parseInt(amountElement.textContent.replace('GHS ', ''));
            
            if (REGISTRATION_BONUS.available && !REGISTRATION_BONUS.getUsedStatus()) {
                const bonus = calculateRegistrationBonus(originalAmount);
                const total = originalAmount + bonus;
                const dailyReturnsOriginal = calculateDailyReturns(originalAmount);
                const dailyReturnsWithBonus = calculateDailyReturns(total);
                
                // Add bonus info to card
                const bonusInfo = document.createElement('div');
                bonusInfo.className = 'bonus-info mt-2';
                bonusInfo.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center small">
                        <span class="text-success">
                            <i class="bi bi-gift-fill me-1"></i>+${REGISTRATION_BONUS.percentage}% Bonus
                        </span>
                        <span class="fw-bold text-primary">GHS ${total} total</span>
                    </div>
                    <div class="text-muted extra-small mt-1">
                        Earn GHS ${dailyReturnsWithBonus}/day (GHS ${dailyReturnsOriginal} + GHS ${dailyReturnsWithBonus - dailyReturnsOriginal})
                    </div>
                `;
                
                // Insert after amount element
                amountElement.parentNode.insertBefore(bonusInfo, amountElement.nextSibling);
            }
        }
    });
}

// Handle investment creation (compatibility)
async function createInvestment(planId, amount) {
    try {
        const result = await api.createInvestment(planId, amount);
        
        if (result.success) {
            showToast('Investment created successfully!');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
        } else {
            showToast(result.message || 'Investment failed', 'error');
        }
    } catch (error) {
        console.error('Investment error:', error);
        showToast(error.message || 'Investment failed. Please try again.', 'error');
    }
}

// Analytics tracking
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'GA_MEASUREMENT_ID');