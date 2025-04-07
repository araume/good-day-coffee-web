import express from 'express';
import { 
    getAllRecipes, 
    getRecipe, 
    createRecipe, 
    updateRecipe, 
    deleteRecipe,
    addRating,
    getSeasonalRecipes 
} from '../controller/recipeController.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllRecipes);
router.get('/seasonal', getSeasonalRecipes);
router.get('/:id', getRecipe);

// Protected routes (require authentication)
router.post('/', isAuthenticated, createRecipe);
router.put('/:id', isAuthenticated, updateRecipe);
router.delete('/:id', isAuthenticated, deleteRecipe);
router.post('/:id/rate', isAuthenticated, addRating);

export default router; 