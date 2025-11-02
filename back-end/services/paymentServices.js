const axios = require('axios');
const crypto = require('crypto');

class PaymobService {
  constructor() {
    this.baseURL = 'https://accept.paymob.com/api';
    this.apiKey = process.env.PAYMOB_API_KEY;
    this.hmacSecret = process.env.PAYMOB_HMAC_SECRET;
    
    // Multiple Integration IDs for different payment methods
    this.integrations = {
      card: {
        id: process.env.PAYMOB_CARD_INTEGRATION_ID,
        iframeId: process.env.PAYMOB_IFRAME_ID
      },
      wallet: {
        id: process.env.PAYMOB_WALLET_INTEGRATION_ID
      }
    };
  }

  // ============================================
  // STEP 1: Authentication
  // ============================================
  async authenticate() {
    try {
      const response = await axios.post(`${this.baseURL}/auth/tokens`, {
        api_key: this.apiKey
      });
      return response.data.token;
    } catch (error) {
      console.error('Authentication Error:', error.response?.data || error.message);
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  // ============================================
  // STEP 2: Create Order
  // ============================================
  async createOrder(authToken, merchantOrderId, amountCents, items = []) {
    try {
      const response = await axios.post(`${this.baseURL}/ecommerce/orders`, {
        auth_token: authToken,
        delivery_needed: false,
        amount_cents: amountCents,
        currency: 'EGP',
        merchant_order_id: merchantOrderId, // ✅ IMPORTANT: Your MongoDB Order ID
        items: items
      });
      return response.data;
    } catch (error) {
      console.error('Order Creation Error:', error.response?.data || error.message);
      throw new Error(`Order creation failed: ${error.message}`);
    }
  }

  // ============================================
  // STEP 3: Generate Payment Key
  // ============================================
  async generatePaymentKey(authToken, orderId, amountCents, billingData, paymentMethod = 'card') {
    try {
      const integrationId = this.integrations[paymentMethod].id;
      
      if (!integrationId) {
        throw new Error(`Invalid payment method: ${paymentMethod}`);
      }

      const response = await axios.post(`${this.baseURL}/acceptance/payment_keys`, {
        auth_token: authToken,
        amount_cents: amountCents,
        expiration: 3600,
        order_id: orderId,
        billing_data: billingData,
        currency: 'EGP',
        integration_id: parseInt(integrationId)
      });
      
      return response.data.token;
    } catch (error) {
      console.error('Payment Key Generation Error:', error.response?.data || error.message);
      throw new Error(`Payment key generation failed: ${error.message}`);
    }
  }

  // ============================================
  // Complete Payment Flow for Card
  // ============================================
  async initiateCardPayment(merchantOrderId, amount, billingData) {
    try {
      const amountCents = Math.round(amount * 100);

      console.log('Initiating Card Payment:', {
        merchantOrderId,
        amount,
        amountCents
      });

      // Step 1: Authenticate
      const authToken = await this.authenticate();
      console.log('✅ Authentication successful');

      // Step 2: Create Order (with merchant_order_id)
      const order = await this.createOrder(authToken, merchantOrderId, amountCents);
      console.log('✅ Order created:', order.id);

      // Step 3: Generate Payment Key
      const paymentToken = await this.generatePaymentKey(
        authToken,
        order.id,
        amountCents,
        billingData,
        'card'
      );
      console.log('✅ Payment key generated');

      // Return iframe URL for card payment
      const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${this.integrations.card.iframeId}?payment_token=${paymentToken}`;

      return {
        success: true,
        orderId: order.id,
        merchantOrderId: merchantOrderId,
        paymentToken: paymentToken,
        paymentMethod: 'card',
        iframeUrl: iframeUrl
      };
    } catch (error) {
      console.error('Card Payment Initiation Error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ============================================
  // Complete Payment Flow for Mobile Wallet
  // ============================================
  async initiateWalletPayment(merchantOrderId, amount, billingData, phoneNumber) {
    try {
      const amountCents = Math.round(amount * 100);

      console.log('Initiating Wallet Payment:', {
        merchantOrderId,
        amount,
        amountCents,
        phoneNumber
      });

      // Step 1: Authenticate
      const authToken = await this.authenticate();
      console.log('✅ Authentication successful');

      // Step 2: Create Order (with merchant_order_id)
      const order = await this.createOrder(authToken, merchantOrderId, amountCents);
      console.log('✅ Order created:', order.id);

      // Step 3: Generate Payment Key
      const paymentToken = await this.generatePaymentKey(
        authToken,
        order.id,
        amountCents,
        billingData,
        'wallet'
      );
      console.log('✅ Payment key generated');

      // Step 4: Pay with Mobile Wallet
      const walletResponse = await axios.post(
        `${this.baseURL}/acceptance/payments/pay`,
        {
          source: {
            identifier: phoneNumber,
            subtype: 'WALLET'
          },
          payment_token: paymentToken
        }
      );

      return {
        success: true,
        orderId: order.id,
        merchantOrderId: merchantOrderId,
        paymentMethod: 'wallet',
        redirectUrl: walletResponse.data.redirect_url,
        data: walletResponse.data
      };
    } catch (error) {
      console.error('Wallet Payment Initiation Error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ============================================
  // Verify Transaction Processed Callback (POST)
  // ============================================
  verifyCallback(callbackData, receivedHmac) {
    try {
      if (!this.hmacSecret) {
        console.error('❌ HMAC Secret is not configured!');
        return false;
      }

      if (!receivedHmac) {
        console.error('❌ No HMAC provided in callback');
        return false;
      }

      // Extract nested order data if it exists
      const orderId = typeof callbackData.order === 'object' 
        ? callbackData.order.id 
        : callbackData.order;

      // Extract source_data fields safely
      const sourcePan = callbackData.source_data?.pan || '';
      const sourceSubType = callbackData.source_data?.sub_type || '';
      const sourceType = callbackData.source_data?.type || '';

      // Concatenate fields in EXACT order as per Paymob documentation
      const concatenatedString = String(callbackData.amount_cents || '') +
        String(callbackData.created_at || '') +
        String(callbackData.currency || '') +
        String(callbackData.error_occured || '') +
        String(callbackData.has_parent_transaction || '') +
        String(callbackData.id || '') +
        String(callbackData.integration_id || '') +
        String(callbackData.is_3d_secure || '') +
        String(callbackData.is_auth || '') +
        String(callbackData.is_capture || '') +
        String(callbackData.is_refunded || '') +
        String(callbackData.is_standalone_payment || '') +
        String(callbackData.is_voided || '') +
        String(orderId || '') +
        String(callbackData.owner || '') +
        String(callbackData.pending || '') +
        String(sourcePan) +
        String(sourceSubType) +
        String(sourceType) +
        String(callbackData.success || '');

      console.log('HMAC Verification Debug:', {
        concatenatedLength: concatenatedString.length,
        firstChars: concatenatedString.substring(0, 50),
        receivedHmacLength: receivedHmac.length
      });

      // Calculate HMAC using SHA512
      const calculatedHmac = crypto
        .createHmac('sha512', this.hmacSecret)
        .update(concatenatedString)
        .digest('hex');

      const isValid = calculatedHmac === receivedHmac;

      if (!isValid) {
        console.error('❌ HMAC Mismatch:', {
          calculated: calculatedHmac.substring(0, 20) + '...',
          received: receivedHmac.substring(0, 20) + '...'
        });
      }

      return isValid;
    } catch (error) {
      console.error('❌ HMAC Verification Error:', error.message);
      return false;
    }
  }

  // ============================================
  // Verify Transaction Response Callback (GET)
  // ============================================
  verifyResponseCallback(queryParams) {
    try {
      if (!this.hmacSecret) {
        console.error('❌ HMAC Secret is not configured!');
        return false;
      }

      const receivedHmac = queryParams.hmac;
      if (!receivedHmac) {
        console.error('❌ No HMAC provided in response callback');
        return false;
      }

      // Concatenate query parameters in EXACT order
      const concatenatedString = String(queryParams.amount_cents || '') +
        String(queryParams.created_at || '') +
        String(queryParams.currency || '') +
        String(queryParams.error_occured || '') +
        String(queryParams.has_parent_transaction || '') +
        String(queryParams.id || '') +
        String(queryParams.integration_id || '') +
        String(queryParams.is_3d_secure || '') +
        String(queryParams.is_auth || '') +
        String(queryParams.is_capture || '') +
        String(queryParams.is_refunded || '') +
        String(queryParams.is_standalone_payment || '') +
        String(queryParams.is_voided || '') +
        String(queryParams.order || '') +
        String(queryParams.owner || '') +
        String(queryParams.pending || '') +
        String(queryParams.source_data_pan || '') +
        String(queryParams.source_data_sub_type || '') +
        String(queryParams.source_data_type || '') +
        String(queryParams.success || '');

      // Calculate HMAC
      const calculatedHmac = crypto
        .createHmac('sha512', this.hmacSecret)
        .update(concatenatedString)
        .digest('hex');

      const isValid = calculatedHmac === receivedHmac;

      if (!isValid) {
        console.error('❌ Response Callback HMAC Mismatch');
      }

      return isValid;
    } catch (error) {
      console.error('❌ Response Callback HMAC Verification Error:', error.message);
      return false;
    }
  }

  // ============================================
  // Query Transaction Status (Optional)
  // ============================================
  async queryTransaction(transactionId) {
    try {
      const authToken = await this.authenticate();
      
      const response = await axios.get(
        `${this.baseURL}/acceptance/transactions/${transactionId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      return {
        success: true,
        transaction: response.data
      };
    } catch (error) {
      console.error('Transaction Query Error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ============================================
  // Refund Transaction
  // ============================================
  async refundTransaction(transactionId, amountCents) {
    try {
      const authToken = await this.authenticate();

      const response = await axios.post(
        `${this.baseURL}/acceptance/void_refund/refund`,
        {
          auth_token: authToken,
          transaction_id: transactionId,
          amount_cents: amountCents
        }
      );

      return {
        success: true,
        refund: response.data
      };
    } catch (error) {
      console.error('Refund Error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ============================================
  // Void Transaction
  // ============================================
  async voidTransaction(transactionId) {
    try {
      const authToken = await this.authenticate();

      const response = await axios.post(
        `${this.baseURL}/acceptance/void_refund/void`,
        {
          auth_token: authToken,
          transaction_id: transactionId
        }
      );

      return {
        success: true,
        void: response.data
      };
    } catch (error) {
      console.error('Void Error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = PaymobService;