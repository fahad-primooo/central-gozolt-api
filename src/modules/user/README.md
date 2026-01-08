# User Module API Documentation

## Available Endpoints

### 1. Create User

**POST** `/users`

Create a new user after phone verification.

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "countryCode": "+1",
  "phoneNumber": "1234567890",
  "password": "SecurePassword123!",
  "avatar": "https://example.com/avatar.jpg", // optional
  "bio": "Software developer" // optional
}
```

**Response:**

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "displayName": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "countryCode": "+1",
    "phoneNumber": "1234567890",
    "emailVerified": false,
    "phoneVerified": true,
    "avatar": "https://example.com/avatar.jpg",
    "bio": "Software developer",
    "status": "ACTIVE",
    "createdAt": "2026-01-08T09:00:00.000Z",
    "updatedAt": "2026-01-08T09:00:00.000Z"
  }
}
```

---

### 2. Get All Users

**GET** `/users?page=1&limit=10`

Get paginated list of users.

**Query Parameters:**

- `page` (optional, default: 1)
- `limit` (optional, default: 10)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "displayName": "John Doe",
      "username": "johndoe",
      "email": "john@example.com",
      "countryCode": "+1",
      "phoneNumber": "1234567890",
      "emailVerified": false,
      "phoneVerified": true,
      "avatar": "https://example.com/avatar.jpg",
      "status": "ACTIVE",
      "createdAt": "2026-01-08T09:00:00.000Z",
      "updatedAt": "2026-01-08T09:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

---

### 3. Get User by ID

**GET** `/users/:id`

Get a specific user by their ID.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "displayName": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "countryCode": "+1",
    "phoneNumber": "1234567890",
    "emailVerified": false,
    "phoneVerified": true,
    "avatar": "https://example.com/avatar.jpg",
    "bio": "Software developer",
    "status": "ACTIVE",
    "lastLoginAt": "2026-01-08T09:00:00.000Z",
    "createdAt": "2026-01-08T09:00:00.000Z",
    "updatedAt": "2026-01-08T09:00:00.000Z"
  }
}
```

---

### 4. Get User by Email

**GET** `/users/email/:email`

Get a user by their email address.

---

### 5. Get User by Username

**GET** `/users/username/:username`

Get a user by their username.

---

### 6. Update User

**PATCH** `/users/:id`

Update user information.

**Request Body:**

```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "username": "janesmith",
  "email": "jane@example.com",
  "avatar": "https://example.com/new-avatar.jpg",
  "bio": "Updated bio"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": 1,
    "firstName": "Jane",
    "lastName": "Smith",
    "displayName": "Jane Smith",
    "username": "janesmith",
    "email": "jane@example.com",
    "countryCode": "+1",
    "phoneNumber": "1234567890",
    "emailVerified": false,
    "phoneVerified": true,
    "avatar": "https://example.com/new-avatar.jpg",
    "bio": "Updated bio",
    "status": "ACTIVE",
    "updatedAt": "2026-01-08T10:00:00.000Z"
  }
}
```

---

### 7. Delete User

**DELETE** `/users/:id?soft=true`

Delete a user (soft delete by default).

**Query Parameters:**

- `soft` (optional, default: true) - Set to `false` for hard delete

**Response:**

```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

### 8. Verify Email

**POST** `/users/:id/verify-email`

Mark user's email as verified.

**Response:**

```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "id": 1,
    "email": "john@example.com",
    "emailVerified": true,
    "emailVerifiedAt": "2026-01-08T10:00:00.000Z"
  }
}
```

---

## Testing with cURL

### Create a User

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "countryCode": "+1",
    "phoneNumber": "1234567890",
    "password": "SecurePassword123!"
  }'
```

### Get All Users

```bash
curl -X GET http://localhost:3000/users
```

### Get User by ID

```bash
curl -X GET http://localhost:3000/users/1
```

### Update User

```bash
curl -X PATCH http://localhost:3000/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "bio": "Updated bio"
  }'
```

### Delete User (Soft)

```bash
curl -X DELETE http://localhost:3000/users/1
```

### Delete User (Hard)

```bash
curl -X DELETE "http://localhost:3000/users/1?soft=false"
```
