import express from 'express';
import { saveQuizScore, getUserQuizScores, getQuizScore } from '../controller/quizScoreController.js';
import { isAuthenticated, isAdmin, auth } from '../middleware/auth.js';
import QuizScore from '../model/QuizScore.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// Save a new quiz score
router.post('/', saveQuizScore);

// Get all quiz scores for the current user
router.get('/', getUserQuizScores);

// Get all quiz results (admin only)
router.get('/all', auth, isAdmin, async (req, res) => {
    try {
        const q = req.query.q?.trim();
        const filter = {};
        // No text search for now, just return all
        const results = await QuizScore.find(filter)
            .populate('userId', 'name email')
            .populate('lessonId', 'title quiz')
            .sort({ createdAt: -1 });
        res.json(results);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a specific quiz score
router.get('/:lessonId', getQuizScore);

export default router; 