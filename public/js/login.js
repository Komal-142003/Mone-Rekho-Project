const togglePassword = document.getElementById('togglePassword');
const password = document.getElementById('password');

togglePassword.addEventListener('click', function() {
    const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
    password.setAttribute('type', type);
    this.textContent = type === 'password' ? 'show' : 'hide';
});

const form = document.getElementById('loginForm');

form.addEventListener('submit', function(e) {
    e.preventDefault();
    let isValid = true;
    
    const email = document.getElementById('email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value)) {
        document.getElementById('emailError').style.display = 'block';
        isValid = false;
    } else {
        document.getElementById('emailError').style.display = 'none';
    }
    
    if (password.value.trim() === '') {
        document.getElementById('passwordError').style.display = 'block';
        isValid = false;
    } else {
        document.getElementById('passwordError').style.display = 'none';
    }
    
    if (isValid) {
        const btn = document.querySelector('.btn');
        btn.textContent = 'Logging In...';
        btn.style.backgroundColor = '#2a9d8f';
        
        setTimeout(() => {
            form.submit();
        }, 1500);
    }
});

const inputs = document.querySelectorAll('input');
inputs.forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.querySelector('label').style.color = 'var(--primary)';
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.querySelector('label').style.color = 'var(--dark)';
    });
});