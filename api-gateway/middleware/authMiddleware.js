const jwt = require("jsonwebtoken");

function extractBearerToken(req) {
  const header = req.headers.authorization || req.headers.Authorization;
  if (!header || typeof header !== "string") return null;
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token.trim();
}

function requireAuth(req, res, next) {
  const token = extractBearerToken(req);
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.user = {
      userId: decoded.userId,
      role: String(decoded.role || "CUSTOMER").toUpperCase(),
      email: decoded.email,
    };
    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}

function requireRole(...allowedRoles) {
  const normalizedAllowedRoles = allowedRoles.map((role) => String(role).toUpperCase());
  return (req, res, next) => {
    if (!req.user || !normalizedAllowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    return next();
  };
}

module.exports = {
  requireAuth,
  requireRole,
};
