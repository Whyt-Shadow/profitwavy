  // Sample transaction data
        const transactions = [
            {
                id: "TX0012345",
                date: "2023-10-15 14:30:00",
                type: "deposit",
                description: "Mobile Money Deposit via MTN",
                amount: 1000.00,
                status: "completed",
                balance: 1250.75,
                method: "MTN Mobile Money",
                reference: "MM1234567890"
            },
            {
                id: "TX0012346",
                date: "2023-10-14 11:15:00",
                type: "investment",
                description: "Agriculture Fund Investment",
                amount: -500.00,
                status: "completed",
                balance: 250.75,
                method: "Platform Investment",
                reference: "INV987654321"
            },
            {
                id: "TX0012347",
                date: "2023-10-14 09:00:00",
                type: "return",
                description: "Daily Return - Agriculture Fund",
                amount: 12.50,
                status: "completed",
                balance: 750.75,
                method: "Platform Returns",
                reference: "RET456789012"
            },
            {
                id: "TX0012348",
                date: "2023-10-13 16:45:00",
                type: "withdrawal",
                description: "Withdrawal to Vodafone Cash",
                amount: -300.00,
                status: "completed",
                balance: 738.25,
                method: "Vodafone Cash",
                reference: "WD789012345"
            },
            {
                id: "TX0012349",
                date: "2023-10-12 10:20:00",
                type: "deposit",
                description: "Mobile Money Deposit via AirtelTigo",
                amount: 750.00,
                status: "completed",
                balance: 1038.25,
                method: "AirtelTigo Money",
                reference: "MM2345678901"
            },
            {
                id: "TX0012350",
                date: "2023-10-12 08:30:00",
                type: "investment",
                description: "Real Estate Trust Investment",
                amount: -250.00,
                status: "completed",
                balance: 288.25,
                method: "Platform Investment",
                reference: "INV876543210"
            },
            {
                id: "TX0012351",
                date: "2023-10-11 09:15:00",
                type: "return",
                description: "Daily Return - Real Estate Trust",
                amount: 8.25,
                status: "completed",
                balance: 538.25,
                method: "Platform Returns",
                reference: "RET345678901"
            },
            {
                id: "TX0012352",
                date: "2023-10-10 15:30:00",
                type: "deposit",
                description: "Mobile Money Deposit via MTN",
                amount: 500.00,
                status: "completed",
                balance: 530.00,
                method: "MTN Mobile Money",
                reference: "MM3456789012"
            },
            {
                id: "TX0012353",
                date: "2023-10-09 12:00:00",
                type: "withdrawal",
                description: "Withdrawal to MTN Mobile Money",
                amount: -200.00,
                status: "pending",
                balance: 530.00,
                method: "MTN Mobile Money",
                reference: "WD890123456",
                notes: "Processing - usually takes 1-2 hours"
            },
            {
                id: "TX0012354",
                date: "2023-10-08 14:20:00",
                type: "deposit",
                description: "Mobile Money Deposit via Vodafone",
                amount: 1000.00,
                status: "failed",
                balance: 30.00,
                method: "Vodafone Cash",
                reference: "MM4567890123",
                notes: "Transaction failed due to insufficient funds"
            }
        ];

        // Initialize DataTable
        let dataTable;

        document.addEventListener('DOMContentLoaded', function() {
            // Initialize toast
            const toastEl = document.getElementById('toast');
            const toast = new bootstrap.Toast(toastEl, { delay: 5000 });
            
            // Function to show toast notification
            window.showToast = function(message, type = 'success') {
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
            };

            // Initialize DataTable
            dataTable = $('#transactionsTable').DataTable({
                data: transactions,
                columns: [
                    { data: 'date' },
                    { data: 'id' },
                    { 
                        data: 'type',
                        render: function(data, type, row) {
                            const typeMap = {
                                'deposit': 'Deposit',
                                'withdrawal': 'Withdrawal',
                                'investment': 'Investment',
                                'return': 'Return'
                            };
                            return typeMap[data] || data;
                        }
                    },
                    { data: 'description' },
                    { 
                        data: 'amount',
                        render: function(data, type, row) {
                            const prefix = data >= 0 ? '+' : '';
                            const className = data >= 0 ? 'amount-positive' : 'amount-negative';
                            return `<span class="${className}">${prefix}GH₵ ${Math.abs(data).toFixed(2)}</span>`;
                        }
                    },
                    { 
                        data: 'status',
                        render: function(data, type, row) {
                            const statusMap = {
                                'completed': 'Completed',
                                'pending': 'Pending',
                                'failed': 'Failed'
                            };
                            const badgeClass = {
                                'completed': 'status-completed',
                                'pending': 'status-pending',
                                'failed': 'status-failed'
                            };
                            return `<span class="status-badge ${badgeClass[data]}">${statusMap[data]}</span>`;
                        }
                    },
                    { 
                        data: 'balance',
                        render: function(data) {
                            return `GH₵ ${data.toFixed(2)}`;
                        }
                    },
                    {
                        data: null,
                        render: function(data, type, row) {
                            return `<button class="btn btn-sm btn-outline-primary view-btn" data-id="${row.id}">
                                <i class="fas fa-eye me-1"></i>View
                            </button>`;
                        }
                    }
                ],
                order: [[0, 'desc']],
                pageLength: 10,
                language: {
                    search: "Search transactions:",
                    lengthMenu: "Show _MENU_ transactions",
                    info: "Showing _START_ to _END_ of _TOTAL_ transactions",
                    paginate: {
                        previous: "Previous",
                        next: "Next"
                    }
                },
                responsive: true
            });

            // Setup filter buttons
            setupFilterButtons();
            
            // Setup view buttons using event delegation
            $(document).on('click', '.view-btn', function() {
                const transactionId = $(this).data('id');
                showTransactionDetails(transactionId);
            });
            
            // Setup filter changes
            setupFilterChanges();
            
            // Set default dates
            setDefaultDates();
        });

        // Go back function
        function goBack() {
            window.history.back();
        };

        function setupFilterButtons() {
            const buttons = document.querySelectorAll('.filter-btn');
            buttons.forEach(btn => {
                btn.addEventListener('click', function() {
                    buttons.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    
                    const period = this.getAttribute('data-period');
                    filterByPeriod(period);
                });
            });
        }

        function setupFilterChanges() {
            document.getElementById('typeFilter').addEventListener('change', applyFilters);
            document.getElementById('statusFilter').addEventListener('change', applyFilters);
            document.getElementById('dateFrom').addEventListener('change', applyFilters);
            document.getElementById('dateTo').addEventListener('change', applyFilters);
        }

        function setDefaultDates() {
            const today = new Date().toISOString().split('T')[0];
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            const oneMonthAgoStr = oneMonthAgo.toISOString().split('T')[0];
            
            document.getElementById('dateFrom').value = oneMonthAgoStr;
            document.getElementById('dateTo').value = today;
            
            applyFilters();
        }

        function filterByPeriod(period) {
            const now = new Date();
            let startDate = null;
            
            switch(period) {
                case 'today':
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    break;
                case 'week':
                    const day = now.getDay();
                    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
                    startDate = new Date(now.getFullYear(), now.getMonth(), diff);
                    break;
                case 'month':
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    break;
                case 'year':
                    startDate = new Date(now.getFullYear(), 0, 1);
                    break;
                default:
                    // All time - set to 1 year ago
                    startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            }
            
            if (startDate) {
                document.getElementById('dateFrom').value = startDate.toISOString().split('T')[0];
                document.getElementById('dateTo').value = now.toISOString().split('T')[0];
            }
            
            applyFilters();
        }

        function applyFilters() {
            const type = document.getElementById('typeFilter').value;
            const status = document.getElementById('statusFilter').value;
            const dateFrom = document.getElementById('dateFrom').value;
            const dateTo = document.getElementById('dateTo').value;
            
            // Clear all filters first
            dataTable.search('').columns().search('').draw();
            
            // Apply type filter if not "all"
            if (type !== 'all') {
                dataTable.column(2).search(type, true, false).draw();
            }
            
            // Apply status filter if not "all"
            if (status !== 'all') {
                dataTable.column(5).search(status, true, false).draw();
            }
            
            // Apply date filtering
            if (dateFrom && dateTo) {
                const filteredData = transactions.filter(transaction => {
                    const transactionDate = new Date(transaction.date.split(' ')[0]);
                    const fromDate = new Date(dateFrom);
                    const toDate = new Date(dateTo);
                    
                    return transactionDate >= fromDate && transactionDate <= toDate;
                });
                
                dataTable.clear().rows.add(filteredData).draw();
            }
        }

        function showTransactionDetails(transactionId) {
            const transaction = transactions.find(t => t.id === transactionId);
            if (!transaction) {
                showToast('Transaction not found!', 'error');
                return;
            }
            
            // Update modal content
            document.getElementById('modal-id').textContent = transaction.id;
            document.getElementById('modal-date').textContent = transaction.date;
            
            const typeMap = {
                'deposit': 'Deposit',
                'withdrawal': 'Withdrawal',
                'investment': 'Investment',
                'return': 'Return'
            };
            document.getElementById('modal-type').textContent = typeMap[transaction.type] || transaction.type;
            
            const statusMap = {
                'completed': 'Completed',
                'pending': 'Pending',
                'failed': 'Failed'
            };
            const statusBadgeClass = {
                'completed': 'status-completed',
                'pending': 'status-pending',
                'failed': 'status-failed'
            };
            document.getElementById('modal-status').innerHTML = 
                `<span class="status-badge ${statusBadgeClass[transaction.status]}">${statusMap[transaction.status]}</span>`;
            
            const amountClass = transaction.amount >= 0 ? 'amount-positive' : 'amount-negative';
            const amountSign = transaction.amount >= 0 ? '+' : '';
            document.getElementById('modal-amount').innerHTML = 
                `<span class="${amountClass}">${amountSign}GH₵ ${Math.abs(transaction.amount).toFixed(2)}</span>`;
            
            document.getElementById('modal-balance').textContent = `GH₵ ${transaction.balance.toFixed(2)}`;
            document.getElementById('modal-description').textContent = transaction.description;
            document.getElementById('modal-method').textContent = transaction.method;
            document.getElementById('modal-reference').textContent = transaction.reference;
            
            if (transaction.notes) {
                document.getElementById('modal-notes').textContent = transaction.notes;
                document.getElementById('modal-notes-section').style.display = 'block';
            } else {
                document.getElementById('modal-notes-section').style.display = 'none';
            }
            
            // Set receipt button handler
            document.getElementById('modal-receipt-btn').onclick = function() {
                downloadReceipt(transaction);
            };
            
            // Show modal
            const modal = new bootstrap.Modal(document.getElementById('transactionModal'));
            modal.show();
        }

        function downloadReceipt(transaction) {
            // Create receipt content
            const receiptContent = `
                ProfitWavy Transaction Receipt
                ==============================
                
                Transaction ID: ${transaction.id}
                Date: ${transaction.date}
                Type: ${transaction.type}
                Amount: ${transaction.amount >= 0 ? '+' : ''}GH₵ ${Math.abs(transaction.amount).toFixed(2)}
                Status: ${transaction.status}
                Description: ${transaction.description}
                Payment Method: ${transaction.method}
                Reference: ${transaction.reference}
                
                Thank you for using ProfitWavy!
            `;
            
            // Create a blob and download link
            const blob = new Blob([receiptContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `receipt-${transaction.id}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showToast('Receipt downloaded successfully!');
        }

        window.exportTransactions = function() {
            // Convert transactions to CSV
            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += "Transaction ID,Date,Type,Description,Amount,Status,Balance,Payment Method,Reference\n";
            
            transactions.forEach(transaction => {
                const row = [
                    transaction.id,
                    transaction.date,
                    transaction.type,
                    transaction.description,
                    transaction.amount,
                    transaction.status,
                    transaction.balance,
                    transaction.method,
                    transaction.reference
                ].map(item => `"${item}"`).join(",");
                csvContent += row + "\n";
            });
            
            // Create download link
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "profitwavy-transactions.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            showToast('Transactions exported as CSV file!');
        };