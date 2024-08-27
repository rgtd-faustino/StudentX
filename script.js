
document.addEventListener("DOMContentLoaded", function() {
    var languageSelector = document.querySelector(".language-selector");
    var currentLanguageButton = document.querySelector(".current-language");

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
});

