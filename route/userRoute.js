import express from 'express';
import { login, logout } from '../controller/userController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.get('/logout', logout);

// Protected routes
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