import { useEffect, useState } from "react";
import {
  createMovieFormData,
  createShow,
  fetchMovies,
} from "../services/api.js";

/**
 * Admin dashboard: add movies (multipart) and showtimes.
 * Movie API requires extra fields (language, director, release date) — we use sensible defaults
 * where the assignment only listed title, description, genre, duration, price.
 */
export default function Admin() {
  const [movies, setMovies] = useState([]);
  const [loadError, setLoadError] = useState("");

  // Add movie form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("");
  const [duration, setDuration] = useState("");
  const [pricePerSeat, setPricePerSeat] = useState("");
  const [posterFile, setPosterFile] = useState(null);
  const [movieMsg, setMovieMsg] = useState("");
  const [movieLoading, setMovieLoading] = useState(false);

  // Defaults required by movie-service schema
  const [language, setLanguage] = useState("English");
  const [director, setDirector] = useState("");
  const [releaseDate, setReleaseDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );

  // Create show form
  const [movieId, setMovieId] = useState("");
  const [theater, setTheater] = useState("");
  const [showDate, setShowDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [showTime, setShowTime] = useState("19:00");
  const [availableSeats, setAvailableSeats] = useState(80);
  const [showMsg, setShowMsg] = useState("");
  const [showLoading, setShowLoading] = useState(false);

  const refreshMovies = async () => {
    try {
      const data = await fetchMovies();
      setMovies(Array.isArray(data) ? data : []);
      setLoadError("");
    } catch (err) {
      setLoadError(err.response?.data?.message || err.message || "Could not load movies.");
    }
  };

  useEffect(() => {
    refreshMovies();
  }, []);

  const handleAddMovie = async (e) => {
    e.preventDefault();
    setMovieMsg("");
    setMovieLoading(true);
    try {
      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("description", description.trim());
      fd.append("genre", genre.trim());
      fd.append("duration", String(duration));
      fd.append("pricePerSeat", String(pricePerSeat));
      fd.append("language", language.trim() || "English");
      fd.append("director", director.trim() || "TBA");
      fd.append("releaseDate", releaseDate);
      fd.append("rating", "0");
      fd.append("status", "now_showing");
      if (posterFile) fd.append("poster", posterFile);

      await createMovieFormData(fd);
      window.alert("Movie created successfully.");
      setTitle("");
      setDescription("");
      setGenre("");
      setDuration("");
      setPricePerSeat("");
      setPosterFile(null);
      await refreshMovies();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to create movie.";
      setMovieMsg(String(msg));
      window.alert(`Error: ${msg}`);
    } finally {
      setMovieLoading(false);
    }
  };

  const handleCreateShow = async (e) => {
    e.preventDefault();
    setShowMsg("");
    setShowLoading(true);
    try {
      const dateIso = new Date(`${showDate}T12:00:00`).toISOString();
      await createShow({
        movieId,
        theater: theater.trim(),
        date: dateIso,
        showTime,
        availableSeats: Number(availableSeats),
      });
      window.alert("Show created successfully.");
      setTheater("");
      setShowTime("19:00");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to create show.";
      setShowMsg(String(msg));
      window.alert(`Error: ${msg}`);
    } finally {
      setShowLoading(false);
    }
  };

  return (
    <main className="main-pad">
      <div className="page-hero">
        <h1>Admin dashboard</h1>
        <p>Add movies and schedule showtimes.</p>
      </div>

      {loadError && <p className="state-msg state-msg--error">{loadError}</p>}

      <div className="admin-grid">
        <section className="admin-card">
          <h2>Add movie</h2>
          <form onSubmit={handleAddMovie}>
            <div className="form-group">
              <label>Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Genre (comma-separated)</label>
              <input
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="Action, Sci-Fi"
                required
              />
            </div>
            <div className="form-group">
              <label>Duration (minutes)</label>
              <input
                type="number"
                min={1}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Ticket price (per seat)</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={pricePerSeat}
                onChange={(e) => setPricePerSeat(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Language</label>
              <input value={language} onChange={(e) => setLanguage(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Director</label>
              <input value={director} onChange={(e) => setDirector(e.target.value)} placeholder="Optional" />
            </div>
            <div className="form-group">
              <label>Release date</label>
              <input
                type="date"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Poster image (optional)</label>
              <input type="file" accept="image/*" onChange={(e) => setPosterFile(e.target.files?.[0] || null)} />
            </div>
            <button type="submit" className="btn btn--primary" disabled={movieLoading}>
              {movieLoading ? "Saving…" : "Add movie"}
            </button>
            {movieMsg && <p className="form-error">{movieMsg}</p>}
            <p className="admin-hint">
              Backend expects multipart form data; extra fields satisfy the movie-service schema.
            </p>
          </form>
        </section>

        <section className="admin-card">
          <h2>Create show</h2>
          <form onSubmit={handleCreateShow}>
            <div className="form-group">
              <label>Movie</label>
              <select value={movieId} onChange={(e) => setMovieId(e.target.value)} required>
                <option value="">Select movie…</option>
                {movies.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Theater</label>
              <input value={theater} onChange={(e) => setTheater(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Date</label>
              <input type="date" value={showDate} onChange={(e) => setShowDate(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Time</label>
              <input value={showTime} onChange={(e) => setShowTime(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Available seats</label>
              <input
                type="number"
                min={1}
                value={availableSeats}
                onChange={(e) => setAvailableSeats(Number(e.target.value))}
                required
              />
            </div>
            <button type="submit" className="btn btn--primary" disabled={showLoading}>
              {showLoading ? "Creating…" : "Create show"}
            </button>
            {showMsg && <p className="form-error">{showMsg}</p>}
          </form>
        </section>
      </div>
    </main>
  );
}
