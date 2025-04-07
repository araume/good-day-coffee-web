// Function to hide admin menu items for non-admin users
async function hideAdminMenuItems() {
    try {
        // First check the localStorage directly (faster)
        const storedEmail = localStorage.getItem('userEmail');
        const storedIsAdmin = localStorage.getItem('isAdmin');
        
        console.log('Stored admin info:', { storedEmail, storedIsAdmin });
        
        // If we have admin info in localStorage, use it
        if (storedEmail === 'admin@gooddaycoffee.com' || storedIsAdmin === 'true') {
            console.log('Admin found in localStorage, showing admin items');
            showAdminItems();
            return;
        }
        
        // If not found in localStorage, check via API
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('No token found, hiding admin items');
            hideAdminItems();
            return;
        }

        const response = await fetch('/api/users/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            console.log('Profile fetch failed, hiding admin items');
            hideAdminItems();
            return;
        }

        const userData = await response.json();
        console.log('User data:', userData);
        
        // Check if user is admin
        if (userData.email === 'admin@gooddaycoffee.com' || userData.isAdmin === true) {
            console.log('Admin user detected from API, showing admin items');
            
            // Update localStorage for future checks
            localStorage.setItem('userEmail', userData.email);
            localStorage.setItem('isAdmin', userData.isAdmin);
            
            showAdminItems();
        } else {
            console.log('Non-admin user detected, hiding admin items');
            hideAdminItems();
        }
    } catch (error) {
        console.error('Error checking admin status:', error);
        hideAdminItems();
    }
}

// Function to hide the admin menu items
function hideAdminItems() {
    const adminLinks = document.querySelectorAll('.admin-only');
    adminLinks.forEach(link => {
        link.style.display = 'none';
    });
}

// Function to show the admin menu items
function showAdminItems() {
    const adminLinks = document.querySelectorAll('.admin-only');
    adminLinks.forEach(link => {
        link.style.display = 'block';
    });
}

// Run the check when the page loads
document.addEventListener('DOMContentLoaded', hideAdminMenuItems); 