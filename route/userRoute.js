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
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Auth routes
router.post('/login', login);
router.get('/logout', logout);

// User management routes (protected)
router.get('/users', auth, getAllUsers);
router.post('/users', auth, createUser);
router.put('/users/:id', auth, updateUser);
router.delete('/users/:id', auth, deleteUser);

// Profile routes
router.get('/profile', auth, getCurrentUser);
router.put('/profile', auth, updateProfile);

// Protected page routes
router.get('/home.html', auth, (req, res) => {
    res.sendFile('public/home.html', { root: '.' });
});

router.get('/profile.html', auth, (req, res) => {
    res.sendFile('public/profile.html', { root: '.' });
});

router.get('/recipe.html', auth, (req, res) => {
    res.sendFile('public/recipe.html', { root: '.' });
});

router.get('/workbook.html', auth, (req, res) => {
    res.sendFile('public/workbook.html', { root: '.' });
});

router.get('/management.html', auth, (req, res) => {
    res.sendFile('public/management.html', { root: '.' });
});

router.get('/all-recipe.html', auth, (req, res) => {
    res.sendFile('public/all-recipe.html', { root: '.' });
});

export default router;