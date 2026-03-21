const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 4002;

// Dummy data (replace with DB later)
let shows = [
  {
    id: 1,
    movieId: 1,
    theater: "Hall A",
    showTime: "10:00 AM",
    availableSeats: 50
  },
  {
    id: 2,
    movieId: 1,
    theater: "Hall B",
    showTime: "3:00 PM",
    availableSeats: 30
  }
];


// 🎯 1. Get all shows
app.get("/shows", (req, res) => {
  const movieId = req.query.movieId;

  if (movieId) {
    const filtered = shows.filter(s => s.movieId == movieId);
    return res.json(filtered);
  }

  res.json(shows);
});


// 🎯 2. Get show by ID
app.get("/shows/:id", (req, res) => {
  const show = shows.find(s => s.id == req.params.id);

  if (!show) {
    return res.status(404).json({ error: "Show not found" });
  }

  res.json(show);
});


// 🎯 3. Create new show
app.post("/shows", async (req, res) => {
  const { movieId, theater, showTime, availableSeats } = req.body;

  try {
    // 🔗 Validate movie exists (inter-service communication)
    const movie = await axios.get(`http://localhost:4001/movies/${movieId}`);

    if (!movie.data) {
      return res.status(400).json({ error: "Invalid movie ID" });
    }

    const newShow = {
      id: shows.length + 1,
      movieId,
      theater,
      showTime,
      availableSeats
    };

    shows.push(newShow);

    res.status(201).json(newShow);

  } catch (err) {
    res.status(500).json({ error: "Movie validation failed" });
  }
});


// 🎯 4. Update seat availability (used after booking/payment)
app.put("/shows/:id/seats", (req, res) => {
  const { seatsBooked } = req.body;

  const show = shows.find(s => s.id == req.params.id);

  if (!show) {
    return res.status(404).json({ error: "Show not found" });
  }

  if (show.availableSeats < seatsBooked) {
    return res.status(400).json({ error: "Not enough seats" });
  }

  show.availableSeats -= seatsBooked;

  res.json({
    message: "Seats updated",
    show
  });
});


app.listen(PORT, () => {
  console.log(`Show Service running on port ${PORT}`);
});