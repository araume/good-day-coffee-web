import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './model/User.js';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function checkUser() {
    try {
        await mongoose.connect(MONGODB_URI, {
            dbName: 'coffee-system'
        });
        console.log('Connected to MongoDB');

        // List all users
        const users = await User.find({});
        console.log('All users in database:', users);

        // Check specific user
        const adminUser = await User.findOne({ email: 'admin@gooddaycoffee.com' });
        console.log('Admin user:', adminUser);

        // Test password comparison
        if (adminUser) {
            const isMatch = await adminUser.comparePassword('admin123');
            console.log('Password match test:', isMatch);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

checkUser(); 