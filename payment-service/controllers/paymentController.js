const axios = require("axios");
const Stripe = require("stripe");
const Payment = require("../models/Payment");
const {
  STRIPE_SECRET_KEY,
  STRIPE_CURRENCY,
  MOVIE_SERVICE_URL,
  SHOW_SERVICE_URL,
} = require("../config/config");

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

const DEFAULT_INTERNAL_SERVICE_KEY = "ctse-internal-service-key-2026";

const uniqueUrls = (urls) => [...new Set(urls.filter(Boolean).map((url) => String(url).replace(/\/+$/, "")))];

const movieServiceCandidates = uniqueUrls([
  MOVIE_SERVICE_URL,
  "http://localhost:4001",
  "http://movie-service:4001",
]);

const showServiceCandidates = uniqueUrls([
  SHOW_SERVICE_URL,
  "http://localhost:4002",
  "http://show-service:4002",
]);

const requestWithFallback = async (method, baseUrls, endpoint, config = {}) => {
  let notFoundError = null;
  let lastError = null;

  for (const baseUrl of baseUrls) {
    try {
      return await axios({
        method,
        url: `${baseUrl}${endpoint}`,
        timeout: 7000,
        ...config,
      });
    } catch (error) {
      lastError = error;
      if (error.response?.status === 404) {
        notFoundError = error;
      }
    }
  }

  if (notFoundError) {
    throw notFoundError;
  }
  throw lastError;
};

const toMinorUnits = (amount) => Math.round(Number(amount) * 100);

const getSeatCount = (body) => Number(body.seatCount ?? body.seats);

const getTicketPrice = (movie) => Number(movie.ticketPrice ?? movie.pricePerSeat ?? movie.price ?? 0);

const getMovie = async (movieId) => {
  const response = await requestWithFallback("get", movieServiceCandidates, `/movies/${movieId}`);
  if (!response.data) {
    throw new Error("Movie not found");
  }
  return response.data;
};

const getShow = async (showId) => {
  const response = await requestWithFallback("get", showServiceCandidates, `/shows/${showId}`);
  return response.data;
};

const getSeatInfo = async (showId) => {
  const response = await requestWithFallback("get", showServiceCandidates, `/shows/${showId}/seats`);
  return response.data;
};

const updateShowSeats = async (showId, availableSeats, reservedSeats) => {
  await requestWithFallback("put", showServiceCandidates, `/shows/${showId}`, {
    data: {
      availableSeats,
      reservedSeats,
    },
    headers: { "X-Service-Key": process.env.INTERNAL_SERVICE_KEY || DEFAULT_INTERNAL_SERVICE_KEY },
  });
};

const mapStripeStatus = (status) => {
  if (status === "succeeded") return "SUCCESS";
  if (status === "canceled") return "FAILED";
  if (status === "requires_payment_method") return "FAILED";
  return "PENDING";
};

