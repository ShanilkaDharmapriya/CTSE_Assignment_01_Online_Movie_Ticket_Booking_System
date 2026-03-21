const authService = require('../services/authService');

function extractBearerToken(req) {
  const header = req.headers.authorization || req.headers.Authorization;
  if (!header || typeof header !== 'string') return null;
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token.trim();
}

/**
 * Validates JWT from Authorization: Bearer <token>.
 * Sets req.auth = { user } on success; calls next(err) on failure.
 */
async function requireValidJwt(req, res, next) {
  const token = extractBearerToken(req);
  try {
    const { user } = await authService.validateToken(token);
    req.auth = { user };
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  extractBearerToken,
  requireValidJwt,
};
