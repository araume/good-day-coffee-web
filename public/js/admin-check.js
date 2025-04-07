// Function to check if the current user is an admin
async function checkAdminAccess() {
    try {
        // First check the localStorage directly (faster)
        const storedEmail = localStorage.getItem('userEmail');
        const storedIsAdmin = localStorage.getItem('isAdmin');
        
        console.log('Stored admin info for access check:', { storedEmail, storedIsAdmin });
        
        // Check if this is an admin page
        const currentPath = window.location.pathname;
        const adminPages = [
            '/management.html',
            '/recipe-management.html',
            '/lesson-management.html'
        ];
        
        const isAdminPage = adminPages.includes(currentPath);
        
        // If we have admin info in localStorage, use it
        if (storedEmail === 'admin@gooddaycoffee.com' || storedIsAdmin === 'true') {
            console.log('Admin found in localStorage, allowing access');
            return; // Allow access
        }
        
        // If not admin and on admin page, redirect
        if (isAdminPage) {
            console.log('Not admin (from localStorage) but on admin page, redirecting');
            window.location.href = '/home.html';
            return;
        }
        
        // If localStorage check doesn't confirm admin status, check via API
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('No token found, redirecting from admin page');
            if (isAdminPage) {
                window.location.href = '/home.html';
            }
            return;
        }

        const response = await fetch('/api/users/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            console.log('Profile fetch failed, redirecting from admin page');
            if (isAdminPage) {
                window.location.href = '/home.html';
            }
            return;
        }

        const userData = await response.json();
        console.log('User data for admin check:', userData);
        
        // Check if user is admin explicitly
        const isAdmin = userData.email === 'admin@gooddaycoffee.com' || userData.isAdmin === true;
        
        // Save to localStorage for future checks
        localStorage.setItem('userEmail', userData.email);
        localStorage.setItem('isAdmin', isAdmin);
        
        // If user is not admin and trying to access admin pages, redirect to home
        if (!isAdmin && isAdminPage) {
            console.log('Non-admin trying to access admin page, redirecting');
            window.location.href = '/home.html';
        } else {
            console.log('Admin user confirmed, allowing access');
        }
    } catch (error) {
        console.error('Error checking admin access:', error);
        // Only redirect if on admin page
        if (adminPages.includes(window.location.pathname)) {
            window.location.href = '/home.html';
        }
    }
}

// Run the check when the page loads
document.addEventListener('DOMContentLoaded', checkAdminAccess); 