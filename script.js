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



    const itemGroup = document.querySelector('.item-group-mobile');
    const dotsPC = document.querySelectorAll('.dot-pc');
    const dotsMobile = document.querySelectorAll('.dot-mobile');

    let currentIndexMobile = 0;  // Current index for the mobile carousel
    let currentIndexPC = 0;      // Current index for the PC carousel

    const itemsPerViewPC = 4;    // Number of items per view for PC
    const itemsPerViewMobile = 1; // Mobile only shows 1 item per view
    const totalItems = 12;        // Total number of items
    
    if (window.innerWidth >= 600) {
        function updateTransformPC() {
            // Calculate the percentage translation based on currentIndex
            const translatePercentage = -(currentIndexPC / totalItems) * 100 * (totalItems / itemsPerViewPC);
            
            // Apply the transform inline to the itemGroup element, ensuring no scaling is applied
            itemGroup.style.transform = `translateX(${translatePercentage}%)`;
            
            updateDotsPC();
        }
        
        function updateDotsPC() {
            dotsPC.forEach((dot, index) => {
                if (index === Math.floor(currentIndexPC / itemsPerViewPC)) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }
        // Initial call to set the correct active dot
        updateTransformPC();
        
        document.getElementById('next-mobile').addEventListener('click', () => {
            if (currentIndexPC >= totalItems - itemsPerViewPC) {
                // Reset to the beginning
                currentIndexPC = 0;
            } else {
                currentIndexPC += itemsPerViewPC;
            }
            updateTransformPC();
        });
        
        document.getElementById('prev-mobile').addEventListener('click', () => {
            if (currentIndexPC <= 0) {
                // Move to the end
                currentIndexPC = totalItems - itemsPerViewPC;
            } else {
                currentIndexPC -= itemsPerViewPC;
            }
            updateTransformPC();
        });
    }







    if (window.innerWidth <= 600) {
        let isAnimating = false;
    
        function updateTransformMobile() {
            // Calculate the percentage translation based on currentIndex
            const translatePercentage = -(currentIndexMobile / totalItems) * 100 * (totalItems / itemsPerViewMobile);
            
            // Apply the transform inline to the itemGroup element, ensuring no scaling is applied
            itemGroup.style.transform = `translateX(${translatePercentage}%)`;
            itemGroup.style.transition = 'transform 0.5s ease-in-out';
            
            updateDotsMobile();
        }
        
        function updateDotsMobile() {
            dotsMobile.forEach((dot, index) => {
                if (index === Math.floor(currentIndexMobile / itemsPerViewMobile)) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }
    
        function moveCarousel(direction) {
            if (isAnimating) return;
            isAnimating = true;
    
            if (direction === 'next') {
                currentIndexMobile = (currentIndexMobile + 1) % totalItems;
            } else {
                currentIndexMobile = (currentIndexMobile - 1 + totalItems) % totalItems;
            }
    
            updateTransformMobile();
    
            setTimeout(() => {
                isAnimating = false;
            }, 350); // Match this with the transition duration
        }
    
        // Initial call to set the correct active dot
        updateTransformMobile();
        
        document.getElementById('next-mobile').addEventListener('click', () => moveCarousel('next'));
        document.getElementById('prev-mobile').addEventListener('click', () => moveCarousel('prev'));
    
        itemGroup.addEventListener('transitionend', () => {
            isAnimating = false;
        });
    }

});    








// DO NOT MESS WITH THIS
document.addEventListener('DOMContentLoaded', function () {
    // Function to create carousel items dynamically
    function createCarouselItems(data) {
      const container = document.getElementById('item-group-1-mobile');
  
      data.items.forEach(item => {
        const itemContainer = document.createElement('div');
        itemContainer.className = 'item-container-mobile';
  
        // Item Image
        const img = document.createElement('img');
        img.src = item.imageSrc;
        img.alt = item.altText;
        itemContainer.appendChild(img);
  
        // Description
        const description = document.createElement('div');
        description.className = 'description-mobile';
  
        const descriptionTitle = document.createElement('p');
        descriptionTitle.className = 'description-title-mobile';
        descriptionTitle.textContent = item.descriptionTitle;
  
        const descriptionSubtitle = document.createElement('p');
        descriptionSubtitle.className = 'description-subtitle-mobile';
        descriptionSubtitle.textContent = item.descriptionSubtitle;
  
        description.appendChild(descriptionTitle);
        description.appendChild(descriptionSubtitle);
        itemContainer.appendChild(description);
  
        // Carousel Line
        const carouselLine = document.createElement('div');
        carouselLine.className = 'carousel-line';
        itemContainer.appendChild(carouselLine);
  
        // Opportunity Place
        const oppPlace = document.createElement('div');
        oppPlace.className = 'opp-place-mobile';
  
        const oppPlaceContainer = document.createElement('div');
        oppPlaceContainer.className = 'opp-place-container';
  
        const logoImg = document.createElement('img');
        logoImg.src = item.logoSrc;
        logoImg.alt = item.logoAlt;
  
        const oppPlaceTexts = document.createElement('div');
        oppPlaceTexts.className = 'opp-place-texts';
  
        const oppPlaceTitle = document.createElement('p');
        oppPlaceTitle.className = 'opp-place-title-mobile';
        oppPlaceTitle.textContent = item.oppPlaceTitle;
  
        const oppPlaceSubtitle = document.createElement('p');
        oppPlaceSubtitle.className = 'opp-place-subtitle-mobile';
        oppPlaceSubtitle.textContent = item.oppPlaceSubtitle;
  
        oppPlaceTexts.appendChild(oppPlaceTitle);
        oppPlaceTexts.appendChild(oppPlaceSubtitle);
        oppPlaceContainer.appendChild(logoImg);
        oppPlaceContainer.appendChild(oppPlaceTexts);
        oppPlace.appendChild(oppPlaceContainer);
        itemContainer.appendChild(oppPlace);
  
        // More Info Button
        const moreInfoBtn = document.createElement('a');
        moreInfoBtn.href = item.moreInfoLink;
        moreInfoBtn.className = 'button-carousel-mobile';
        moreInfoBtn.textContent = 'Mais Informações';
  
        itemContainer.appendChild(moreInfoBtn);
  
        // Append item container to the carousel container
        container.appendChild(itemContainer);
      });
    }
  
    // Fetch the JSON file and populate the carousel
    fetch('events.json')
      .then(response => response.json())
      .then(data => createCarouselItems(data))
      .catch(error => console.error('Error loading carousel data:', error));
    });
  


    document.addEventListener("DOMContentLoaded", function() {
        var questions = document.querySelectorAll(".faq-question");
    
        questions.forEach(function(question) {
            question.addEventListener("click", function() {
                var answer = this.nextElementSibling;
    
                if (answer.classList.contains("show")) {
                    answer.classList.remove("show");
                    this.classList.remove("active");
                } else {
                    // Hide other answers
                    document.querySelectorAll(".faq-answer.show").forEach(function(item) {
                        item.classList.remove("show");
                        item.previousElementSibling.classList.remove("active");
                    });
    
                    answer.classList.add("show");
                    this.classList.add("active");
                }
            });
        });
    });

    
    document.addEventListener("DOMContentLoaded", function () {
        const cookieBanner = document.querySelector(".cookie-banner");
        const functionalCookies = document.getElementById("functional-cookies");
        const analyticsCookies = document.getElementById("analytics-cookies");
        
        function saveCookiePreferences(functional, analytics) {
            localStorage.setItem("functionalCookies", functional);
            localStorage.setItem("analyticsCookies", analytics);
            hideCookieBanner();
            applyCookiePreferences();
        }
        
        function hideCookieBanner() {
            cookieBanner.style.display = "none";
        }
        
        function showCookieBanner() {
            cookieBanner.style.display = "block";
        }
        
        function applyCookiePreferences() {
            // Apply functional cookies
            if (localStorage.getItem("functionalCookies") === "true") {
                // Set functional cookies here
                console.log("Functional cookies enabled");
            }
            
            // Apply analytics cookies (Google Analytics)
            if (localStorage.getItem("analyticsCookies") === "true") {
                // Load Google Tag Manager
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','GTM-XXXXXXX'); // Replace GTM-XXXXXXX with your actual GTM container ID
                
                console.log("Analytics cookies enabled");
            } else {
                // Disable Google Analytics if it was previously loaded
                window['ga-disable-UA-XXXXXXXX-X'] = true; // Replace UA-XXXXXXXX-X with your actual GA property ID
                console.log("Analytics cookies disabled");
            }

        }
        
        document.getElementById("reject-all").addEventListener("click", function () {
            functionalCookies.checked = false;
            analyticsCookies.checked = false;
            saveCookiePreferences(false, false);
        });

        document.getElementById("accept-all").addEventListener("click", function () {
            functionalCookies.checked = true;
            analyticsCookies.checked = true;
            saveCookiePreferences(true, true);
        });
        
        // Check if cookie preferences are already set
        const functionalPreference = localStorage.getItem("functionalCookies");
        const analyticsPreference = localStorage.getItem("analyticsCookies");
        
        if (functionalPreference === null || analyticsPreference === null || marketingPreference === null) {
            showCookieBanner();
        } else {
            functionalCookies.checked = functionalPreference === "true";
            analyticsCookies.checked = analyticsPreference === "true";
            applyCookiePreferences();
        }
    });