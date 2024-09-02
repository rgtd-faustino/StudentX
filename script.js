document.addEventListener("DOMContentLoaded", function() {
    var languageSelector = document.querySelector(".dropdown-content");
    var currentLanguageButton = document.querySelector(".current-language");
    var hamburger = document.querySelector(".hamburger");

    // Language Selector Toggle
    currentLanguageButton.addEventListener("click", function(event) {
        event.stopPropagation(); // Prevents the click from being detected by the document event listener
        languageSelector.classList.toggle("active");
    });

    // Close the language options if clicked outside
    document.addEventListener("click", function(event) {
        if (!languageSelector.contains(event.target) && !currentLanguageButton.contains(event.target)) {
            languageSelector.classList.remove("active");
        }
    });

    // Toggle the navigation menu when hamburger is clicked
    hamburger.addEventListener("click", function() {
        toggleMenu();  // Call the toggleMenu function when the hamburger icon is clicked
    });

    function toggleMenu() {
        const menuContent = document.querySelector('.menu-content');
        menuContent.classList.toggle('active');
        var hamburger = document.querySelector('.hamburger');
        
        // Toggle the 'open' class on the hamburger to animate the lines
        hamburger.classList.toggle('open');
    
        // Toggle the visibility of the menu content (optional)
        menuContent.classList.toggle('show');
        
    }
});



let currentIndexMobile = 0;

const carouselMobile = document.querySelector('.carousel-mobile');
const dotsMobile = document.querySelectorAll('.dot-mobile');
const totalItems = document.querySelectorAll('.item-container-mobile').length;

document.getElementById('next-mobile').addEventListener('click', () => {
    currentIndexMobile = (currentIndexMobile + 1) % totalItems;
    updateCarouselMobile();
});

document.getElementById('prev-mobile').addEventListener('click', () => {
    currentIndexMobile = (currentIndexMobile - 1 + totalItems) % totalItems;
    updateCarouselMobile();
});

function updateCarouselMobile() {
    const items = document.querySelectorAll('.item-container-mobile');
    
    items.forEach((item, index) => {
        item.classList.toggle('active', index === currentIndexMobile);
    });

    dotsMobile.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndexMobile);
    });
}


dotsMobile.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        currentIndexMobile = index;
        updateCarouselMobile();
    });
});

updateCarouselMobile();

