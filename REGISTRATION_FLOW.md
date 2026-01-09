# Complete User Registration Flow

## Overview

This document outlines the complete registration flow with phone verification for the Central Gozolt API.

## Step-by-Step Flow

### Step 1: Initiate Phone Verification

**Endpoint:** `POST /api/phone-verification/initiate`

```bash
curl -X POST http://localhost:3000/api/phone-verification/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "contact_number": "3001234567",
    "country_code": "+92",
    "verification_method": "whatsapp"
  }'
```

**Response:**

```json
{
  "status": true,
  "message": "OTP is being sent via whatsapp",
  "data": {
    "normalized_phone": "+923001234567",
    "channel": "whatsapp",
    "expires_in_minutes": 10
  }
}
```

### Step 2: Verify OTP

**Endpoint:** `POST /api/phone-verification/verify`

```bash
curl -X POST http://localhost:3000/api/phone-verification/verify \
  -H "Content-Type: application/json" \
  -d '{
    "contact_number": "3001234567",
    "country_code": "+92",
    "otp": "123456"
  }'
```

**Response:**

```json
{
  "status": true,
  "message": "Phone number verified successfully",
  "data": {
    "contact_number": "3001234567",
    "country_code": "+92",
    "verified_at": "2026-01-09T10:30:00.000Z"
  }
}
```

### Step 3: Register User

**Endpoint:** `POST /api/auth/register`

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "username": "johndoe123",
    "email": "john.doe@example.com",
    "country_code": "+92",
    "phone_number": "3001234567",
    "password": "SecurePass123",
    "avatar": "https://example.com/avatar.jpg",
    "bio": "Software developer"
  }'
```

**Response:**

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

## Database State Changes

### After Step 1 (Initiate)

**phone_verifications table:**
| id | country_code | phone_number | verified | channel | expires_at |
|----|--------------|--------------|----------|---------|------------|
| 1 | +92 | 3001234567 | false | whatsapp| 2026-01-09 10:40:00 |

### After Step 2 (Verify)

**phone_verifications table:**
| id | country_code | phone_number | verified | verified_at |
|----|--------------|--------------|----------|-------------|
| 1 | +92 | 3001234567 | true | 2026-01-09 10:30:00 |

### After Step 3 (Register)

**users table:**
| id | username | email | country_code | phone_number | phone_verified | phone_verified_at |
|----|----------|-------|--------------|--------------|----------------|-------------------|
| 1 | johndoe123 | john.doe@example.com | +92 | 3001234567 | true | 2026-01-09 10:30:00 |

**phone_verifications table:**
| (empty - record deleted after registration) |

## Error Scenarios

### 1. Phone Not Verified

If user tries to register without phone verification:

```json
{
  "status": false,
  "message": "Phone number not verified. Please complete OTP verification first.",
  "data": {
    "phone_verified": false
  }
}
```

### 2. Duplicate User

If user already exists:

```json
{
  "status": false,
  "message": "An account with this email already exists"
}
```

### 3. Expired Phone Verification

If verification expired:

```json
{
  "status": false,
  "message": "Phone verification has expired. Please verify your phone again.",
  "data": {
    "phone_verified": false,
    "expired": true
  }
}
```

## Rate Limiting

- **Phone Verification Initiate:** 5 requests per 10 minutes per phone number
- **Resend OTP:** 3 requests per 10 minutes per phone number
- **No rate limit on registration** (protected by phone verification requirement)

## Security Considerations

1. ✅ **Phone Verification Required** - Users must verify phone before registration
2. ✅ **Password Hashing** - Bcrypt with 10 rounds
3. ✅ **Unique Constraints** - Email, username, and phone number are unique
4. ✅ **Transaction Safety** - User creation and verification cleanup are atomic
5. ✅ **OTP Expiration** - Verifications expire after 10 minutes
6. ✅ **Rate Limiting** - Prevents abuse of OTP sending

## API Consistency

All APIs now use **snake_case** for request/response fields:

- ✅ `first_name` instead of `firstName`
- ✅ `country_code` instead of `countryCode`
- ✅ `phone_number` instead of `phoneNumber`
- ✅ `verification_method` instead of `verificationMethod`

## Next Steps

1. **Implement Queue System** - See [QUEUE_IMPLEMENTATION.md](../QUEUE_IMPLEMENTATION.md)
2. **Add Login Endpoint** - JWT-based authentication
3. **Add Refresh Token** - For session management
4. **Email Verification** - Similar to phone verification
5. **Password Reset** - Via email or SMS

## Testing with Postman

Import the collection: `postman/central-gozolt-api.postman_collection.json`

The collection includes:

- All phone verification endpoints
- Register endpoint
- Example requests with proper snake_case formatting
