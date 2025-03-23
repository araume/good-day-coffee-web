// DOM Elements
const userTableBody = document.getElementById('userTableBody');
const addUserBtn = document.querySelector('.add-user-btn');
const searchInput = document.getElementById('searchInput');
const userModal = document.getElementById('userModal');
const closeBtn = document.querySelector('.close');
const userForm = document.getElementById('userForm');

// State
let users = [];
let currentUserId = null;

// Fetch all users
async function fetchUsers() {
    try {
        const response = await fetch('/api/users/users');
        if (!response.ok) throw new Error('Failed to fetch users');
        users = await response.json();
        displayUsers(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        alert('Failed to load users');
    }
}

// Display users in table
function displayUsers(usersToDisplay) {
    userTableBody.innerHTML = '';
    usersToDisplay.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.name}</td>
            <td>${user.phone || 'N/A'}</td>
            <td>${user.email}</td>
            <td>${user.age || 'N/A'}</td>
            <td>${user.gender || 'N/A'}</td>
            <td>${user.isActive ? 'Active' : 'Inactive'}</td>
            <td>
                <button onclick="editUser('${user._id}')" class="edit-btn">Edit</button>
                <button onclick="deleteUser('${user._id}')" class="delete-btn">Delete</button>
            </td>
        `;
        userTableBody.appendChild(row);
    });
}

// Show modal for adding/editing user
function showModal(user = null) {
    currentUserId = user ? user._id : null;
    userForm.reset();
    
    if (user) {
        // Populate form with user data
        Object.keys(user).forEach(key => {
            const input = userForm.elements[key];
            if (input) input.value = user[key];
        });
        // Clear password fields when editing
        userForm.elements.password.value = '';
        userForm.elements.confirmPassword.value = '';
    }

    userModal.style.display = 'block';
}

// Close modal
function closeModal() {
    userModal.style.display = 'none';
    currentUserId = null;
}

// Handle form submission
async function handleSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(userForm);
    const userData = Object.fromEntries(formData.entries());
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'age', 'gender', 'status'];
    const missingFields = requiredFields.filter(field => !userData[field]);
    
    if (missingFields.length > 0) {
        alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
        return;
    }

    // Validate passwords if creating new user or if password is provided
    if (!currentUserId || userData.password) {
        if (!userData.password) {
            alert('Password is required for new users');
            return;
        }
        if (userData.password !== userData.confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        if (userData.password.length < 6) {
            alert('Password must be at least 6 characters long');
            return;
        }
    }

    // Remove confirmPassword and empty password fields
    delete userData.confirmPassword;
    if (!userData.password) {
        delete userData.password;
    }
    
    // Add override code
    userData.overrideCode = 'GoodDayCoffeeSystemOverRide2025';

    try {
        if (currentUserId) {
            // Update user
            const response = await fetch(`/api/users/users/${currentUserId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }
        } else {
            // Create new user
            const response = await fetch('/api/users/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }
        }

        closeModal();
        fetchUsers();
    } catch (error) {
        alert(error.message);
    }
}

// Edit user
async function editUser(userId) {
    const user = users.find(u => u._id === userId);
    if (user) {
        showModal(user);
    }
}

// Delete user
async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
        const response = await fetch(`/api/users/users/${userId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ overrideCode: 'GoodDayCoffeeSystemOverRide2025' })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message);
        }

        fetchUsers();
    } catch (error) {
        alert(error.message);
    }
}

// Search functionality
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        (user.phone && user.phone.includes(searchTerm))
    );
    displayUsers(filteredUsers);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    fetchUsers();
    addUserBtn.addEventListener('click', () => showModal());
    closeBtn.addEventListener('click', closeModal);
    userForm.addEventListener('submit', handleSubmit);
    searchInput.addEventListener('input', handleSearch);

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === userModal) closeModal();
    });
}); 