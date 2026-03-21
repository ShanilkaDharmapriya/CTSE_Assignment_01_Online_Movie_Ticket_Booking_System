import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-black/80 backdrop-blur-lg border-b border-white/10 py-3' : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center group">
          <div className="bg-red-600 p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-red-600/20">
            <span className="text-xl">🎬</span>
          </div>
          <span className="ml-3 text-2xl font-bold tracking-tighter text-white">
            MOVIE<span className="text-red-600">BOOK</span>
          </span>
        </Link>

        <div className="flex items-center gap-8">
          {isAuthenticated ? (
            <>
              <Link
                to="/booking-history"
                className="text-gray-300 hover:text-white font-medium transition-colors"
              >
                My Bookings
              </Link>
              <div className="h-8 w-[1px] bg-white/10 hidden md:block"></div>
              <div className="hidden md:flex flex-col items-end">
                <span className="text-gray-400 text-xs uppercase tracking-widest leading-none mb-1">Authenticated as</span>
                <span className="text-white font-bold leading-none">{user?.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-5 py-2 bg-white/5 hover:bg-red-600/10 hover:text-red-500 border border-white/10 rounded-full font-bold transition-all"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="px-6 py-2 text-white font-bold hover:text-red-600 transition-colors">
                Sign In
              </Link>
              <Link to="/register" className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-full font-bold shadow-lg shadow-red-900/20 transition-all active:scale-95">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
