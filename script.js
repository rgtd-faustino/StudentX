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



// Mobile-specific code
if (window.matchMedia("(max-width: 768px)").matches) {
    let currentIndexMobile = 0;

    const carouselMobile = document.querySelector('.carousel-mobile');
    const dotsMobile = document.querySelectorAll('.dot-mobile');
    const totalItemsMobile = document.querySelectorAll('.item-container-mobile').length;

    document.getElementById('next-mobile').addEventListener('click', () => {
        currentIndexMobile = (currentIndexMobile + 1) % totalItemsMobile;
        updateCarouselMobile();
    });

    document.getElementById('prev-mobile').addEventListener('click', () => {
        currentIndexMobile = (currentIndexMobile - 1 + totalItemsMobile) % totalItemsMobile;
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
}

// Desktop-specific code
if (window.matchMedia("(min-width: 769px)").matches) {
    let currentIndexDesktop = 0;
    const itemsToShow = 4; // Number of items to move at a time
    const carouselDesktop = document.querySelector('.item-group-mobile');
    const totalItemsDesktop = document.querySelectorAll('.item-container-mobile').length;
    const itemWidthPercentage = 46.7 / itemsToShow;

    document.getElementById('next-mobile').addEventListener('click', () => {
        // Move right: Increase index by itemsToShow
        currentIndexDesktop = (currentIndexDesktop + itemsToShow) % totalItemsDesktop;
        updateCarouselDesktop();
    });

    document.getElementById('prev-mobile').addEventListener('click', () => {
        // Move left: Decrease index by itemsToShow
        currentIndexDesktop = (currentIndexDesktop - itemsToShow + totalItemsDesktop) % totalItemsDesktop;
        updateCarouselDesktop();
    });

    function updateCarouselDesktop() {
        const offset = -currentIndexDesktop * itemWidthPercentage; /* Calculate the offset in percentage */
        carouselDesktop.style.transform = `translateX(${offset}%)`; /* Move the item group */
    }

    updateCarouselDesktop(); // Initialize the carousel position
}
