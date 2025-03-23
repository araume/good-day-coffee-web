import express from 'express';
import { 
    getAllLessons, 
    getLesson, 
    createLesson, 
    updateLesson, 
    deleteLesson 
} from '../controller/lessonController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get all lessons
router.get('/', auth, getAllLessons);

// Get a single lesson
router.get('/:id', auth, getLesson);

// Create a new lesson
router.post('/', auth, createLesson);

// Update a lesson
router.put('/:id', auth, updateLesson);

// Delete a lesson
router.delete('/:id', auth, deleteLesson);

export default router; 