const togglePassword = document.getElementById('togglePassword');
const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirmPassword');

if (togglePassword) {
    togglePassword.addEventListener('click', function() {
        const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
        password.setAttribute('type', type);
        this.textContent = type === 'password' ? 'show' : 'hide';
    });
}

if (toggleConfirmPassword) {
    toggleConfirmPassword.addEventListener('click', function() {
        const type = confirmPassword.getAttribute('type') === 'password' ? 'text' : 'password';
        confirmPassword.setAttribute('type', type);
        this.textContent = type === 'password' ? 'show' : 'hide';
    });
}

const form = document.getElementById('signupForm');
if (form) {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        let isValid = true;
        
        document.querySelectorAll('.error').forEach(el => {
            el.style.display = 'none';
        });

        const name = document.getElementById('name');
        if (name.value.trim() === '') {
            document.getElementById('nameError').style.display = 'block';
            isValid = false;
        }
        
        const phone = document.getElementById('phone');
        const phoneRegex = /^[0-9]{10,15}$/;
        if (!phoneRegex.test(phone.value)) {
            document.getElementById('phoneError').style.display = 'block';
            isValid = false;
        }
        
        const email = document.getElementById('email');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.value)) {
            document.getElementById('emailError').style.display = 'block';
            isValid = false;
        }
        
        if (password.value.length < 6) {
            document.getElementById('passwordError').style.display = 'block';
            isValid = false;
        }
        
        if (password.value !== confirmPassword.value) {
            document.getElementById('confirmPasswordError').style.display = 'block';
            isValid = false;
        }
        
        if (isValid) {
            this.submit();
        }
    });
}

const inputs = document.querySelectorAll('input');
inputs.forEach(input => {
    input.addEventListener('focus', function() {
        const label = this.parentElement.querySelector('label');
        if (label) label.style.color = 'var(--primary)';
    });
    
    input.addEventListener('blur', function() {
        const label = this.parentElement.querySelector('label');
        if (label) label.style.color = 'var(--dark)';
    });
});