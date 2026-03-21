import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { movieService, showService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function MovieDetail() {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const movieData = await movieService.getMovieById(movieId);
        setMovie(movieData);

        const showsData = await showService.getShowsByMovieId(movieId);
        setShows(showsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [movieId]);

  const handleSelectShow = (showId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(`/booking/${movieId}/${showId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <div className="text-gray-500 font-medium tracking-widest uppercase text-xs">Fetching Details...</div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-6">
        <div className="glass-card p-10 text-center max-w-md">
          <div className="text-5xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold mb-2">Movie Not Found</h2>
          <p className="text-gray-400 mb-6">{error || 'The requested movie could not be loaded.'}</p>
          <button onClick={() => navigate('/')} className="btn-primary">Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-20">
      {/* Backdrop Section */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        <img 
          src={movie.poster} 
          alt="Backdrop" 
          className="w-full h-full object-cover blur-sm scale-105 opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-64 relative z-10">
        <button
          onClick={() => navigate('/')}
          className="mb-8 flex items-center gap-2 text-white/60 hover:text-white transition-colors group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          <span className="font-medium tracking-wide text-sm uppercase">Back to Collection</span>
        </button>

        <div className="flex flex-col md:flex-row gap-12">
          {/* Poster Column */}
          <div className="w-full md:w-80 flex-shrink-0 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="glass-card shadow-2xl shadow-black/50 aspect-[2/3]">
              {movie.poster ? (
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-stone-900 flex items-center justify-center text-gray-500">
                  <span>No Image</span>
                </div>
              )}
            </div>
          </div>

          {/* Info Column */}
          <div className="flex-grow animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-red-600 px-3 py-1 rounded text-[10px] font-black tracking-widest uppercase">
                {movie.genre?.split('/')[0].trim()}
              </span>
              <span className="text-yellow-500 font-bold flex items-center gap-1">
                <span>★</span> {movie.rating}
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter leading-none">
              {movie.title.toUpperCase()}
            </h1>

            <div className="flex flex-wrap gap-6 mb-10 text-gray-400 font-medium">
              <div className="flex items-center gap-2">
                <span className="text-gray-600 uppercase text-[10px] tracking-widest">Duration</span>
                <span className="text-white">{movie.duration} min</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 uppercase text-[10px] tracking-widest">Genre</span>
                <span className="text-white">{movie.genre}</span>
              </div>
            </div>

            <div className="mb-12">
              <h3 className="text-gray-600 uppercase text-xs font-black tracking-[0.2em] mb-4">Synopsis</h3>
              <p className="text-gray-300 text-lg leading-relaxed max-w-3xl font-light">
                {movie.description || 'No description available for this cinematic masterpiece.'}
              </p>
            </div>

            {/* Showtimes Section */}
            <div className="pt-8 border-t border-white/10">
              <h2 className="text-3xl font-black tracking-tight mb-8">SELECT YOUR EXPERIENCE</h2>
              
              {shows.length === 0 ? (
                <div className="glass-card p-10 text-center border-dashed border-white/5">
                  <p className="text-gray-500 italic">No scheduled shows for this title at the moment.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {shows.map((show, idx) => (
                    <div
                      key={show._id}
                      className="glass-card p-6 flex items-center justify-between hover:bg-white/10 transition-all group animate-fade-in"
                      style={{ animationDelay: `${0.3 + idx * 0.1}s` }}
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-gray-500 text-[10px] font-black tracking-widest uppercase mb-1">Theater</span>
                        <span className="text-xl font-bold text-white group-hover:text-red-500 transition-colors uppercase italic">{show.theater}</span>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-gray-400 text-sm">{new Date(show.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                          <span className="h-1 w-1 rounded-full bg-gray-600"></span>
                          <span className="text-red-500 font-bold text-sm tracking-widest">{show.time}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-3">
                        <div className="text-right">
                          <span className="text-gray-500 text-[10px] font-black tracking-widest uppercase block">Price</span>
                          <span className="text-2xl font-black text-white italic">Rs. {show.price}</span>
                        </div>
                        <button
                          onClick={() => handleSelectShow(show._id)}
                          disabled={show.availableSeats === 0}
                          className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-800 disabled:text-gray-600 rounded-lg text-xs font-black tracking-widest uppercase transition-all shadow-lg active:scale-95"
                        >
                          {show.availableSeats === 0 ? 'Sold Out' : (isAuthenticated ? 'Book Now' : 'Sign In')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
