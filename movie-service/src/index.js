const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 4001;

// Dummy data
let movies = [
  { id: 1, title: "Inception", price: 10 },
  { id: 2, title: "Interstellar", price: 12 }
];

// Get all movies
app.get("/movies", (req, res) => {
  res.json(movies);
});

// Get movie by ID
app.get("/movies/:id", (req, res) => {
  const movie = movies.find(m => m.id == req.params.id);
  res.json(movie);
});

app.listen(PORT, () => console.log(`Movie Service running on ${PORT}`));