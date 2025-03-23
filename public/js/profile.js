document.addEventListener('DOMContentLoaded', () => {
    const editProfileBtn = document.getElementById('editProfileBtn');
    const modal = document.getElementById('editProfileModal');
    const closeBtn = modal.querySelector('.close');
    const cancelBtn = modal.querySelector('.cancel-btn');
    const editProfileForm = document.getElementById('editProfileForm');

    // Fetch and display user profile
    fetchUserProfile();

    // Event listeners for modal
    editProfileBtn.addEventListener('click', () => {
        modal.style.display = 'block';
        populateEditForm();
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
    editProfileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(editProfileForm);
        const data = {
            name: formData.get('name'),
            phone: formData.get('phone'),
            age: formData.get('age'),
            gender: formData.get('gender')
        };

        // Only include password if it's not empty
        const newPassword = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');

        if (newPassword) {
            if (newPassword !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }
            data.password = newPassword;
        }

        try {
            const response = await fetch('/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update profile');
            }

            const result = await response.json();
            alert('Profile updated successfully!');
            modal.style.display = 'none';
            fetchUserProfile(); // Refresh the profile display
        } catch (error) {
            console.error('Error updating profile:', error);
            alert(error.message || 'Failed to update profile. Please try again.');
        }
    });
});

async function fetchUserProfile() {
    try {
        const response = await fetch('/api/users/profile');
        if (!response.ok) {
            throw new Error('Failed to fetch profile');
        }

        const user = await response.json();
        displayUserProfile(user);
    } catch (error) {
        console.error('Error fetching profile:', error);
        alert('Failed to load profile. Please try again.');
    }
}

function displayUserProfile(user) {
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userEmail').textContent = user.email;
    document.getElementById('userPhone').textContent = user.phone;
    document.getElementById('userAge').textContent = user.age;
    document.getElementById('userGender').textContent = user.gender;
    document.getElementById('userStatus').textContent = user.status || 'Active';
}

function populateEditForm() {
    const user = {
        name: document.getElementById('userName').textContent,
        phone: document.getElementById('userPhone').textContent,
        age: document.getElementById('userAge').textContent,
        gender: document.getElementById('userGender').textContent
    };

    document.getElementById('editName').value = user.name;
    document.getElementById('editPhone').value = user.phone;
    document.getElementById('editAge').value = user.age;
    document.getElementById('editGender').value = user.gender;
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
} 