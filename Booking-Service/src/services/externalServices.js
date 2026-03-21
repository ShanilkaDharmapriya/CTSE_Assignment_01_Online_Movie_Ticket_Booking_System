const axios = require("axios");

function getRequiredEnvValue(name) {
  const envValue = process.env[name];
  if (!envValue) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return envValue;
}

  // Ask movie-service for movie details to confirm movie is valid

async function getMovieById(movieId) {
  const movieServiceBaseUrl = getRequiredEnvValue("MOVIE_SERVICE_URL");
  const response = await axios.get(`${movieServiceBaseUrl}/movies/${movieId}`);
  return response.data;
}

 // Ask show-service for show details such as available seats and price

async function getShowById(showId) {
  const showServiceBaseUrl = getRequiredEnvValue("SHOW_SERVICE_URL");
  const response = await axios.get(`${showServiceBaseUrl}/shows/${showId}`);
  return response.data;
}

  // Ask payment-service to process booking payment before booking confirmation

async function createPayment(payload) {
  const paymentServiceBaseUrl = getRequiredEnvValue("PAYMENT_SERVICE_URL");
  const response = await axios.post(`${paymentServiceBaseUrl}/payments`, payload);
  return response.data;
}

async function reduceShowSeats(showId, seats) {
  const showServiceBaseUrl = getRequiredEnvValue("SHOW_SERVICE_URL");
  const response = await axios.put(`${showServiceBaseUrl}/shows/${showId}/seats/reduce`, { seats });
  return response.data;
}

module.exports = {
  getMovieById,
  getShowById,
  createPayment,
  reduceShowSeats
};
