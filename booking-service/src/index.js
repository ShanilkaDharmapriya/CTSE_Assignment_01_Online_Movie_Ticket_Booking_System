const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 4003;

let bookings = [];

app.post("/book", async (req, res) => {
  try {
    const { movieId, seats } = req.body;

    // Call Payment Service
    const payment = await axios.post("http://localhost:4004/pay", {
      movieId,
      seats
    });

    const booking = {
      id: bookings.length + 1,
      movieId,
      seats,
      paymentStatus: payment.data.status
    };

    bookings.push(booking);

    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: "Booking failed" });
  }
});
app.listen(PORT, () => console.log(`Booking Service running on ${PORT}`));
