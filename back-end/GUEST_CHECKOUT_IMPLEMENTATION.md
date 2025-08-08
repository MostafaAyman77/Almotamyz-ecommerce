# Guest Checkout Implementation

This document outlines the implementation of guest checkout functionality alongside the existing authenticated user system.

## Overview

The system now supports two parallel paths:
1. **Authenticated Users**: Existing functionality for registered users
2. **Guest Users**: New functionality for users without accounts

## Key Changes Made

### 1. Cart Model (`models/cartModel.js`)
- Added `guestId` field (optional, indexed)
- Made `user` field optional
- Added validation to ensure either `user` or `guestId` is present, but not both

### 2. Order Model (`models/orderModel.js`)
- Added `guestId` field (optional, indexed)
- Made `user` field optional
- Added `guestCustomer` object with:
  - `name` (required for guest orders)
  - `email` (required for guest orders)
  - `phone` (required for guest orders)
- Added validation for guest orders

### 3. Guest Utilities (`utils/guestUtils.js`)
- `generateGuestId()`: Creates UUID for guest identification
- `getGuestIdFromRequest(req)`: Extracts guest ID from cookies or headers
- `setGuestIdCookie(res, guestId)`: Sets guest ID in HTTP-only cookie
- `getCartIdentifier(req)`: Returns appropriate identifier for cart operations
- `getOrderIdentifier(req)`: Returns appropriate identifier for order operations

### 4. Cart Service (`services/cartService.js`)
- Updated all functions to support both authenticated users and guests
- `addProductToCart`: Generates guest ID if needed, sets cookie
- `getLoggedUserCart`: Returns cart for user or guest
- `removeSpecificCartItem`: Works with both user and guest carts
- `clearCart`: Clears user or guest cart
- `updateCartItemQuantity`: Updates quantities for both user types
- `applyCoupon`: Applies coupons to user or guest carts

### 5. Order Service (`services/orderService.js`)
- `createCashOrder`: Supports guest orders with customer information
- `filterOrderForLoggedUser`: Updated to handle guest orders
- `cancelOrder`: Updated to handle guest order permissions

### 6. Routes
- **Cart Routes** (`routes/cartRoute.js`): Removed authentication requirements
- **Order Routes** (`routes/orderRoute.js`): Added guest checkout route
- **Guest Routes** (`routes/guestRoute.js`): New dedicated guest routes
- **Main Routes** (`routes/index.js`): Added guest route mounting

### 7. Server Configuration (`server.js`)
- Added `cookie-parser` middleware for guest ID handling

## API Endpoints

### Guest Cart Operations
- `POST /api/v1/guest/cart` - Add product to guest cart
- `GET /api/v1/guest/cart` - Get guest cart
- `DELETE /api/v1/guest/cart` - Clear guest cart
- `PUT /api/v1/guest/cart/applyCoupon` - Apply coupon to guest cart
- `PUT /api/v1/guest/cart/:itemId` - Update cart item quantity
- `DELETE /api/v1/guest/cart/:itemId` - Remove cart item

### Guest Order Operations
- `POST /api/v1/guest/orders/:cartId` - Create guest order

### Existing Cart Operations (Now Support Both)
- `POST /api/v1/cart` - Add product to cart (user or guest)
- `GET /api/v1/cart` - Get cart (user or guest)
- `DELETE /api/v1/cart` - Clear cart (user or guest)
- `PUT /api/v1/cart/applyCoupon` - Apply coupon (user or guest)
- `PUT /api/v1/cart/:itemId` - Update cart item (user or guest)
- `DELETE /api/v1/cart/:itemId` - Remove cart item (user or guest)

### Existing Order Operations (Now Support Both)
- `POST /api/v1/orders/:cartId` - Create order (user or guest)

## Guest ID Management

### Cookie Storage
- Guest IDs are stored in HTTP-only cookies
- 30-day expiration
- Secure in production
- SameSite strict policy

### Header Support
- Guest IDs can also be sent via `X-Guest-Id` header
- Useful for mobile apps or when cookies are disabled

## Frontend Integration

### For Guest Users
1. **First Visit**: No guest ID exists
2. **Add to Cart**: Guest ID is generated and set in cookie
3. **Subsequent Requests**: Guest ID is automatically included
4. **Checkout**: Customer information is manually entered

### For Authenticated Users
- Existing functionality remains unchanged
- User ID is used for all operations

## Guest Order Process

1. **Add Products**: Guest adds products to cart (guest ID generated)
2. **Review Cart**: Guest views cart contents
3. **Checkout**: Guest provides:
   - Customer name
   - Customer email
   - Customer phone
   - Shipping address
4. **Order Creation**: Order is created with guest ID and customer info
5. **Cart Clear**: Guest cart is cleared after order creation

## Security Considerations

- Guest IDs are UUIDs (not predictable)
- Guest orders require customer information
- Guest orders cannot be cancelled by guests (admin only)
- Guest carts are tied to browser sessions
- No sensitive data stored in guest carts

## Database Changes

### Cart Collection
```javascript
{
  cartItems: [...],
  totalCartPrice: Number,
  totalPriceAfterDiscount: Number,
  user: ObjectId,        // Optional (for authenticated users)
  guestId: String,       // Optional (for guest users)
  createdAt: Date,
  updatedAt: Date
}
```

### Order Collection
```javascript
{
  user: ObjectId,        // Optional (for authenticated users)
  guestId: String,       // Optional (for guest users)
  guestCustomer: {       // Required for guest orders
    name: String,
    email: String,
    phone: String
  },
  cartItems: [...],
  shippingAddress: {...},
  totalOrderPrice: Number,
  // ... other fields
}
```

## Testing

### Guest Cart Flow
1. Add product to cart (no authentication)
2. Verify guest ID is generated and set in cookie
3. Add more products
4. Update quantities
5. Apply coupons
6. Remove items
7. Clear cart

### Guest Order Flow
1. Create guest cart with products
2. Create order with customer information
3. Verify order is created with guest ID
4. Verify cart is cleared
5. Verify product quantities are updated

## Migration Notes

- Existing user carts and orders remain unchanged
- New guest functionality is additive
- No breaking changes to existing authenticated user flows
- Backward compatibility maintained 