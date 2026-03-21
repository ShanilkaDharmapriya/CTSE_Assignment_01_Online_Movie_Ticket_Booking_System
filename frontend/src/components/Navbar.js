import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav style={{ backgroundColor: "#222", padding: "12px 24px", display: "flex", gap: "24px" }}>
      <Link to="/" style={{ color: "#fff", textDecoration: "none", fontWeight: "bold" }}>
        🎬 Movie Booking
      </Link>
      <Link to="/movies" style={{ color: "#ccc", textDecoration: "none" }}>
        Movies
      </Link>
      <Link to="/shows" style={{ color: "#ccc", textDecoration: "none" }}>
        Shows
      </Link>
      <Link to="/bookings" style={{ color: "#ccc", textDecoration: "none" }}>
        My Bookings
      </Link>
    </nav>
  );
}

export default Navbar;
