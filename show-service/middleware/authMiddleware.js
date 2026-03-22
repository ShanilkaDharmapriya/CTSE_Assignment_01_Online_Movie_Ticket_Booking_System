const axios = require("axios");

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://localhost:5000";
const INTERNAL_SERVICE_KEY = process.env.INTERNAL_SERVICE_KEY || "ctse-internal-service-key-2026";

const requireAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized: missing Authorization header" });
  }

  try {
    const response = await axios.get(`${AUTH_SERVICE_URL}/auth/validate`, {
      headers: { Authorization: authHeader },
      timeout: 5000,
    });

    const role = response.data?.data?.user?.role;
    if (role !== "admin") {
      return res.status(403).json({ message: "Forbidden: admin role required" });
    }

    req.auth = response.data?.data || null;
    return next();
  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json(
        error.response.data || { message: "Unauthorized" }
      );
    }

    return res.status(503).json({ message: "Auth service unavailable" });
  }
};

module.exports = {
  requireAdmin,
  requireAdminOrService,
};

// Allows internal microservice calls (via X-Service-Key header) OR admin JWT.
async function requireAdminOrService(req, res, next) {
  const serviceKey = req.headers["x-service-key"];
  if (INTERNAL_SERVICE_KEY && serviceKey === INTERNAL_SERVICE_KEY) {
    return next();
  }
  return requireAdmin(req, res, next);
}
