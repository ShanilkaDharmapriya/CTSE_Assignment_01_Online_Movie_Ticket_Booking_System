const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userStore = require('../models/userStore');

const SALT_ROUNDS = 10;

function getJwtOptions() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return {
    secret,
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  };
}

function buildTokenPayload(user) {
  return {
    userId: user.id,
    email: user.email,
    role: user.role,
  };
}

async function register({ name, email, password }) {
  if (userStore.findByEmail(email)) {
    const err = new Error('Email already registered');
    err.statusCode = 409;
    err.code = 'EMAIL_EXISTS';
    throw err;
  }
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = userStore.createUser({ name, email, passwordHash });
  return userStore.toPublicUser(user);
}

async function login({ email, password }) {
  const user = userStore.findByEmail(email);
  if (!user) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    err.code = 'INVALID_CREDENTIALS';
    throw err;
  }
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    err.code = 'INVALID_CREDENTIALS';
    throw err;
  }
  const { secret, expiresIn } = getJwtOptions();
  const token = jwt.sign(buildTokenPayload(user), secret, { expiresIn });
  return {
    token,
    user: userStore.toPublicUser(user),
  };
}

function validateToken(token) {
  if (!token) {
    const err = new Error('Missing token');
    err.statusCode = 401;
    err.code = 'TOKEN_MISSING';
    throw err;
  }
  const { secret } = getJwtOptions();
  try {
    const decoded = jwt.verify(token, secret);
    const user = userStore.findById(decoded.userId);
    if (!user || user.email !== decoded.email) {
      const err = new Error('User no longer valid');
      err.statusCode = 401;
      err.code = 'TOKEN_INVALID';
      throw err;
    }
    return {
      valid: true,
      user: userStore.toPublicUser(user),
    };
  } catch (e) {
    if (e.statusCode) throw e;
    const err = new Error('Invalid or expired token');
    err.statusCode = 401;
    err.code = 'TOKEN_INVALID';
    throw err;
  }
}

module.exports = {
  register,
  login,
  validateToken,
};
