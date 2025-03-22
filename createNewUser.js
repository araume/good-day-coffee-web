import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './model/User.js';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function createNewUser() {
    try {
        await mongoose.connect(MONGODB_URI, {
            dbName: 'coffee-system'
        });
        console.log('Connected to MongoDB');

        // Delete existing users
        await User.deleteMany({});
        console.log('Deleted existing users');

        // Create new user
        const newUser = new User({
            name: 'Admin',
            email: 'admin@gooddaycoffee.com',
            password: 'admin123',
            isActive: true
        });

        await newUser.save();
        console.log('Created new user:', newUser);

        // Verify user was created
        const savedUser = await User.findOne({ email: 'admin@gooddaycoffee.com' });
        console.log('Verified user in database:', savedUser);

        // Test password comparison
        const isMatch = await savedUser.comparePassword('admin123');
        console.log('Password match test:', isMatch);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

createNewUser(); 