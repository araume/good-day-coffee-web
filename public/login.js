document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('error-message');
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessage.style.display = 'none'; // Clear any previous errors
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            const response = await fetch('/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password }),
                credentials: 'include' // Important for session cookies
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Store token in localStorage if present
                if (data.token) {
                    localStorage.setItem('token', data.token);
                }
                
                // Store user info including admin status
                if (data.user) {
                    localStorage.setItem('userEmail', data.user.email);
                    localStorage.setItem('isAdmin', data.user.isAdmin || false);
                    console.log('User login info saved:', {
                        email: data.user.email,
                        isAdmin: data.user.isAdmin
                    });
                }
                
                // Show success message
                errorMessage.style.color = 'green';
                errorMessage.textContent = 'Login successful! Redirecting...';
                errorMessage.style.display = 'block';
                
                // Redirect after a short delay
                setTimeout(() => {
                    window.location.href = '/home.html';
                }, 1000);
            } else {
                // Show error message
                errorMessage.style.color = 'red';
                errorMessage.textContent = data.message || 'Login failed';
                errorMessage.style.display = 'block';
            }
        } catch (error) {
            console.error('Login error:', error);
            errorMessage.textContent = 'An error occurred during login. Please try again.';
            errorMessage.style.display = 'block';
        }
    });
});
