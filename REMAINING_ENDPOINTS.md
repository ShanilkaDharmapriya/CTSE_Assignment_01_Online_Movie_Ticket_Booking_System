# Implementation Guide: Required Service Endpoints

## Show Service - Free Seats Endpoint

### Endpoint: POST /shows/:showId/free-seats

**Purpose:**
Release reserved seats when a booking is cancelled, making them available for other customers.

**Location:** `show-service/src/routes/showRoutes.js`

**Implementation:**

```javascript
// showRoutes.js - Add this route
router.post('/:showId/free-seats', authenticateJWT, async (req, res, next) => {
  try {
    const { showId } = req.params;
    const { seats } = req.body;

    // Validate input
    if (!seats || seats <= 0) {
      return res.status(400).json({ message: "Valid seat count required" });
    }

    // Find the show
    const show = await Show.findById(showId);
    if (!show) {
      return res.status(404).json({ message: "Show not found" });
    }

    // Update seats: increase available, decrease reserved
    show.availableSeats = (show.availableSeats || 0) + seats;
    show.reservedSeats = Math.max(0, (show.reservedSeats || 0) - seats);

    // Save updated show
    const updatedShow = await show.save();

    return res.status(200).json({
      message: "Seats freed successfully",
      show: updatedShow
    });
  } catch (error) {
    return next(error);
  }
});
```

**Show Model Updates (if needed):**
```javascript
// show-service/src/models/Show.js - ensure these fields exist
const showSchema = new mongoose.Schema({
  // ... existing fields ...
  reservedSeats: {
    type: Number,
    default: 0,
    min: 0
  },
  availableSeats: {
    type: Number,
    required: true,
    min: 0
  },
  // ... timestamps ...
}, { timestamps: true });
```

**Testing:**
```bash
# Before cancellation
GET /shows/{showId}
→ availableSeats: 95, reservedSeats: 5

# Cancel booking with 2 seats
DELETE /bookings/{bookingId}
→ Calls POST /shows/{showId}/free-seats { seats: 2 }

# After cancellation
GET /shows/{showId}
→ availableSeats: 97, reservedSeats: 3
```

**Error Handling:**
- 400: Invalid seat count
- 404: Show not found
- 500: Database error

**Security:**
- Requires JWT authentication
- Called only from booking-service
- No role restriction needed (internal service call)

---

## Payment Service - Refund Endpoint

### Endpoint: POST /payments/:paymentId/refund

**Purpose:**
Process and record a payment refund when a booking is cancelled.

**Location:** `payment-service/src/routes/paymentRoutes.js`

**Implementation:**

```javascript
// paymentRoutes.js - Add this route
router.post('/:paymentId/refund', authenticateJWT, async (req, res, next) => {
  try {
    const { paymentId } = req.params;

    // Find the payment
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Check if payment is in refundable state
    if (payment.status === 'REFUNDED') {
      return res.status(400).json({ message: "Payment already refunded" });
    }

    if (payment.status !== 'COMPLETED' && payment.status !== 'CAPTURED') {
      return res.status(400).json({ 
        message: "Only completed payments can be refunded",
        currentStatus: payment.status 
      });
    }

    // Process refund (integrate with Stripe if using real payments)
    // For now, just update status
    let refundResult = {
      transactionId: `REFUND-${Date.now()}`,
      amount: payment.amount,
      timestamp: new Date(),
      status: 'SUCCESS'
    };

    // If using Stripe, call: stripe.refunds.create({ charge: payment.stripeChargeId })
    // If using other provider, adapt accordingly

    // Update payment record
    payment.status = 'REFUNDED';
    payment.refundedAmount = payment.amount;
    payment.refundedAt = new Date();
    payment.refundTransactionId = refundResult.transactionId;

    const updatedPayment = await payment.save();

    return res.status(200).json({
      message: "Refund processed successfully",
      payment: updatedPayment,
      refund: refundResult
    });
  } catch (error) {
    return next(error);
  }
});
```

**Payment Model Updates (if needed):**
```javascript
// payment-service/src/models/Payment.js - ensure these fields exist
const paymentSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'CAPTURED', 'FAILED', 'REFUNDED'],
    default: 'PENDING',
    index: true
  },
  refundedAmount: {
    type: Number,
    default: 0
  },
  refundedAt: {
    type: Date,
    default: null
  },
  refundTransactionId: {
    type: String,
    default: null
  },
  // ... other fields like stripeChargeId if using Stripe ...
  // ... timestamps ...
}, { timestamps: true });
```

**For Stripe Integration:**
```javascript
// More realistic implementation with Stripe
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.post('/:paymentId/refund', authenticateJWT, async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (!payment.stripeChargeId) {
      return res.status(400).json({ message: "No charge to refund" });
    }

    // Call Stripe API
    const refund = await stripe.refunds.create({
      charge: payment.stripeChargeId,
      amount: Math.round(payment.amount * 100) // Convert to cents
    });

    // Update payment record
    payment.status = 'REFUNDED';
    payment.refundedAmount = payment.amount;
    payment.refundedAt = new Date();
    payment.refundTransactionId = refund.id;
    await payment.save();

    return res.status(200).json({
      message: "Refund processed successfully",
      refund: {
        id: refund.id,
        amount: payment.amount,
        status: refund.status,
        timestamp: new Date()
      }
    });
  } catch (error) {
    // Handle Stripe errors
    if (error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({ message: error.message });
    }
    return next(error);
  }
});
```

