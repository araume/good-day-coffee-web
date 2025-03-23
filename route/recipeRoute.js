import express from 'express';
import { 
    getAllRecipes, 
    getRecipe, 
    createRecipe, 
    updateRecipe, 
    deleteRecipe,
    addRating 
} from '../controller/recipeController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllRecipes);
router.get('/:id', getRecipe);

// Protected routes (require authentication)
router.post('/', auth, createRecipe);
router.put('/:id', auth, updateRecipe);
router.delete('/:id', auth, deleteRecipe);
router.post('/:id/rate', auth, addRating);

export default router; 