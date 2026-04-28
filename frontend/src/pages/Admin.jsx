import { useEffect, useState } from "react";
import {
  createMovieFormData,
  createShow,
  createTheater,
  fetchMovies,
  fetchTheaters,
} from "../services/api.js";
import { usePopup } from "../context/PopupContext.jsx";

/**
 * Admin dashboard: add movies (multipart) and showtimes.
 * Movie API requires extra fields (language, director, release date) — we use sensible defaults
 * where the assignment only listed title, description, genre, duration, price.
 */
export default function Admin() {
  const { notify } = usePopup();
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

  const [theaters, setTheaters] = useState([]);

  const [theaterName, setTheaterName] = useState("");
  const [theaterRows, setTheaterRows] = useState("A,B,C,D,E,F");
  const [theaterSeatsPerRow, setTheaterSeatsPerRow] = useState(18);
  const [theaterMsg, setTheaterMsg] = useState("");
  const [theaterLoading, setTheaterLoading] = useState(false);

  const [movieId, setMovieId] = useState("");
  const [theaterId, setTheaterId] = useState("");
  const [showStart, setShowStart] = useState("");
  const [showEnd, setShowEnd] = useState("");
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

  const refreshTheaters = async () => {
    try {
      const data = await fetchTheaters();
      setTheaters(Array.isArray(data) ? data : []);
    } catch {
      setTheaters([]);
    }
  };

  useEffect(() => {
    refreshMovies();
    refreshTheaters();
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
      notify("Movie created successfully.", "success");
      setTitle("");
      setDescription("");
      setGenre("");
      setDuration("");
      setPricePerSeat("");
      setPosterFile(null);
      await refreshMovies();
    } catch (err) {
      console.error("[Admin][CreateMovie] request failed", {
        status: err.response?.status,
        statusText: err.response?.statusText,
        responseBody: err.response?.data,
        message: err.message,
      });
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to create movie.";
      setMovieMsg(String(msg));
      notify(`Error: ${msg}`, "error", 3600);
    } finally {
      setMovieLoading(false);
    }
  };

  const handleCreateTheater = async (e) => {
    e.preventDefault();
    setTheaterMsg("");
    setTheaterLoading(true);
    try {
      const rows = theaterRows
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean);
      await createTheater({
        name: theaterName.trim(),
        rows,
        seatsPerRow: Number(theaterSeatsPerRow),
      });
      notify("Theater created.", "success");
      setTheaterName("");
      await refreshTheaters();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to create theater.";
      setTheaterMsg(String(msg));
      notify(`Error: ${msg}`, "error", 3600);
    } finally {
      setTheaterLoading(false);
    }
  };

  const handleCreateShow = async (e) => {
    e.preventDefault();
    setShowMsg("");
    setShowLoading(true);
    try {
      const startTime = new Date(showStart).toISOString();
      const endTime = new Date(showEnd).toISOString();
      if (!theaterId || Number.isNaN(new Date(showStart).getTime()) || Number.isNaN(new Date(showEnd).getTime())) {
        throw new Error("Select a hall and valid start/end times.");
      }
      if (new Date(endTime) <= new Date(startTime)) {
        throw new Error("End time must be after start time.");
      }

      const payload = { movieId, theaterId, startTime, endTime };

      await createShow(payload);
      notify("Show created successfully.", "success");
      setShowStart("");
      setShowEnd("");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to create show.";
      setShowMsg(String(msg));
      notify(`Error: ${msg}`, "error", 3600);
    } finally {
      setShowLoading(false);
    }
  };

  return (
    <main className="main-pad">
      <div className="page-hero">
        <h1>Admin dashboard</h1>
        <p>Add movies, define halls, and schedule showtimes with real seat maps.</p>
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
          <h2>Create theater (hall template)</h2>
          <form onSubmit={handleCreateTheater}>
            <div className="form-group">
              <label>Hall name</label>
              <input
                value={theaterName}
                onChange={(e) => setTheaterName(e.target.value)}
                placeholder="IMAX 1"
                required
              />
            </div>
            <div className="form-group">
              <label>Row labels (comma-separated)</label>
              <input
                value={theaterRows}
                onChange={(e) => setTheaterRows(e.target.value)}
                placeholder="A,B,C,D"
                required
              />
            </div>
            <div className="form-group">
              <label>Seats per row</label>
              <input
                type="number"
                min={1}
                max={200}
                value={theaterSeatsPerRow}
                onChange={(e) => setTheaterSeatsPerRow(Number(e.target.value))}
                required
              />
            </div>
            <button type="submit" className="btn btn--primary" disabled={theaterLoading}>
              {theaterLoading ? "Saving…" : "Create theater"}
            </button>
            {theaterMsg && <p className="form-error">{theaterMsg}</p>}
            <p className="admin-hint">Seats are named row + number (e.g. A1…A18). Layout version increments when you edit rows.</p>
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
              <select value={theaterId} onChange={(e) => setTheaterId(e.target.value)} required>
                <option value="">Select hall…</option>
                {theaters.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name} ({t.rows?.length || 0} rows × {t.seatsPerRow || 0})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Start</label>
              <input
                type="datetime-local"
                value={showStart}
                onChange={(e) => setShowStart(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>End</label>
              <input
                type="datetime-local"
                value={showEnd}
                onChange={(e) => setShowEnd(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn--primary" disabled={showLoading}>
              {showLoading ? "Creating…" : "Create show"}
            </button>
            {showMsg && <p className="form-error">{showMsg}</p>}
            <p className="admin-hint">Seats for this performance are generated from the hall template. Overlapping times in the same hall are rejected.</p>
          </form>
        </section>
      </div>
    </main>
  );
}
