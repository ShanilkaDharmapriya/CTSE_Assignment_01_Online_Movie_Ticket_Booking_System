import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../services/api';

const MovieForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: '',
    duration: '',
    ticketPrice: '',
  });

  useEffect(() => {
    if (isEdit) {
      fetchMovie();
    }
  }, [id]);

  const fetchMovie = async () => {
    try {
      const response = await api.get(`/movies/${id}`);
      setFormData(response.data);
    } catch (err) {
      setError('Failed to fetch movie details.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      ...formData,
      duration: parseInt(formData.duration, 10),
      ticketPrice: parseFloat(formData.ticketPrice),
    };

    try {
      if (isEdit) {
        await api.put(`/movies/${id}`, payload);
      } else {
        await api.post('/movies', payload);
      }
      navigate('/');
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && typeof err.response.data === 'object' && !err.response.data.error) {
        // Validation errors form Spring
        const errorMessages = Object.entries(err.response.data)
                                    .map(([field, msg]) => `${field}: ${msg}`)
                                    .join(' | ');
        setError(errorMessages);
      } else {
        setError('Failed to save movie. Check your input or connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/" className="inline-flex items-center space-x-2 text-slate-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Movies</span>
      </Link>

      <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700 shadow-xl overflow-hidden">
        <div className="bg-slate-900/50 p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">
            {isEdit ? 'Update Movie' : 'Add New Movie'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-900/30 border border-red-500/50 rounded-xl text-red-200 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Movie Title</label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="e.g. Inception"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              placeholder="A brief summary of the movie..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Genre</label>
              <input
                type="text"
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="e.g. Sci-Fi, Action"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Duration (mins)</label>
              <input
                type="number"
                name="duration"
                min="1"
                required
                value={formData.duration}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="120"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Ticket Price ($)</label>
            <input
              type="number"
              name="ticketPrice"
              step="0.01"
              min="0.01"
              required
              value={formData.ticketPrice}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="12.99"
            />
          </div>

          <div className="pt-4 flex justify-end space-x-4">
            <Link to="/" className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-all shadow-md hover:shadow-lg px-6">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all shadow-md hover:shadow-lg flex items-center px-6 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="h-5 w-5 mr-2" />
              )}
              {isEdit ? 'Update Movie' : 'Save Movie'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MovieForm;
