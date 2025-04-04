import express from 'express';
import { 
    getAllLessons, 
    getLesson, 
    createLesson, 
    updateLesson, 
    deleteLesson 
} from '../controller/lessonController.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllLessons);
router.get('/:id', getLesson);

// Protected routes
router.post('/', isAuthenticated, createLesson);
router.put('/:id', isAuthenticated, updateLesson);
router.delete('/:id', isAuthenticated, deleteLesson);

export default router; 