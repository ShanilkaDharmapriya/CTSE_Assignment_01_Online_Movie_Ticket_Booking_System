import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import MovieList from './components/MovieList';
import MovieForm from './components/MovieForm';

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Routes>
            <Route path="/" element={<MovieList />} />
            <Route path="/add" element={<MovieForm />} />
            <Route path="/edit/:id" element={<MovieForm />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
