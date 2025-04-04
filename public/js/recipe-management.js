document.addEventListener('DOMContentLoaded', () => {
    const recipeGrid = document.getElementById('recipeGrid');
    const addRecipeBtn = document.getElementById('addRecipeBtn');
    const modal = document.getElementById('recipeModal');
    const closeBtn = modal.querySelector('.close');
    const cancelBtn = modal.querySelector('.cancel-btn');
    const recipeForm = document.getElementById('recipeForm');

    // Fetch and display recipes
    fetchRecipes();

    // Event listeners for modal
    addRecipeBtn.addEventListener('click', () => {
        modal.style.display = 'block';
        recipeForm.reset();
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    cancelBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Handle form submission
    recipeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(recipeForm);
        const data = {
            name: formData.get('name'),
            description: formData.get('description'),
            image: formData.get('image'),
            ingredients: formData.get('ingredients').split('\n').filter(item => item.trim()),
            procedure: formData.get('procedure').split('\n').filter(item => item.trim()),
            season: formData.get('season')
        };

        try {
            const response = await fetch('/api/recipes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Failed to create recipe');
            }

            alert('Recipe created successfully!');
            modal.style.display = 'none';
            fetchRecipes(); // Refresh the recipe grid
        } catch (error) {
            console.error('Error creating recipe:', error);
            alert('Failed to create recipe. Please try again.');
        }
    });
});

async function fetchRecipes() {
    try {
        const response = await fetch('/api/recipes');
        if (!response.ok) {
            throw new Error('Failed to fetch recipes');
        }

        const recipes = await response.json();
        displayRecipes(recipes);
    } catch (error) {
        console.error('Error fetching recipes:', error);
        alert('Failed to load recipes. Please try again.');
    }
}

function displayRecipes(recipes) {
    const recipeGrid = document.getElementById('recipeGrid');
    recipeGrid.innerHTML = '';

    recipes.forEach(recipe => {
        const recipeCard = createRecipeCard(recipe);
        recipeGrid.appendChild(recipeCard);
    });
}

function createRecipeCard(recipe) {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.innerHTML = `
        <img src="${recipe.image}" alt="${recipe.name}">
        <h3>${recipe.name}</h3>
    `;

    card.addEventListener('click', () => showRecipeDetails(recipe));
    return card;
}

function showRecipeDetails(recipe) {
    const modal = document.getElementById('recipeDetailsModal');
    const content = modal.querySelector('.modal-content');
    
    content.innerHTML = `
        <span class="close">&times;</span>
        <h2>${recipe.name}</h2>
        <img src="${recipe.image}" alt="${recipe.name}" class="recipe-image">
        ${recipe.description ? `<p class="description">${recipe.description}</p>` : ''}
        
        <div class="recipe-section">
            <h3>Ingredients</h3>
            <ul>
                ${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
            </ul>
        </div>

        <div class="recipe-section">
            <h3>Procedure</h3>
            <ol>
                ${recipe.procedure.map(step => `<li>${step}</li>`).join('')}
            </ol>
        </div>

        <div class="recipe-section">
            <h3>Season</h3>
            <p>${recipe.season}</p>
        </div>

        <div class="recipe-actions">
            <button class="delete-btn" data-recipe-id="${recipe._id}">Delete Recipe</button>
        </div>
    `;

    // Add delete button functionality
    const deleteBtn = content.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', async () => {
        if (confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) {
            try {
                const response = await fetch(`/api/recipes/${recipe._id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to delete recipe');
                }

                alert('Recipe deleted successfully!');
                modal.style.display = 'none';
                fetchRecipes(); // Refresh the recipe grid
            } catch (error) {
                console.error('Error deleting recipe:', error);
                alert('Failed to delete recipe. Please try again.');
            }
        }
    });

    // Add close button functionality
    const closeBtn = content.querySelector('.close');
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    modal.style.display = 'block';
} 