const processPayment = async (req, res) => {
  const seatCount = getSeatCount(req.body);
  const currency = String(req.body.currency || STRIPE_CURRENCY).toLowerCase();

  console.log("[PaymentService][ProcessPayment] request received", {
    bookingId: req.body.bookingId,
    userId: req.body.userId,
    movieId: req.body.movieId,
    showId: req.body.showId,
    seats: seatCount,
    paymentMethod: req.body.paymentMethod,
    currency,
  });

  if (!req.body.bookingId || !req.body.userId || !req.body.movieId || !req.body.showId || !Number.isInteger(seatCount) || seatCount < 1) {
    return res.status(400).json({
      message: "bookingId, userId, movieId, showId and a positive seats value are required",
    });
  }

  try {
    const [movie, show, seatInfo] = await Promise.all([
      getMovie(req.body.movieId),
      getShow(req.body.showId),
      getSeatInfo(req.body.showId),
    ]);

    console.log("[PaymentService][ProcessPayment] dependencies fetched", {
      movieId: movie?._id || req.body.movieId,
      showId: show?._id || req.body.showId,
      availableSeats: seatInfo?.availableSeats,
      reservedSeats: seatInfo?.reservedSeats,
    });

    if (String(show.movieId) !== String(req.body.movieId)) {
      return res.status(400).json({ message: "Show does not belong to the specified movie" });
    }

    if (seatInfo.availableSeats < seatCount) {
      return res.status(400).json({ message: "Not enough seats available for this show" });
    }

    const amount = getTicketPrice(movie) * seatCount;
    const paymentMethod = req.body.paymentMethod || "stripe";
    let paymentStatus = "SUCCESS";
    let stripePaymentIntentId = null;
    let clientSecret = null;
    let failureReason = null;

    if (!stripe) {
      paymentStatus = "SUCCESS";
    } else {
      const paymentMethodId = req.body.paymentMethodId || (process.env.NODE_ENV !== "production" ? "pm_card_visa" : undefined);
      const paymentIntentPayload = {
        amount: toMinorUnits(amount),
        currency,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: "never",
        },
        metadata: {
          bookingId: String(req.body.bookingId),
          userId: req.body.userId,
          movieId: req.body.movieId,
          showId: req.body.showId,
          seats: String(seatCount),
        },
      };

      if (paymentMethodId) {
        paymentIntentPayload.confirm = true;
        paymentIntentPayload.payment_method = paymentMethodId;
      }

      const paymentIntent = await stripe.paymentIntents.create(paymentIntentPayload);

      paymentStatus = mapStripeStatus(paymentIntent.status);
      stripePaymentIntentId = paymentIntent.id;
      clientSecret = paymentIntent.client_secret;
      failureReason = paymentIntent.last_payment_error?.message || null;

      console.log("[PaymentService][ProcessPayment] stripe intent created", {
        paymentIntentId: paymentIntent.id,
        paymentStatus,
      });
    }

    if (paymentStatus === "SUCCESS") {
      await updateShowSeats(
        req.body.showId,
        seatInfo.availableSeats - seatCount,
        seatInfo.reservedSeats + seatCount
      );
    }

    const payment = await Payment.create({
      bookingId: req.body.bookingId,
      userId: req.body.userId,
      movieId: req.body.movieId,
      showId: req.body.showId,
      seats: seatCount,
      amount,
      currency,
      paymentMethod,
      provider: stripe ? "stripe" : "mock",
      stripePaymentIntentId,
      clientSecret,
      paymentStatus,
      failureReason,
    });

    console.log("[PaymentService][ProcessPayment] payment stored", {
      paymentId: payment._id,
      paymentStatus: payment.paymentStatus,
      amount: payment.amount,
      provider: payment.provider,
    });

    if (payment.paymentStatus !== "SUCCESS") {
      return res.status(402).json({
        paymentId: payment._id,
        bookingId: payment.bookingId,
        paymentStatus: payment.paymentStatus,
        amount: payment.amount,
        currency: payment.currency,
        clientSecret: payment.clientSecret,
        message: payment.failureReason || "Payment requires additional action",
      });
    }

    return res.status(200).json({
      paymentId: payment._id,
      bookingId: payment.bookingId,
      paymentStatus: payment.paymentStatus,
      amount: payment.amount,
      currency: payment.currency,
      paymentMethod: payment.paymentMethod,
      provider: payment.provider,
      stripePaymentIntentId: payment.stripePaymentIntentId,
    });
  } catch (error) {
    console.error("[PaymentService][ProcessPayment] failed", {
      message: error.message,
      name: error.name,
      stack: error.stack,
      upstreamStatus: error.response?.status,
      upstreamBody: error.response?.data,
    });
    if (error.response) {
      return res.status(error.response.status).json({
        message: "Failed to process payment",
        error: error.response?.data?.message || error.message,
        upstream: error.response?.data,
      });
    }
    return res.status(500).json({ message: "Failed to process payment", error: error.message });
  }
};

const getAllPayments = async (req, res) => {
  try {
    const filter = {};
    if (req.query.bookingId) filter.bookingId = req.query.bookingId;
    if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;
    const payments = await Payment.find(filter).sort({ createdAt: -1 });
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve payments", error: error.message });
  }
};

const getPaymentStatus = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve payment", error: error.message });
  }
};

const refundPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.paymentStatus === "REFUNDED") {
      return res.status(400).json({ message: "Payment is already refunded" });
    }

    if (payment.paymentStatus !== "SUCCESS") {
      return res.status(400).json({ message: "Only successful payments can be refunded" });
    }

    if (!stripe || payment.provider === "mock") {
      payment.paymentStatus = "REFUNDED";
      payment.refundedAt = new Date();
      await payment.save();

      return res.status(200).json({
        paymentId: payment._id,
        bookingId: payment.bookingId,
        paymentStatus: payment.paymentStatus,
        amount: payment.amount,
        currency: payment.currency,
      });
    }

    const refund = await stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
      amount: toMinorUnits(req.body.amount || payment.amount),
    });

    payment.paymentStatus = "REFUNDED";
    payment.refundId = refund.id;
    payment.refundedAt = new Date();
    await payment.save();

    res.status(200).json({
      paymentId: payment._id,
      bookingId: payment.bookingId,
      paymentStatus: payment.paymentStatus,
      amount: payment.amount,
      currency: payment.currency,
      refundId: payment.refundId,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to refund payment", error: error.message });
  }
};

module.exports = {
  processPayment,
  getAllPayments,
  getPaymentStatus,
  refundPayment,
};