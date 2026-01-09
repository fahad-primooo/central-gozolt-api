# API Migration to Laravel-Compatible Structure

## Changes Made

### ✅ Route Structure (Matches Laravel)

**Old Routes → New Routes:**

```
/api/phone-verification/initiate  →  /api/verification/initiate
/api/phone-verification/resend    →  /api/verification/resend
/api/phone-verification/verify    →  /api/verification/verify
/api/auth/register                →  /api/register
/api/auth/login/initiate          →  /api/phone-login/request-otp
/api/auth/login                   →  /api/phone-login/verify-otp
```

### ✅ Token System Change

**Before:** JWT Tokens

- JSON Web Tokens with signed payloads
- Required JWT_SECRET environment variable
- Tokens contained user data in payload

**After:** Plain Text Tokens (Laravel Sanctum-style)

- Random 40-character tokens
- Stored hashed (SHA-256) in database
- Token metadata tracked (last_used_at, expires_at)
- Similar to Laravel Personal Access Tokens

### ✅ New Database Table

**`tokens` table:**

```sql
CREATE TABLE tokens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  name VARCHAR(255) DEFAULT 'auth_token',
  token VARCHAR(64) UNIQUE NOT NULL,  -- Hashed token
  last_used_at DATETIME NULL,
  expires_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### ✅ Authentication Middleware

**New File:** `src/middlewares/auth.middleware.ts`

Usage in routes:

```typescript
import { authenticate } from '../middlewares/auth.middleware';

// Protected route example
router.get('/profile', authenticate, userController.getProfile);
```

Middleware attaches user to `req.user` for access in controllers.

## Database Migration

Run the migration to create the tokens table:

```bash
npm run prisma:migrate
# Enter migration name: add_tokens_table
```

## API Usage Examples

### 1. Register User

```bash
POST /api/register
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "country_code": "+92",
  "phone_number": "3001234567",
  "avatar": "https://example.com/avatar.jpg",
  "bio": "Developer"
}
```

**Response:**

```json
{
  "status": true,
  "message": "Registration successful",
  "data": {
    "user": { ... },
    "token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0"
  }
}
```

### 2. Login with OTP

**Step 1: Request OTP**

```bash
POST /api/phone-login/request-otp
Content-Type: application/json

{
  "country_code": "+92",
  "phone_number": "3001234567",
  "channel": "whatsapp"
}
```

**Step 2: Verify OTP & Get Token**

```bash
POST /api/phone-login/verify-otp
Content-Type: application/json

{
  "country_code": "+92",
  "phone_number": "3001234567",
  "otp": "123456"
}
```

**Response:**

```json
{
  "status": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0"
  }
}
```

### 3. Using the Token

**Authorization Header:**

```
Authorization: Bearer a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
```

**Example Protected Request:**

```bash
GET /api/users/profile
Authorization: Bearer a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
```

## Token Management

### Token Expiration

- Default: 7 days
- Set in `createToken()` function
- Expired tokens are automatically deleted when accessed

### Token Storage

- **Client:** Store plain text token securely (e.g., secure storage in Flutter)
- **Server:** Only hashed version stored in database
- **Transmission:** Always use HTTPS in production

### Revoke Token

```typescript
import { revokeToken } from '../utils/token';

// Revoke single token
await revokeToken(plainTextToken);

// Revoke all user tokens (logout from all devices)
await revokeAllUserTokens(userId);
```

## Flutter Integration

### 1. Save Token After Login

```dart
final response = await http.post(
  Uri.parse('$baseUrl/api/phone-login/verify-otp'),
  body: json.encode({
    'country_code': '+92',
    'phone_number': '3001234567',
    'otp': '123456',
  }),
);

final data = json.decode(response.body);
final token = data['data']['token'];

// Save token securely
await storage.write(key: 'auth_token', value: token);
```

### 2. Use Token in Requests

```dart
final token = await storage.read(key: 'auth_token');

final response = await http.get(
  Uri.parse('$baseUrl/api/users/profile'),
  headers: {
    'Authorization': 'Bearer $token',
    'Content-Type': 'application/json',
  },
);
```

## Environment Variables

No longer needed:

- ~~JWT_SECRET~~ (removed)

Still required:

- DATABASE_URL
- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN
- TWILIO_VERIFY_SERVICE_SID

## Breaking Changes

⚠️ **For Existing Flutter Apps:**

1. Update all API endpoint URLs to new structure
2. Change token storage/retrieval logic
3. Token format changed from JWT to plain text
4. Update Authorization header format (still `Bearer <token>`)

## Postman Collection

Updated collection includes:

- ✅ All routes with new paths
- ✅ Automatic token saving to environment variable
- ✅ Examples for all endpoints

Import from: `postman/central-gozolt-api.postman_collection.json`

## Benefits of Plain Text Tokens

1. **Simpler Implementation** - No JWT library dependencies
2. **Database Control** - Full control over token lifecycle
3. **Revocation** - Can instantly invalidate tokens
4. **Tracking** - Track last used timestamp
5. **Laravel Compatible** - Matches Sanctum token structure
6. **Stateless** - Still stateless like JWT, but with DB lookup

## Security Considerations

✅ **Token Hashing** - SHA-256 before storage  
✅ **HTTPS Required** - Never send tokens over HTTP  
✅ **Expiration** - 7-day default expiration  
✅ **Secure Storage** - Use encrypted storage in apps  
✅ **Rate Limiting** - Applied on login endpoints  
✅ **One-Way Hash** - Cannot reverse engineer original token

## Testing

Use the updated Postman collection:

**Complete Flow:**

1. POST `/api/verification/initiate`
2. POST `/api/verification/verify`
3. POST `/api/register` → Save token
4. POST `/api/phone-login/request-otp`
5. POST `/api/phone-login/verify-otp` → Save new token
6. Use token in subsequent requests

Token is automatically saved to `accessToken` environment variable in Postman.
