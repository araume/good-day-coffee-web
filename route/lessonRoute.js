import express from 'express';
import { auth, isAdmin } from '../middleware/auth.js';
import {
    getAllLessons,
    getLesson,
    createLesson,
    updateLesson,
    deleteLesson
} from '../controller/lessonController.js';

const router = express.Router();

// Public routes (for viewing lessons)
router.get('/', getAllLessons);
router.get('/:id', getLesson);

// Admin only routes
router.post('/', auth, isAdmin, createLesson);
router.put('/:id', auth, isAdmin, updateLesson);
router.delete('/:id', auth, isAdmin, deleteLesson);

export default router; 