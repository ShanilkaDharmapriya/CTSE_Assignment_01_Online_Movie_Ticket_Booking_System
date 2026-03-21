const axios = require("axios");

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

async function getMovieById(movieId) {
  const baseUrl = requireEnv("MOVIE_SERVICE_URL");
  const response = await axios.get(`${baseUrl}/movies/${movieId}`);
  return response.data;
}

async function getShowById(showId) {
  const baseUrl = requireEnv("SHOW_SERVICE_URL");
  const response = await axios.get(`${baseUrl}/shows/${showId}`);
  return response.data;
}

async function createPayment(payload) {
  const baseUrl = requireEnv("PAYMENT_SERVICE_URL");
  const response = await axios.post(`${baseUrl}/payments`, payload);
  return response.data;
}

module.exports = {
  getMovieById,
  getShowById,
  createPayment
};
