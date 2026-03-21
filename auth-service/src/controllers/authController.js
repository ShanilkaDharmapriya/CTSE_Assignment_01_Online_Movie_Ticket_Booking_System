const authService = require('../services/authService');

async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;
    const user = await authService.register({ name, email, password, role });
    res.status(201).json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

/** Populated by requireValidJwt middleware. */
function validateAuthenticated(req, res) {
  res.json({ success: true, data: { valid: true, user: req.auth.user } });
}

function health(_req, res) {
  res.json({ success: true, service: 'auth-service', status: 'ok' });
}

module.exports = {
  register,
  login,
  validateAuthenticated,
  health,
};
