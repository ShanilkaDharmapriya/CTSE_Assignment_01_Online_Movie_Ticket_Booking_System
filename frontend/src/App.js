import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import MovieList from "./pages/movie-service/MovieList";
import MovieDetail from "./pages/movie-service/MovieDetail";
import ShowList from "./pages/show-service/ShowList";
import ShowDetail from "./pages/show-service/ShowDetail";

function App() {
  return (
    <Router>
      <Navbar />
      <div style={{ padding: "20px" }}>
        <Routes>
          {/* Movie Service routes */}
          <Route path="/movies" element={<MovieList />} />
          <Route path="/movies/:id" element={<MovieDetail />} />

          {/* Show Service routes */}
          <Route path="/shows" element={<ShowList />} />
          <Route path="/shows/:id" element={<ShowDetail />} />

          {/* Default */}
          <Route path="/" element={<MovieList />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
