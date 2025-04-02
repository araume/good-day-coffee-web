import User from '../model/User.js';
import { generateToken } from '../middleware/auth.js';
import bcrypt from 'bcrypt';

export const fetch = async (req, res) => { 
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({error: "Internal Server Error"});
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt:', { email, password });

        // Validate input
        if (!email || !password) {
            console.log('Missing email or password');
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        // Find user
        const user = await User.findOne({ email });
        console.log('Found user:', user ? 'Yes' : 'No');
        
        if (!user) {
            console.log('User not found');
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        console.log('Password match:', isMatch);
        
        if (!isMatch) {
            console.log('Password does not match');
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Set user ID in session
        req.session.userId = user._id;
        console.log('Session set with userId:', user._id);

        res.json({ 
            message: 'Login successful',
            user: {
                id: user._id,
                email: user.email,
                name: user.name
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

export const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ message: 'Error during logout' });
        }
        res.clearCookie('connect.sid');
        res.json({ message: 'Logged out successfully' });
    });
};

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user
        const user = new User({
            name,
            email,
            password
        });

        await user.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get all users
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Create new user
export const createUser = async (req, res) => {
    try {
        const { overrideCode, ...userData } = req.body;
        console.log('Creating user with data:', { ...userData, password: '[REDACTED]' });

        // Verify override code
        if (overrideCode !== 'GoodDayCoffeeSystemOverRide2025') {
            return res.status(403).json({ message: 'Invalid override code' });
        }

        // Validate required fields
        if (!userData.name || !userData.email || !userData.password || !userData.phone || !userData.age || !userData.gender) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: userData.email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Create new user
        const user = new User({
            ...userData,
            email: userData.email.toLowerCase()
        });
        
        await user.save();

        // Return user without password
        const userResponse = user.toObject();
        delete userResponse.password;
        
        res.status(201).json(userResponse);
    } catch (error) {
        console.error('Error creating user:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Email already registered' });
        }
        res.status(500).json({ message: 'Server Error' });
    }
};

// Update user
export const updateUser = async (req, res) => {
    try {
        const { overrideCode, ...updateData } = req.body;
        const userId = req.params.id;

        // Verify override code
        if (overrideCode !== 'GoodDayCoffeeSystemOverRide2025') {
            return res.status(403).json({ message: 'Invalid override code' });
        }

        // If updating email, check if new email already exists
        if (updateData.email) {
            const existingUser = await User.findOne({ 
                email: updateData.email,
                _id: { $ne: userId }
            });
            if (existingUser) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }

        // Update user
        const user = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Delete user
export const deleteUser = async (req, res) => {
    try {
        const { overrideCode } = req.body;
        const userId = req.params.id;

        // Verify override code
        if (overrideCode !== 'GoodDayCoffeeSystemOverRide2025') {
            return res.status(403).json({ message: 'Invalid override code' });
        }

        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get current user profile
export const getCurrentUser = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        const user = await User.findById(req.session.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Update user profile
export const updateProfile = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        const userId = req.session.userId;
        const updateData = req.body;

        // Remove any fields that shouldn't be updated
        delete updateData.email; // Prevent email change through profile update
        delete updateData.status; // Prevent status change through profile update

        // If password is being updated
        if (updateData.password) {
            // Hash the new password
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(updateData.password, salt);
        }

        // Update user
        const user = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
