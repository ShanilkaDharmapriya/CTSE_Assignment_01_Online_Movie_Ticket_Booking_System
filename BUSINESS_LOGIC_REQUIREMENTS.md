# 📋 Business Logic Requirements Analysis

## ✅ CURRENTLY IMPLEMENTED

### **Booking Workflow**
1. **Validation**
   - ✅ User ID, Movie ID, Show ID, Seat count required
   - ✅ Movie exists check
   - ✅ Show exists check
   - ✅ Seat availability check (availableSeats >= requestedSeats)

2. **Payment Processing**
   - ✅ Payment amount calculated (show.price × seats)
   - ✅ Payment created before booking saved
   - ✅ Payment status tracked (PENDING, SUCCESS, FAILED, REFUNDED)
   - ✅ Stripe integration with fallback to mock provider

3. **Booking Confirmation**
   - ✅ Booking saved only after payment created
   - ✅ Booking status = "CONFIRMED" on creation
   - ✅ Booking stored with user context (userId, movieId, showId, seats)

4. **Seat Management**
   - ✅ Seats updated after successful payment
   - ✅ availableSeats decreased
   - ✅ reservedSeats increased

5. **Cancellation**
   - ✅ Booking can be canceled
   - ✅ Status changed to "CANCELLED"
   - ✅ Duplicate cancellation prevented

---

## ⚠️ CRITICAL GAPS IN BUSINESS LOGIC

### **Gap #1: Cancellation Doesn't Trigger Refund** 🔴
**Status:** ❌ **NOT IMPLEMENTED**

**Problem:**
- Canceling a booking doesn't refund the payment
- No automatic refund workflow
- Seats not freed up on cancellation

**Current Flow:**
```
User cancels booking
↓
Booking status = "CANCELLED"
↓
Payment remains "SUCCESS"
↓
Seats still reserved ❌
```

**Required Flow:**
```
User cancels booking
↓
Call payment-service to refund payment
↓
On refund success: Booking status = "CANCELLED"
↓
Free up seats (decrease reservedSeats, increase availableSeats)
↓
Return confirmation
```

**Impact:** Users cannot get refunds, seats stuck in reserved state

---

### **Gap #2: No Booking Confirmation Notification** 🔴
**Status:** ❌ **NOT IMPLEMENTED**

**Problem:**
- No email confirmation sent after booking
- No SMS notification
- No ticket generation
- No booking reference/confirmation details returned to user

**Missing:**
```
- Email notification service
- Email templates for:
  - Booking confirmation
  - Booking cancellation  
  - Payment receipt
  - Refund confirmation
- Ticket generation with QR code
- Booking reference generation
```

**Impact:** Users have no proof of booking, no way to track tickets

---

### **Gap #3: No User-Specific Booking Query** 🔴
**Status:** ⚠️ **PARTIAL**

**Problem:**
- `GET /bookings` returns ALL bookings (security issue)
- Should filter by userId automatically
- No "my bookings" endpoint

**Current:**
```
GET /bookings → Returns all users' bookings ❌
```

**Required:**
```
GET /bookings (requires user auth) 
  → Returns only current user's bookings ✅
  → Filter by status, date, etc.
  → Sort by creation date
```

**Impact:** Users can see other users' bookings (privacy violation)

---

### **Gap #4: Payment Failure Doesn't Clean Up Booking** 🔴
**Status:** ❌ **NOT IMPLEMENTED**

**Problem:**
- If payment fails, booking service may have already attempted to save
- No rollback mechanism
- No consistency between booking and payment tables

**Current Issue:**
```
1. Booking validates input ✅
2. Booking calls payment service ✅
3. Payment processing FAILS ❌
4. Exception caught, not saved ✅
   BUT: No cleanup of other state
```

**Missing:**
- Idempotent payment processing (same payment request = same result)
- Database transaction consistency between services
- Retry logic for failed payments

---

### **Gap #5: No Booking Expiration Hold** 🔴
**Status:** ❌ **NOT IMPLEMENTED**

**Problem:**
- Seats reserved indefinitely
- No hold-time limit (e.g., complete payment within 10 minutes)
- Booking not tied to payment status

**Typical Requirements:**
```
Seats reserved for 10 minutes
  ↓
If payment not completed in 10 minutes
  ↓
Seats released, booking cancelled
  ↓
User must start over
```

**Missing:**
- Booking status states: PENDING, CONFIRMED, CANCELLED, EXPIRED
- Scheduled cleanup job for expired bookings
- WebSocket/polling for real-time seat updates

---

### **Gap #6: No Booking Metadata/History** 🔴
**Status:** ❌ **NOT IMPLEMENTED**

