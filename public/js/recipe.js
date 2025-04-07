document.addEventListener('DOMContentLoaded', () => {
    // Get the content container
    const contentContainer = document.querySelector('.content');
    
    // Function to fetch and display seasonal recipes
    async function fetchSeasonalRecipes() {
        try {
            const response = await fetch('/api/recipes/seasonal', {
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch seasonal recipes');
            }
            
            const data = await response.json();
            const { season, recipes } = data;
            
            // Clear existing content
            contentContainer.innerHTML = '';
            
            // Display season
            const seasonHeader = document.createElement('h2');
            seasonHeader.className = 'season-header';
            seasonHeader.textContent = `${season.charAt(0).toUpperCase() + season.slice(1)} Seasonal Recipes`;
            contentContainer.appendChild(seasonHeader);
            
            if (recipes.length === 0) {
                const noRecipesMsg = document.createElement('p');
                noRecipesMsg.className = 'no-recipes';
                noRecipesMsg.textContent = `No recipes available for ${season} season yet.`;
                contentContainer.appendChild(noRecipesMsg);
                return;
            }
            
            // Create recipe grid
            const recipeGrid = document.createElement('div');
            recipeGrid.className = 'recipe-grid';
            
            // Add recipes to the grid
            recipes.forEach((recipe) => {
                const recipeCard = document.createElement('div');
                recipeCard.className = 'recipe-card';
                
                // Create image container for consistent sizing
                const imgContainer = document.createElement('div');
                imgContainer.className = 'img-container';
                
                const img = document.createElement('img');
                img.src = recipe.image;
                img.alt = recipe.name;
                imgContainer.appendChild(img);
                
                // Create content container
                const contentDiv = document.createElement('div');
                contentDiv.className = 'card-content';
                
                const title = document.createElement('h3');
                title.textContent = recipe.name;
                
                const description = document.createElement('p');
                description.textContent = recipe.description || 'A delicious coffee recipe to try this season.';
                
                contentDiv.appendChild(title);
                contentDiv.appendChild(description);
                
                recipeCard.appendChild(imgContainer);
                recipeCard.appendChild(contentDiv);
                
                // Add click event to view recipe details
                recipeCard.addEventListener('click', () => {
                    window.location.href = `/all-recipe.html?id=${recipe._id}`;
                });
                
                recipeGrid.appendChild(recipeCard);
            });
            
            contentContainer.appendChild(recipeGrid);
            
        } catch (error) {
            console.error('Error:', error);
            contentContainer.innerHTML = '<p class="error">Failed to load seasonal recipes. Please try again later.</p>';
        }
    }
    
    // Call the function to fetch and display recipes
    fetchSeasonalRecipes();
}); 