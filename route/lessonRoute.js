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

// Get all lessons
router.get('/', isAuthenticated, getAllLessons);

// Get a single lesson
router.get('/:id', isAuthenticated, getLesson);

// Create a new lesson
router.post('/', isAuthenticated, createLesson);

// Update a lesson
router.put('/:id', isAuthenticated, updateLesson);

// Delete a lesson
router.delete('/:id', isAuthenticated, deleteLesson);

export default router; 