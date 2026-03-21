import { useEffect, useState } from "react";
import MovieCard from "../components/MovieCard.jsx";
import { fetchMovies } from "../services/api.js";

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchMovies();
        if (!cancelled) setMovies(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || err.message || "Could not load movies.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="main-pad">
      <div className="page-hero">
        <h1>Now on your screen</h1>
        <p>Pick a film — then choose a showtime and grab your seats.</p>
      </div>

      {loading && <p className="state-msg">Loading movies…</p>}
      {!loading && error && <p className="state-msg state-msg--error">{error}</p>}
      {!loading && !error && movies.length === 0 && (
        <p className="state-msg">No movies yet. Ask an admin to add one.</p>
      )}
      {!loading && !error && movies.length > 0 && (
        <div className="movie-grid">
          {movies.map((m) => (
            <MovieCard key={m._id} movie={m} />
          ))}
        </div>
      )}
    </main>
  );
}
