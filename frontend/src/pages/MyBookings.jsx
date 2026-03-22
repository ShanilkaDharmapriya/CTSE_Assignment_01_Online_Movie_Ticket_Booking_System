import { useEffect, useMemo, useState } from "react";
import { fetchMyBookings, fetchMovies } from "../services/api.js";

const formatDateTime = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString();
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError("");
      try {
        const [bookingData, movieData] = await Promise.all([fetchMyBookings(), fetchMovies()]);
        setBookings(Array.isArray(bookingData) ? bookingData : []);
        setMovies(Array.isArray(movieData) ? movieData : []);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load bookings.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const moviesById = useMemo(
    () => Object.fromEntries(movies.map((movie) => [movie._id, movie])),
    [movies]
  );

  return (
    <main className="main-pad">
      <div className="page-hero">
        <h1>My bookings</h1>
        <p>Track your booking references and payment status.</p>
      </div>

      {isLoading && <p className="state-msg">Loading bookings...</p>}
      {!isLoading && error && <p className="state-msg state-msg--error">{error}</p>}

      {!isLoading && !error && (
        <section className="admin-card">
          <div className="admin-list-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Movie</th>
                  <th>Show ID</th>
                  <th>Seats</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.bookingId || booking.bookingReference || booking._id}>
                    <td>{booking.bookingReference || booking.bookingId || "-"}</td>
                    <td>{moviesById[booking.movieId]?.title || booking.movieId || "-"}</td>
                    <td>{booking.showId || "-"}</td>
                    <td>{booking.seats || "-"}</td>
                    <td>{booking.status || "-"}</td>
                    <td>{booking.paymentStatus || "-"}</td>
                    <td>{formatDateTime(booking.createdAt)}</td>
                  </tr>
                ))}
                {!bookings.length && (
                  <tr>
                    <td colSpan={7}>No bookings found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}
