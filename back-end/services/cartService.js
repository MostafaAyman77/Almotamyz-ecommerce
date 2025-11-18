const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const db = require("./DB/db.services");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");

// Validate product availability and stock
const validateProductStock = async (productId, requestedQuantity, color = null) => {
  const product = await db.findOne({
    model: Product,
    filter: { 
      _id: productId, 
      isDeleted: { $ne: true }
    }
  });

  if (!product) {
    throw new ApiError("Product not found", 404);
  }

  if (product.quantity < requestedQuantity) {
    throw new ApiError(`Only ${product.quantity} items available in stock`, 400);
  }

  // Validate color if provided
  if (color && product.colors && product.colors.length > 0) {
    if (!product.colors.includes(color)) {
      throw new ApiError(`Color ${color} is not available for this product`, 400);
    }
  }

  return product;
};

// Helper function to update cart with recalculated total price
const updateCartWithTotalPrice = async (cartId, cartItems) => {
  const totalCartPrice = Cart.calculateTotalPrice(cartItems);
  
  return await db.update({
    model: Cart,
    filter: { _id: cartId },
    data: { 
      cartItems: cartItems,
      totalCartPrice: totalCartPrice
    }
  });
};

// @desc    Add product to cart or update quantity
// @route   POST /api/v1/cart
// @access  Private/User
exports.addProductToCart = asyncHandler(async (req, res, next) => {
  const { productId, color, quantity = 1 } = req.body;
  const userId = req.user._id;

  // Validate product and stock
  const product = await validateProductStock(productId, quantity, color);

  // Find or create user cart (ensures one cart per user)
  let cart = await db.findOne({
    model: Cart,
    filter: { user: userId , isDeleted: false }
  });

  if (!cart) {
    // Create new cart with calculated total price
    const cartItems = [{
      product: productId,
      color,
      price: product.price,
      quantity: parseInt(quantity)
    }];
    
    const totalCartPrice = Cart.calculateTotalPrice(cartItems);
    
    cart = await db.create({
      model: Cart,
      data: {
        user: userId,
        cartItems: cartItems,
        totalCartPrice: totalCartPrice
      }
    });
  } else {
    // Check if product already exists in cart
    const existingItemIndex = cart.cartItems.findIndex(
      item => item.product.toString() === productId && item.color === color
    );

    let updatedCartItems = [...cart.cartItems];

    if (existingItemIndex > -1) {
      // Update quantity if product exists
      const newQuantity = cart.cartItems[existingItemIndex].quantity + parseInt(quantity);
      
      // Re-validate stock for updated quantity
      await validateProductStock(productId, newQuantity, color);
      
      updatedCartItems[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item to cart
      updatedCartItems.push({
        product: productId,
        color,
        price: product.price,
        quantity: parseInt(quantity)
      });
    }

    // Update existing cart with recalculated total price
    cart = await updateCartWithTotalPrice(cart._id, updatedCartItems);
  }

  // Populate the cart before sending response
  const populatedCart = await db.populate({
    model: Cart,
    query: cart,
    path: 'cartItems.product',
    select: 'title imageCover brand'
  });

  res.status(200).json({
    status: "success",
    message: "Product added to cart successfully",
    numOfCartItems: cart.cartItems.length,
    data: populatedCart,
  });
});

// @desc    Get user cart
// @route   GET /api/v1/cart
// @access  Private/User
exports.getUserCart = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  const cart = await db.findOne({
    model: Cart,
    filter: { user: userId , isDeleted: false }
  });

  if (!cart) {
    return res.status(200).json({
      status: "success",
      numOfCartItems: 0,
      data: null,
      message: "No cart found",
    });
  }

  // Populate product details
  const populatedCart = await db.populate({
    model: Cart,
    query: cart,
    path: 'cartItems.product',
    select: 'title  brand  -_id'
  });

  res.status(200).json({
    status: "success",
    numOfCartItems: populatedCart.cartItems.length,
    data: populatedCart,
  });
});

