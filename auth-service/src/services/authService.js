const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const SALT_ROUNDS = 10;

function getJwtOptions() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return {
    secret,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  };
}

function buildTokenPayload(user) {
  return {
    userId: user._id,
    email: user.email,
    role: user.role,
  };
}

async function register({ name, email, password }) {
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    const err = new Error('Email already registered');
    err.statusCode = 409;
    err.code = 'EMAIL_EXISTS';
    throw err;
  }
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ name, email, passwordHash });
  
  return toPublicUser(user);
}

async function login({ email, password }) {
  const user = await User.findOne({ email: email.toLowerCase() });
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
    user: toPublicUser(user),
  };
}

async function validateToken(token) {
  if (!token) {
    console.error('validateToken called without token');
    const err = new Error('Missing token');
    err.statusCode = 401;
    err.code = 'TOKEN_MISSING';
    throw err;
  }
  const { secret } = getJwtOptions();
  try {
    const decoded = jwt.verify(token, secret);
    console.log('Token verified for user ID:', decoded.userId);
    const user = await User.findById(decoded.userId);
    if (!user || user.email !== decoded.email) {
      console.error('User validation failed after token verification:', decoded.userId);
      const err = new Error('User no longer valid');
      err.statusCode = 401;
      err.code = 'TOKEN_INVALID';
      throw err;
    }
    const publicUser = toPublicUser(user);
    console.log('Validation success for:', publicUser.email);
    return {
      valid: true,
      user: publicUser,
    };
  } catch (e) {
    console.error('Token validation error:', e.message);
    if (e.statusCode) throw e;
    const err = new Error('Invalid or expired token');
    err.statusCode = 401;
    err.code = 'TOKEN_INVALID';
    throw err;
  }
}

function toPublicUser(user) {
  if (!user) return null;
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

module.exports = {
  register,
  login,
  validateToken,
};
