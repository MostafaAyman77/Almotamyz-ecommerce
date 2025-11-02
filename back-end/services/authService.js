const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const sendEmail = require("../utils/sendEmail");
const {createToken , genrateToken ,verify, generateAuthTokens, getTokenSignature, extractRoleAndToken} = require("../utils/createToken");
const User = require("../models/userModel");
const { create, findOne, update } = require("./DB/db.services");

// @desc    Signup
// @route   POST /api/v1/auth/signup
// @access  Public
exports.signup = asyncHandler(async (req, res, next) => {
  // 1- Create user
  const user = await create({
    model: User,
    data: {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    }
  });

  // 2- Generate email verification token
  const emailVerifyToken = genrateToken({
    data: { _id: user._id, email: user.email },
    key: process.env.EMAIL_TOKEN_SIGNATURE,
    options: { expiresIn: process.env.EMAIL_TOKEN_EXPIRE_IN }
  });

  // 3- Create verification URL
  const verificationUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/verify-email/${emailVerifyToken}`;

  // 4- Send verification email with HTML
  const htmlMessage = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .button { display: inline-block; padding: 12px 24px; background: #4CAF50; 
                     color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Welcome to E-shop!</h1>
            </div>
            <div class="content">
                <h2>Hi ${user.name},</h2>
                <p>Welcome to E-shop! Please verify your email address to get started.</p>
                <p>Click the button below to verify your email address:</p>
                <div style="text-align: center;">
                    <a href="${verificationUrl}" class="button">Verify Email Address</a>
                </div>
                <p>Or copy and paste this link in your browser:</p>
                <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 4px;">
                    ${verificationUrl}
                </p>
                <p>This link will expire in 24 hours.</p>
                <p>If you didn't create an account, please ignore this email.</p>
            </div>
            <div class="footer">
                <p>Thanks,<br>The E-shop Team</p>
            </div>
        </div>
    </body>
    </html>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: "Verify your E-shop account",
      html: htmlMessage,
      message: `Hi ${user.name}, Please verify your email by clicking: ${verificationUrl}` // Fallback text
    });
  } catch (err) {
    console.error("🚨 Email sending error:", err);
    // Don't block user registration if email fails
  }

  // 5- Delete sensitive information from response
  const userResponse = { ...user._doc };
  delete userResponse.password;

  res.status(201).json({
    data: userResponse,
    message: "Registration successful! Please check your email to verify your account."
  });
});

// @desc    Verify email
// @route   GET /api/v1/auth/verify-email/:token
// @access  Public
exports.verifyEmail = asyncHandler(async (req, res, next) => {
  // 1) Verify the token
  const receivedToken = req.params.token;
  let userData;
  
  try {
    userData = verify({
      token: receivedToken,
      key: process.env.EMAIL_TOKEN_SIGNATURE
    });
  } catch (err) {
    return next(new ApiError("Email verification token is invalid or expired", 400));
  }

  // 2) Find user by ID and email from token
  const user = await findOne({
    model: User,
    filter: { _id: userData._id, email: userData.email }
  });

  if (!user) {
    return next(new ApiError("Email verification token is invalid", 400));
  }

  if (user.isVerified) {
    return res.status(200).json({
      status: "Success",
      message: "Email is already verified!",
    });
  }

  // 3) Update user as verified
  await update({
    model: User,
    filter: { _id: user._id },
    data: { isVerified: true }
  });

  // 4) Send success response with optional redirect
  const successHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .success { color: #4CAF50; font-size: 24px; margin-bottom: 20px; }
            .button { display: inline-block; padding: 12px 24px; background: #4CAF50; 
                     color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="success">✅ Email Verified Successfully!</div>
        <p>Your email has been verified. You can now login to your account.</p>
        <a href="${process.env.FRONTEND_URL || '/'}" class="button">Go to Login</a>
    </body>
    </html>
  `;

  // Send HTML response for browser, JSON for API calls
  if (req.headers.accept && req.headers.accept.includes('text/html')) {
    res.set('Content-Type', 'text/html');
    return res.send(successHtml);
  }

  res.status(200).json({
    status: "Success",
    message: "Email verified successfully!",
  });
});

