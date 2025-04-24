import mongoose from 'mongoose';

const quizQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['multiple-choice', 'identification', 'multiple-answer'],
        default: 'multiple-choice'
    },
    options: [{
        type: String,
        required: function() { 
            return this.type === 'multiple-choice' || this.type === 'multiple-answer';
        }
    }],
    correctAnswer: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
        // For multiple-choice: a single number (index of correct option)
        // For multiple-answer: an array of numbers (indices of correct options)
        // For identification: a string (the correct answer)
        validate: {
            validator: function(v) {
                if (this.type === 'multiple-choice') {
                    return Number.isInteger(v) && v >= 0 && v < this.options.length;
                } else if (this.type === 'multiple-answer') {
                    return Array.isArray(v) && 
                           v.every(index => Number.isInteger(index) && index >= 0 && index < this.options.length);
                } else if (this.type === 'identification') {
                    return typeof v === 'string' && v.trim().length > 0;
                }
                return false;
            },
            message: props => `${props.value} is not a valid answer for question type ${props.type}!`
        }
    }
});

const lessonSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        maxlength: [1000000, 'Description is too long, it can include images but total size must be under 1MB']
    },
    quiz: [quizQuestionSchema],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
lessonSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Lesson = mongoose.model('Lesson', lessonSchema);

export default Lesson; 