import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-6 relative overflow-hidden py-20">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/5 blur-[120px] rounded-full" />
      
      <div className="w-full max-w-lg relative z-10 animate-fade-in">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-3 mb-8 group">
            <div className="bg-red-600 p-3 rounded-2xl group-hover:rotate-12 transition-transform duration-300 shadow-xl shadow-red-600/30">
              <span className="text-2xl">🎬</span>
            </div>
            <span className="text-3xl font-black tracking-tighter text-white">MOVIE<span className="text-red-600">BOOK</span></span>
          </Link>
          <h1 className="text-4xl font-black tracking-tight text-white mb-2 uppercase italic">Join the Club</h1>
          <p className="text-gray-500 font-medium tracking-wide">Create your cinematic account today</p>
        </div>

        <div className="glass-card p-10 bg-white/[0.02] shadow-2xl">
          {error && (
            <div className="bg-red-600/10 border border-red-600/20 text-red-500 p-4 rounded-xl mb-8 text-sm font-bold animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2 px-1">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Cinemaniac"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2 px-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="you@cinema.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2 px-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2 px-1">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-sm tracking-widest uppercase font-black flex items-center justify-center gap-3 mt-4"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Register Now</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-red-600 font-bold hover:text-red-500 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