// @desc    Remove specific cart item
// @route   DELETE /api/v1/cart/:itemId
// @access  Private/User
exports.removeCartItem = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  const cart = await db.findOne({
    model: Cart,
    filter: { user: userId , isDeleted: false }
  });

  if (!cart) {
    return next(new ApiError("Cart not found", 404));
  }

  // Find item to remove
  const itemIndex = cart.cartItems.findIndex(
    item => item._id.toString() === req.params.itemId
  );

  if (itemIndex === -1) {
    return next(new ApiError("Cart item not found", 404));
  }

  // Remove item from cartItems array
  const updatedCartItems = [...cart.cartItems];
  updatedCartItems.splice(itemIndex, 1);

  // Update cart with recalculated total price
  const updatedCart = await updateCartWithTotalPrice(cart._id, updatedCartItems);

  // Populate before response
  const populatedCart = await db.populate({
    model: Cart,
    query: updatedCart,
    path: 'cartItems.product',
    select: 'title imageCover brand'
  });

  res.status(200).json({
    status: "success",
    message: "Item removed from cart successfully",
    numOfCartItems: populatedCart.cartItems.length,
    data: populatedCart,
  });
});

// @desc    Clear user cart
// @route   DELETE /api/v1/cart
// @access  Private/User
exports.clearCart = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  const cart = await db.findOne({
    model: Cart,
    filter: { user: userId , isDeleted: false }
  });

  if (!cart) {
    return next(new ApiError("Cart not found", 404));
  }

  // Clear all cart items and set total to 0
  const updatedCart = await db.softDelete({
    model: Cart,
    filter: { _id: cart._id }
  });

  res.status(200).json({
    status: "success",
    message: "Cart cleared successfully",
    numOfCartItems: 0,
    data: updatedCart,
  });
});

// @desc    Update cart item quantity
// @route   PUT /api/v1/cart/:itemId
// @access  Private/User
exports.updateCartItemQuantity = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;
  const userId = req.user._id;

  const cart = await db.findOne({
    model: Cart,
    filter: { user: userId , isDeleted: false }
  });

  if (!cart) {
    return next(new ApiError("Cart not found", 404));
  }

  const itemIndex = cart.cartItems.findIndex(
    item => item._id.toString() === req.params.itemId
  );

  if (itemIndex === -1) {
    return next(new ApiError(`No item found with id: ${req.params.itemId}`, 404));
  }

  const cartItem = cart.cartItems[itemIndex];
  
  // Validate product availability for new quantity
  await validateProductStock(cartItem.product, quantity, cartItem.color);

  // Update quantity in cart items
  const updatedCartItems = [...cart.cartItems];
  updatedCartItems[itemIndex].quantity = parseInt(quantity);

  // Update cart with recalculated total price
  const updatedCart = await updateCartWithTotalPrice(cart._id, updatedCartItems);

  // Populate before response
  const populatedCart = await db.populate({
    model: Cart,
    query: updatedCart,
    path: 'cartItems.product',
    select: 'title imageCover brand'
  });

  res.status(200).json({
    status: "success",
    message: "Quantity updated successfully",
    numOfCartItems: populatedCart.cartItems.length,
    data: populatedCart,
  });
});

// @desc    Get cart summary (total items and price)
// @route   GET /api/v1/cart/summary
// @access  Private/User
exports.getCartSummary = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  const cart = await db.findOne({
    model: Cart,
    filter: { user: userId , isDeleted: false }
  });

  if (!cart || cart.cartItems.length === 0) {
    return res.status(200).json({
      status: "success",
      data: {
        totalItems: 0,
        totalPrice: 0,
        message: "Cart is empty"
      }
    });
  }

  const summary = {
    totalItems: cart.cartItems.reduce((total, item) => total + item.quantity, 0),
    totalPrice: cart.totalCartPrice,
    numOfCartItems: cart.cartItems.length
  };

  res.status(200).json({
    status: "success",
    data: summary
  });
});