import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getAllShows } from "../../services/showService";

function ShowList() {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const movieId = searchParams.get("movieId");
  const date    = searchParams.get("date");

  useEffect(() => {
    const params = {};
    if (movieId) params.movieId = movieId;
    if (date)    params.date    = date;

    getAllShows(params)
      .then((res) => setShows(res.data))
      .catch(() => setError("Failed to load shows. Please try again."))
      .finally(() => setLoading(false));
  }, [movieId, date]);

  if (loading) return <p>Loading shows...</p>;
  if (error)   return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2>
        {movieId ? `Shows for Movie #${movieId}` : "All Shows"}
      </h2>

      {shows.length === 0 ? (
        <p>No shows available.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead style={{ backgroundColor: "#f0f0f0" }}>
            <tr>
              <th>Movie</th>
              <th>Theater</th>
              <th>Date</th>
              <th>Time</th>
              <th>Available Seats</th>
              <th>Price (LKR)</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {shows.map((show) => (
              <tr key={show._id}>
                <td>{show.movieTitle}</td>
                <td>{show.theater}</td>
                <td>{new Date(show.date).toLocaleDateString()}</td>
                <td>{show.showTime}</td>
                <td>{show.availableSeats} / {show.totalSeats}</td>
                <td>{show.pricePerSeat}</td>
                <td>
                  <span style={{ color: show.status === "active" ? "green" : "red" }}>
                    {show.status}
                  </span>
                </td>
                <td>
                  <button onClick={() => navigate(`/shows/${show._id}`)}>
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ShowList;