// @desc    Resend verification email
// @route   POST /api/v1/auth/resend-verification
// @access  Public
exports.resendVerification = asyncHandler(async (req, res, next) => {
  // 1) Find user by email
  const user = await findOne({
    model: User,
    filter: { email: req.body.email }
  });

  if (!user) {
    return next(new ApiError("No user found with this email address", 404));
  }

  if (user.isVerified) {
    return next(new ApiError("Email is already verified", 400));
  }

  // 2) Generate new email verification token
  const emailVerifyToken = genrateToken({
    data: { _id: user._id, email: user.email },
    key: process.env.EMAIL_TOKEN_SIGNATURE,
    options: { expiresIn: process.env.EMAIL_TOKEN_EXPIRE_IN }
  });

  // 3) Create verification URL
  const verificationUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/verify-email/${emailVerifyToken}`;

  // 4) Send verification email with HTML
  const htmlMessage = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #FF9800; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .button { display: inline-block; padding: 12px 24px; background: #FF9800; 
                     color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Verify Your E-shop Account</h1>
            </div>
            <div class="content">
                <h2>Hi ${user.name},</h2>
                <p>You requested a new verification email. Click the button below to verify your email address:</p>
                <div style="text-align: center;">
                    <a href="${verificationUrl}" class="button">Verify Email Address</a>
                </div>
                <p>Or copy and paste this link in your browser:</p>
                <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 4px;">
                    ${verificationUrl}
                </p>
                <p>If you didn't request this, please ignore this email.</p>
            </div>
        </div>
    </body>
    </html>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: "Verify your E-shop account",
      html: htmlMessage,
      message: `Hi ${user.name}, Please verify your email by clicking: ${verificationUrl}`
    });
  } catch (err) {
    console.error("🚨 Email sending error:", err);
    return next(new ApiError("There was an error sending the verification email", 500));
  }

  res.status(200).json({
    status: "Success",
    message: "Verification email sent successfully!",
  });
});
// @desc    Login
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  // 1) Check if user exists & password is correct
  const user = await findOne({
    model: User,
    filter: { email: req.body.email }
  });

  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError("Incorrect email or password", 401));
  }

  // 2) Check if email is verified
  if (!user.isVerified) {
    return next(new ApiError("Please verify your email address before logging in", 401));
  }

  // 3) Generate tokens based on user role
  const { accessToken, refreshToken } = generateAuthTokens(user);

  // 4) Prepare user response
  const userResponse = { ...user._doc };
  delete userResponse.password;

  // 5) Send response with Bearer tokens
  res.status(200).json({
    data: userResponse,
    tokens: {
      accessToken,
      refreshToken,
    }
  });
});
// @desc    Refresh token
// @route   POST /api/v1/auth/refresh-token
// @access  Public
exports.refreshToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new ApiError("Refresh token is required", 400));
  }

  try {
    // Extract role and token from the refresh token
    const tokenParts = extractRoleAndToken(refreshToken);
    if (!tokenParts) {
      return next(new ApiError("Invalid refresh token format", 400));
    }

    const { role, token } = tokenParts;

    // Verify refresh token with role-specific signature
    const decoded = verify({
      token: token,
      key: getTokenSignature(role, 'refresh')
    });

    // Find user
    const user = await findOne({
      model: User,
      filter: { _id: decoded.userId }
    });

    if (!user) {
      return next(new ApiError("User not found", 404));
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateAuthTokens(user);

    res.status(200).json({
      accessToken,
      refreshToken: newRefreshToken,
    });

  } catch (err) {
    return next(new ApiError("Invalid or expired refresh token", 401));
  }
});

// @desc    Make sure the user is logged in
// @access  Protected
exports.protect = asyncHandler(async (req, res, next) => {
  // 1) Check if token exists
  let bearerToken;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    bearerToken = req.headers.authorization;
  }

  if (!bearerToken) {
    return next(new ApiError("You are not logged in. Please login to access this route", 401));
  }

  // 2) Extract role and token from Bearer token
  const tokenParts = extractRoleAndToken(bearerToken);
  if (!tokenParts) {
    return next(new ApiError("Invalid token format", 401));
  }

  const { role, token } = tokenParts;

  // 3) Verify token with role-specific signature
  let decoded;
  try {
    decoded = verify({
      token: token,
      key: getTokenSignature(role, 'access')
    });
  } catch (err) {
    return next(new ApiError("Invalid or expired token", 401));
  }

  // 4) Check if user exists
  const currentUser = await findOne({
    model: User,
    filter: { _id: decoded.userId }
  });

  if (!currentUser) {
    return next(new ApiError("The user that belongs to this token no longer exists", 401));
  }

  // 5) Check if user changed password after token was created
  if (currentUser.passwordChangedAt) {
    const passChangedTimestamp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10
    );
    if (passChangedTimestamp > decoded.iat) {
      return next(new ApiError("User recently changed password. Please login again", 401));
    }
  }

  // 6) Attach user to request
  req.user = currentUser;
  next();
});

// @desc    Authorization (User Permissions)
// @access  Protected
exports.allowedTo = (...roles) => asyncHandler(async (req, res, next) => {
  // 1) Check if user role is included in allowed roles
  if (!roles.includes(req.user.role)) {
    return next(new ApiError("You are not allowed to access this route", 403));
  }
  next();
});


// @desc    Forgot password
// @route   POST /api/v1/auth/forgotPassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  // 1) Get user by email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`There is no user with that email ${req.body.email}`, 404)
    );
  }
  // 2) If user exist, Generate hash reset random 6 digits and save it in db
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  // Save hashed password reset code into db
  user.passwordResetCode = hashedResetCode;
  // Add expiration time for password reset code (10 min)
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerified = false;

  await user.save();

  // 3) Send the reset code via email
  const message = `Hi ${user.name},\n We received a request to reset the password on your E-shop Account. \n ${resetCode} \n Enter this code to complete the reset. \n Thanks for helping us keep your account secure.\n The E-shop Team`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset code (valid for 10 min)",
      message,
    });
  } catch (err) {
    console.error("🚨 Email sending error:", err);

    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;

    await user.save();

    // Provide more specific error message based on the error type
    if (err.message.includes("Email credentials not configured")) {
      return next(
        new ApiError(
          "Email service not configured. Please contact support.",
          500
        )
      );
    }
    if (err.code === "EAUTH") {
      return next(
        new ApiError(
          "Email authentication failed. Please check email configuration.",
          500
        )
      );
    }
    return next(new ApiError("There is an error in sending email", 500));
  }

  res
    .status(200)
    .json({ status: "Success", message: "Reset code sent to email" });
});

// @desc    Verify password reset code
// @route   POST /api/v1/auth/verifyResetCode
// @access  Public
exports.verifyPassResetCode = asyncHandler(async (req, res, next) => {
  // 1) Get user based on reset code
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  const user = await User.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ApiError("Reset code invalid or expired"));
  }

  // 2) Reset code valid
  user.passwordResetVerified = true;
  await user.save();

  res.status(200).json({
    status: "Success",
  });
});

// @desc    Reset password
// @route   POST /api/v1/auth/resetPassword
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // 1) Get user based on email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`There is no user with email ${req.body.email}`, 404)
    );
  }

  // 2) Check if reset code verified
  if (!user.passwordResetVerified) {
    return next(new ApiError("Reset code not verified", 400));
  }

  user.password = req.body.newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;

  await user.save();

  // 3) if everything is ok, generate token
  const token = createToken(user._id);
  res.status(200).json({ token });
});