**Missing Fields in Booking Model:**
```javascript
{
  bookingReference: "BK-2024-001234",    // ❌ Human-readable ID
  paymentId: "payment-123",               // ❌ Link to payment
  movieTitle: "Avatar",                   // ❌ Denormalized data
  theaterName: "Cinema Hall 1",          // ❌ Denormalized data
  showDateTime: "2024-03-25T18:00:00",   // ❌ Combined date/time
  seatNumbers: ["A1", "A2"],             // ❌ Actual seat numbers
  amount: 500,                            // ❌ Total amount paid
  paymentMethod: "card",                  // ❌ How it was paid
  tickets: [{                             // ❌ Generated tickets
    ticketId: "TKT-2024-001",
    qrCode: "data:image/png;...",
    seatNumber: "A1"
  }],
  lastStatusChangeAt: "2024-03-20T...",  // ❌ Status audit trail
  cancelledReason: "User requested",      // ❌ Cancellation reason
}
```

---

### **Gap #7: No Seat Locking During Transaction** 🔴
**Status:** ❌ **NOT IMPLEMENTED**

**Problem:**
- Race condition: Two users can book the same seat simultaneously
- No optimistic/pessimistic locking
- No seat lock during payment processing

**Current:**
```
User A: Checks 5 seats available ✅
User B: Checks 5 seats available ✅
User A: Books 5 seats ✅
User B: Books 5 seats ✅ (but only 0 available!)
```

**Missing:**
- Seat reservation lock before payment
- Lock expires on payment success/failure
- Conflict handling on duplicate reservation

---

### **Gap #8: Incomplete Refund Workflow** 🔴
**Status:** ⚠️ **PARTIAL**

**Current Refund Implementation:**
- ✅ Payment can be marked as REFUNDED
- ✅ Stripe refund API called

**Missing:**
- ❌ Refund not linked to booking
- ❌ No automatic refund on booking cancellation
- ❌ No refund confirmation notification
- ❌ No refund audit trail
- ❌ No partial refund support

---

## 📊 Business Logic Completeness Matrix

| Requirement | Status | Priority | Impact |
|-------------|--------|----------|--------|
| Booking creation | ✅ | CRITICAL | High |
| Payment processing | ✅ | CRITICAL | High |
| Seat reservation | ✅ | CRITICAL | High |
| Booking cancellation | ⚠️ | HIGH | High |
| Refund on cancellation | ❌ | HIGH | High |
| Refund workflow | ⚠️ | HIGH | High |
| Confirmation notification | ❌ | HIGH | Medium |
| User booking query | ⚠️ | MEDIUM | Medium |
| Seat locking | ❌ | MEDIUM | High |
| Booking expiration | ❌ | MEDIUM | Medium |
| Ticket generation | ❌ | MEDIUM | Medium |
| Booking metadata | ⚠️ | MEDIUM | Low |

---

## 🔧 Implementation Requirements - Priority Order

### **Priority 1: CRITICAL - Fix Safety Issues**

#### 1.1 User-Specific Booking Filtering
```javascript
// Current (WRONG):
GET /bookings → Returns ALL bookings

// Required:
GET /bookings
  - Extracts userId from JWT token (req.auth.user.id)
  - Filters: Booking.find({ userId: req.auth.user.id })
  - Prevents users seeing other users' bookings
```

#### 1.2 Refund on Cancellation
```javascript
// When booking cancelled:
1. Find booking
2. Find associated payment
3. If payment.status === "SUCCESS"
   → Call payment-service refund endpoint
   → Update booking.status = "CANCELLED"
   → Update payment.status = "REFUNDED"
4. On refund success
   → Call show-service to free seats
   → Return confirmation with refund details
```

#### 1.3 Free Seats on Cancellation
```javascript
// When booking cancelled AND refund successful:
1. Get show details
2. Update show:
   - availableSeats += booking.seats
   - reservedSeats -= booking.seats
3. Send update to show-service
```

---

### **Priority 2: HIGH - Complete Core Workflows**

#### 2.1 Booking Confirmation Email
```javascript
// After booking confirmed:
1. Generate booking reference: "BK-2024-XXXXX"
2. Send email with:
   - Booking confirmation
   - Movie details
   - Show date/time
   - Seat numbers
   - Amount paid
   - QR code
3. Store email sent status
```

#### 2.2 Idempotent Payment Processing
```javascript
// For duplicate payment requests:
1. Check if payment already exists for this booking
2. If exists with status "SUCCESS" → Return existing payment
3. If exists with status "PENDING" → Return pending payment
4. Otherwise → Process new payment
```

