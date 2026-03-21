/**
 * Auth microservice base URL (must match where auth-service listens).
 * Override with env: AUTH_SERVICE_URL=http://localhost:5001
 */
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://localhost:5001";

/** True when axios could not reach the service (down, wrong port, network). */
function isAuthUnreachable(error) {
  return !error.response;
}

module.exports = { AUTH_SERVICE_URL, isAuthUnreachable };
