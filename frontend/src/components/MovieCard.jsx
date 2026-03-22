import { Link } from "react-router-dom";
import { API_BASE_URL } from "../services/api.js";

const PLACEHOLDER =
  "https://placehold.co/340x510/1a1d26/6b7280?text=No+Poster";

/**
 * Netflix-style card: poster, title, genre, duration.
 * Poster URL uses public GET /movies/:id/poster when hasPoster is true.
 */
export default function MovieCard({ movie }) {
  const id = movie._id;
  const posterSrc =
    movie.hasPoster === true ? `${API_BASE_URL}/movies/${id}/poster` : PLACEHOLDER;

  const genreText = Array.isArray(movie.genre) ? movie.genre.join(", ") : movie.genre || "—";
  const durationText =
    movie.duration != null ? `${movie.duration} min` : "—";

  return (
    <Link to={`/movies/${id}/shows`} className="movie-card">
      <div className="movie-card__poster-wrap">
        <img
          src={posterSrc}
          alt={movie.title || "Movie poster"}
          className="movie-card__poster"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = PLACEHOLDER;
          }}
        />
      </div>
      <div className="movie-card__body">
        <h3 className="movie-card__title">{movie.title}</h3>
        <p className="movie-card__meta">{genreText}</p>
        <p className="movie-card__meta">{durationText}</p>
      </div>
    </Link>
  );
}
