# Email Registration Guide

## Problem: "Email already registered" Error

When you get the error `"E-mail already in user"` or `"Email already registered"`, it means the email address you're trying to use for signup already exists in the database.

## Solutions

### 1. **Login Instead of Signup**

If you already have an account with that email, use the login endpoint:

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "mostafaelalfy77@gmail.com",
  "password": "your_password"
}
```

### 2. **Use Forgot Password**

If you forgot your password, use the forgot password functionality:

```http
POST /api/v1/auth/forgotPassword
Content-Type: application/json

{
  "email": "mostafaelalfy77@gmail.com"
}
```

This will send a 6-digit reset code to your email.

### 3. **Check Email Availability**

You can check if an email is available before trying to sign up:

```http
GET /api/v1/auth/check-email/mostafaelalfy77@gmail.com
```

Response:

```json
{
  "exists": true,
  "message": "Email already registered"
}
```

### 4. **Use a Different Email**

Simply use a different email address that hasn't been registered yet.

## Password Reset Flow

If you need to reset your password:

1. **Request Reset Code:**

   ```http
   POST /api/v1/auth/forgotPassword
   {
     "email": "mostafaelalfy77@gmail.com"
   }
   ```

2. **Verify Reset Code:**

   ```http
   POST /api/v1/auth/verifyResetCode
   {
     "resetCode": "123456"
   }
   ```

3. **Reset Password:**
   ```http
   PUT /api/v1/auth/resetPassword
   {
     "email": "mostafaelalfy77@gmail.com",
     "newPassword": "new_password_123"
   }
   ```

## Common Scenarios

- **New User**: Use a different email or check availability first
- **Existing User**: Use login or forgot password
- **Forgot Password**: Use the forgot password flow
- **Account Recovery**: Use forgot password to reset credentials

## Error Messages

- `"Email already registered. Please login or use forgot password."` - Email exists, use login or reset
- `"Email available"` - Email is free to use for signup
- `"Invalid email address"` - Email format is incorrect
- `"Password required"` - Password field is missing
- `"Password must be at least 6 characters"` - Password too short
