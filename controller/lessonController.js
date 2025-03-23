import Lesson from '../model/Lesson.js';

// Get all lessons
export const getAllLessons = async (req, res) => {
    try {
        const lessons = await Lesson.find().sort({ createdAt: -1 });
        res.json(lessons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single lesson
export const getLesson = async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id);
        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }
        res.json(lesson);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new lesson
export const createLesson = async (req, res) => {
    try {
        const { title, description, quiz } = req.body;
        
        // Validate quiz questions
        if (quiz) {
            quiz.forEach((question, index) => {
                if (!question.question || !question.options || question.options.length < 2) {
                    throw new Error(`Invalid quiz question at index ${index}`);
                }
                if (question.correctAnswer < 0 || question.correctAnswer >= question.options.length) {
                    throw new Error(`Invalid correct answer for question at index ${index}`);
                }
            });
        }

        const lesson = new Lesson({
            title,
            description,
            quiz: quiz || []
        });

        const newLesson = await lesson.save();
        res.status(201).json(newLesson);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update a lesson
export const updateLesson = async (req, res) => {
    try {
        const { title, description, quiz } = req.body;
        const lesson = await Lesson.findById(req.params.id);

        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }

        // Validate quiz questions if provided
        if (quiz) {
            quiz.forEach((question, index) => {
                if (!question.question || !question.options || question.options.length < 2) {
                    throw new Error(`Invalid quiz question at index ${index}`);
                }
                if (question.correctAnswer < 0 || question.correctAnswer >= question.options.length) {
                    throw new Error(`Invalid correct answer for question at index ${index}`);
                }
            });
        }

        lesson.title = title || lesson.title;
        lesson.description = description || lesson.description;
        if (quiz) lesson.quiz = quiz;

        const updatedLesson = await lesson.save();
        res.json(updatedLesson);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a lesson
export const deleteLesson = async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id);
        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }
        await lesson.deleteOne();
        res.json({ message: 'Lesson deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 