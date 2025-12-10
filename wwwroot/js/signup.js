document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.login-form');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirmPassword');

    if (!form || !nameInput || !emailInput || !passwordInput || !confirmInput) return;

    function getOrCreateErrorElement(input) {
        let error = input.parentElement.querySelector('.error-message');
        if (!error) {
            error = document.createElement('span');
            error.className = 'error-message';
            input.parentElement.appendChild(error);
        }
        return error;
    }

    function showError(input, message) {
        const error = getOrCreateErrorElement(input);
        error.textContent = message;
        input.classList.add('error');
        input.classList.remove('valid');
    }

    function clearError(input) {
        const error = getOrCreateErrorElement(input);
        error.textContent = '';
        input.classList.remove('error');
        input.classList.add('valid');
    }

    function validateName() {
        const value = nameInput.value.trim();
        if (value.length < 2) {
            showError(nameInput, 'please enter your full name');
            return false;
        }
        if (!/^[a-zA-Z\s.'-]+$/.test(value)) {
            showError(nameInput, 'name can contain letters and spaces only');
            return false;
        }
        clearError(nameInput);
        return true;
    }

    function validateEmail() {
        const value = emailInput.value.trim();
        const emailRegex = /^[\w.!#$%&'*+/=?^_`{|}~-]+@[\w-]+\.[\w.-]{2,}$/i;
        if (!emailRegex.test(value)) {
            showError(emailInput, 'please enter a valid email');
            return false;
        }
        clearError(emailInput);
        return true;
    }

    function validatePassword() {
        const value = passwordInput.value;
        const rules = [
            { test: /.{8,}/, message: 'at least 8 characters' },
            { test: /[a-z]/, message: 'one lowercase letter' },
            { test: /[A-Z]/, message: 'one uppercase letter' },
            { test: /\d/, message: 'one number' },
            { test: /[^\w\s]/, message: 'one special character' },
        ];

        const failed = rules.filter(r => !r.test.test(value));
        if (failed.length) {
            const msg = 'password must include ' + failed.map(f => f.message).join(', ');
            showError(passwordInput, msg);
            return false;
        }
        clearError(passwordInput);
        return true;
    }

    function validateConfirm() {
        if (confirmInput.value !== passwordInput.value || confirmInput.value.length === 0) {
            showError(confirmInput, 'passwords do not match');
            return false;
        }
        clearError(confirmInput);
        return true;
    }

    // Real-time validation
    nameInput.addEventListener('input', validateName);
    emailInput.addEventListener('input', validateEmail);
    passwordInput.addEventListener('input', () => {
        validatePassword();
        validateConfirm();
    });
    confirmInput.addEventListener('input', validateConfirm);

    form.addEventListener('submit', (e) => {
        const valid = [validateName(), validateEmail(), validatePassword(), validateConfirm()].every(Boolean);
        if (!valid) {
            e.preventDefault();
        }
    });
});


