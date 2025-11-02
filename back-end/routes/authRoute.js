const express = require("express");
const asyncHandler = require("express-async-handler");
const {
  signupValidator,
  loginValidator,
  forgotPasswordValidator,
  verifyResetCodeValidator,
  resetPasswordValidator,
  resendVerificationValidator,
  refreshTokenValidator,
  checkEmailValidator,
} = require("../utils/validators/authValidator");

const {
  signup,
  login,
  forgotPassword,
  verifyPassResetCode,
  resetPassword,
  verifyEmail,
  resendVerification,
  refreshToken,
  checkEmail,
} = require("../services/authService");

const User = require("../models/userModel");

const router = express.Router();

// Authentication routes
router.post("/signup", signupValidator, signup);
router.post("/login", loginValidator, login);
router.post("/refresh-token", refreshTokenValidator, refreshToken);
``
// Password reset routes
router.post("/forgotPassword", forgotPasswordValidator, forgotPassword);
router.post("/verifyResetCode", verifyResetCodeValidator, verifyPassResetCode);
router.put("/resetPassword", resetPasswordValidator, resetPassword);

// Email verification routes
router.get("/verify-email/:token", verifyEmail);
// router.post("/resend-verification", resendVerificationValidator, resendVerification);

// Utility routes
router.get("/check-email/:email", checkEmailValidator, checkEmail);

module.exports = router;