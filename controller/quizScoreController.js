import QuizScore from '../model/QuizScore.js';

// Save a new quiz score
export const saveQuizScore = async (req, res) => {
    try {
        const { lessonId, score, totalQuestions, percentage, answers } = req.body;
        const userId = req.session.userId; // Get user ID from session

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const quizScore = new QuizScore({
            userId,
            lessonId,
            score,
            totalQuestions,
            percentage,
            answers: Array.isArray(answers) ? answers : []
        });

        const savedScore = await quizScore.save();
        res.status(201).json(savedScore);
    } catch (error) {
        if (error.code === 11000) { // Duplicate key error
            res.status(400).json({ message: 'Score already exists for this lesson' });
        } else {
            res.status(500).json({ message: error.message });
        }
    }
};

// Get all quiz scores for a user
export const getUserQuizScores = async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const scores = await QuizScore.find({ userId })
            .populate('lessonId', 'title')
            .sort({ completedAt: -1 });

        res.json(scores);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a specific quiz score
export const getQuizScore = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { lessonId } = req.params;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const score = await QuizScore.findOne({ userId, lessonId })
            .populate('lessonId', 'title');

        if (!score) {
            return res.status(404).json({ message: 'Score not found' });
        }

        res.json(score);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 