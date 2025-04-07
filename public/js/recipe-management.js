document.addEventListener('DOMContentLoaded', () => {
    const recipeGrid = document.getElementById('recipeGrid');
    const addRecipeBtn = document.getElementById('addRecipeBtn');
    const modal = document.getElementById('recipeModal');
    const closeBtn = modal.querySelector('.close');
    const cancelBtn = modal.querySelector('.cancel-btn');
    const recipeForm = document.getElementById('recipeForm');
    const searchInput = document.getElementById('searchInput');
    const seasonFilter = document.getElementById('seasonFilter');
    const clearSearchBtn = document.getElementById('clearSearch');
    const searchStatus = document.getElementById('searchStatus');

    let allRecipes = []; // Store all recipes for filtering
    let timeoutId; // For debouncing search

    // Fetch and display recipes
    fetchRecipes();

    // Event listeners for search and filter
    searchInput.addEventListener('input', () => {
        // Show clear button when there's text
        if (searchInput.value.trim()) {
            clearSearchBtn.classList.add('visible');
        } else {
            clearSearchBtn.classList.remove('visible');
        }
        
        // Debounce search to improve performance
        clearTimeout(timeoutId);
        timeoutId = setTimeout(filterRecipes, 300);
    });
    
    seasonFilter.addEventListener('change', filterRecipes);
    
    // Clear search button functionality
    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearSearchBtn.classList.remove('visible');
        filterRecipes();
        searchInput.focus();
    });

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

    // Details modal close on click outside
    const detailsModal = document.getElementById('recipeDetailsModal');
    window.addEventListener('click', (e) => {
        if (e.target === detailsModal) {
            detailsModal.style.display = 'none';
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

    // Function to filter recipes
    function filterRecipes() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const selectedSeason = seasonFilter.value.toLowerCase();
        
        // If no search term and no season filter, show all recipes
        if (!searchTerm && !selectedSeason) {
            displayRecipes(allRecipes);
            searchStatus.textContent = '';
            searchStatus.classList.remove('visible');
            return;
        }
        
        const filteredRecipes = allRecipes.filter(recipe => {
            // Search in name, description, ingredients, and procedure
            const ingredientsText = recipe.ingredients.join(' ').toLowerCase();
            const procedureText = recipe.procedure.join(' ').toLowerCase();
            
            const matchesSearch = !searchTerm || 
                recipe.name.toLowerCase().includes(searchTerm) || 
                (recipe.description && recipe.description.toLowerCase().includes(searchTerm)) ||
                ingredientsText.includes(searchTerm) ||
                procedureText.includes(searchTerm);
                
            const matchesSeason = !selectedSeason || recipe.season === selectedSeason;
            
            return matchesSearch && matchesSeason;
        });
        
        // Update search status
        let statusText = '';
        if (searchTerm && selectedSeason) {
            statusText = `Found ${filteredRecipes.length} recipes matching "${searchTerm}" in ${selectedSeason} season`;
        } else if (searchTerm) {
            statusText = `Found ${filteredRecipes.length} recipes matching "${searchTerm}"`;
        } else if (selectedSeason) {
            statusText = `Found ${filteredRecipes.length} ${selectedSeason} recipes`;
        }
        
        searchStatus.textContent = statusText;
        searchStatus.classList.add('visible');
        
        displayRecipes(filteredRecipes);
    }
    
    // Initial fetch of all recipes
    async function fetchRecipes() {
        const loadingElement = document.createElement('div');
        loadingElement.className = 'loading';
        loadingElement.textContent = 'Loading recipes...';
        recipeGrid.innerHTML = '';
        recipeGrid.appendChild(loadingElement);
        
        try {
            const response = await fetch('/api/recipes');
            if (!response.ok) {
                throw new Error('Failed to fetch recipes');
            }

            const recipes = await response.json();
            allRecipes = recipes; // Store all recipes
            displayRecipes(recipes);
            
            // Update status if search is active
            if (searchInput.value.trim() || seasonFilter.value) {
                filterRecipes();
            }
        } catch (error) {
            console.error('Error fetching recipes:', error);
            recipeGrid.innerHTML = '<p class="error">Failed to load recipes. Please try again.</p>';
        }
    }
});

function displayRecipes(recipes) {
    const recipeGrid = document.getElementById('recipeGrid');
    recipeGrid.innerHTML = '';

    if (recipes.length === 0) {
        recipeGrid.innerHTML = '<p class="no-recipes">No recipes found. Try a different search term or filter.</p>';
        return;
    }

    recipes.forEach(recipe => {
        const recipeCard = createRecipeCard(recipe);
        recipeGrid.appendChild(recipeCard);
    });
}

function createRecipeCard(recipe) {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    
    const imgContainer = document.createElement('div');
    imgContainer.className = 'img-container';
    
    const img = document.createElement('img');
    img.src = recipe.image;
    img.alt = recipe.name;
    imgContainer.appendChild(img);
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'card-content';
    
    const title = document.createElement('h3');
    title.textContent = recipe.name;
    
    const description = document.createElement('p');
    description.textContent = recipe.description || 'A delicious coffee recipe.';
    
    const seasonTag = document.createElement('span');
    seasonTag.className = 'season-tag';
    seasonTag.textContent = recipe.season.charAt(0).toUpperCase() + recipe.season.slice(1);
    
    contentDiv.appendChild(title);
    contentDiv.appendChild(description);
    contentDiv.appendChild(seasonTag);
    
    card.appendChild(imgContainer);
    card.appendChild(contentDiv);
    
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
            <p>${recipe.season.charAt(0).toUpperCase() + recipe.season.slice(1)}</p>
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