require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./src/models/User');

/** Same password for all seeded admins (local / assignment use only). */
const DEFAULT_PASSWORD = 'adminpassword123';

const ADMINS = [
  { email: 'admin@cinema.com', name: 'System Administrator' },
  { email: 'admin@example.com', name: 'Demo Administrator' },
];

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    for (const { email, name } of ADMINS) {
      const existing = await User.findOne({ email });
      if (existing) {
        console.log(`Admin already exists: ${email}`);
      } else {
        await User.create({
          name,
          email,
          passwordHash,
          role: 'ADMIN',
        });
        console.log(`Admin user created: ${email}`);
      }
    }

    console.log(`Password for seeded admins: ${DEFAULT_PASSWORD}`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin:', err.message);
    process.exit(1);
  }
};

seedAdmin();
