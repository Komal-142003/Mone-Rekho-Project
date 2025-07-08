const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.getElementById('navLinks');

mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    mobileMenuBtn.innerHTML = navLinks.classList.contains('active') 
        ? '<i class="fas fa-times"></i>' 
        : '<i class="fas fa-bars"></i>';
});

const header = document.getElementById('header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

const dishCards = document.querySelectorAll('.dish-card');
const aboutImg = document.querySelector('.about-img img');

function animateOnScroll() {
    dishCards.forEach((card, index) => {
        const cardPosition = card.getBoundingClientRect().top;
        const screenPosition = window.innerHeight / 1.3;

        if (cardPosition < screenPosition) {
            card.style.animationDelay = `${index * 0.2}s`;
            card.classList.add('animate');
        }
    });

    const aboutImgPosition = aboutImg.getBoundingClientRect().top;
    const aboutScreenPosition = window.innerHeight / 1.2;

    if (aboutImgPosition < aboutScreenPosition) {
        aboutImg.classList.add('animate');
    }
}

window.addEventListener('scroll', animateOnScroll);
animateOnScroll();

const slider = document.getElementById('testimonialSlider');
const dots = document.querySelectorAll('.slider-dot');
let currentSlide = 0;

function showSlide(index) {
    slider.style.transform = `translateX(-${index * 100}%)`;
    
    dots.forEach(dot => dot.classList.remove('active'));
    dots[index].classList.add('active');
    
    currentSlide = index;
}

dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        showSlide(index);
    });
});

setInterval(() => {
    currentSlide = (currentSlide + 1) % dots.length;
    showSlide(currentSlide);
}, 5000);

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
            
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            }
        }
    });
});