import axios from "axios";

/** API Gateway base URL (matches your backend). */
export const API_BASE_URL = "http://localhost:3000";

const TOKEN_KEY = "token";
const USER_KEY = "user";

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
  return data;
}

/**
 * Register (optional helper if you add a register page later)
 */
export async function registerRequest(name, email, password) {
  const { data } = await api.post("/auth/register", { name, email, password });
  return data;
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

export async function createBooking(payload) {
  // { movieId, showId, seats }
  const { data } = await api.post("/bookings", payload);
  return data;
}

/**
 * Admin: create movie (multipart — backend expects multer)
 * Required by movie-service: language, director, releaseDate, etc.
 */
export async function createMovieFormData(formData) {
  const { data } = await api.post("/movies", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function createShow(payload) {
  const { data } = await api.post("/shows", payload);
  return data;
}

export default api;
