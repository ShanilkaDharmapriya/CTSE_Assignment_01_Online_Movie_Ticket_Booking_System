const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 4004;

app.post("/pay", (req, res) => {
  const { movieId, seats } = req.body;

  // Dummy calculation
  const amount = seats * 10;

  res.json({
    status: "SUCCESS",
    amount
  });
});

app.listen(PORT, () => console.log(`Payment Service running on ${PORT}`));