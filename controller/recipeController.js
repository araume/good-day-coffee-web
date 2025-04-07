import Recipe from '../model/Recipe.js';

// Get all recipes
export const getAllRecipes = async (req, res) => {
    try {
        const recipes = await Recipe.find().sort({ createdAt: -1 });
        res.status(200).json(recipes);
    } catch (error) {
        console.error('Error fetching recipes:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get single recipe
export const getRecipe = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        res.status(200).json(recipe);
    } catch (error) {
        console.error('Error fetching recipe:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Create new recipe
export const createRecipe = async (req, res) => {
    try {
        const { name, description, image, ingredients, procedure, season } = req.body;

        // Validate required fields
        if (!name || !image || !ingredients || !procedure || !season) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Create new recipe
        const recipe = new Recipe({
            name,
            description,
            image,
            ingredients: Array.isArray(ingredients) ? ingredients : [ingredients],
            procedure: Array.isArray(procedure) ? procedure : [procedure],
            season
        });

        await recipe.save();
        res.status(201).json(recipe);
    } catch (error) {
        console.error('Error creating recipe:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Update recipe
export const updateRecipe = async (req, res) => {
    try {
        const { name, description, image, ingredients, procedure, season } = req.body;
        const recipe = await Recipe.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        // Update fields if provided
        if (name) recipe.name = name;
        if (description) recipe.description = description;
        if (image) recipe.image = image;
        if (ingredients) recipe.ingredients = Array.isArray(ingredients) ? ingredients : [ingredients];
        if (procedure) recipe.procedure = Array.isArray(procedure) ? procedure : [procedure];
        if (season) recipe.season = season;

        await recipe.save();
        res.status(200).json(recipe);
    } catch (error) {
        console.error('Error updating recipe:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Delete recipe
export const deleteRecipe = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        await recipe.deleteOne();
        res.status(200).json({ message: 'Recipe deleted successfully' });
    } catch (error) {
        console.error('Error deleting recipe:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Add rating to recipe
export const addRating = async (req, res) => {
    try {
        const { rating } = req.body;
        const recipe = await Recipe.findById(req.params.id);
        const userId = req.user.userId;

        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        // Validate rating
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        // Check if user has already rated
        const existingRating = recipe.ratings.find(r => r.userId.toString() === userId);
        if (existingRating) {
            existingRating.rating = rating;
        } else {
            recipe.ratings.push({ userId, rating });
        }

        await recipe.save();
        res.status(200).json(recipe);
    } catch (error) {
        console.error('Error adding rating:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get seasonal recipes
export const getSeasonalRecipes = async (req, res) => {
    try {
        // Get current month (0-11)
        const currentMonth = new Date().getMonth();
        
        // Determine current season based on month
        let currentSeason;
        if (currentMonth >= 2 && currentMonth <= 4) {
            currentSeason = 'spring';
        } else if (currentMonth >= 5 && currentMonth <= 7) {
            currentSeason = 'summer';
        } else if (currentMonth >= 8 && currentMonth <= 10) {
            currentSeason = 'fall';
        } else {
            currentSeason = 'winter';
        }
        
        // Find recipes for the current season
        const recipes = await Recipe.find({ season: currentSeason });
        
        // Randomly select 6 recipes (or all if less than 6)
        const selectedRecipes = recipes
            .sort(() => 0.5 - Math.random())
            .slice(0, 6);
        
        res.status(200).json({
            season: currentSeason,
            recipes: selectedRecipes
        });
    } catch (error) {
        console.error('Error fetching seasonal recipes:', error);
        res.status(500).json({ message: 'Server Error' });
    }
}; 