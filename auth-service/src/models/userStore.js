const { randomUUID } = require('crypto');

/** In-memory user store (swap for MongoDB later without changing service API). */
const usersByEmail = new Map();
const usersById = new Map();

function normalizeEmail(email) {
  return String(email).trim().toLowerCase();
}

function findByEmail(email) {
  return usersByEmail.get(normalizeEmail(email)) ?? null;
}

function findById(userId) {
  return usersById.get(userId) ?? null;
}

function createUser({ name, email, passwordHash, role }) {
  const id = randomUUID();
  const normalizedRole = String(role || "CUSTOMER").toUpperCase();
  const user = {
    id,
    name: String(name).trim(),
    email: normalizeEmail(email),
    role: normalizedRole === "ADMIN" ? "ADMIN" : "CUSTOMER",
    passwordHash,
    createdAt: new Date().toISOString(),
  };
  usersByEmail.set(user.email, user);
  usersById.set(user.id, user);
  return user;
}

function toPublicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

module.exports = {
  findByEmail,
  findById,
  createUser,
  toPublicUser,
};
