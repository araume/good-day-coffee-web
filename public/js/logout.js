// Function to handle logout
async function handleLogout() {
    try {
        // Get the token from localStorage
        const token = localStorage.getItem('token');
        
        // Clear all localStorage items
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        localStorage.removeItem('isAdmin');
        
        // If there's a token, call the logout API
        if (token) {
            await fetch('/api/users/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
        }
        
        // Redirect to login page
        window.location.href = '/index.html';
    } catch (error) {
        console.error('Error during logout:', error);
        // Fallback: redirect to login page even if there's an error
        window.location.href = '/index.html';
    }
}

// Add event listeners to logout links
document.addEventListener('DOMContentLoaded', function() {
    const logoutLinks = document.querySelectorAll('a[href="index.html"]');
    
    logoutLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            handleLogout();
        });
    });
}); 