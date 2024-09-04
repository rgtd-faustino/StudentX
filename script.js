document.addEventListener("DOMContentLoaded", function() {
    // Selectors
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
        hamburger.classList.toggle('open'); // Toggle the 'open' class to animate lines
        menuContent.classList.toggle('show'); // Toggle the visibility of the menu content (optional)
    }

    // Close the navigation menu if clicked outside
    document.addEventListener("click", function(event) {
        const menuContent = document.querySelector('.menu-content');
        if (!menuContent.contains(event.target) && !hamburger.contains(event.target)) {
            menuContent.classList.remove('active');
            hamburger.classList.remove('open');
            menuContent.classList.remove('show');
        }
    });

    let currentIndex = 0;
    const itemsPerView = 4;
    const totalItems = 12;
    const itemWidth = 20; // Width of each item container in percentage
    const itemGap = 5.9; // Gap between items in percentage
    
    const itemGroup = document.querySelector('.item-group-mobile');
    const dots = document.querySelectorAll('.dot-pc');
    
    // Calculate total width including gaps
    const totalWidth = (itemWidth + itemGap) * totalItems - itemGap; // Subtract the last gap
    
    function updateTransform() {
        itemGroup.style.transform = `translateX(-${(itemWidth + itemGap) * currentIndex}%)`;
        updateDots();
    }
    
    function updateDots() {
        dots.forEach((dot, index) => {
            if (index === Math.floor(currentIndex / itemsPerView)) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
    
    // Initial call to set the correct active dot
    updateDots();
    
    document.getElementById('next-mobile').addEventListener('click', () => {
        if (currentIndex >= totalItems - itemsPerView) {
            // Reset to the beginning
            currentIndex = 0;
        } else {
            currentIndex += itemsPerView;
        }
        updateTransform();
    });
    
    document.getElementById('prev-mobile').addEventListener('click', () => {
        if (currentIndex <= 0) {
            // Move to the end
            currentIndex = totalItems - itemsPerView;
        } else {
            currentIndex -= itemsPerView;
        }
        updateTransform();
    });
    
});

