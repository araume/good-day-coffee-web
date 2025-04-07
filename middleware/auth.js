import jwt from 'jsonwebtoken';
import User from '../model/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // In production, always use environment variable

export const auth = async (req, res, next) => {
    try {
        // First try to get token from Authorization header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (token) {
            // Token-based authentication
            const decoded = jwt.verify(token, JWT_SECRET);
            const user = await User.findById(decoded.userId);

            if (!user) {
                return res.status(401).redirect('/home.html');
            }

            req.user = user;
            req.token = token;
            next();
        } 
        // If no token, check for session-based authentication
        else if (req.session && req.session.userId) {
            const user = await User.findById(req.session.userId);
            
            if (!user) {
                return res.status(401).redirect('/home.html');
            }
            
            req.user = user;
            next();
        } 
        else {
            // Non-authenticated users should go to login page
            return res.status(401).redirect('/');
        }
    } catch (error) {
        console.error('Authentication error:', error);
        // For authenticated users with errors, redirect to home
        if (req.session && req.session.userId) {
            return res.status(401).redirect('/home.html');
        }
        // Non-authenticated users go to login
        res.status(401).redirect('/');
    }
};

export const generateToken = (userId) => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
};

export const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        next();
    } else {
        // Non-authenticated users go to login
        res.status(401).redirect('/');
    }
};

export const isAdmin = async (req, res, next) => {
    try {
        if (!req.user || !req.user.isAdmin) {
            return res.status(403).redirect('/home.html');
        }
        next();
    } catch (error) {
        console.error('Admin check error:', error);
        res.status(500).redirect('/home.html');
    }
}; 