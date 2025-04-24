import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
    userAnswer: mongoose.Schema.Types.Mixed, // string, array, or number
    correctAnswer: mongoose.Schema.Types.Mixed, // string, array, or number
    isCorrect: Boolean
}, { _id: false });

const quizScoreSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lessonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson',
        required: true
    },
    score: {
        type: Number,
        required: true,
        min: 0
    },
    totalQuestions: {
        type: Number,
        required: true,
        min: 0
    },
    percentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    completedAt: {
        type: Date,
        default: Date.now
    },
    answers: [answerSchema]
});

// Create a compound index to ensure one score per user per lesson
quizScoreSchema.index({ userId: 1, lessonId: 1 }, { unique: true });

const QuizScore = mongoose.model('QuizScore', quizScoreSchema);

export default QuizScore; 