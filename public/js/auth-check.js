// This script checks if the user is authenticated on the client-side
// and redirects to the login page if not

document.addEventListener('DOMContentLoaded', function() {
    // Skip check on login page
    if (window.location.pathname === '/' || 
        window.location.pathname === '/index.html') {
        return;
    }

    // Check for token in localStorage
    const token = localStorage.getItem('token');
    if (!token) {
        console.log('No authentication token found, redirecting to login');
        window.location.href = '/index.html';
        return;
    }

    // Verify the token is valid by making a request to the server
    fetch('/api/users/profile', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Invalid or expired token');
        }
        return response.json();
    })
    .then(data => {
        console.log('Authentication successful:', data.name);
        
        // Store user info in localStorage for quick access
        localStorage.setItem('userName', data.name);
        localStorage.setItem('userEmail', data.email);
        localStorage.setItem('isAdmin', data.isAdmin);
        
        // Check if the user is trying to access admin pages
        const currentPath = window.location.pathname;
        const adminPages = [
            '/management.html',
            '/recipe-management.html',
            '/lesson-management.html'
        ];
        
        if (adminPages.includes(currentPath) && !data.isAdmin) {
            console.log('Non-admin user trying to access admin page, redirecting');
            window.location.href = '/home.html';
        }
    })
    .catch(error => {
        console.error('Authentication check failed:', error);
        // Clear local storage and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        localStorage.removeItem('isAdmin');
        window.location.href = '/index.html';
    });
}); 