const axios = require("axios");

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://localhost:5000";
const INTERNAL_SERVICE_KEY = process.env.INTERNAL_SERVICE_KEY || "ctse-internal-service-key-2026";

async function validateBearerAndAttachUser(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader) {
    const err = new Error("Unauthorized: missing Authorization header");
    err.statusCode = 401;
    throw err;
  }

  const response = await axios.get(`${AUTH_SERVICE_URL}/auth/validate`, {
    headers: { Authorization: authHeader },
    timeout: 5000,
  });

  const user = response.data?.data?.user;
  if (!user) {
    const err = new Error("Unauthorized");
    err.statusCode = 401;
    throw err;
  }

  req.auth = { user };
  return user;
}

const requireAuth = async (req, res, next) => {
  try {
    await validateBearerAndAttachUser(req);
    return next();
  } catch (error) {
    if (error.response) {
      return res
        .status(error.response.status)
        .json(error.response.data || { message: "Unauthorized" });
    }
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(503).json({ message: "Auth service unavailable" });
  }
};

const requireAdmin = async (req, res, next) => {
  try {
    await validateBearerAndAttachUser(req);
    const role = String(req.auth?.user?.role || "").toLowerCase();
    if (role !== "admin") {
      return res.status(403).json({ message: "Forbidden: admin role required" });
    }
    return next();
  } catch (error) {
    if (error.response) {
      return res
        .status(error.response.status)
        .json(error.response.data || { message: "Unauthorized" });
    }
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(503).json({ message: "Auth service unavailable" });
  }
};

async function requireAdminOrService(req, res, next) {
  const serviceKey = req.headers["x-service-key"];
  if (INTERNAL_SERVICE_KEY && serviceKey === INTERNAL_SERVICE_KEY) {
    return next();
  }
  return requireAdmin(req, res, next);
}

const requireServiceKey = (req, res, next) => {
  const serviceKey = req.headers["x-service-key"];
  if (!INTERNAL_SERVICE_KEY || serviceKey !== INTERNAL_SERVICE_KEY) {
    return res.status(401).json({ message: "Unauthorized: invalid service key" });
  }
  return next();
};

/**
 * If Authorization is present, validate JWT and attach req.auth; otherwise req.auth stays unset.
 * Used for public endpoints that need user context when logged in (e.g. seat isMine).
 */
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader) {
    return next();
  }
  try {
    await validateBearerAndAttachUser(req);
    return next();
  } catch (error) {
    if (error.response) {
      return res
        .status(error.response.status)
        .json(error.response.data || { message: "Unauthorized" });
    }
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(503).json({ message: "Auth service unavailable" });
  }
};

module.exports = {
  requireAuth,
  requireAdmin,
  requireAdminOrService,
  requireServiceKey,
  optionalAuth,
};
