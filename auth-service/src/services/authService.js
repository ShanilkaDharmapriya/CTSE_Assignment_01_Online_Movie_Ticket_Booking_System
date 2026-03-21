const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userStore = require('../models/userStore');

const SALT_ROUNDS = 10;
let seedAdminPromise = null;

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

async function registerCustomer({ name, email, password }) {
  const existingUser = await userStore.findByEmail(email);
  if (existingUser) {
    const err = new Error('Email already registered');
    err.statusCode = 409;
    err.code = 'EMAIL_EXISTS';
    throw err;
  }
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = userStore.createUser({
    name,
    email,
    passwordHash,
    role: userStore.USER_ROLES.CUSTOMER,
  });
  return userStore.toPublicUser(user);
}

async function ensureSeedAdminUser() {
  if (seedAdminPromise) return seedAdminPromise;

  seedAdminPromise = (async () => {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME || 'System Admin';

    if (!adminEmail || !adminPassword) {
      return;
    }

    const existingUser = await userStore.findByEmail(adminEmail);
    if (existingUser) {
      return;
    }

    const passwordHash = await bcrypt.hash(adminPassword, SALT_ROUNDS);
    userStore.createUser({
      name: adminName,
      email: adminEmail,
      passwordHash,
      role: userStore.USER_ROLES.ADMIN,
    });
  })();

  return seedAdminPromise;
}

async function loginForRole({ email, password, role }) {
  const user = await userStore.findByEmail(email);
  if (!user || user.role !== role) {
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

async function loginCustomer({ email, password }) {
  return loginForRole({ email, password, role: userStore.USER_ROLES.CUSTOMER });
}

async function loginAdmin({ email, password }) {
  await ensureSeedAdminUser();
  return loginForRole({ email, password, role: userStore.USER_ROLES.ADMIN });
}

async function validateToken(token) {
  if (!token) {
    const err = new Error('Missing token');
    err.statusCode = 401;
    err.code = 'TOKEN_MISSING';
    throw err;
  }
  const { secret } = getJwtOptions();
  try {
    const decoded = jwt.verify(token, secret);
    const user = await userStore.findById(decoded.userId);
    if (!user || user.email !== decoded.email || user.role !== decoded.role) {
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
  registerCustomer,
  loginCustomer,
  loginAdmin,
  validateToken,
};
