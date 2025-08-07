const asyncHandler = require("express-async-handler");

const ApiError = require("../utils/apiError");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const Coupon = require("../models/couponModel");
const {
  generateGuestId,
  getGuestIdFromRequest,
  setGuestIdCookie,
  getCartIdentifier,
} = require("../utils/guestUtils");

const calcTotalCartPrice = (cart) => {
  let totalPrice = 0;
  cart.cartItems.forEach((item) => {
    totalPrice += item.quantity * item.price;
  });
  cart.totalCartPrice = totalPrice;
  cart.totalPriceAfterDiscount = undefined;
  return totalPrice;
};

// @desc    Add product to cart
// @route   POST /api/v1/cart
// @access  Public (supports both authenticated users and guests)
exports.addProductToCart = asyncHandler(async (req, res, next) => {
  const { productId, color } = req.body;
  const product = await Product.findById(productId);

  if (!product) {
    return next(new ApiError("Product not found", 404));
  }

  // Get cart identifier (user ID for authenticated users, guest ID for guests)
  let cartIdentifier;
  let guestId = null;

  if (req.user) {
    // Authenticated user
    cartIdentifier = { user: req.user._id };
  } else {
    // Guest user
    guestId = getGuestIdFromRequest(req);
    if (!guestId) {
      // Generate new guest ID for new guest
      guestId = generateGuestId();
      setGuestIdCookie(res, guestId);
    }
    cartIdentifier = { guestId };
  }

  // 1) Get Cart for user or guest
  let cart = await Cart.findOne(cartIdentifier);

  if (!cart) {
    // create cart with product
    cart = await Cart.create({
      ...cartIdentifier,
      cartItems: [{ product: productId, color, price: product.price }],
    });
  } else {
    // product exist in cart, update product quantity
    const productIndex = cart.cartItems.findIndex(
      (item) => item.product.toString() === productId && item.color === color
    );

    if (productIndex > -1) {
      const cartItem = cart.cartItems[productIndex];
      cartItem.quantity += 1;

      cart.cartItems[productIndex] = cartItem;
    } else {
      // product not exist in cart, push product to cartItems array
      cart.cartItems.push({ product: productId, color, price: product.price });
    }
  }

  // Calculate total cart price
  calcTotalCartPrice(cart);
  await cart.save();

  res.status(200).json({
    status: "success",
    message: "Product added to cart successfully",
    numOfCartItems: cart.cartItems.length,
    data: cart,
    guestId: guestId, // Return guest ID for frontend storage
  });
});

// @desc    Get user or guest cart
// @route   GET /api/v1/cart
// @access  Public (supports both authenticated users and guests)
exports.getLoggedUserCart = asyncHandler(async (req, res, next) => {
  // Get cart identifier (user ID for authenticated users, guest ID for guests)
  let cartIdentifier;

  if (req.user) {
    // Authenticated user
    cartIdentifier = { user: req.user._id };
  } else {
    // Guest user
    const guestId = getGuestIdFromRequest(req);
    if (!guestId) {
      return res.status(200).json({
        status: "success",
        numOfCartItems: 0,
        data: null,
        message: "No cart found for guest",
      });
    }
    cartIdentifier = { guestId };
  }

  const cart = await Cart.findOne(cartIdentifier);

  if (!cart) {
    return res.status(200).json({
      status: "success",
      numOfCartItems: 0,
      data: null,
      message: "No cart found",
    });
  }

  res.status(200).json({
    status: "success",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @desc    Remove specific cart item
// @route   DELETE /api/v1/cart/:itemId
// @access  Public (supports both authenticated users and guests)
exports.removeSpecificCartItem = asyncHandler(async (req, res, next) => {
  const cartIdentifier = getCartIdentifier(req);

  const cart = await Cart.findOneAndUpdate(
    cartIdentifier,
    {
      $pull: { cartItems: { _id: req.params.itemId } },
    },
    { new: true }
  );

  if (!cart) {
    return next(new ApiError("Cart not found", 404));
  }

  calcTotalCartPrice(cart);
  await cart.save();

  res.status(200).json({
    status: "success",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @desc    Clear user or guest cart
// @route   DELETE /api/v1/cart
// @access  Public (supports both authenticated users and guests)
exports.clearCart = asyncHandler(async (req, res, next) => {
  const cartIdentifier = getCartIdentifier(req);
  await Cart.findOneAndDelete(cartIdentifier);
  res.status(204).send();
});

// @desc    Update specific cart item quantity
// @route   PUT /api/v1/cart/:itemId
// @access  Public (supports both authenticated users and guests)
exports.updateCartItemQuantity = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;
  const cartIdentifier = getCartIdentifier(req);

  const cart = await Cart.findOne(cartIdentifier);
  if (!cart) {
    return next(new ApiError("Cart not found", 404));
  }

  const itemIndex = cart.cartItems.findIndex(
    (item) => item._id.toString() === req.params.itemId
  );
  if (itemIndex > -1) {
    const cartItem = cart.cartItems[itemIndex];
    cartItem.quantity = quantity;
    cart.cartItems[itemIndex] = cartItem;
  } else {
    return next(
      new ApiError(`there is no item for this id :${req.params.itemId}`, 404)
    );
  }

  calcTotalCartPrice(cart);

  await cart.save();

  res.status(200).json({
    status: "success",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @desc    Apply coupon on user or guest cart
// @route   PUT /api/v1/cart/applyCoupon
// @access  Public (supports both authenticated users and guests)
exports.applyCoupon = asyncHandler(async (req, res, next) => {
  // 1) Get coupon based on coupon name
  const coupon = await Coupon.findOne({
    name: req.body.coupon,
    expire: { $gt: Date.now() },
  });

  if (!coupon) {
    return next(new ApiError(`Coupon is invalid or expired`));
  }

  // 2) Get user or guest cart to get total cart price
  const cartIdentifier = getCartIdentifier(req);
  const cart = await Cart.findOne(cartIdentifier);

  if (!cart) {
    return next(new ApiError("Cart not found", 404));
  }

  const totalPrice = cart.totalCartPrice;

  // 3) Calculate price after priceAfterDiscount
  const totalPriceAfterDiscount = (
    totalPrice -
    (totalPrice * coupon.discount) / 100
  ).toFixed(2); // 99.23

  cart.totalPriceAfterDiscount = totalPriceAfterDiscount;
  await cart.save();

  res.status(200).json({
    status: "success",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

exports.addProductToUserCart = async (userId, productId, color, price) => {
  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      cartItems: [{ product: productId, color, price, quantity: 1 }],
    });
  } else {
    const index = cart.cartItems.findIndex(
      (item) =>
        item.product.toString() === productId.toString() && item.color === color
    );

    if (index > -1) {
      cart.cartItems[index].quantity += 1;
    } else {
      cart.cartItems.push({ product: productId, color, price, quantity: 1 });
    }
  }

  // تحديث السعر الإجمالي (لو بتستخدم)
  cart.totalCartPrice = cart.cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  await cart.save();
  return cart;
};
