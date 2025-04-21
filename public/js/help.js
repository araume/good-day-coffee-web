document.addEventListener('DOMContentLoaded', function() {
    const helpForm = document.getElementById('helpForm');
    
    if (helpForm) {
        helpForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;
            
            // Create email content
            const mailtoLink = `mailto:gooddaycoffees2025@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`)}`;
            
            // Open the user's email client
            window.location.href = mailtoLink;
            
            // Show confirmation message
            alert('Thank you for your message. Your email client should open shortly with your message details.');
            
            // Reset the form
            helpForm.reset();
        });
    }
}); 