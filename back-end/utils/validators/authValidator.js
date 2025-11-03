const slugify = require("slugify");
const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const User = require("../../models/userModel");

// Regex patterns
const patterns = {
  name: /^[a-zA-Z\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s]{2,50}$/, // Allows English, Arabic, and other Unicode letters with spaces
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, // Standard email format
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character
  resetCode: /^\d{6}$/, // Exactly 6 digits
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, // URL-friendly slug format
  
  // Updated token patterns for your format: "role JWTtoken"
  roleToken: /^[a-zA-Z0-9]+\s+[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/, // "role JWT.token.signature"
  jwtToken: /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/, // Standard JWT format
  rolePrefix: /^(user|admin|manager|vendor|customer)$/, // Supported roles in your token system
};

exports.signupValidator = [
  check("name")
    .notEmpty()
    .withMessage("User name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("User name must be between 2 and 50 characters")
    .matches(patterns.name)
    .withMessage("Name can only contain letters and spaces")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address")
    .matches(patterns.email)
    .withMessage("Email must be in valid format (e.g., user@example.com)")
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(
            new Error(
              "Email already registered. Please login or use forgot password."
            )
          );
        }
      })
    ),

  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(patterns.password)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)"
    )
    .custom((password, { req }) => {
      if (password !== req.body.passwordConfirm) {
        throw new Error("Password confirmation does not match");
      }
      return true;
    }),

  check("passwordConfirm")
    .notEmpty()
    .withMessage("Password confirmation is required"),

  validatorMiddleware,
];

exports.loginValidator = [
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address")
    .matches(patterns.email)
    .withMessage("Email must be in valid format (e.g., user@example.com)"),

  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  validatorMiddleware,
];

exports.forgotPasswordValidator = [
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address")
    .matches(patterns.email)
    .withMessage("Email must be in valid format (e.g., user@example.com)")
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (!user) {
          return Promise.reject(new Error("No user found with this email address"));
        }
      })
    ),

  validatorMiddleware,
];

exports.verifyResetCodeValidator = [
  check("resetCode")
    .notEmpty()
    .withMessage("Reset code is required")
    .isLength({ min: 6, max: 6 })
    .withMessage("Reset code must be exactly 6 digits")
    .isNumeric()
    .withMessage("Reset code must contain only numbers")
    .matches(patterns.resetCode)
    .withMessage("Reset code must be exactly 6 digits (e.g., 123456)"),

  validatorMiddleware,
];

exports.resetPasswordValidator = [
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address")
    .matches(patterns.email)
    .withMessage("Email must be in valid format (e.g., user@example.com)")
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (!user) {
          return Promise.reject(new Error("No user found with this email address"));
        }
        if (!user.passwordResetVerified) {
          return Promise.reject(new Error("Reset code not verified. Please verify reset code first"));
        }
      })
    ),

  check("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(patterns.password)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)"
    )
    .custom((newPassword, { req }) => {
      if (newPassword !== req.body.passwordConfirm) {
        throw new Error("Password confirmation does not match");
      }
      return true;
    }),

  check("passwordConfirm")
    .notEmpty()
    .withMessage("Password confirmation is required"),

  validatorMiddleware,
];

exports.resendVerificationValidator = [
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address")
    .matches(patterns.email)
    .withMessage("Email must be in valid format (e.g., user@example.com)")
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (!user) {
          return Promise.reject(new Error("No user found with this email address"));
        }
        if (user.isVerified) {
          return Promise.reject(new Error("Email is already verified"));
        }
      })
    ),

  validatorMiddleware,
];

exports.refreshTokenValidator = [
  check("refreshToken")
    .notEmpty()
    .withMessage("Refresh token is required")
    .custom((token) => {
      // Check if it matches the format: "role JWTtoken"
      if (!patterns.roleToken.test(token)) {
        throw new Error('Invalid token format. Expected "role jwt.token.here" (two words separated by space)');
      }
      
      // Extract role and validate it
      const role = token.split(' ')[0];
      if (!patterns.rolePrefix.test(role)) {
        throw new Error(`Invalid role: ${role}. Supported roles: user, admin, manager, vendor, customer`);
      }
      
      return true;
    }),

  validatorMiddleware,
];

exports.verifyEmailValidator = [
  check("token")
    .notEmpty()
    .withMessage("Verification token is required")
    .matches(patterns.jwtToken)
    .withMessage("Invalid verification token format"),

  validatorMiddleware,
];

exports.checkEmailValidator = [
  check("email")
    .notEmpty()
    .withMessage("Email parameter is required")
    .isEmail()
    .withMessage("Invalid email address")
    .matches(patterns.email)
    .withMessage("Email must be in valid format (e.g., user@example.com)"),

  validatorMiddleware,
];

// Validator for Authorization header (used in protect middleware)
exports.authorizationHeaderValidator = [
  check("authorization")
    .notEmpty()
    .withMessage("Authorization header is required")
    .custom((header) => {
      // Check if it matches: "Bearer role JWTtoken" or "role JWTtoken"
      if (header.startsWith('Bearer ')) {
        const tokenWithoutBearer = header.substring(7); // Remove "Bearer " prefix
        if (!patterns.roleToken.test(tokenWithoutBearer)) {
          throw new Error('Invalid token format. Expected "Bearer role jwt.token.here"');
        }
        
        // Validate role
        const role = tokenWithoutBearer.split(' ')[0];
        if (!patterns.rolePrefix.test(role)) {
          throw new Error(`Invalid role: ${role}. Supported roles: user, admin, manager, vendor, customer`);
        }
      } else {
        // No Bearer prefix, just "role JWTtoken"
        if (!patterns.roleToken.test(header)) {
          throw new Error('Invalid token format. Expected "role jwt.token.here" or "Bearer role jwt.token.here"');
        }
        
        // Validate role
        const role = header.split(' ')[0];
        if (!patterns.rolePrefix.test(role)) {
          throw new Error(`Invalid role: ${role}. Supported roles: user, admin, manager, vendor, customer`);
        }
      }
      return true;
    }),

  validatorMiddleware,
];

// Export patterns for use in other files if needed
exports.patterns = patterns;