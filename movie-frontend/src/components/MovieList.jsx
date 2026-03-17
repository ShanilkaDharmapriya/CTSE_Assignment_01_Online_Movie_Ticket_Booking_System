import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2, Clock, Ticket } from 'lucide-react';
import api from '../services/api';

const MovieList = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const response = await api.get('/movies');
      setMovies(response.data);
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteMovie = async (id) => {
    if (window.confirm('Are you sure you want to delete this movie?')) {
      try {
        await api.delete(`/movies/${id}`);
        fetchMovies();
      } catch (error) {
        console.error('Error deleting movie:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
          Now Showing
        </h1>
      </div>

      {movies.length === 0 ? (
        <div className="text-center py-20 bg-slate-800/50 rounded-2xl border border-slate-700 backdrop-blur-sm">
          <p className="text-slate-400 text-lg mb-4">No movies available.</p>
          <Link to="/add" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 inline-flex items-center transition-all shadow-md hover:shadow-lg">
            Add your first movie
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {movies.map((movie) => (
            <div key={movie.movieId} className="group bg-slate-800/80 rounded-2xl border border-slate-700 overflow-hidden hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10 backdrop-blur-sm relative">
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2 z-10 w-full justify-end bg-gradient-to-b from-slate-900/80 to-transparent">
                <Link to={`/edit/${movie.movieId}`} className="p-2 bg-blue-500 hover:bg-blue-600 rounded-full text-white shadow-lg transition-colors">
                  <Pencil className="h-4 w-4" />
                </Link>
                <button onClick={() => deleteMovie(movie.movieId)} className="p-2 bg-red-500 hover:bg-red-600 rounded-full text-white shadow-lg transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors drop-shadow-sm">{movie.title}</h2>
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium border border-blue-500/30">
                    {movie.genre}
                  </span>
                </div>
                
                <p className="text-slate-400 mb-6 line-clamp-3 min-h-[4.5rem]">
                  {movie.description}
                </p>
                
                <div className="flex items-center justify-between text-sm text-slate-300 pt-4 border-t border-slate-700/50">
                  <div className="flex items-center space-x-2 bg-slate-900/50 px-3 py-1.5 rounded-lg">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span>{movie.duration} mins</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-indigo-900/30 px-3 py-1.5 rounded-lg border border-indigo-500/20">
                    <Ticket className="h-4 w-4 text-indigo-400" />
                    <span className="font-semibold text-indigo-300">${movie.ticketPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MovieList;
