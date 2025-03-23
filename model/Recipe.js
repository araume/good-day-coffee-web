import mongoose from 'mongoose';

const recipeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    image: {
        type: String,
        required: true
    },
    ingredients: [{
        type: String,
        required: true
    }],
    procedure: [{
        type: String,
        required: true
    }],
    season: {
        type: String,
        required: true,
        enum: ['spring', 'summer', 'fall', 'winter']
    },
    ratings: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        rating: {
            type: Number,
            min: 1,
            max: 5
        }
    }],
    averageRating: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Calculate average rating before saving
recipeSchema.pre('save', function(next) {
    if (this.ratings.length > 0) {
        this.averageRating = this.ratings.reduce((acc, curr) => acc + curr.rating, 0) / this.ratings.length;
    }
    next();
});

const Recipe = mongoose.model('Recipe', recipeSchema);

export default Recipe; 