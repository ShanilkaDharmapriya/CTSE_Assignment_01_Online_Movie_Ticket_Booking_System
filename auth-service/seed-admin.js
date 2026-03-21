require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./src/models/User');

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const email = 'admin@cinema.com';
        const password = 'adminpassword123';
        
        const existingAdmin = await User.findOne({ email });
        if (existingAdmin) {
            console.log('Admin already exists');
        } else {
            const passwordHash = await bcrypt.hash(password, 10);
            await User.create({
                name: 'System Administrator',
                email: email,
                passwordHash: passwordHash,
                role: 'ADMIN'
            });
            console.log('Admin user created successfully');
        }
        process.exit(0);
    } catch (err) {
        console.error('Error seeding admin:', err.message);
        process.exit(1);
    }
};

seedAdmin();
