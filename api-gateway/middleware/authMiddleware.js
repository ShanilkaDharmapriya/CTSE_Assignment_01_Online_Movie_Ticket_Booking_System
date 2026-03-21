const axios = require("axios");

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://auth-service:5000";

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
 * Authenticate request using JWT token
 * Sets req.auth = { user: { id, email, role } } on success
 * Passes error to next middleware on failure
 */
async function authenticateJWT(req, res, next) {
  const token = extractBearerToken(req);

  // Token is optional for this middleware; caller decides if required
  if (!token) {
    return next();
  }

  try {
    const response = await axios.get(`${AUTH_SERVICE_URL}/auth/validate`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.data.success && response.data.data.valid) {
      req.auth = { user: response.data.data.user };
      // Forward user context as headers for downstream services
      req.headers["x-user-id"] = response.data.data.user.id;
      req.headers["x-user-role"] = response.data.data.user.role;
      req.headers["x-user-email"] = response.data.data.user.email;
    }
  } catch (error) {
    // Token validation failed, continue without auth context
    // (routes can decide if auth is required)
  }

  next();
}

/**
 * Require authentication - fail if no valid token
 */
function requireAuth(req, res, next) {
  if (!req.auth || !req.auth.user) {
    return res.status(401).json({
      success: false,
      error: { message: "Unauthorized - valid JWT token required", code: "UNAUTHORIZED" },
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
      success: false,
      error: { message: "Unauthorized - valid JWT token required", code: "UNAUTHORIZED" },
    });
  }

  if (req.auth.user.role !== "ADMIN") {
    return res.status(403).json({
      success: false,
      error: { message: "Forbidden - admin role required", code: "FORBIDDEN" },
    });
  }

  next();
}

/**
 * Require specific role
 */
function requireRole(role) {
  return (req, res, next) => {
    if (!req.auth || !req.auth.user) {
      return res.status(401).json({
        success: false,
        error: { message: "Unauthorized - valid JWT token required", code: "UNAUTHORIZED" },
      });
    }

    if (req.auth.user.role !== role) {
      return res.status(403).json({
        success: false,
        error: { message: `Forbidden - ${role} role required`, code: "FORBIDDEN" },
      });
    }

    next();
  };
}

module.exports = {
  extractBearerToken,
  authenticateJWT,
  requireAuth,
  requireAdmin,
  requireRole,
};
