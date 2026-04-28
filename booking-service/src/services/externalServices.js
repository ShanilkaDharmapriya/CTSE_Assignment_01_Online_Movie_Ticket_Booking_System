const axios = require("axios");
const {
  MOVIE_SERVICE_URL,
  SHOW_SERVICE_URL,
  PAYMENT_SERVICE_URL,
} = require("../../config/config");

async function getMovieById(movieId) {
  const response = await axios.get(`${MOVIE_SERVICE_URL.replace(/\/+$/, "")}/movies/${movieId}`);
  return response.data;
}

async function getShowById(showId) {
  const response = await axios.get(`${SHOW_SERVICE_URL.replace(/\/+$/, "")}/shows/${showId}`);
  return response.data;
}

async function createPayment(payload) {
  const response = await axios.post(
    `${PAYMENT_SERVICE_URL.replace(/\/+$/, "")}/payments`,
    payload
  );
  return response.data;
}

module.exports = {
  getMovieById,
  getShowById,
  createPayment,
};
