# Order & Payment System - Complete Setup Guide

## 📦 Files Created

1. **orderModel.js** - MongoDB schema with payment states
2. **orderService.js** - Full CRUD operations + Paymob integration
3. **orderRoute.js** - Protected routes with role-based access
4. **orderValidator.js** - Input validation middleware

---

## 🔗 Relationships

```
User ←→ Cart ←→ Order
         ↓
      Paymob Payment Gateway
```

### Database Relations:
- **Order → User**: Direct reference to order owner
- **Order → Cart**: Reference to original cart (for tracking)
- **Order → Products**: Snapshot of cart items at purchase time

---

## 🚀 Setup Instructions

### 1. Environment Variables (.env)
```env
# Paymob Configuration
PAYMOB_API_KEY=your_api_key_here
PAYMOB_CARD_INTEGRATION_ID=your_card_integration_id
PAYMOB_WALLET_INTEGRATION_ID=your_wallet_integration_id
PAYMOB_IFRAME_ID=your_iframe_id
PAYMOB_HMAC_SECRET=your_hmac_secret
```

### 2. Install Dependencies
```bash
npm install axios crypto
```

### 3. Register Routes (in server.js or app.js)
```javascript
const orderRoute = require('./routes/orderRoute');
app.use('/api/v1/orders', orderRoute);
```

### 4. Create Paymob Service File
Save the provided `paymentServices.js` as `utils/paymobService.js`

---

## 📍 API Endpoints

### **User Endpoints** (Requires Authentication)

#### 1. Create Cash Order
```http
POST /api/v1/orders/:cartId
Authorization: Bearer {token}

Body:
{
  "shippingAddress": {
    "details": "123 Main St, Apt 4",
    "phone": "01012345678",
    "city": "Cairo",
    "postalCode": "11511"
  }
}
```

#### 2. Create Card Payment (Paymob)
```http
POST /api/v1/orders/:cartId/pay-card
Authorization: Bearer {token}

Body:
{
  "shippingAddress": {
    "details": "123 Main St, Apt 4",
    "phone": "01012345678",
    "city": "Cairo",
    "postalCode": "11511"
  }
}

Response:
{
  "status": "success",
  "data": {
    "order": {...},
    "paymentUrl": "https://accept.paymob.com/api/acceptance/iframes/...",
    "paymentToken": "..."
  }
}
```

#### 3. Create Wallet Payment (Paymob)
```http
POST /api/v1/orders/:cartId/pay-wallet
Authorization: Bearer {token}

Body:
{
  "shippingAddress": {
    "details": "123 Main St",
    "phone": "01012345678",
    "city": "Cairo"
  },
  "phone": "01012345678"  // Wallet phone number
}
```

#### 4. Get All Orders (User sees only their orders)
```http
GET /api/v1/orders
Authorization: Bearer {token}
```

#### 5. Get Specific Order
```http
GET /api/v1/orders/:orderId
Authorization: Bearer {token}
```

#### 6. Cancel Order
```http
PUT /api/v1/orders/:orderId/cancel
Authorization: Bearer {token}
```

---

### **Admin/Manager Endpoints**

#### 7. Mark Order as Paid (Manual)
```http
PUT /api/v1/orders/:orderId/pay
Authorization: Bearer {admin_token}
```

#### 8. Mark Order as Delivered
```http
PUT /api/v1/orders/:orderId/deliver
Authorization: Bearer {admin_token}
```

#### 9. Delete Order (Admin Only)
```http
DELETE /api/v1/orders/:orderId
Authorization: Bearer {admin_token}
```

---

### **Public Endpoint**

#### 10. Paymob Callback (Webhook)
```http
POST /api/v1/orders/paymob-callback
Content-Type: application/json

Body: (Sent by Paymob)
{
  "obj": {
    "id": 123456,
    "success": true,
    "order": "paymob_order_id",
    ...
  }
}
```

**⚠️ Configure this URL in Paymob Dashboard:**
```
https://yourdomain.com/api/v1/orders/paymob-callback
```

---

## 🔄 Payment Flow

### **Cash Order Flow:**
1. User creates order → Order created with `paymentMethodType: "cash"`
2. Product quantities updated immediately
3. Cart deleted
4. Order status: `pending` → Admin marks as `paid` when cash received

### **Card Payment Flow:**
1. User initiates payment → Order created with `paymentStatus: "pending"`
2. Paymob iframe URL returned to frontend
3. User completes payment on Paymob
4. Paymob sends callback to your webhook
5. Webhook updates order: `isPaid: true`, `paymentStatus: "paid"`
6. Product quantities updated
7. Cart deleted

### **Wallet Payment Flow:**
1. User initiates payment with phone number
2. Redirect URL returned
3. User completes payment in wallet app
4. Same callback flow as card payment

---

## 📊 Order States

### Payment Status:
- `pending` - Payment not completed
- `paid` - Payment successful
- `failed` - Payment failed
- `refunded` - Payment refunded (when cancelled)

### Order Status:
- `pending` - Order placed, awaiting payment
- `processing` - Payment received, preparing order
- `shipped` - Order shipped
- `delivered` - Order delivered
- `cancelled` - Order cancelled

---

## 🛡️ Security Features

✅ **HMAC Signature Verification** - Validates Paymob callbacks  
✅ **Role-Based Access Control** - User/Admin/Manager permissions  
✅ **Cart Ownership Verification** - Users can only order from their carts  
✅ **Order Ownership Verification** - Users can only view/cancel their orders  
✅ **Input Validation** - Validates all user inputs  

---

## 🔧 Frontend Integration Example

```javascript
// Create card payment
const createCardPayment = async (cartId, shippingAddress) => {
  const response = await fetch(`/api/v1/orders/${cartId}/pay-card`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ shippingAddress })
  });
  
  const data = await response.json();
  
  // Redirect user to Paymob payment page
  window.location.href = data.data.paymentUrl;
};

// Check order status
const checkOrderStatus = async (orderId) => {
  const response = await fetch(`/api/v1/orders/${orderId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  console.log(data.data.paymentStatus); // pending, paid, failed
};
```

---

## 📝 Testing Checklist

- [ ] Test cash order creation
- [ ] Test card payment initiation
- [ ] Test wallet payment initiation
- [ ] Test Paymob callback with test credentials
- [ ] Test order listing (user vs admin)
- [ ] Test order cancellation
- [ ] Test admin marking order as paid/delivered
- [ ] Verify product quantity decrements
- [ ] Verify cart deletion after successful order

---

## 🐛 Common Issues & Solutions

### Issue: "Cart does not belong to you"
**Solution:** Ensure the cart's `user` field matches the authenticated user's ID

### Issue: Paymob callback not working
**Solution:** 
1. Check HMAC secret is correct
2. Verify callback URL is registered in Paymob dashboard
3. Ensure webhook endpoint is publicly accessible

### Issue: Product quantity not updating
**Solution:** Verify Product model has `quantity` and `sold` fields

### Issue: Payment successful but order not updated
**Solution:** Check server logs for callback errors and verify `paymobOrderId` is being saved

---

## 🎯 Next Steps

1. **Add Email Notifications** - Send order confirmation emails
2. **Add Order Tracking** - Implement tracking numbers
3. **Add Refund Logic** - Handle payment refunds via Paymob API
4. **Add Analytics** - Track payment success rates
5. **Add Invoice Generation** - PDF invoices for completed orders

---

**🎉 Your complete order and payment system is ready!**