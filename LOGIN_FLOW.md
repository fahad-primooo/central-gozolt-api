# OTP-Based Login Implementation

## Overview

The login system uses OTP (One-Time Password) verification via WhatsApp or SMS. No traditional password is required for login.

## Login Flow

### Step 1: Initiate Login

**Endpoint:** `POST /api/auth/login/initiate`

User provides their registered phone number and receives OTP.

```bash
curl -X POST http://localhost:3000/api/auth/login/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "country_code": "+92",
    "phone_number": "3001234567",
    "channel": "whatsapp"
  }'
```

**Request Body:**

```json
{
  "country_code": "+92",
  "phone_number": "3001234567",
  "channel": "whatsapp" // optional, default: "whatsapp", can be "sms"
}
```

**Success Response (200):**

```json
{
  "status": true,
  "message": "OTP sent via whatsapp",
  "data": {
    "channel": "whatsapp",
    "expires_in_minutes": 10
  }
}
```

**Error Responses:**

**404 - User Not Found:**

```json
{
  "status": false,
  "message": "No account found with this phone number. Please register first."
}
```

### Step 2: Login with OTP

**Endpoint:** `POST /api/auth/login`

User provides OTP to complete login and receive JWT token.

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "country_code": "+92",
    "phone_number": "3001234567",
    "otp": "123456"
  }'
```

**Request Body:**

```json
{
  "country_code": "+92",
  "phone_number": "3001234567",
  "otp": "123456"
}
```

**Success Response (200):**

```json
{
  "status": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "display_name": "John Doe",
      "username": "johndoe123",
      "email": "john.doe@example.com",
      "country_code": "+92",
      "phone_number": "3001234567",
      "email_verified": false,
      "phone_verified": true,
      "phone_verified_at": "2026-01-09T10:30:00.000Z",
      "avatar": "https://example.com/avatar.jpg",
      "bio": "Software developer",
      "status": "ACTIVE",
      "last_login_at": "2026-01-09T12:45:00.000Z",
      "created_at": "2026-01-09T10:30:00.000Z",
      "updated_at": "2026-01-09T12:45:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**

**404 - User Not Found:**

```json
{
  "status": false,
  "message": "No account found with this phone number"
}
```

**400 - No Pending Verification:**

```json
{
  "status": false,
  "message": "No pending login verification found. Please request a new OTP."
}
```

**400 - OTP Expired:**

```json
{
  "status": false,
  "message": "OTP has expired. Please request a new one.",
  "data": {
    "expired": true
  }
}
```

**400 - Invalid OTP:**

```json
{
  "status": false,
  "message": "Invalid or expired OTP"
}
```

## JWT Token

### Token Structure

The JWT token contains the following payload:

```typescript
{
  user_id: number;
  username: string;
  email: string;
  phone_number: string;
  country_code: string;
  iat: number; // Issued at
  exp: number; // Expiration
  iss: string; // Issuer: "central-gozolt-api"
  aud: string; // Audience: "gozolt-app"
}
```

### Token Expiration

- **Access Token:** 7 days
- **Refresh Token:** 30 days (for future implementation)

### Using the Token

Include the token in the `Authorization` header for protected routes:

```bash
curl -X GET http://localhost:3000/api/users/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Rate Limiting

**Login Initiation:** 5 requests per 10 minutes per phone number

This prevents abuse of the OTP sending system.

## Security Features

✅ **OTP Verification** - Twilio Verify service ensures OTP validity  
✅ **JWT Tokens** - Secure authentication with signed tokens  
✅ **Rate Limiting** - Prevents brute force attacks  
✅ **Automatic Cleanup** - Verification records deleted after successful login  
✅ **Expiration Tracking** - OTPs expire after 10 minutes  
✅ **Last Login Tracking** - Updates `last_login_at` on each successful login

## Database Changes

### After Initiate Login

**phone_verifications table:**
| id | country_code | phone_number | verified | channel | expires_at |
|----|--------------|--------------|----------|---------|------------|
| 1 | +92 | 3001234567 | false | whatsapp| 2026-01-09 12:55:00 |

### After Successful Login

**users table (updated):**
| id | last_login_at |
|----|---------------|
| 1 | 2026-01-09 12:45:00 |

**phone_verifications table:**
| (empty - record deleted after login) |

## Environment Variables

Make sure to set the JWT secret in `.env`:

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

**⚠️ IMPORTANT:** Use a strong, random secret in production!

Generate a secure secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Complete User Journey

### New User Flow

1. `POST /api/phone-verification/initiate` - Verify phone
2. `POST /api/phone-verification/verify` - Confirm OTP
3. `POST /api/auth/register` - Create account
4. `POST /api/auth/login/initiate` - Request login OTP
5. `POST /api/auth/login` - Login with OTP, receive token

### Returning User Flow

1. `POST /api/auth/login/initiate` - Request login OTP
2. `POST /api/auth/login` - Login with OTP, receive token

## Testing with Postman

The Postman collection includes:

- **Initiate Login (WhatsApp OTP)** - Request OTP via WhatsApp
- **Initiate Login (SMS OTP)** - Request OTP via SMS
- **Login with OTP** - Complete login and auto-save token

The token is automatically saved to the `accessToken` environment variable for use in protected routes.

## Future Enhancements

- [ ] Refresh token implementation
- [ ] Logout endpoint (token blacklisting)
- [ ] Device tracking
- [ ] Session management
- [ ] Two-factor authentication options
- [ ] Biometric authentication support
