const authService = require('../services/authService');

async function registerCustomer(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const user = await authService.registerCustomer({ name, email, password });
    res.status(201).json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
}

async function loginCustomer(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.loginCustomer({ email, password });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function loginAdmin(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.loginAdmin({ email, password });
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
  registerCustomer,
  loginCustomer,
  loginAdmin,
  validateAuthenticated,
  health,
};
