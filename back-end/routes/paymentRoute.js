const express = require('express');
const router = express.Router();
const PaymobService = require('../services/paymentServices');

const paymob = new PaymobService();

router.post('/card', async (req, res) => {
  const { amount, customerInfo } = req.body;

  const billingData = {
    first_name: customerInfo.firstName,
    last_name: customerInfo.lastName,
    email: customerInfo.email,
    phone_number: customerInfo.phone,
    apartment: 'NA',
    floor: 'NA',
    street: 'NA',
    building: 'NA',
    shipping_method: 'NA',
    postal_code: 'NA',
    city: customerInfo.city || 'Cairo',
    country: 'EG',
    state: 'NA'
  };

  const result = await paymob.initiateCardPayment(amount, billingData);
  
  if (result.success) {
    res.json({
      success: true,
      paymentMethod: 'card',
      iframeUrl: result.iframeUrl,
      orderId: result.orderId
    });
  } else {
    res.status(500).json({
      success: false,
      error: result.error
    });
  }
});


router.post('/callback', (req, res) => {
  const callbackData = req.body;
  
  console.log('Received callback:', callbackData);
  
  const isValid = paymob.verifyCallback(callbackData);
  
  if (isValid && callbackData.success === 'true') {
    // Payment successful
    console.log('✅ Payment successful for order:', callbackData.order);
    // TODO: Update your database, send confirmation email, etc.
  } else {
    // Payment failed
    console.log('❌ Payment failed for order:', callbackData.order);
  }
  
  res.status(200).send('OK');
});

module.exports = router;