// Slideshow functionality
const slides = document.querySelectorAll('.slide');
const indicators = document.querySelectorAll('.slide-indicators span');
let currentSlide = 0;
const slideInterval = 5000; // Change slide every 5 seconds

function showSlide(index) {
    // Remove active class from all slides and indicators
    slides.forEach(slide => slide.classList.remove('active'));
    indicators.forEach(indicator => indicator.classList.remove('active'));
    
    // Add active class to current slide and indicator
    slides[index].classList.add('active');
    indicators[index].classList.add('active');
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
}

// Add click event to indicators
indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
        currentSlide = index;
        showSlide(currentSlide);
        resetInterval();
    });
});

// Start automatic slideshow
let slideTimer = setInterval(nextSlide, slideInterval);

// Reset interval when manually changing slides
function resetInterval() {
    clearInterval(slideTimer);
    slideTimer = setInterval(nextSlide, slideInterval);
}

// Theme toggle functionality
const themeToggle = document.querySelector('.theme-toggle');
const body = document.body;
let isDarkMode = false;

themeToggle.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    body.style.backgroundColor = isDarkMode ? '#1a1a1a' : '#ffffff';
    body.style.color = isDarkMode ? '#ffffff' : '#333333';
    
    // Update icon
    const icon = themeToggle.querySelector('i');
    if (isDarkMode) {
        icon.classList.replace('fa-moon', 'fa-sun');
    } else {
        icon.classList.replace('fa-sun', 'fa-moon');
    }
});

// Menu item click handler
const menuItems = document.querySelectorAll('.menu-item a');
menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        // Remove active class from all items
        menuItems.forEach(i => i.classList.remove('active'));
        // Add active class to clicked item
        item.classList.add('active');
    });
});

// Chat button click handler
const chatButton = document.querySelector('.chat-button');
chatButton.addEventListener('click', () => {
    // Add chat functionality here
    console.log('Chat button clicked');
});
