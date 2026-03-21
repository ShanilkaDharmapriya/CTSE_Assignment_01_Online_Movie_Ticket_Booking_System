// 
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

// Aggregator: Get movie + shows
app.get("/movies/:id/details", async (req, res) => {
  try {
    const movieId = req.params.id;

    const movie = await axios.get(`http://localhost:4001/movies/${movieId}`);
    const shows = await axios.get(`http://localhost:4002/shows?movieId=${movieId}`);

    res.json({
      movie: movie.data,
      shows: shows.data
    });
  } catch (err) {
    res.status(500).json({ error: "Error fetching data" });
  }
});

app.listen(PORT, () => console.log(`API Gateway running on ${PORT}`));