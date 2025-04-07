import express from 'express';
import { auth, isAdmin } from '../middleware/auth.js';
import { 
    registerUser, 
    loginUser, 
    getUserProfile,
    updateUserProfile,
    getAllUsers,
    deleteUser,
    updateUser
} from '../controller/userController.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes (require authentication)
router.get('/profile', auth, getUserProfile);
router.put('/profile', auth, updateUserProfile);

// Admin only routes
router.get('/users', auth, isAdmin, getAllUsers);
router.delete('/users/:id', auth, isAdmin, deleteUser);
router.put('/users/:id', auth, isAdmin, updateUser);

export default router;