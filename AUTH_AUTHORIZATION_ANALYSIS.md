# 🔐 Authentication & Authorization Analysis

## ✅ CURRENTLY IMPLEMENTED

### **Auth Service (PORT 5000)**
| Feature | Status | Notes |
|---------|--------|-------|
| User Registration | ✅ | `POST /auth/register` - Email, name, password with bcrypt hashing |
| User Login | ✅ | `POST /auth/login` - Returns JWT token |
| JWT Token Validation | ✅ | `GET /auth/validate` - Validates Bearer token |
| Password Hashing | ✅ | bcrypt with 10 salt rounds |
| Token Expiry | ✅ | Configurable via JWT_EXPIRES_IN (default: 1h) |

### **Authentication Mechanism**
- **Token Type:** JWT (JSON Web Token)
- **Storage:** In-memory user store (no database persistence)
- **Algorithm:** HS256 (HMAC with SHA-256)
- **Bearer Format:** `Authorization: Bearer <token>`

### **Middleware**
- ✅ `extractBearerToken()` - Extracts token from Authorization header
- ✅ `requireValidJwt()` - Validates JWT, sets `req.auth.user`

---

## ⚠️ CRITICAL GAPS & MISSING AUTHORIZATION

### **Gap #1: No Role-Based Access Control (RBAC)**
**Status:** ❌ **NOT IMPLEMENTED**

**Problem:**
- User model has NO `role` field
- Frontend expects admin operations (`POST /shows`, `PUT /shows`, `DELETE /shows`, `PUT /movies`)
- No role validation middleware
- No authorization checks on protected endpoints

**Required Roles:**
```
- ADMIN   : Can create/update/delete movies & shows
- USER    : Can only view movies/shows and make bookings
```

**Impact:** Any authenticated user can perform admin operations (security risk)

---

### **Gap #2: API Gateway NOT Protecting Routes**
**Status:** ❌ **NOT IMPLEMENTED**

**Problem:**
- API Gateway (`api-gateway/src/index.js`) has NO authentication middleware
- Routes are accessible without JWT token
- No /auth routes mounted at gateway
- Cannot validate tokens before proxying to services

**Current:** Anyone can call any endpoint without authentication
**Required:** All routes should require valid JWT token (except /auth/register, /auth/login)

---

### **Gap #3: Individual Services NOT Validating Tokens**
**Status:** ❌ **NOT IMPLEMENTED**

**Problem:**
- Movie Service - No JWT validation
- Show Service - No JWT validation
- Booking Service - No JWT validation
- Payment Service - No JWT validation

**Required:** Each service should validate JWT before processing, especially for:
- ✅ Bookings (should validate user making booking matches JWT userId)
- ✅ DELETE/PUT operations (should validate user is ADMIN)

---

### **Gap #4: No User Context Passed Between Services**
**Status:** ❌ **NOT IMPLEMENTED**

**Problem:**
- When API Gateway proxies requests, user info is not forwarded
- Services cannot know which user is making the request
- Cannot enforce booking belongs to authenticated user

**Required:** Forward `X-User-Id` and `X-User-Role` headers through the API Gateway

---

### **Gap #5: No Protected/Admin-Only Endpoints**
**Status:** ❌ **NOT IMPLEMENTED**

**Problem:**
- No `@admin` or protected decorator
- No middleware distinguishing between user/admin operations

**Admin Operations (should be protected):**
- `POST /movies` - Create movie
- `PUT /movies/:id` - Update movie
- `DELETE /movies/:id` - Delete movie
- `POST /shows` - Create show
- `PUT /shows/:id` - Update show
- `DELETE /shows/:id` - Delete show

**User Operations (should check ownership):**
- `POST /bookings` - User should only see their own bookings
- `GET /bookings` - User should only see their own bookings
- `DELETE /bookings/:id` - User should only cancel their own bookings

---

## 📊 Authentication/Authorization Matrix

| Component | Current | Required | Gap |
|-----------|---------|----------|-----|
| JWT Authentication | ✅ | ✅ | 0% |
| Role-Based Access Control | ❌ | ✅ | **100%** |
| API Gateway Protection | ❌ | ✅ | **100%** |
| Service-Level Auth | ❌ | ✅ | **100%** |
| User Context Propagation | ❌ | ✅ | **100%** |
| Ownership Validation | ❌ | ✅ | **100%** |

---

## 🔧 Implementation Requirements

### **Priority 1: CRITICAL**
- [ ] Add `role` field to user model (ADMIN, USER)
- [ ] Implement role check middleware
- [ ] Protect API Gateway routes with JWT validation
- [ ] Add role validation to POST/PUT/DELETE operations
- [ ] Forward user context (X-User-Id, X-User-Role) through gateway

### **Priority 2: HIGH**
- [ ] Add user ownership checks to bookings (users can only see/cancel their own)
- [ ] Add auth middleware to each service (movie, show, booking, payment)
- [ ] Create authorization utility middleware
- [ ] Add isAdmin() check middleware

### **Priority 3: MEDIUM**
- [ ] Update auth-service to persist users to MongoDB (instead of in-memory)
- [ ] Add logout/token blacklist mechanism
- [ ] Add refresh token support
- [ ] Add password reset functionality
- [ ] Add audit logging for sensitive operations

---

## 📋 Affected Endpoints

### **UNPROTECTED (should be PROTECTED):**
- ❌ `POST /movies` - Should require ADMIN role
- ❌ `PUT /movies/:id` - Should require ADMIN role
- ❌ `DELETE /movies/:id` - Should require ADMIN role
- ❌ `POST /shows` - Should require ADMIN role
- ❌ `PUT /shows/:id` - Should require ADMIN role
- ❌ `DELETE /shows/:id` - Should require ADMIN role
- ❌ `POST /bookings` - Should require auth + validate user
- ❌ `DELETE /bookings/:id` - Should require auth + check ownership
- ❌ `POST /payments` - Should require auth + validate booking belongs to user

### **UNPROTECTED (OK - Public):**
- ✅ `POST /auth/register` - Public
- ✅ `POST /auth/login` - Public
- ✅ `GET /movies` - Public
- ✅ `GET /movies/:id` - Public
- ✅ `GET /shows` - Public
- ✅ `GET /shows/:id` - Public
- ✅ `GET /shows/:id/seats` - Public

---

## 🎯 Next Steps

1. **Update User Model** - Add role field and default to "USER"
2. **Create Authorization Middleware** - requireRole, requireAuth, setUserContext
3. **Update API Gateway** - Add auth protection middleware & forward user headers
4. **Update Services** - Add auth validation and ownership checks
5. **Test End-to-End** - Verify admin-only and user-specific operations work correctly
