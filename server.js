import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import path from 'path';
import { fileURLToPath } from 'url';
import userRoutes from './route/userRoute.js';
import lessonRoutes from './route/lessonRoute.js';
import recipeRoutes from './route/recipeRoute.js';
import quizScoreRoutes from './route/quizScoreRoute.js';
import { isAuthenticated, auth, isAdmin } from './middleware/auth.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: MONGODB_URI,
        ttl: 24 * 60 * 60 // 1 day
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
}));

// Public assets that don't require authentication
app.use('/img', express.static(path.join(__dirname, 'public/img')));
app.use('/index.html', express.static(path.join(__dirname, 'public/index.html')));
app.use('/index.css', express.static(path.join(__dirname, 'public/index.css')));
app.use('/login.js', express.static(path.join(__dirname, 'public/login.js')));

// Authentication middleware for static files
// This will check if the user is authenticated for all other static files
app.use((req, res, next) => {
    // List of paths that don't require authentication
    const publicPaths = [
        '/',
        '/index.html',
        '/login.js',
        '/index.css',
        '/img',
        '/api/users/login',
        '/api/users/register'
    ];
    
    // Check if the requested path is public
    const isPublicPath = publicPaths.some(path => 
        req.path === path || req.path.startsWith('/img/'));
    
    if (isPublicPath) {
        return next();
    }
    
    // Check for JWT token in the Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    // Check for session authentication
    const isSessionAuth = req.session && req.session.userId;
    
    if (!token && !isSessionAuth) {
        // If it's an API request, return 401 status
        if (req.path.startsWith('/api/')) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        
        // If it's a page request, redirect to login page
        return res.redirect('/index.html');
    }
    
    next();
});

// Serve static files (now protected by the auth middleware above)
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/users', userRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/quiz-scores', quizScoreRoutes);

// Protected page routes - available to all authenticated users
app.get('/home.html', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.get('/profile.html', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

app.get('/recipe.html', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'recipe.html'));
});

app.get('/workbook.html', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'workbook.html'));
});

app.get('/all-recipe.html', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'all-recipe.html'));
});

// Admin-only page routes
app.get('/management.html', auth, isAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'management.html'));
});

app.get('/recipe-management.html', auth, isAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'recipe-management.html'));
});

app.get('/lesson-management.html', auth, isAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'lesson-management.html'));
});

// Catch-all route to redirect any non-matching routes to login
app.get('*', (req, res) => {
    res.redirect('/index.html');
});

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
    dbName: 'coffee-system'
})
.then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
})
.catch((error) => {
    console.error('Error connecting to MongoDB:', error);
}); 