import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import MovieDetail from './pages/MovieDetail';
import Booking from './pages/Booking';
import Checkout from './pages/Checkout';
import BookingHistory from './pages/BookingHistory';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Public Routes - Anyone can browse */}
          <Route path="/" element={<Home />} />
          <Route path="/movie/:movieId" element={<MovieDetail />} />

          {/* Protected Routes - Require authentication */}
          <Route
            path="/booking/:movieId/:showId"
            element={
              <ProtectedRoute>
                <Booking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout/:bookingId"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking-history"
            element={
              <ProtectedRoute>
                <BookingHistory />
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
