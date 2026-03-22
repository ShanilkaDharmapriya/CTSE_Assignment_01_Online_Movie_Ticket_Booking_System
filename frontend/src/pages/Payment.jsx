import { useMemo, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { processPayment, updateBookingStatus } from "../services/api.js";

const toDigits = (value) => String(value || "").replace(/\D/g, "");

const isFutureExpiry = (value) => {
  const match = String(value || "").trim().match(/^(\d{2})\/(\d{2})$/);
  if (!match) return false;

  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return false;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  return year > currentYear || (year === currentYear && month >= currentMonth);
};

const deriveStripeTestPaymentMethodId = (cardNumber) => {
  const digits = toDigits(cardNumber);

  // Map common Stripe test cards to known payment method IDs.
  if (digits === "4000000000000002") return "pm_card_chargeDeclined";
  if (digits === "4000002500003155") return "pm_card_authenticationRequired";
  return "pm_card_visa";
};

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();

  const booking = location.state?.booking || null;
  const movie = location.state?.movie || null;
  const show = location.state?.show || null;
  const seats = Number(location.state?.seats || booking?.seats || 0);

  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [currency, setCurrency] = useState("usd");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [cardExpiry, setCardExpiry] = useState("12/30");
  const [cardCvc, setCardCvc] = useState("123");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState(null);

  const bookingId = booking?.bookingId || booking?.bookingReference;
  const showId = show?._id || booking?.showId;
  const movieId = movie?._id || booking?.movieId;

  const summaryAmountText = useMemo(() => {
    const ticketPrice = Number(movie?.pricePerSeat || movie?.price || 0);
    if (Number.isFinite(ticketPrice) && ticketPrice > 0 && Number.isFinite(seats) && seats > 0) {
      return `${(ticketPrice * seats).toFixed(2)} ${String(currency || "usd").toUpperCase()}`;
    }
    return "Calculated by backend";
  }, [movie, seats, currency]);

  if (!bookingId || !showId || !movieId || !Number.isInteger(seats) || seats < 1) {
    return <Navigate to="/" replace />;
  }

  const validateCardDetails = () => {
    if (paymentMethod !== "stripe") {
      return "";
    }

    if (!cardName.trim()) return "Cardholder name is required.";

    const numberDigits = toDigits(cardNumber);
    if (numberDigits.length < 12 || numberDigits.length > 19) {
      return "Enter a valid card number.";
    }

    if (!isFutureExpiry(cardExpiry)) {
      return "Enter a valid future expiry date (MM/YY).";
    }

    const cvcDigits = toDigits(cardCvc);
    if (cvcDigits.length < 3 || cvcDigits.length > 4) {
      return "Enter a valid CVC.";
    }

    return "";
  };

  const handlePayNow = async (e) => {
    e.preventDefault();
    setError("");

    const validationMessage = validateCardDetails();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setIsProcessing(true);

    try {
      const derivedPaymentMethodId =
        paymentMethod === "stripe" ? deriveStripeTestPaymentMethodId(cardNumber) : undefined;

      const paymentResult = await processPayment({
        bookingId,
        movieId,
        showId,
        seats,
        paymentMethod,
        paymentMethodId: derivedPaymentMethodId,
        currency,
      });

      await updateBookingStatus(bookingId, {
        status: "CONFIRMED",
        paymentStatus: paymentResult.paymentStatus || "SUCCESS",
        paymentId: paymentResult.paymentId,
        amount: paymentResult.amount,
        currency: paymentResult.currency,
        provider: paymentResult.provider,
        paymentMethod: paymentResult.paymentMethod,
      });

      setSuccessData(paymentResult);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Payment failed.";

      try {
        await updateBookingStatus(bookingId, {
          status: "PAYMENT_FAILED",
          paymentStatus: err.response?.data?.paymentStatus || "FAILED",
          paymentId: err.response?.data?.paymentId,
          failureReason: String(message),
        });
      } catch {
        // Best-effort update; keep original payment error for UI.
      }

      setError(String(message));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="main-pad">
      <div className="page-hero">
        <h1>Complete payment</h1>
        <p>Finish your booking with Stripe or a fallback method.</p>
      </div>

      <div className="payment-grid">
        <section className="admin-card">
          <h2>Booking summary</h2>
          <p><strong>Reference:</strong> {booking.bookingReference || bookingId}</p>
          <p><strong>Movie:</strong> {movie?.title || movieId}</p>
          <p><strong>Theater:</strong> {show?.theater || "-"}</p>
          <p><strong>Seats:</strong> {seats}</p>
          <p><strong>Estimated amount:</strong> {summaryAmountText}</p>
        </section>

        <section className="admin-card">
          <h2>Payment method</h2>
          {!successData ? (
            <form onSubmit={handlePayNow}>
              <div className="form-group">
                <label htmlFor="payment-method">Method</label>
                <select
                  id="payment-method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="stripe">Stripe</option>
                  <option value="mock">Mock</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="currency">Currency</label>
                <input
                  id="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value.toLowerCase())}
                  maxLength={3}
                  required
                />
              </div>

              {paymentMethod === "stripe" && (
                <>
                  <div className="form-group">
                    <label htmlFor="card-name">Cardholder name</label>
                    <input
                      id="card-name"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="card-number">Card number</label>
                    <input
                      id="card-number"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4242 4242 4242 4242"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="card-expiry">Expiry (MM/YY)</label>
                    <input
                      id="card-expiry"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="12/30"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="card-cvc">CVC</label>
                    <input
                      id="card-cvc"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      placeholder="123"
                      required
                    />
                  </div>

                  <p className="admin-hint">
                    Card details stay in the browser and are used to choose a Stripe test payment profile.
                    Use 4242 4242 4242 4242 for success, 4000 0000 0000 0002 for a declined test.
                  </p>
                </>
              )}

              <button type="submit" className="btn btn--primary" disabled={isProcessing}>
                {isProcessing ? "Processing..." : "Pay now"}
              </button>
              {error && <p className="form-error">{error}</p>}
            </form>
          ) : (
            <div>
              <p className="form-success">Payment successful and booking confirmed.</p>
              <p><strong>Payment ID:</strong> {successData.paymentId}</p>
              <p><strong>Status:</strong> {successData.paymentStatus}</p>
              <p><strong>Amount:</strong> {successData.amount} {String(successData.currency || "").toUpperCase()}</p>
              <div style={{ marginTop: "1rem" }}>
                <Link to="/" className="btn btn--primary">Back to movies</Link>
              </div>
            </div>
          )}
        </section>
      </div>

      {!successData && (
        <p style={{ marginTop: "1rem" }}>
          <Link to="/" className="btn btn--ghost">Cancel and return</Link>
        </p>
      )}
    </main>
  );
}
