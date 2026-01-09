# Authentication Module

## Overview

This module handles user authentication with OTP-based login system. No traditional passwords are required for login - users authenticate using OTP sent to their verified phone number.

## Features

✅ **OTP-Based Registration** - Phone verification required before account creation  
✅ **OTP-Based Login** - Passwordless login via WhatsApp or SMS  
✅ **JWT Authentication** - Secure token-based authentication  
✅ **Rate Limiting** - Protection against abuse  
✅ **Multiple Channels** - WhatsApp and SMS support

## Flows

### Registration Flow

1. **Phone Verification** (via `/api/phone-verification/initiate`)
   - User provides phone number
   - OTP sent via WhatsApp or SMS
   - User verifies OTP
   - Phone verification record created with `verified: true`

2. **Registration** (via `/api/auth/register`)
   - User provides registration details
   - System checks if phone is verified
   - User account created
   - Phone verification record deleted

### Login Flow

1. **Initiate Login** (via `/api/auth/login/initiate`)
   - User provides registered phone number
   - System verifies user exists
   - OTP sent via WhatsApp or SMS
   - Login verification record created

2. **Login** (via `/api/auth/login`)
   - User provides phone number + OTP
   - System verifies OTP via Twilio
   - JWT token generated
   - User data returned with token
   - Verification record deleted

## API Endpoints

### 1. Register User

**POST** `/api/auth/register`

**Request Body:**

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "username": "johndoe123",
  "email": "john.doe@example.com",
  "country_code": "+92",
  "phone_number": "3001234567",
  "password": "SecurePass123",
  "avatar": "https://example.com/avatar.jpg", // optional
  "bio": "Software developer" // optional
}
```

**Success Response (201):**

```json
{
  "status": true,
  "message": "Registration successful",
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
      "created_at": "2026-01-09T10:30:00.000Z",
      "updated_at": "2026-01-09T10:30:00.000Z"
    }
  }
}
```

**Error Responses:**

**400 - Phone Not Verified:**

```json
{
  "status": false,
  "message": "Phone number not verified. Please complete OTP verification first.",
  "data": {
    "phone_verified": false
  }
}
```

**409 - User Already Exists:**

```json
{
  "status": false,
  "message": "An account with this email already exists"
}
```

### 2. Initiate Login

**POST** `/api/auth/login/initiate`

**Request Body:**

```json
{
  "country_code": "+92",
  "phone_number": "3001234567",
  "channel": "whatsapp" // optional, default: "whatsapp"
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

**Error Response (404):**

```json
{
  "status": false,
  "message": "No account found with this phone number. Please register first."
}
```

### 3. Login with OTP

**POST** `/api/auth/login`

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

- **404:** User not found
- **400:** No pending verification / OTP expired / Invalid OTP

## JWT Token

**Payload:**

```typescript
{
  user_id: number;
  username: string;
  email: string;
  phone_number: string;
  country_code: string;
}
```

**Expiration:** 7 days

**Usage:**

```bash
Authorization: Bearer <token>
```

## Validation Rules

### Register

### Required Fields

- `first_name`: 1-100 characters
- `last_name`: 1-100 characters
- `username`: 3-50 characters (letters, numbers, underscores only)
- `email`: Valid email format
- `country_code`: Format: +1 to +9999
- `phone_number`: 5-15 digits
- `password`: Minimum 8 characters with at least:
  - 1 uppercase letter
  - 1 lowercase letter
  - 1 number

### Optional Fields

- `avatar`: Valid URL
- `bio`: Max 500 characters

### Initiate Login

- `country_code`: Format: +1 to +9999
- **OTP Verification** via Twilio Verify
- **JWT Token Authentication** with 7-day expiration
- **Rate Limiting** on sensitive endpoints
- **Phone Number Verification** required for registration
- **Automatic Cleanup** of verification records
- **Password Hashing** (for future password-based auth)
- **Transaction Safety** for atomic operations

## Environment Variables

Required in `.env`:

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_VERIFY_SERVICE_SID=your-verify-service-sid
```

- `phone_number`: 5-15 digits
- `otp`: Exactly 6 digits

## Rate Limiting

- **Registration:** No rate limit (protected by phone verification)
- **Login Initiation:** 5 requests per 10 minutes per phone number

## Security Features

- Password hashing with bcrypt (10 rounds)
- Phone verification required before registration
- Duplicate checks for email, username, and phone
- Transaction-based user creation (atomic operation)
- Phone verification cleanup after successful registration

## Database Schema

### User Model

```prisma
model User {
  id               Int       @id @default(autoincrement())
  firstName        String    @map("first_name")
  lastName         String    @map("last_name")
  displayName      String    @map("display_name")
  username         String    @unique
  email            String    @unique
  countryCode      String    @map("country_code")
  phoneNumber      String    @map("phone_number")
  password         String?
  emailVerified    Boolean   @default(false)
  phoneVerified    Boolean   @default(true)
  phonRefresh token mechanism
- [ ] Logout endpoint with token blacklisting
- [ ] Password reset via OTP
- [ ] Email verification
- [ ] OAuth providers (Google, Facebook)
- [ ] Device tracking
- [ ] Session management
- [ ] Two-factor authentication

## Testing

Use the Postman collection at `postman/central-gozolt-api.postman_collection.json`

**Complete Test Flow:**
1. Initiate phone verification
2. Verify OTP
3. Register user
4. Initiate login (sends OTP)
5. Login with OTP (receive token)
6. Use token for authenticated requests

**Note:** The login endpoint automatically saves the JWT token to the `accessToken` environment variable in Postman.

## Documentation

- [REGISTRATION_FLOW.md](../../../REGISTRATION_FLOW.md) - Detailed registration flow
- [LOGIN_FLOW.md](../../../LOGIN_FLOW.md) - Detailed login flow
- [QUEUE_IMPLEMENTATION.md](../../../QUEUE_IMPLEMENTATION.md) - Background job processing

- [ ] Password reset
- [ ] Email verification
- [ ] OAuth providers (Google, Facebook)

## Testing

Use the Postman collection at `postman/central-gozolt-api.postman_collection.json`

**Test Flow:**
1. Initiate phone verification
2. Verify OTP
3. Register user
4. Verify phone verification record is deleted
```
