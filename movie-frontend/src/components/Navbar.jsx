import React from 'react';
import { Film } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-slate-800/80 backdrop-blur-md sticky top-0 z-50 shadow-lg border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-lg">
              <Film className="h-6 w-6 text-white" />
            </div>
            <Link to="/" className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
              CineStream
            </Link>
          </div>
          <div>
            <Link to="/add" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center shadow-blue-500/50 hover:shadow-blue-500/70 transition-all duration-300">
              + Add Movie
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
