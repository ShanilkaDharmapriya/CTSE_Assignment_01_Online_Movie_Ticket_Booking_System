const axios = require("axios");

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://auth-service:5000";

/**
 * Authenticate request using JWT token passed from gateway
 * Validates token and sets req.auth = { user } on success
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
      req.auth = { user: response.data.data.user };
    }
  } catch (error) {
    // Token validation failed, continue
  }

  next();
}

/**
 * Extract Bearer token from Authorization header
 */
function extractBearerToken(req) {
  const header = req.headers.authorization || req.headers.Authorization;
  if (!header || typeof header !== "string") return null;
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token.trim();
}

/**
 * Require authentication
 */
function requireAuth(req, res, next) {
  if (!req.auth || !req.auth.user) {
    return res.status(401).json({
      message: "Unauthorized - valid JWT token required",
      code: "UNAUTHORIZED",
    });
  }
  next();
}

/**
 * Require admin role
 */
function requireAdmin(req, res, next) {
  if (!req.auth || !req.auth.user) {
    return res.status(401).json({
      message: "Unauthorized - valid JWT token required",
      code: "UNAUTHORIZED",
    });
  }

  if (req.auth.user.role !== "ADMIN") {
    return res.status(403).json({
      message: "Forbidden - admin role required",
      code: "FORBIDDEN",
    });
  }

  next();
}

module.exports = {
  authenticateJWT,
  requireAuth,
  requireAdmin,
  extractBearerToken,
};
