// DOM Elements
const loginForm = document.querySelector('.login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const emailError = document.getElementById('email-error');
const passwordError = document.getElementById('password-error');

// Validation Rules
const validationRules = {
    email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        minLength: 5,
        maxLength: 254
    },
    password: {
        required: true,
        minLength: 6,
        maxLength: 128
    }
};

// Validation Functions
function validateEmail(email) {
    const errors = [];
    
    if (!email || email.trim() === '') {
        return { valid: false, error: 'Email is required' };
    }
    
    const trimmedEmail = email.trim();
    
    if (trimmedEmail.length < validationRules.email.minLength) {
        return { valid: false, error: `Email must be at least ${validationRules.email.minLength} characters long` };
    }
    
    if (trimmedEmail.length > validationRules.email.maxLength) {
        return { valid: false, error: `Email must be less than ${validationRules.email.maxLength} characters` };
    }
    
    if (!validationRules.email.pattern.test(trimmedEmail)) {
        return { valid: false, error: 'Please enter a valid email address' };
    }
    
    // Additional email format checks
    if (trimmedEmail.includes('..') || trimmedEmail.startsWith('.') || trimmedEmail.endsWith('.')) {
        return { valid: false, error: 'Please enter a valid email address' };
    }
    
    const parts = trimmedEmail.split('@');
    if (parts.length !== 2) {
        return { valid: false, error: 'Please enter a valid email address' };
    }
    
    if (parts[1].split('.').length < 2) {
        return { valid: false, error: 'Please enter a valid email address' };
    }
    
    return { valid: true, error: '' };
}

function validatePassword(password) {
    if (!password || password.trim() === '') {
        return { valid: false, error: 'Password is required' };
    }
    
    if (password.length < validationRules.password.minLength) {
        return { valid: false, error: `Password must be at least ${validationRules.password.minLength} characters long` };
    }
    
    if (password.length > validationRules.password.maxLength) {
        return { valid: false, error: `Password must be less than ${validationRules.password.maxLength} characters` };
    }
    
    // Check for whitespace
    if (/\s/.test(password)) {
        return { valid: false, error: 'Password cannot contain spaces' };
    }
    
    return { valid: true, error: '' };
}

// Display Error Function
function showError(input, errorElement, errorMessage) {
    input.classList.add('error');
    input.classList.remove('valid');
    errorElement.textContent = errorMessage;
}

// Clear Error Function
function clearError(input, errorElement) {
    input.classList.remove('error');
    input.classList.add('valid');
    errorElement.textContent = '';
}

// Real-time Validation
emailInput.addEventListener('blur', () => {
    const validation = validateEmail(emailInput.value);
    if (validation.valid) {
        clearError(emailInput, emailError);
    } else {
        showError(emailInput, emailError, validation.error);
    }
});

emailInput.addEventListener('input', () => {
    // Clear error on input if previously invalid
    if (emailInput.classList.contains('error')) {
        const validation = validateEmail(emailInput.value);
        if (validation.valid) {
            clearError(emailInput, emailError);
        } else {
            emailError.textContent = validation.error;
        }
    }
});

passwordInput.addEventListener('blur', () => {
    const validation = validatePassword(passwordInput.value);
    if (validation.valid) {
        clearError(passwordInput, passwordError);
    } else {
        showError(passwordInput, passwordError, validation.error);
    }
});

passwordInput.addEventListener('input', () => {
    // Clear error on input if previously invalid
    if (passwordInput.classList.contains('error')) {
        const validation = validatePassword(passwordInput.value);
        if (validation.valid) {
            clearError(passwordInput, passwordError);
        } else {
            passwordError.textContent = validation.error;
        }
    }
});

// Form Submission Validation
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Reset previous validation states
    emailInput.classList.remove('error', 'valid');
    passwordInput.classList.remove('error', 'valid');
    
    // Validate all fields
    const emailValidation = validateEmail(emailInput.value);
    const passwordValidation = validatePassword(passwordInput.value);
    
    let isFormValid = true;
    
    // Email validation
    if (!emailValidation.valid) {
        showError(emailInput, emailError, emailValidation.error);
        isFormValid = false;
    } else {
        clearError(emailInput, emailError);
    }
    
    // Password validation
    if (!passwordValidation.valid) {
        showError(passwordInput, passwordError, passwordValidation.error);
        isFormValid = false;
    } else {
        clearError(passwordInput, passwordError);
    }
    
    // If form is valid, proceed with submission
    if (isFormValid) {
        // Get form data
        const formData = {
            email: emailInput.value.trim(),
            password: passwordInput.value,
            rememberMe: document.querySelector('.checkbox').checked
        };
        
        // Here you would typically send the data to a server
        console.log('Form is valid. Submitting...', formData);
        
        // Show success message (optional)
        alert('Login successful! (This is a demo - no actual login performed)');
        
        // In a real application, you would make an API call here:
        // fetch('/api/login', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify(formData)
        // })
        // .then(response => response.json())
        // .then(data => {
        //     // Handle success
        // })
        // .catch(error => {
        //     // Handle error
        // });
    } else {
        // Focus on first invalid field
        if (!emailValidation.valid) {
            emailInput.focus();
        } else if (!passwordValidation.valid) {
            passwordInput.focus();
        }
    }
});

// Prevent form submission on Enter key if validation fails
emailInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        passwordInput.focus();
    }
});

// Google Login Button Handler (placeholder)
document.querySelector('.google-btn').addEventListener('click', (e) => {
    e.preventDefault();
    console.log('Google login clicked');
    // Implement Google OAuth here
    alert('Google login functionality would be implemented here');
});

// Forgot Password Link Handler (placeholder)
document.querySelector('.forgot-password').addEventListener('click', (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    
    if (!email) {
        emailInput.focus();
        showError(emailInput, emailError, 'Please enter your email address first');
        return;
    }
    
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
        emailInput.focus();
        showError(emailInput, emailError, emailValidation.error);
        return;
    }
    
    console.log('Forgot password requested for:', email);
    alert(`Password reset link would be sent to: ${email}`);
});

