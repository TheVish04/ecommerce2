const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const users = [
    {
        name: "Super Admin",
        email: "admin@gmail.com",
        password: "admin@123",
        role: "admin",
        isEmailVerified: true
    },
    {
        name: "Amit Verma",
        email: "vendor1@gmail.com",
        password: "vendor@123",
        role: "vendor",
        vendorStatus: "approved",
        vendorProfile: {
            storeName: "Vivid Strokes Studio",
            bio: "Specializing in oil on canvas and custom charcoal portraits."
        },
        isEmailVerified: true
    },
    {
        name: "Sara Khan",
        email: "vendor2@gmail.com",
        password: "vendor@123",
        role: "vendor",
        vendorStatus: "approved",
        vendorProfile: {
            storeName: "Pixel Perfect Assets",
            bio: "High-quality 3D textures, brushes, and printed merchandise."
        },
        isEmailVerified: true
    },
    {
        name: "Rahul Sharma",
        email: "customer@gmail.com",
        password: "customer@123",
        role: "customer",
        isEmailVerified: true
    }
];

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const seedUsers = async () => {
    await connectDB();

    try {
        for (const user of users) {
            const existingUser = await User.findOne({ email: user.email });
            if (existingUser) {
                console.log(`User ${user.email} already exists. Skipping...`);
                continue;
            }

            // Creating user triggers pre-save hook to hash password
            await User.create(user);
            console.log(`Created user: ${user.name} (${user.email})`);
        }

        console.log('✅ Seeding complete!');
        process.exit();
    } catch (error) {
        console.error(`❌ Seeding failed: ${error.message}`);
        process.exit(1);
    }
};

seedUsers();
