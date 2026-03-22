const axios = require("axios");
const { AUTH_SERVICE_URL } = require("../config/config");

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
};
