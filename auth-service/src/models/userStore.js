const mongoose = require('mongoose');

const USER_ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
};

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.CUSTOMER,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);

function normalizeEmail(email) {
  return String(email).trim().toLowerCase();
}

function mapDoc(userDoc) {
  if (!userDoc) return null;
  return {
    id: String(userDoc._id),
    name: userDoc.name,
    email: userDoc.email,
    passwordHash: userDoc.passwordHash,
    role: userDoc.role,
    createdAt: userDoc.createdAt,
  };
}

async function findByEmail(email) {
  const userDoc = await User.findOne({ email: normalizeEmail(email) }).exec();
  return mapDoc(userDoc);
}

async function findById(userId) {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return null;
  }
  const userDoc = await User.findById(userId).exec();
  return mapDoc(userDoc);
}

async function createUser({ name, email, passwordHash, role = USER_ROLES.CUSTOMER }) {
  const userDoc = await User.create({
    name: String(name).trim(),
    email: normalizeEmail(email),
    passwordHash,
    role,
  });
  return mapDoc(userDoc);
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
  USER_ROLES,
  findByEmail,
  findById,
  createUser,
  toPublicUser,
};
