const axios = require("axios");

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://auth-service:5000";

/**
 * Validate JWT via Auth Service and attach user to req.user (and req.auth for compatibility).
 */
async function authenticateJWT(req, res, next) {
  const token = extractBearerToken(req);

  if (!token) {
    return next();
  }

  try {
    const response = await axios.get(`${AUTH_SERVICE_URL}/auth/validate`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.data.success && response.data.data.valid) {
      const user = response.data.data.user;
      req.user = user;
      req.auth = { user };
    }
  } catch (error) {
    // Invalid or expired token — continue without req.user
  }

  next();
}

function extractBearerToken(req) {
  const header = req.headers.authorization || req.headers.Authorization;
  if (!header || typeof header !== "string") return null;
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token.trim();
}

function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      message: "Unauthorized - valid JWT token required",
      code: "UNAUTHORIZED",
    });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin only" });
  }
  next();
}

module.exports = {
  authenticateJWT,
  requireAuth,
  requireAdmin,
  extractBearerToken,
};
