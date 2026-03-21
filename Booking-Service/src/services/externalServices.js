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

  // Ask show-service to reserve seats (before payment)

async function reserveShowSeats(showId, seats) {
  const showServiceBaseUrl = getRequiredEnvValue("SHOW_SERVICE_URL");
  const response = await axios.post(`${showServiceBaseUrl}/shows/${showId}/reserve-seats`, {
    seats,
  });
  return response.data;
}

  // Ask show-service to release seats (cancel / payment failure)

async function freeShowSeats(showId, seatsToFree) {
  const showServiceBaseUrl = getRequiredEnvValue("SHOW_SERVICE_URL");
  const response = await axios.post(`${showServiceBaseUrl}/shows/${showId}/free-seats`, {
    seats: seatsToFree,
  });
  return response.data;
}

  // Ask payment-service to process booking payment before booking confirmation

async function createPayment(payload, authHeader) {
  const paymentServiceBaseUrl = getRequiredEnvValue("PAYMENT_SERVICE_URL");
  const headers = {};
  if (authHeader) {
    headers.Authorization = authHeader;
  }
  const response = await axios.post(`${paymentServiceBaseUrl}/payments`, payload, { headers });
  return response.data;
}

  // Ask payment-service to refund a payment when booking is cancelled

async function refundPayment(paymentId, authHeader) {
  const paymentServiceBaseUrl = getRequiredEnvValue("PAYMENT_SERVICE_URL");
  const headers = {};
  if (authHeader) {
    headers.Authorization = authHeader;
  }
  const response = await axios.post(`${paymentServiceBaseUrl}/payments/${paymentId}/refund`, {}, { headers });
  return response.data;
}

module.exports = {
  getMovieById,
  getShowById,
  reserveShowSeats,
  freeShowSeats,
  createPayment,
  refundPayment,
};
