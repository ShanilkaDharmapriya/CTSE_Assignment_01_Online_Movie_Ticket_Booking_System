import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getShowById } from "../../services/showService";

function ShowDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getShowById(id)
      .then((res) => setShow(res.data))
      .catch(() => setError("Failed to load show details."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Loading show details...</p>;
  if (error)   return <p style={{ color: "red" }}>{error}</p>;
  if (!show)   return <p>Show not found.</p>;

  const isSoldOut = show.availableSeats === 0;
  const occupancyPercent = Math.round(
    ((show.totalSeats - show.availableSeats) / show.totalSeats) * 100
  );

  return (
    <div style={{ maxWidth: "600px" }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: "16px" }}>
        ← Back
      </button>

      <h2>Show Details</h2>

      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
        <tbody>
          <tr>
            <th>Movie</th>
            <td>{show.movieTitle}</td>
          </tr>
          <tr>
            <th>Theater</th>
            <td>{show.theater}</td>
          </tr>
          <tr>
            <th>Date</th>
            <td>{new Date(show.date).toLocaleDateString()}</td>
          </tr>
          <tr>
            <th>Show Time</th>
            <td>{show.showTime}</td>
          </tr>
          <tr>
            <th>Total Seats</th>
            <td>{show.totalSeats}</td>
          </tr>
          <tr>
            <th>Available Seats</th>
            <td>
              {isSoldOut ? (
                <span style={{ color: "red", fontWeight: "bold" }}>Sold Out</span>
              ) : (
                <span style={{ color: "green" }}>{show.availableSeats}</span>
              )}
            </td>
          </tr>
          <tr>
            <th>Occupancy</th>
            <td>{occupancyPercent}% filled</td>
          </tr>
          <tr>
            <th>Price per Seat</th>
            <td>LKR {show.pricePerSeat}</td>
          </tr>
          <tr>
            <th>Status</th>
            <td>
              <span style={{ color: show.status === "active" ? "green" : "red" }}>
                {show.status}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      {!isSoldOut && show.status === "active" && (
        <button
          style={{ marginTop: "20px", padding: "10px 24px", fontSize: "16px" }}
          onClick={() => navigate(`/bookings/new?showId=${show._id}`)}
        >
          Book Tickets
        </button>
      )}
    </div>
  );
}

export default ShowDetail;
