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
    }
});
