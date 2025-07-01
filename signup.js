
// Signup form handling
document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.querySelector('form');
    
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const firstName = formData.get('firstname');
            const lastName = formData.get('lastname');
            const email = formData.get('email');
            const carNumber = formData.get('car-number');
            const experience = formData.get('experience');
            const categories = formData.getAll('categories');
            const termsAccepted = formData.get('terms');
            
            // Validate required fields
            if (!firstName || !lastName || !email || !carNumber || !experience || !termsAccepted) {
                alert('Please fill in all required fields and accept the terms.');
                return;
            }
            
            // Create signup request
            const signupRequest = {
                id: Date.now().toString(),
                name: `${firstName} ${lastName}`,
                email: email,
                carNumber: carNumber,
                experience: experience,
                categories: categories,
                date: new Date().toLocaleDateString(),
                status: 'pending'
            };
            
            // Get existing requests
            const existingRequests = JSON.parse(localStorage.getItem('vsct_signup_requests') || '[]');
            
            // Check if email already exists
            if (existingRequests.some(req => req.email === email)) {
                alert('A signup request with this email already exists.');
                return;
            }
            
            // Check if car number is already taken
            if (existingRequests.some(req => req.carNumber === carNumber)) {
                alert('Car number is already taken. Please choose a different number.');
                return;
            }
            
            // Add new request
            existingRequests.push(signupRequest);
            localStorage.setItem('vsct_signup_requests', JSON.stringify(existingRequests));
            
            // Success message
            alert('Registration submitted successfully! We will review your application and contact you soon.');
            
            // Reset form
            this.reset();
        });
    }
});
