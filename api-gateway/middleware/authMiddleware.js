const axios = require("axios");
const { AUTH_SERVICE_URL, isAuthUnreachable } = require("../config/authService");

function extractBearerToken(req) {
  const header = req.headers.authorization || req.headers.Authorization;
  if (!header || typeof header !== "string") return null;
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token.trim();
}

/**
 * Validate JWT and set req.user (same shape as token user from Auth Service).
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
      req.headers["x-user-id"] = user.id;
      req.headers["x-user-role"] = user.role;
      req.headers["x-user-email"] = user.email;
    }
  } catch (error) {
    if (isAuthUnreachable(error)) {
      return res.status(503).json({
        success: false,
        error: { message: "Auth service unavailable", code: "AUTH_SERVICE_DOWN" },
      });
    }
    // Auth reachable but token invalid / error — continue without user
  }

  next();
}

function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { message: "Unauthorized - valid JWT token required", code: "UNAUTHORIZED" },
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

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: "Unauthorized - valid JWT token required", code: "UNAUTHORIZED" },
      });
    }

    if (req.user.role !== role) {
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