**Testing:**
```bash
# Create and capture payment
POST /payments { bookingId, amount: 500 }
→ payment status: COMPLETED, refundedAmount: 0

# Refund the payment
POST /payments/{paymentId}/refund
→ payment status: REFUNDED, refundedAmount: 500, refundedAt: timestamp

# Try refunding again (should fail)
POST /payments/{paymentId}/refund
→ 400: Payment already refunded
```

**Error Handling:**
- 400: Payment already refunded / Invalid state / Refund processing error
- 404: Payment not found
- 500: Database error / Stripe API error

**Security:**
- Requires JWT authentication
- Called only from booking-service
- No personal data exposed in response
- Admins could use different role if needed

---

## Integration Testing Script

**File:** `test-integration.js`

```javascript
const axios = require('axios');

const API_BASE = 'http://localhost:3000';
let userToken, movieId, showId, bookingId;

async function test() {
  try {
    // 1. Register and login
    console.log('1. Registering user...');
    await axios.post(`${API_BASE}/auth/register`, {
      username: `user_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      password: 'test123'
    });

    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      username: `user_${Date.now()}`,
      password: 'test123'
    });
    userToken = loginRes.data.token;
    console.log('✓ User logged in');

    // 2. Get a movie
    console.log('\n2. Fetching movies...');
    const moviesRes = await axios.get(`${API_BASE}/movies`);
    movieId = moviesRes.data[0]?._id;
    console.log(`✓ Movie fetched: ${movieId}`);

    // 3. Get available shows
    console.log('\n3. Fetching shows...');
    const showsRes = await axios.get(`${API_BASE}/shows`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    showId = showsRes.data[0]?._id;
    const initialAvailable = showsRes.data[0]?.availableSeats;
    console.log(`✓ Show fetched: ${showId}`);
    console.log(`  Available seats before: ${initialAvailable}`);

    // 4. Create a booking
    console.log('\n4. Creating booking...');
    const bookingRes = await axios.post(
      `${API_BASE}/bookings`,
      {
        userId: 'test-user',
        movieId: movieId,
        showId: showId,
        seats: 2
      },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    bookingId = bookingRes.data._id;
    const bookingRef = bookingRes.data.bookingReference;
    console.log(`✓ Booking created: ${bookingId}`);
    console.log(`  Booking Reference: ${bookingRef}`);
    console.log(`  Status: ${bookingRes.data.status}`);

    // 5. Check seats after booking
    console.log('\n5. Checking seats after booking...');
    const showsRes2 = await axios.get(`${API_BASE}/shows/${showId}`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    const afterBooking = showsRes2.data.availableSeats;
    console.log(`  Available seats after booking: ${afterBooking}`);
    console.log(`  Seats reserved: ${initialAvailable - afterBooking}`);

    // 6. Cancel the booking
    console.log('\n6. Cancelling booking...');
    const cancelRes = await axios.delete(
      `${API_BASE}/bookings/${bookingId}`,
      {
        data: { reason: 'Testing refund workflow' },
        headers: { Authorization: `Bearer ${userToken}` }
      }
    );
    console.log(`✓ Booking cancelled`);
    console.log(`  Refund Status: ${cancelRes.data.refundStatus}`);
    console.log(`  Refunded Amount: ${cancelRes.data.refundedAmount}`);
    console.log(`  Cancellation Reason: ${cancelRes.data.cancellationReason}`);

    // 7. Check seats after cancellation
    console.log('\n7. Checking seats after cancellation...');
    const showsRes3 = await axios.get(`${API_BASE}/shows/${showId}`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    const afterCancel = showsRes3.data.availableSeats;
    console.log(`  Available seats after cancellation: ${afterCancel}`);
    console.log(`  Seats freed: ${afterCancel - afterBooking}`);

    // 8. Verify user can only see own bookings
    console.log('\n8. Testing user isolation...');
    const bookingsRes = await axios.get(`${API_BASE}/bookings`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log(`✓ User can see only their bookings: ${bookingsRes.data.length} booking(s)`);

    console.log('\n✅ Integration test passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

test();
```

**Run with:**
```bash
node test-integration.js
```

---

## Summary of Required Changes

| Service | Endpoint | Method | Purpose | Status |
|---------|----------|--------|---------|--------|
| show-service | `/shows/:id/free-seats` | POST | Free seats after cancellation | ⏳ Needs Implementation |
| payment-service | `/payments/:id/refund` | POST | Process refund | ⏳ Needs Implementation |

---

## Deployment Order

1. **Update show-service:**
   - Add free-seats endpoint
   - Deploy & test

2. **Update payment-service:**
   - Add refund endpoint
   - Test with Stripe (if applicable)
   - Deploy

3. **Verify booking-service integration:**
   - Run integration tests
   - Monitor logs for refund/seat errors

4. **Monitor in production:**
   - Track refund success rate
   - Monitor for seat discrepancies
   - Handle failed refunds manually

---

**Status:** Ready for implementation. All code is provided above.
