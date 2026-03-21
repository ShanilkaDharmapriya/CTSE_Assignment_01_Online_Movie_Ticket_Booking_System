import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { movieService } from '../services/api';
import MovieCard from '../components/MovieCard';

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const data = await movieService.getMovies();
        setMovies(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <div className="text-gray-500 font-medium tracking-widest uppercase text-xs">Loading Experience...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-6">
        <div className="glass-card p-10 text-center max-w-md">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Connection Error</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary">Try Again</button>
        </div>
      </div>
    );
  }

  const featuredMovie = movies[0];
  const otherMovies = movies.slice(1);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      {featuredMovie && (
        <section className="relative h-[85vh] w-full overflow-hidden flex items-end pb-20">
          <div className="absolute inset-0">
            <img 
              src={featuredMovie.poster} 
              alt="Featured" 
              className="w-full h-full object-cover grayscale-[0.2]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-transparent to-transparent opacity-80" />
          </div>
          
          <div className="relative max-w-7xl mx-auto px-6 w-full animate-fade-in">
            <div className="inline-block bg-red-600 px-3 py-1 rounded text-[10px] font-black tracking-widest uppercase mb-6 shadow-xl shadow-red-600/30">
              Featured Movie
            </div>
            <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter leading-none max-w-4xl">
              {featuredMovie.title.toUpperCase()}
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mb-10 leading-relaxed font-light">
              {featuredMovie.description}
            </p>
            <div className="flex gap-4">
              <Link to={`/movie/${featuredMovie._id}`} className="btn-primary flex items-center gap-2">
                <span>Book Now</span>
                <span className="text-xl">🎟️</span>
              </Link>
              <Link to={`/movie/${featuredMovie._id}`} className="btn-secondary">
                View Details
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Movie Grid Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl font-black tracking-tight mb-2">NOW SHOWING</h2>
            <div className="h-1 w-12 bg-red-600 rounded-full"></div>
          </div>
          <p className="text-gray-500 font-medium text-sm">Showing {movies.length} exclusive titles</p>
        </div>

        {movies.length === 0 ? (
          <div className="glass-card p-20 text-center">
            <p className="text-gray-400 text-lg italic">No movies available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {movies.map((movie) => (
              <Link key={movie._id} to={`/movie/${movie._id}`} className="animate-fade-in">
                <MovieCard movie={movie} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
