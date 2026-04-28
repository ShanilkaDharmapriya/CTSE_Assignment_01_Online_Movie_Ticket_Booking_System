const { INTERNAL_SERVICE_KEY } = require("../../config/config");

function requireServiceKey(req, res, next) {
  const key = req.headers["x-service-key"];
  if (!key || key !== INTERNAL_SERVICE_KEY) {
    return res.status(401).json({ message: "Unauthorized: invalid or missing service key" });
  }
  return next();
}

module.exports = { requireServiceKey };
