import express from 'express';
import { saveQuizScore, getUserQuizScores, getQuizScore } from '../controller/quizScoreController.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// Save a new quiz score
router.post('/', saveQuizScore);

// Get all quiz scores for the current user
router.get('/', getUserQuizScores);

// Get a specific quiz score
router.get('/:lessonId', getQuizScore);

export default router; 