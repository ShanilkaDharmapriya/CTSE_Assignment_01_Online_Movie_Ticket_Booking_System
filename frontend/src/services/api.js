import axios from 'axios';
import { mockMovies, mockShows, mockBookings } from './mockData';

const API_BASE_URL = 'http://localhost:3000';
const USE_MOCK = true; // Always use mock for now as requested

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Simulated delay helper
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Movie Service
export const movieService = {
  getMovies: async () => {
    if (USE_MOCK) {
      await delay();
      return mockMovies;
    }
    const response = await apiClient.get('/movies');
    return response.data;
  },
  getMovieById: async (movieId) => {
    if (USE_MOCK) {
      await delay();
      return mockMovies.find(m => m._id === movieId);
    }
    const response = await apiClient.get(`/movies/${movieId}`);
    return response.data;
  },
};

// Show Service
export const showService = {
  getShows: async () => {
    if (USE_MOCK) {
      await delay();
      return mockShows;
    }
    const response = await apiClient.get('/shows');
    return response.data;
  },
  getShowById: async (showId) => {
    if (USE_MOCK) {
      await delay();
      return mockShows.find(s => s._id === showId);
    }
    const response = await apiClient.get(`/shows/${showId}`);
    return response.data;
  },
  getShowsByMovieId: async (movieId) => {
    if (USE_MOCK) {
      await delay();
      return mockShows.filter((show) => show.movieId === movieId);
    }
    const response = await apiClient.get('/shows');
    const allShows = response.data;
    return allShows.filter((show) => show.movieId === movieId);
  },
};

// Booking Service
export const bookingService = {
  createBooking: async (bookingData) => {
    if (USE_MOCK) {
      await delay(1000);
      return { _id: 'new_b_' + Date.now(), ...bookingData };
    }
    const response = await apiClient.post('/bookings', bookingData);
    return response.data;
  },
  getBookings: async () => {
    if (USE_MOCK) {
      await delay();
      return mockBookings;
    }
    const response = await apiClient.get('/bookings');
    return response.data;
  },
  getBookingById: async (bookingId) => {
    if (USE_MOCK) {
      await delay();
      const existing = mockBookings.find(b => b._id === bookingId);
      if (existing) return existing;
      // Handle new bookings
      return {
        _id: bookingId,
        bookingReference: 'BK-' + Math.floor(1000 + Math.random() * 9000),
        movieTitle: mockMovies[0].title,
        theaterName: mockShows[0].theater,
        showDateTime: new Date().toISOString(),
        seats: 2,
        amount: 2400,
        status: 'PENDING',
      };
    }
    const response = await apiClient.get(`/bookings/${bookingId}`);
    return response.data;
  },
  cancelBooking: async (bookingId, reason) => {
    if (USE_MOCK) {
      await delay();
      return { _id: bookingId, status: 'CANCELLED' };
    }
    const response = await apiClient.delete(`/bookings/${bookingId}`, {
      data: { reason },
    });
    return response.data;
  },
};

// Payment Service
export const paymentService = {
  createPayment: async (paymentData) => {
    if (USE_MOCK) {
      await delay(1500);
      return { status: 'SUCCESS', transactionId: 'TX-' + Date.now() };
    }
    const response = await apiClient.post('/payments', paymentData);
    return response.data;
  },
};

export default apiClient;
