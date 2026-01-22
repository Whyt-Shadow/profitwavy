// server/paymentController.js
const axios = require('axios');

const PAYSTACK_SECRET_KEY = 'sk_live_1d227ca943d56775a9cd97b7abc2aea381781d78';

class PaymentController {
    // Initialize Paystack transaction
    async initializeTransaction(req, res) {
        try {
            const { amount, email, phone, network, userId } = req.body;
            
            // Convert amount to pesewas
            const amountInPesewas = amount * 100;
            
            // Generate unique reference
            const reference = 'PW' + Date.now() + Math.random().toString(36).substr(2, 9);
            
            // Prepare request data
            const requestData = {
                amount: amountInPesewas,
                email: email || 'customer@profitwavy.com',
                currency: 'GHS',
                reference: reference,
                callback_url: `${process.env.BASE_URL}/api/payment/callback`,
                metadata: {
                    user_id: userId,
                    phone: phone,
                    network: network,
                    type: 'deposit'
                }
            };
            
            // Add mobile money data if provided
            if (phone && network) {
                requestData.mobile_money = {
                    phone: phone,
                    provider: network
                };
            }
            
            // Make API call to Paystack
            const response = await axios.post(
                'https://api.paystack.co/transaction/initialize',
                requestData,
                {
                    headers: {
                        Authorization: `Bearer $sk_live_1d227ca943d56775a9cd97b7abc2aea381781d78}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            // Save transaction to database
            await this.saveTransaction({
                userId,
                amount,
                reference,
                status: 'pending',
                type: 'deposit',
                paymentMethod: network ? 'mobile_money' : 'card',
                network
            });
            
            res.json({
                success: true,
                data: response.data.data
            });
            
        } catch (error) {
            console.error('Initialize transaction error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to initialize payment'
            });
        }
    }
    
    // Verify Paystack payment
    async verifyPayment(req, res) {
        try {
            const { reference } = req.body;
            
            // Call Paystack verify API
            const response = await axios.get(
                `https://api.paystack.co/transaction/verify/${reference}`,
                {
                    headers: {
                        Authorization: `Bearer ${sk_live_1d227ca943d56775a9cd97b7abc2aea381781d78}`
                    }
                }
            );
            
            const transaction = response.data.data;
            
            if (transaction.status === 'success') {
                // Update transaction in database
                await this.updateTransaction(reference, {
                    status: 'completed',
                    paystackData: transaction
                });
                
                // Credit user's account
                const userId = transaction.metadata.user_id;
                const amount = transaction.amount / 100; // Convert from pesewas
                
                await this.creditUserAccount(userId, amount);
                
                res.json({
                    success: true,
                    message: 'Payment verified successfully',
                    data: transaction
                });
            } else {
                res.json({
                    success: false,
                    message: 'Payment not successful',
                    data: transaction
                });
            }
            
        } catch (error) {
            console.error('Verify payment error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to verify payment'
            });
        }
    }
    
    // Webhook for Paystack callbacks
    async webhook(req, res) {
        try {
            const hash = crypto.createHmac('sha512', sk_live_1d227ca943d56775a9cd97b7abc2aea381781d78)
                .update(JSON.stringify(req.body))
                .digest('hex');
            
            // Verify signature
            if (hash === req.headers['x-paystack-signature']) {
                const event = req.body;
                
                switch (event.event) {
                    case 'charge.success':
                        await this.handleSuccessfulCharge(event.data);
                        break;
                    case 'transfer.success':
                        await this.handleSuccessfulTransfer(event.data);
                        break;
                    // Handle other events
                }
                
                res.sendStatus(200);
            } else {
                res.sendStatus(400);
            }
        } catch (error) {
            console.error('Webhook error:', error);
            res.sendStatus(500);
        }
    }
    
    // Database methods (simplified)
    async saveTransaction(transactionData) {
        // Save to your database
        console.log('Saving transaction:', transactionData);
    }
    
    async updateTransaction(reference, updates) {
        // Update transaction in database
        console.log('Updating transaction:', reference, updates);
    }
    
    async creditUserAccount(userId, amount) {
        // Credit user's account balance
        console.log('Crediting user:', userId, 'Amount:', amount);
    }
    
    async handleSuccessfulCharge(data) {
        // Handle successful charge from webhook
        console.log('Successful charge:', data);
        
        // Update transaction and credit user
        await this.updateTransaction(data.reference, {
            status: 'completed',
            paystackData: data
        });
        
        const userId = data.metadata.user_id;
        const amount = data.amount / 100;
        
        await this.creditUserAccount(userId, amount);
    }
}

module.exports = new PaymentController();