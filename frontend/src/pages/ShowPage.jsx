import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { createBooking, fetchMovieById, fetchShowsForMovie } from "../services/api.js";

function formatShowWhen(dateVal, showTime) {
  try {
    const d = dateVal ? new Date(dateVal) : null;
    const datePart =
      d && !Number.isNaN(d.getTime())
        ? d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })
        : "";
    const timePart = showTime || "";
    return [datePart, timePart].filter(Boolean).join(" · ");
  } catch {
    return showTime || "—";
  }
}

export default function ShowPage() {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedShow, setSelectedShow] = useState(null);
  const [seats, setSeats] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const [m, sList] = await Promise.all([
          fetchMovieById(movieId),
          fetchShowsForMovie(movieId),
        ]);
        if (!cancelled) {
          setMovie(m);
          setShows(Array.isArray(sList) ? sList : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || err.message || "Failed to load showtimes.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [movieId]);

  /**
   * Booking requires an account. Browsing showtimes does not.
   */
  const handleBookNow = (show) => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    setSelectedShow(show);
    setSeats(1);
    setBookingError("");
  };

  const handleConfirmBooking = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    if (!selectedShow) return;
    setBookingError("");
    const n = Number(seats);
    if (!Number.isInteger(n) || n < 1) {
      setBookingError("Enter a valid number of seats.");
      return;
    }
    if (n > selectedShow.availableSeats) {
      setBookingError(`Only ${selectedShow.availableSeats} seat(s) left.`);
      return;
    }

    setBookingLoading(true);
    try {
      const result = await createBooking({
        movieId,
        showId: selectedShow._id,
        seats: n,
      });
      navigate("/payment", {
        state: {
          booking: result,
          movie,
          show: selectedShow,
          seats: n,
        },
      });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Booking failed.";
      setBookingError(String(msg));
      window.alert(`Booking failed: ${msg}`);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="main-pad">
        <p className="state-msg">Loading…</p>
      </main>
    );
  }

  if (error || !movie) {
    return (
      <main className="main-pad">
        <p className="state-msg state-msg--error">{error || "Movie not found."}</p>
      </main>
    );
  }

  return (
    <main className="main-pad">
      <div className="show-header">
        <h1>{movie.title}</h1>
        <p style={{ color: "var(--text-muted)", margin: 0 }}>
          Choose a theater and time — then confirm your seats.
        </p>
      </div>

      {shows.length === 0 ? (
        <p className="state-msg">No showtimes listed for this movie yet.</p>
      ) : (
        <div className="show-list">
          {shows.map((show) => (
            <div key={show._id} className="show-row">
              <div className="show-row__info">
                <p>
                  <strong>{show.theater}</strong>
                </p>
                <p className="muted">{formatShowWhen(show.date, show.showTime)}</p>
                <p className="muted">{show.availableSeats} seats available</p>
              </div>
              <button
                type="button"
                className="btn btn--primary"
                disabled={show.availableSeats < 1}
                onClick={() => handleBookNow(show)}
              >
                Book now
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedShow && (
        <div className="booking-panel">
          <h3>Complete booking</h3>
          <p style={{ margin: "0 0 0.75rem", fontSize: "0.9rem", color: "var(--text-muted)" }}>
            {selectedShow.theater} — {formatShowWhen(selectedShow.date, selectedShow.showTime)}
          </p>
          <div className="form-group">
            <label htmlFor="seats">Number of seats</label>
            <input
              id="seats"
              type="number"
              min={1}
              max={selectedShow.availableSeats}
              value={seats}
              onChange={(e) => setSeats(Number(e.target.value))}
            />
          </div>
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleConfirmBooking}
            disabled={bookingLoading}
          >
            {bookingLoading ? "Confirming…" : "Confirm booking"}
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            style={{ marginLeft: "0.5rem" }}
            onClick={() => setSelectedShow(null)}
          >
            Cancel
          </button>
          {bookingError && <p className="form-error">{bookingError}</p>}
        </div>
      )}
    </main>
  );
}
