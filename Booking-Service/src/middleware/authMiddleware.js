const axios = require("axios");

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://localhost:5000";

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized: missing Authorization header" });
  }

  try {
    const response = await axios.get(`${AUTH_SERVICE_URL}/auth/validate`, {
      headers: { Authorization: authHeader },
      timeout: 5000,
    });

    const user = response.data?.data?.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.auth = { user };
    return next();
  } catch (error) {
    if (error.response) {
      return res
        .status(error.response.status)
        .json(error.response.data || { message: "Unauthorized" });
    }
    return res.status(503).json({ message: "Auth service unavailable" });
  }
}

module.exports = { requireAuth };
