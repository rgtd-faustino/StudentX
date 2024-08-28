document.addEventListener("DOMContentLoaded", function() {
    var languageSelector = document.querySelector(".language-selector");
    var currentLanguageButton = document.querySelector(".current-language");
    var navActions = document.querySelector(".nav-actions");
    var navItems = document.querySelector(".nav-items");

    // Language Selector Toggle
    currentLanguageButton.addEventListener("click", function(event) {
        event.stopPropagation(); // Prevents the click from being detected by the document event listener
        languageSelector.classList.toggle("active");
    });

    // Close the language options if clicked outside
    document.addEventListener("click", function(event) {
        if (!languageSelector.contains(event.target)) {
            languageSelector.classList.remove("active");
        }
    });

    // Toggle Navigation Menu for Mobile
    navActions.addEventListener("click", function(event) {
        // Only toggle if the click is not on the language selector or contact button
        if (!languageSelector.contains(event.target) && !event.target.closest('.contact-button')) {
            navItems.style.display = navItems.style.display === 'block' ? 'none' : 'block';
        }
    });

    // Close the nav items if clicked outside (optional enhancement)
    document.addEventListener("click", function(event) {
        if (!navActions.contains(event.target) && navItems.style.display === 'block') {
            navItems.style.display = 'none';
        }
    });
});
