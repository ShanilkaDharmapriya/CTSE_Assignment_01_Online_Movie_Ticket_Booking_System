import axios from "axios";

/** API Gateway base URL (matches your backend). */
const configuredGatewayUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
export const API_BASE_URL = configuredGatewayUrl.replace(/\/+$/, "");

const TOKEN_KEY = "token";
const USER_KEY = "user";

function normalizeUser(user) {
  if (!user || typeof user !== "object") {
    return user;
  }

  return {
    ...user,
    role: typeof user.role === "string" ? user.role.toUpperCase() : user.role,
  };
}

function normalizeAuthPayload(payload) {
  if (!payload?.data?.user) {
    return payload;
  }

  return {
    ...payload,
    data: {
      ...payload.data,
      user: normalizeUser(payload.data.user),
    },
  };
}

function normalizeBookingPayload(payload) {
  if (!payload || typeof payload !== "object") {
    return payload;
  }

  return {
    ...payload,
    bookingReference: payload.bookingReference || payload.bookingId || payload._id || null,
  };
}

function normalizePaymentPayload(payload) {
  if (!payload || typeof payload !== "object") {
    return payload;
  }

  return {
    ...payload,
    paymentStatus: payload.paymentStatus ? String(payload.paymentStatus).toUpperCase() : payload.paymentStatus,
  };
}

/** Axios instance — JWT attached automatically when present. */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Let the browser set multipart boundaries automatically for FormData payloads.
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});

// --- Auth helpers (used by pages) ---

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// --- API calls ---

/**
 * Login — backend returns { success, data: { token, user } }
 */
export async function loginRequest(email, password) {
  const { data } = await api.post("/auth/login", { email, password });
  return normalizeAuthPayload(data);
}

/**
 * Register (optional helper if you add a register page later)
 */
export async function registerRequest(name, email, password) {
  const { data } = await api.post("/auth/register", { name, email, password });
  return normalizeAuthPayload(data);
}

export async function fetchMovies() {
  const { data } = await api.get("/movies");
  return data;
}

export async function fetchMovieById(movieId) {
  const { data } = await api.get(`/movies/${movieId}`);
  return data;
}

export async function fetchShowsForMovie(movieId) {
  const { data } = await api.get("/shows", { params: { movieId } });
  return data;
}

export async function fetchShows(params = {}) {
  const { data } = await api.get("/shows", { params });
  return data;
}

/** Admin: all shows including completed / cancelled (requires admin JWT). */
export async function fetchShowsAdmin(params = {}) {
  const { data } = await api.get("/shows/admin/list", { params });
  return data;
}

export async function fetchTheaters() {
  const { data } = await api.get("/theaters");
  return data;
}

export async function createTheater(payload) {
  const { data } = await api.post("/theaters", payload);
  return data;
}

export async function updateTheater(theaterId, payload) {
  const { data } = await api.put(`/theaters/${theaterId}`, payload);
  return data;
}

export async function deleteTheater(theaterId) {
  const { data } = await api.delete(`/theaters/${theaterId}`);
  return data;
}

/** Full seat layout for a show (AVAILABLE | HELD | BOOKED per seat). */
export async function fetchSeatLayout(showId) {
  const { data } = await api.get(`/shows/${showId}/seats`);
  return data;
}

/**
 * Atomically hold specific seats for the current user (5-minute TTL server-side).
 * @returns {Promise<{ success: boolean, data: { showId, seatNumbers, expiresAt, holdDurationMs } }>}
 */
export async function holdSeats(showId, seats) {
  const { data } = await api.post("/seats/hold", { showId, seats });
  return data;
}

export async function releaseSeats(showId, seats) {
  const { data } = await api.post("/seats/release", { showId, seats });
  return data;
}

export async function processPayment(payload) {
  console.log("[API][processPayment] request payload", payload);
  try {
    const { data } = await api.post("/payments", payload);
    console.log("[API][processPayment] response body", data);
    return normalizePaymentPayload(data);
  } catch (error) {
    console.error("[API][processPayment] request failed", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseBody: error.response?.data,
      message: error.message,
    });
    throw error;
  }
}

export async function fetchBookings(params = {}) {
  const { data } = await api.get("/bookings", { params });
  return Array.isArray(data) ? data.map(normalizeBookingPayload) : [];
}

export async function fetchMyBookings() {
  const currentUser = getStoredUser();
  const params = currentUser?.id ? { userId: currentUser.id } : {};
  return fetchBookings(params);
}

export async function fetchPayments(params = {}) {
  const { data } = await api.get("/payments", { params });
  return Array.isArray(data) ? data.map(normalizePaymentPayload) : [];
}

/**
 * Admin: create movie (multipart — backend expects multer)
 * Required by movie-service: language, director, releaseDate, etc.
 */
export async function createMovieFormData(formData) {
  try {
    const { data } = await api.post("/movies", formData);
    console.log("POST /movies response body:", data);
    return data;
  } catch (error) {
    console.log("POST /movies response body:", error.response?.data);
    throw error;
  }
}

export async function updateMovieFormData(movieId, formData) {
  const { data } = await api.put(`/movies/${movieId}`, formData);
  return data;
}

export async function deleteMovieById(movieId) {
  const { data } = await api.delete(`/movies/${movieId}`);
  return data;
}

export async function createShow(payload) {
  const { data } = await api.post("/shows", payload);
  return data;
}

export async function updateShow(showId, payload) {
  const { data } = await api.put(`/shows/${showId}`, payload);
  return data;
}

export async function deleteShowById(showId) {
  const { data } = await api.delete(`/shows/${showId}`);
  return data;
}

export default api;
