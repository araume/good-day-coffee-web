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
        <div class="rating">${recipe.averageRating.toFixed(1)} ⭐</div>
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

        <div class="recipe-section">
            <h3>Rating</h3>
            <div class="rating-container">
                <div class="current-rating">Current Rating: ${recipe.averageRating.toFixed(1)} ⭐</div>
                <div class="rating-stars">
                    ${[1, 2, 3, 4, 5].map(star => `
                        <span class="star" data-rating="${star}">★</span>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    // Add event listeners for rating stars
    const stars = content.querySelectorAll('.star');
    stars.forEach(star => {
        star.addEventListener('click', async () => {
            const rating = parseInt(star.dataset.rating);
            try {
                const response = await fetch(`/api/recipes/${recipe._id}/rate`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ rating })
                });

                if (!response.ok) {
                    throw new Error('Failed to rate recipe');
                }

                // Update the displayed rating
                const updatedRecipe = await response.json();
                content.querySelector('.current-rating').textContent = 
                    `Current Rating: ${updatedRecipe.averageRating.toFixed(1)} ⭐`;
            } catch (error) {
                console.error('Error rating recipe:', error);
                alert('Failed to rate recipe. Please try again.');
            }
        });
    });

    // Add close button functionality
    const closeBtn = content.querySelector('.close');
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    modal.style.display = 'block';
} 