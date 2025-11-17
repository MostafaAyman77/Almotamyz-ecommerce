const axios = require('axios');

class PaymobService {
  constructor() {
    this.baseURL = 'https://accept.paymob.com/api';
    this.apiKey = process.env.PAYMOB_API_KEY;

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

  // Step 1: Authentication
  async authenticate() {
    try {
      const response = await axios.post(`${this.baseURL}/auth/tokens`, {
        api_key: this.apiKey
      });
      return response.data.token;
    } catch (error) {
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  // Step 2: Create Order
  async createOrder(authToken, amountCents, items = []) {
    try {
      const response = await axios.post(`${this.baseURL}/ecommerce/orders`, {
        auth_token: authToken,
        delivery_needed: false,
        amount_cents: amountCents,
        currency: 'EGP',
        items: items
      });
      return response.data;
    } catch (error) {
      throw new Error(`Order creation failed: ${error.message}`);
    }
  }

  // Step 3: Generate Payment Key
  async generatePaymentKey(authToken, orderId, amountCents, billingData, paymentMethod = 'card') {
    try {
      const integrationId = this.integrations[paymentMethod].id;

      const response = await axios.post(`${this.baseURL}/acceptance/payment_keys`, {
        auth_token: authToken,
        amount_cents: amountCents,
        expiration: 3600,
        order_id: orderId,
        billing_data: billingData,
        currency: 'EGP',
        integration_id: integrationId
      });
      return response.data.token;
    } catch (error) {
      throw new Error(`Payment key generation failed: ${error.message}`);
    }
  }

  // Complete Payment Flow for Card
  async initiateCardPayment(amount, billingData) {
    try {
      const amountCents = Math.round(amount * 100);

      // Step 1: Authenticate
      const authToken = await this.authenticate();

      // Step 2: Create Order
      const order = await this.createOrder(authToken, amountCents);

      // Step 3: Generate Payment Key
      const paymentToken = await this.generatePaymentKey(
        authToken,
        order.id,
        amountCents,
        billingData,
        'card'
      );

      // Return iframe URL for card payment
      return {
        success: true,
        orderId: order.id,
        paymentToken: paymentToken,
        paymentMethod: 'card',
        iframeUrl: `https://accept.paymob.com/api/acceptance/iframes/${this.integrations.card.iframeId}?payment_token=${paymentToken}`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Complete Payment Flow for Mobile Wallet
  async initiateWalletPayment(amount, billingData, phoneNumber) {
    try {
      const amountCents = Math.round(amount * 100);

      // Step 1: Authenticate
      const authToken = await this.authenticate();

      // Step 2: Create Order
      const order = await this.createOrder(authToken, amountCents);

      // Step 3: Generate Payment Key
      const paymentToken = await this.generatePaymentKey(
        authToken,
        order.id,
        amountCents,
        billingData,
        'wallet'
      );

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
        paymentMethod: 'wallet',
        redirectUrl: walletResponse.data.redirect_url,
        data: walletResponse.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  verifyTransactionResponse(queryParams) {
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha512', process.env.PAYMOB_HMAC_SECRET);

    // ⚠️ IMPORTANT: The order of fields MUST match Paymob's documentation exactly
    const data = [
      queryParams.amount_cents,
      queryParams.created_at,
      queryParams.currency,
      queryParams.error_occured,
      queryParams.has_parent_transaction,
      queryParams.id,
      queryParams.integration_id,
      queryParams.is_3d_secure,
      queryParams.is_auth,
      queryParams.is_capture,
      queryParams.is_refunded,
      queryParams.is_standalone_payment,
      queryParams.is_voided,
      queryParams.order,
      queryParams.owner,
      queryParams.pending,
      queryParams.source_data_pan,
      queryParams.source_data_sub_type,
      queryParams.source_data_type,
      queryParams.success
    ].join('');
    console.log("order data" , queryParams.order)
    const calculatedHmac = hmac.update(data).digest('hex');

    // Log for debugging (remove in production)
    console.log('Calculated HMAC:', calculatedHmac);
    console.log('Received HMAC:', queryParams.hmac);

    return calculatedHmac === queryParams.hmac;
  }
  // Verify transaction callback
  verifyCallback(callbackData) {
    return this.verifyTransactionResponse(callbackData)
  }


}

module.exports = PaymobService;