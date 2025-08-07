const { v4: uuidv4 } = require("uuid");

// Generate a unique guest ID
exports.generateGuestId = () => uuidv4();

// Extract guest ID from request (from cookie or header)
exports.getGuestIdFromRequest = (req) => {
  // Check for guest ID in cookie first
  if (req.cookies && req.cookies.guestId) {
    return req.cookies.guestId;
  }

  // Check for guest ID in header
  if (req.headers["x-guest-id"]) {
    return req.headers["x-guest-id"];
  }

  return null;
};

// Set guest ID in response cookie
exports.setGuestIdCookie = (res, guestId) => {
  res.cookie("guestId", guestId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

// Get cart identifier (user ID for authenticated users, guest ID for guests)
exports.getCartIdentifier = (req) => {
  if (req.user) {
    return { user: req.user._id };
  }

  const guestId = this.getGuestIdFromRequest(req);
  if (!guestId) {
    throw new Error("Guest ID not found");
  }

  return { guestId };
};

// Get order identifier (user ID for authenticated users, guest ID for guests)
exports.getOrderIdentifier = (req) => {
  if (req.user) {
    return { user: req.user._id };
  }

  const guestId = this.getGuestIdFromRequest(req);
  if (!guestId) {
    throw new Error("Guest ID not found");
  }

  return { guestId };
};
