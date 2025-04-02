import express from 'express';
import { 
    login, 
    logout, 
    getAllUsers, 
    createUser, 
    updateUser, 
    deleteUser,
    getCurrentUser,
    updateProfile 
} from '../controller/userController.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

// Auth routes (no auth required)
router.post('/login', login);
router.get('/logout', logout);

// User management routes (protected)
router.get('/', isAuthenticated, getAllUsers);
router.post('/', isAuthenticated, createUser);
router.put('/:id', isAuthenticated, updateUser);
router.delete('/:id', isAuthenticated, deleteUser);

// Profile routes (protected)
router.get('/profile', isAuthenticated, getCurrentUser);
router.put('/profile', isAuthenticated, updateProfile);

// Protected page routes
router.get('/home.html', isAuthenticated, (req, res) => {
    res.sendFile('public/home.html', { root: '.' });
});

router.get('/profile.html', isAuthenticated, (req, res) => {
    res.sendFile('public/profile.html', { root: '.' });
});

router.get('/recipe.html', isAuthenticated, (req, res) => {
    res.sendFile('public/recipe.html', { root: '.' });
});

router.get('/workbook.html', isAuthenticated, (req, res) => {
    res.sendFile('public/workbook.html', { root: '.' });
});

router.get('/management.html', isAuthenticated, (req, res) => {
    res.sendFile('public/management.html', { root: '.' });
});

router.get('/all-recipe.html', isAuthenticated, (req, res) => {
    res.sendFile('public/all-recipe.html', { root: '.' });
});

export default router;