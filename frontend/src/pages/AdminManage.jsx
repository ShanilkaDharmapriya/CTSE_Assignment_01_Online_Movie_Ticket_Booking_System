import { useEffect, useMemo, useState } from "react";
import {
  API_BASE_URL,
  deleteMovieById,
  deleteShowById,
  fetchBookings,
  fetchMovies,
  fetchPayments,
  fetchShowsAdmin,
  updateMovieFormData,
  updateShow,
} from "../services/api.js";
import { usePopup } from "../context/PopupContext.jsx";

const toDateInput = (value) => {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString();
};

const asList = (value) => (Array.isArray(value) ? value : []);

const posterUrlForMovie = (movieId) => `${API_BASE_URL}/movies/${movieId}/poster`;

export default function AdminManage() {
  const { confirm, notify } = usePopup();
  const [activeSection, setActiveSection] = useState("all");
  const [movies, setMovies] = useState([]);
  const [shows, setShows] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [editingMovieId, setEditingMovieId] = useState("");
  const [movieForm, setMovieForm] = useState({
    title: "",
    description: "",
    genre: "",
    language: "",
    duration: "",
    director: "",
    releaseDate: "",
    pricePerSeat: "",
    status: "now_showing",
  });

  const [editingShowId, setEditingShowId] = useState("");
  const [showForm, setShowForm] = useState({
    movieId: "",
    markCancelled: false,
  });

  const moviesById = useMemo(
    () => Object.fromEntries(asList(movies).map((movie) => [movie._id, movie])),
    [movies]
  );

  const showSection = (section) => activeSection === "all" || activeSection === section;

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [moviesData, showsData, bookingsData, paymentsData] = await Promise.all([
        fetchMovies(),
        fetchShowsAdmin(),
        fetchBookings(),
        fetchPayments(),
      ]);

      setMovies(asList(moviesData));
      setShows(asList(showsData));
      setBookings(asList(bookingsData));
      setPayments(asList(paymentsData));
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to load admin data.";
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const beginMovieEdit = (movie) => {
    setEditingMovieId(movie._id);
    setMovieForm({
      title: movie.title || "",
      description: movie.description || "",
      genre: Array.isArray(movie.genre) ? movie.genre.join(", ") : String(movie.genre || ""),
      language: movie.language || "English",
      duration: String(movie.duration || ""),
      director: movie.director || "",
      releaseDate: toDateInput(movie.releaseDate),
      pricePerSeat: String(movie.pricePerSeat || ""),
      status: movie.status || "now_showing",
    });
  };

  const saveMovieEdit = async () => {
    if (!editingMovieId) return;
    setMessage("");
    setError("");

    try {
      const fd = new FormData();
      fd.append("title", movieForm.title.trim());
      fd.append("description", movieForm.description.trim());
      fd.append("genre", movieForm.genre.trim());
      fd.append("language", movieForm.language.trim() || "English");
      fd.append("duration", String(movieForm.duration).trim());
      fd.append("director", movieForm.director.trim() || "TBA");
      fd.append("releaseDate", movieForm.releaseDate);
      fd.append("pricePerSeat", String(movieForm.pricePerSeat).trim());
      fd.append("status", movieForm.status || "now_showing");

      await updateMovieFormData(editingMovieId, fd);
      setEditingMovieId("");
      setMessage("Movie updated successfully.");
      notify("Movie updated successfully.", "success");
      await loadData();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to update movie.";
      setError(String(msg));
    }
  };

  const removeMovie = async (movieId) => {
      const ok = await confirm({
        title: "Delete movie",
        message: "Do you want to delete this movie? This action cannot be undone.",
        confirmText: "Delete",
        cancelText: "Keep",
        intent: "danger",
      });
    if (!ok) return;

    setMessage("");
    setError("");
    try {
      await deleteMovieById(movieId);
      setMessage("Movie deleted successfully.");
      notify("Movie deleted successfully.", "success");
      await loadData();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to delete movie.";
      setError(String(msg));
    }
  };

  const beginShowEdit = (show) => {
    setEditingShowId(show._id);
    setShowForm({
      movieId: show.movieId || "",
      markCancelled: false,
    });
  };

  const saveShowEdit = async () => {
    if (!editingShowId) return;

    setMessage("");
    setError("");
    try {
      if (showForm.markCancelled) {
        await updateShow(editingShowId, { status: "CANCELLED" });
      } else {
        await updateShow(editingShowId, { movieId: showForm.movieId.trim() });
      }
      setEditingShowId("");
      setMessage("Show updated successfully.");
      notify("Show updated successfully.", "success");
      await loadData();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to update show.";
      setError(String(msg));
    }
  };

  const removeShow = async (showId) => {
      const ok = await confirm({
        title: "Delete show",
        message: "Cancel this show? Seats and history are kept; status becomes CANCELLED.",
        confirmText: "Delete",
        cancelText: "Keep",
        intent: "danger",
      });
    if (!ok) return;

    setMessage("");
    setError("");
    try {
      await deleteShowById(showId);
      setMessage("Show cancelled (data retained).");
      notify("Show cancelled (data retained).", "success");
      await loadData();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to delete show.";
      setError(String(msg));
    }
  };

  return (
    <main className="main-pad">
      <div className="page-hero">
        <h1>Admin manage</h1>
        <p>View all entities and manage movies and shows.</p>
      </div>

      <div className="admin-section-switcher">
        <button
          type="button"
          className={`btn ${activeSection === "all" ? "btn--primary" : "btn--ghost"}`}
          onClick={() => setActiveSection("all")}
        >
          All
        </button>
        <button
          type="button"
          className={`btn ${activeSection === "movies" ? "btn--primary" : "btn--ghost"}`}
          onClick={() => setActiveSection("movies")}
        >
          Movies
        </button>
        <button
          type="button"
          className={`btn ${activeSection === "shows" ? "btn--primary" : "btn--ghost"}`}
          onClick={() => setActiveSection("shows")}
        >
          Shows
        </button>
        <button
          type="button"
          className={`btn ${activeSection === "bookings" ? "btn--primary" : "btn--ghost"}`}
          onClick={() => setActiveSection("bookings")}
        >
          Bookings
        </button>
        <button
          type="button"
          className={`btn ${activeSection === "payments" ? "btn--primary" : "btn--ghost"}`}
          onClick={() => setActiveSection("payments")}
        >
          Payments
        </button>
      </div>

      {loading && <p className="state-msg">Loading admin data...</p>}
      {!loading && error && <p className="state-msg state-msg--error">{error}</p>}
      {!loading && message && <p className="form-success">{message}</p>}

      {!loading && (
        <div className="admin-manage-grid">
          {showSection("movies") && <section className="admin-card">
            <h2>Movies</h2>
            <div className="admin-list-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Poster</th>
                    <th>Title</th>
                    <th>Genre</th>
                    <th>Duration</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {asList(movies).map((movie) => (
                    <tr key={movie._id}>
                      <td>
                        {movie.hasPoster ? (
                          <img
                            src={posterUrlForMovie(movie._id)}
                            alt={`${movie.title} poster`}
                            className="admin-movie-thumb"
                            loading="lazy"
                          />
                        ) : (
                          <span className="admin-thumb-fallback">No image</span>
                        )}
                      </td>
                      <td>{movie.title}</td>
                      <td>{Array.isArray(movie.genre) ? movie.genre.join(", ") : movie.genre}</td>
                      <td>{movie.duration} min</td>
                      <td>{movie.pricePerSeat}</td>
                      <td>{movie.status}</td>
                      <td className="admin-row-actions">
                        <button type="button" className="btn btn--ghost" onClick={() => beginMovieEdit(movie)}>
                          Edit
                        </button>
                        <button type="button" className="btn btn--ghost" onClick={() => removeMovie(movie._id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!movies.length && (
                    <tr>
                      <td colSpan={7}>No movies found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {editingMovieId && (
              <div className="admin-inline-edit">
                <h3>Edit movie</h3>
                <div className="admin-inline-grid">
                  <input
                    value={movieForm.title}
                    onChange={(e) => setMovieForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Title"
                  />
                  <input
                    value={movieForm.genre}
                    onChange={(e) => setMovieForm((prev) => ({ ...prev, genre: e.target.value }))}
                    placeholder="Genre"
                  />
                  <input
                    value={movieForm.language}
                    onChange={(e) => setMovieForm((prev) => ({ ...prev, language: e.target.value }))}
                    placeholder="Language"
                  />
                  <input
                    value={movieForm.duration}
                    onChange={(e) => setMovieForm((prev) => ({ ...prev, duration: e.target.value }))}
                    type="number"
                    min={1}
                    placeholder="Duration"
                  />
                  <input
                    value={movieForm.director}
                    onChange={(e) => setMovieForm((prev) => ({ ...prev, director: e.target.value }))}
                    placeholder="Director"
                  />
                  <input
                    value={movieForm.releaseDate}
                    onChange={(e) => setMovieForm((prev) => ({ ...prev, releaseDate: e.target.value }))}
                    type="date"
                  />
                  <input
                    value={movieForm.pricePerSeat}
                    onChange={(e) => setMovieForm((prev) => ({ ...prev, pricePerSeat: e.target.value }))}
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="Price per seat"
                  />
                  <select
                    value={movieForm.status}
                    onChange={(e) => setMovieForm((prev) => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="now_showing">now_showing</option>
                    <option value="coming_soon">coming_soon</option>
                    <option value="ended">ended</option>
                  </select>
                </div>
                <textarea
                  value={movieForm.description}
                  onChange={(e) => setMovieForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Description"
                />
                <div className="admin-row-actions">
                  <button type="button" className="btn btn--primary" onClick={saveMovieEdit}>
                    Save movie
                  </button>
                  <button type="button" className="btn btn--ghost" onClick={() => setEditingMovieId("")}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </section>}

          {showSection("shows") && <section className="admin-card">
            <h2>Shows</h2>
            <div className="admin-list-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Movie</th>
                    <th>Hall</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Status</th>
                    <th>Seats (avail)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {asList(shows).map((show) => (
                    <tr key={show._id}>
                      <td>{moviesById[show.movieId]?.title || show.movieId}</td>
                      <td>{show.theaterId?.name || show.theaterId || "—"}</td>
                      <td>{formatDateTime(show.startTime)}</td>
                      <td>{formatDateTime(show.endTime)}</td>
                      <td>{show.status || "—"}</td>
                      <td>
                        {show.availableSeats ?? "—"}
                        {typeof show.heldSeats === "number" && show.heldSeats > 0
                          ? ` (+${show.heldSeats} held)`
                          : ""}
                      </td>
                      <td className="admin-row-actions">
                        <button type="button" className="btn btn--ghost" onClick={() => beginShowEdit(show)}>
                          Edit
                        </button>
                        <button type="button" className="btn btn--ghost" onClick={() => removeShow(show._id)}>
                          Cancel show
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!shows.length && (
                    <tr>
                      <td colSpan={7}>No shows found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {editingShowId && (
              <div className="admin-inline-edit">
                <h3>Edit show</h3>
                <p className="admin-hint" style={{ marginTop: 0 }}>
                  You can fix a wrong movie link or cancel the show. Times and hall cannot be changed after creation.
                </p>
                <div className="admin-inline-grid">
                  <input
                    value={showForm.movieId}
                    onChange={(e) => setShowForm((prev) => ({ ...prev, movieId: e.target.value }))}
                    placeholder="Movie ID (Mongo _id)"
                  />
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <input
                      type="checkbox"
                      checked={showForm.markCancelled}
                      onChange={(e) => setShowForm((prev) => ({ ...prev, markCancelled: e.target.checked }))}
                    />
                    Cancel show (CANCELLED)
                  </label>
                </div>
                <div className="admin-row-actions">
                  <button type="button" className="btn btn--primary" onClick={saveShowEdit}>
                    Save show
                  </button>
                  <button type="button" className="btn btn--ghost" onClick={() => setEditingShowId("")}>
                    Close
                  </button>
                </div>
              </div>
            )}
          </section>}

          {showSection("bookings") && <section className="admin-card">
            <h2>Bookings</h2>
            <div className="admin-list-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>User</th>
                    <th>Movie</th>
                    <th>Seats</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {asList(bookings).map((booking) => (
                    <tr key={booking.bookingId || booking._id}>
                      <td>{booking.bookingReference || booking.bookingId || booking._id}</td>
                      <td>{booking.userId || "-"}</td>
                      <td>{moviesById[booking.movieId]?.title || booking.movieId || "-"}</td>
                      <td>
                        {Array.isArray(booking.seats) ? booking.seats.join(", ") : booking.seats ?? "-"}
                      </td>
                      <td>{booking.status || booking.paymentStatus || "-"}</td>
                      <td>{formatDateTime(booking.createdAt)}</td>
                    </tr>
                  ))}
                  {!bookings.length && (
                    <tr>
                      <td colSpan={6}>No bookings found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>}

          {showSection("payments") && <section className="admin-card">
            <h2>Payments</h2>
            <div className="admin-list-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Payment ID</th>
                    <th>Booking</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {asList(payments).map((payment) => (
                    <tr key={payment._id}>
                      <td>{payment._id}</td>
                      <td>{payment.bookingId || "-"}</td>
                      <td>
                        {payment.currency ? `${String(payment.currency).toUpperCase()} ` : ""}
                        {payment.amount}
                      </td>
                      <td>{payment.paymentMethod || payment.provider || "-"}</td>
                      <td>{payment.paymentStatus || "-"}</td>
                      <td>{formatDateTime(payment.createdAt)}</td>
                    </tr>
                  ))}
                  {!payments.length && (
                    <tr>
                      <td colSpan={6}>No payments found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>}
        </div>
      )}
    </main>
  );
}