#### 2.3 Complete Booking Model
```javascript
// Add fields:
- bookingReference: Unique human-readable ID
- paymentId: Link to payment record
- seatNumbers: Array of actual seat numbers
- movieTitle: Denormalized for quick display
- theaterName: Denormalized for quick display
- showDateTime: Combined date/time
- amount: Total amount paid
- paymentMethod: How payment was made
- lastStatusChangeAt: Audit trail
- cancelledReason: Why it was cancelled
```

---

### **Priority 3: MEDIUM - Enhance User Experience**

#### 3.1 Seat Locking During Booking
```javascript
// When booking initiated:
1. Lock seats (reservation mechanism)
2. Set lock expiry (e.g., 10 minutes)
3. Process payment
4. On success: Convert lock to reservation
5. On failure: Release lock
```

#### 3.2 Booking Expiration
```javascript
// Scheduled job (every 5 minutes):
1. Find bookings with status "PENDING"
2. If created > 10 minutes ago
   → Mark as "EXPIRED"
   → Free up seats
   → Notify user
```

#### 3.3 Ticket Generation
```javascript
// After booking confirmed:
1. Generate unique ticket ID for each seat
2. Create QR code (encodes: bookingId, seatNumber, movieId)
3. Generate PDF ticket with:
   - Movie title
   - Show date/time
   - Seat number
   - QR code
   - Booking reference
4. Email ticket to user
5. Store in booking record
```

---

## 🔄 Revised Booking Flow (Complete)

```
1. USER INITIATES BOOKING
   └─ POST /bookings with userId, movieId, showId, seats

2. BOOKING SERVICE VALIDATES
   ├─ Check movie exists
   ├─ Check show exists
   └─ Check seats available

3. LOCK SEATS (New)
   └─ Reserve seats for 10 minutes

4. PROCESS PAYMENT
   ├─ Call payment-service
   ├─ Stripe payment intent created
   └─ Payment status = PENDING/SUCCESS/FAILED

5. PAYMENT FAILURE HANDLING (New)
   ├─ If FAILED
   │  └─ Release seat lock
   │  └─ Return error with retry option
   └─ If PENDING
      └─ Return with client_secret for frontend

6. BOOKING CONFIRMATION
   ├─ Status = CONFIRMED
   ├─ Generate booking reference
   └─ Generate tickets with QR codes

7. NOTIFICATIONS (New)
   ├─ Email: Booking confirmation + tickets
   ├─ Email: Payment receipt
   └─ SMS: Booking confirmation

8. USER CANCELS BOOKING
   ├─ POST /bookings/:id/cancel
   ├─ Call payment-service to refund
   ├─ Update booking status = CANCELLED
   ├─ Free up seats on show
   └─ Email: Cancellation + refund confirmation

9. SCHEDULED CLEANUP (New)
   ├─ Find PENDING bookings > 10 minutes
   ├─ Mark as EXPIRED
   ├─ Free entire seat reservation
   └─ Notify user
```

---

## 📋 Required Endpoints (New)

```
POST   /bookings/:id/cancel              - Cancel with refund
POST   /bookings/:id/tickets             - Get generated tickets
POST   /bookings/:id/confirmation        - Resend confirmation
```

---

## 🎓 Data Model Additions

### Booking Model
```javascript
{
  bookingReference: String,      // BK-2024-001234
  status: ENUM,                  // PENDING, CONFIRMED, CANCELLED, EXPIRED
  paymentId: String,             // Link to payment
  seatNumbers: [String],         // ["A1", "A2"]
  movieTitle: String,            // Denormalized
  theaterName: String,           // Denormalized
  showDateTime: Date,            // Combined
  amount: Number,                // Total paid
  paymentMethod: String,         // "stripe"
  tickets: [{                    // Generated tickets
    ticketId: String,
    seatNumber: String,
    qrCode: String
  }],
  lastStatusChangeAt: Date,      // Status audit
  cancelledReason: String,       // Why cancelled
  holdExpiresAt: Date,           // Seat lock expiry
  notificationSent: Boolean,     // Email sent flag
}
```

---

## ✨ Summary

**Currently Working:**
- ✅ Basic booking creation
- ✅ Payment processing
- ✅ Seat reservation

**Needs Implementation:**
- ❌ Refund on cancellation (CRITICAL)
- ❌ User isolation for bookings (CRITICAL)
- ❌ Confirmation notifications (HIGH)
- ❌ Seat locking (HIGH)
- ❌ Ticket generation (MEDIUM)

**Estimated Effort:** 3-4 weeks for complete implementation
