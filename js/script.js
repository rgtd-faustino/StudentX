document.addEventListener("DOMContentLoaded", function() {
    // Hamburger menu functionality
    var hamburger = document.querySelector(".hamburger");
    const menuContent = document.querySelector('.menu-content');

    // Toggle the navigation menu when hamburger is clicked
    hamburger.addEventListener("click", function(e) {
        e.stopPropagation(); // Prevent click from bubbling to document
        toggleMenu();
    });

    function toggleMenu() {
        menuContent.classList.toggle('active');
        hamburger.classList.toggle('open');
        menuContent.classList.toggle('show');
    }

    // Close the navigation menu if clicked outside
    document.addEventListener("click", function(event) {
        if (!menuContent.contains(event.target) && !hamburger.contains(event.target)) {
            closeMenu();
        }
    });

    // Add click event listeners to all navigation links
    const navLinks = menuContent.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            closeMenu();
        });
    });

    // Function to close the menu
    function closeMenu() {
        menuContent.classList.remove('active');
        hamburger.classList.remove('open');
        menuContent.classList.remove('show');
    }

    // FAQ functionality
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

    // Modal functionality
    if (document.getElementById('videoModal')) {
        window.openModal = function() {
            const modal = document.getElementById('videoModal');
            const video = document.getElementById('modalVideo');
            
            modal.style.display = 'block';
            video.play();
            
            // Show ad containers if they exist
            const leftAd = document.getElementById('leftAd');
            const rightAd = document.getElementById('rightAd');
            
            if (leftAd) leftAd.style.display = 'block';
            if (rightAd) rightAd.style.display = 'block';
            
            if (typeof loadGoogleAds === 'function') {
                loadGoogleAds();
            }
        }
        
        window.closeModal = function() {
            const modal = document.getElementById('videoModal');
            const video = document.getElementById('modalVideo');
            
            modal.style.display = 'none';
            video.pause();
            video.currentTime = 0;
            
            // Hide ad containers
            const leftAd = document.getElementById('leftAd');
            const rightAd = document.getElementById('rightAd');
            
            if (leftAd) {
                leftAd.style.display = 'none';
                leftAd.innerHTML = '';
            }
            if (rightAd) {
                rightAd.style.display = 'none';
                rightAd.innerHTML = '';
            }
        }
        
        // Close modal when clicking outside the video
        window.onclick = function(event) {
            const modal = document.getElementById('videoModal');
            if (event.target == modal) {
                closeModal();
            }
        }
    }

    // Animated text rotation functionality
    function startMessageRotation(containerId, messages, animationClass) {
        let currentIndex = 0;
        const container = document.getElementById(containerId);
        
        if (!container) return;
    
        function showNextMessage() {
            const currentElement = container.querySelector(`.${animationClass}`);
            
            // Remove previous message with fade-out animation
            if (currentElement) {
                currentElement.classList.add('fade-out');
                setTimeout(() => {
                    currentElement.remove();
                }, 1000);
            }
    
            // Create and show new message
            const newElement = document.createElement('div');
            newElement.className = animationClass;
            newElement.innerHTML = messages[currentIndex];
            container.appendChild(newElement);
    
            // Trigger animation
            setTimeout(() => {
                newElement.classList.add('active');
            }, 100);
    
            // Update index
            currentIndex = (currentIndex + 1) % messages.length;
        }
    
        // Initial display
        showNextMessage();
    
        // Set interval for message rotation
        setInterval(showNextMessage, 2000);
    }
    
    // Define messages and containers
    const sloganMessages = [
        "<span class='x-highlight'>X</span>-CEED YOUR LIMITS",
        "<span class='x-highlight'>X</span>-PLORE NEW OPPORTUNITIES",
        "LEARN FROM<span class='x-highlight'>&nbsp;X</span>-PERTS",
        "PURSUE<span class='x-highlight'>&nbsp;X</span>-CELLENCE",
        "<span class='x-highlight'>X</span>-PAND YOUR NETWORK",
        "GET<span class='x-highlight'>&nbsp;X</span>-CLUSIVE INSIGHTS",
        "<span class='x-highlight'>X</span>-PECT THE BEST"
    ];
    
    const opportunitiesMessages = [
        "Palestras e workshops",
        "Academias e grupos de jovens",
        "Programas de embaixadores",
        "Núcleos de estudantes",
        "Voluntariado",
        "Júnior empresas",
        "Feiras de emprego",
        "Empresas",
        "Instituições de ensino",
        "Associações e federações de estudantes"
    ];
    
    // Start rotations for both sections
    if (document.getElementById('textContainerSlogan')) {
        startMessageRotation('textContainerSlogan', sloganMessages, 'animated-text-slogan');
    }
    
    if (document.getElementById('textContainerOpportunities')) {
        startMessageRotation('textContainerOpportunities', opportunitiesMessages, 'animated-text-opportunities');
    }

    // Mobile carousel functionality
    initializeCarousel();
});

// Main carousel initialization function (separated to avoid conflicts)
function initializeCarousel() {
    const isMobile = window.innerWidth < 600;
    const itemGroup = document.querySelector('.item-group-mobile');
    
    if (!itemGroup) return; // Exit if carousel elements don't exist
    
    // Fetch and create carousel items
    fetch('/json/events.json')
        .then(response => response.json())
        .then(data => {
            createCarouselItems(data);
            
            if (isMobile) {
                setupMobileCarousel();
            } else {
                setupDesktopCarousel();
            }
        })
        .catch(error => {
            console.error('Error loading carousel data:', error);
            // Try to use existing items if fetch fails
            if (isMobile) {
                setupMobileCarousel();
            } else {
                setupDesktopCarousel();
            }
        });
        
}

// Function to create carousel items dynamically
function createCarouselItems(data) {
    const container = document.getElementById('item-group-1-mobile');
    if (!container) return;
    
    // Clear existing content
    container.innerHTML = '';
    
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

// Setup functions for desktop and mobile carousel
function setupDesktopCarousel() {
    const itemGroup = document.querySelector('.item-group-mobile');
    const dotsPC = document.querySelectorAll('.dot-pc');
    const arrowsAndDots = document.querySelector('.arrows-and-dots');
    
    if (!itemGroup || !dotsPC.length) return;
    
    // Show arrows and dots for desktop
    if (arrowsAndDots) arrowsAndDots.style.display = 'flex';
    
    let currentIndexPC = 0;
    const itemsPerViewPC = 4;
    const totalItems = document.querySelectorAll('.item-container-mobile').length || 12;
    
    function updateTransformPC() {
        // Calculate the percentage translation based on currentIndex
        const translatePercentage = -(currentIndexPC / totalItems) * 100 * (totalItems / itemsPerViewPC);
        
        // Apply the transform inline to the itemGroup element
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
    
    const nextButton = document.getElementById('next-mobile');
    const prevButton = document.getElementById('prev-mobile');
    
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            if (currentIndexPC >= totalItems - itemsPerViewPC) {
                // Reset to the beginning
                currentIndexPC = 0;
            } else {
                currentIndexPC += itemsPerViewPC;
            }
            updateTransformPC();
        });
    }
    
    if (prevButton) {
        prevButton.addEventListener('click', () => {
            if (currentIndexPC <= 0) {
                // Move to the end
                currentIndexPC = totalItems - itemsPerViewPC;
            } else {
                currentIndexPC -= itemsPerViewPC;
            }
            updateTransformPC();
        });
    }
}

function setupMobileCarousel() {
    const carouselContainer = document.querySelector('.carousel-container-mobile');
    const itemGroup = document.querySelector('.item-group-mobile');
    const arrowsAndDots = document.querySelector('.arrows-and-dots');
   
    if (!carouselContainer || !itemGroup) return;
   
    // Hide arrows and dots for mobile
    if (arrowsAndDots) arrowsAndDots.style.display = 'none';
   
    // Get all items
    const carouselItems = document.querySelectorAll('.item-container-mobile');
    if (!carouselItems.length) return;
   
    // Reset any previous styles
    itemGroup.style.transform = 'none';
    itemGroup.style.display = 'block';
   
    // Hide all items except the first one
    carouselItems.forEach((item, index) => {
        item.style.transform = 'none';
        if (index > 0) {
            item.style.display = 'none';
        } else {
            item.style.display = 'block';
        }
        
        // Add swipe indicator containers to each item
        const swipeIndicators = document.createElement('div');
        swipeIndicators.className = 'swipe-indicators';
        
        // Create left (bad) indicator
        const leftIndicator = document.createElement('div');
        leftIndicator.className = 'swipe-indicator left-indicator';
        leftIndicator.innerHTML = '<i class="fa fa-times"></i><span>Reject</span>';
        
        // Create right (good) indicator
        const rightIndicator = document.createElement('div');
        rightIndicator.className = 'swipe-indicator right-indicator';
        rightIndicator.innerHTML = '<i class="fa fa-check"></i><span>Accept</span>';
        
        swipeIndicators.appendChild(leftIndicator);
        swipeIndicators.appendChild(rightIndicator);
        item.appendChild(swipeIndicators);
    });
   
    // Add Font Awesome for icons if not already present
    if (!document.querySelector('link[href*="font-awesome"]')) {
        const fontAwesome = document.createElement('link');
        fontAwesome.rel = 'stylesheet';
        fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
        document.head.appendChild(fontAwesome);
    }
   
    let currentIndex = 0;
   
    // Touch event variables
    let startX, moveX, startTime;
    const minSwipeDistance = 50; // Minimum distance for a swipe to be registered
   
    // Add touch event listeners
    carouselContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
    carouselContainer.addEventListener('touchmove', handleTouchMove, { passive: true });
    carouselContainer.addEventListener('touchend', handleTouchEnd, { passive: true });
   
    function handleTouchStart(e) {
        startX = e.touches[0].clientX;
        startTime = new Date().getTime();
       
        // Get the current visible item and prepare it for animation
        const currentItem = carouselItems[currentIndex];
        currentItem.style.transition = 'none';
    }
   
    function handleTouchMove(e) {
        if (!startX) return;
       
        moveX = e.touches[0].clientX;
        const diff = moveX - startX;
       
        // Move the current item with the finger
        const currentItem = carouselItems[currentIndex];
        currentItem.style.transform = `translateX(${diff}px)`;
        
        // Show and animate the appropriate indicator based on swipe direction
        const leftIndicator = currentItem.querySelector('.left-indicator');
        const rightIndicator = currentItem.querySelector('.right-indicator');
        
        if (diff < 0) {
            // Swiping left (reject)
            const opacity = Math.min(Math.abs(diff) / 150, 1);
            leftIndicator.style.opacity = opacity;
            leftIndicator.style.transform = `scale(${0.5 + opacity * 0.5})`;
            rightIndicator.style.opacity = 0;
            
            // Add a red tint to the card when swiping left
            currentItem.style.boxShadow = `0 0 ${Math.abs(diff) / 2}px rgba(255, 0, 0, ${opacity * 0.5})`;
            currentItem.style.backgroundColor = `rgba(255, 240, 240, ${opacity * 0.9})`;
        } else if (diff > 0) {
            // Swiping right (accept)
            const opacity = Math.min(Math.abs(diff) / 150, 1);
            rightIndicator.style.opacity = opacity;
            rightIndicator.style.transform = `scale(${0.5 + opacity * 0.5})`;
            leftIndicator.style.opacity = 0;
            
            // Add a green tint to the card when swiping right
            currentItem.style.boxShadow = `0 0 ${Math.abs(diff) / 2}px rgba(0, 255, 0, ${opacity * 0.5})`;
            currentItem.style.backgroundColor = `rgba(240, 255, 240, ${opacity * 0.9})`;
        }
        
        // Add rotation for a more natural feel
        const rotation = diff / 20; // Adjust divisor for more/less rotation
        currentItem.style.transform = `translateX(${diff}px) rotate(${rotation}deg)`;
    }
   
    function handleTouchEnd(e) {
        if (!startX || !moveX) return;
       
        const currentItem = carouselItems[currentIndex];
        const diff = moveX - startX;
        const swipeTime = new Date().getTime() - startTime;
       
        // Reset transition for smooth animation
        currentItem.style.transition = 'transform 0.3s ease-out, box-shadow 0.3s ease-out, background-color 0.3s ease-out';
       
        // If swipe is significant enough or fast enough
        if (Math.abs(diff) > minSwipeDistance || (Math.abs(diff) > 20 && swipeTime < 300)) {
            // Decide direction based on swipe
            if (diff < 0) {
                // Swipe left
                currentItem.style.transform = `translateX(-150%) rotate(-10deg)`;
                
                // Add vibration for rejection if supported
                if (navigator.vibrate) {
                    navigator.vibrate(100);
                }
                
                // Show the next item after animation
                setTimeout(() => {
                    showNextItem();
                    resetCardStyles(currentItem);
                }, 300);
            } else {
                // Swipe right
                currentItem.style.transform = `translateX(150%) rotate(10deg)`;
                
                
                // Show the next item after animation
                setTimeout(() => {
                    showNextItem();
                    resetCardStyles(currentItem);
                }, 300);
            }
        } else {
            // Not a strong enough swipe, return to center with animation
            resetCardStyles(currentItem);
        }
       
        // Reset variables
        startX = null;
        moveX = null;
    }
    
    function resetCardStyles(item) {
        item.style.transform = 'translateX(0) rotate(0deg)';
        item.style.boxShadow = 'none';
        item.style.backgroundColor = '';
        
        // Reset indicators
        const leftIndicator = item.querySelector('.left-indicator');
        const rightIndicator = item.querySelector('.right-indicator');
        if (leftIndicator) leftIndicator.style.opacity = 0;
        if (rightIndicator) rightIndicator.style.opacity = 0;
    }
    
    function showNextItem() {
        // Hide current item
        if (carouselItems[currentIndex]) {
            carouselItems[currentIndex].style.display = 'none';
        }
        
        if(currentIndex == carouselItems.length){
            return;
        }

        // Move to next item or loop back to first
        currentIndex = (currentIndex + 1);
        
        if (currentIndex == carouselItems.length) {
            // Select the first .item-container-mobile div
            const itemContainer = document.querySelector('.item-group-mobile');
        
            if (itemContainer && !itemContainer.querySelector('img[src="images/nextDay.png"]')) {
                // Create an <img> element only if it doesn't already exist
                const img = document.createElement('img');
                
                // Set the image source and alt attributes
                img.src = 'images/nextDay.png'; // Replace with the actual image path
                img.alt = 'Não há mais eventos para o dia!'; // Replace with a meaningful description
                
                // Append the image to the item container
                itemContainer.appendChild(img);
            }
            return;
        }

        // Show next item
        if (carouselItems[currentIndex]) {
            carouselItems[currentIndex].style.display = 'block';
            resetCardStyles(carouselItems[currentIndex]);
        }
    }
}

// Function to add initial instructions overlay
function addSwipeInstructions() {
    // Add instructions only to the first card
    const firstCard = document.querySelector('.item-container-mobile');
    if (!firstCard) return;
    
    const instructions = document.createElement('div');
    instructions.className = 'swipe-instructions';
    instructions.innerHTML = `
        <h3>Dá Swipe para escolher</h3>
        <p class="instruction-right">
            <i class="fa fa-check instruction-icon"></i>
            Swipe RIGHT to ACCEPT
            Dá Swipe para a DIREITA para ACEITAR
        </p>
        <p class="instruction-left">
            <i class="fa fa-times instruction-icon"></i>
            Dá Swipe para a ESQUERDA para RECUSAR
        </p>
        <button id="got-it-btn">Entendido!</button>
    `;
    
    firstCard.appendChild(instructions);
    
    // Add event listener to dismiss instructions
    setTimeout(() => {
        const gotItBtn = document.getElementById('got-it-btn');
        if (gotItBtn) {
            gotItBtn.addEventListener('click', () => {
                instructions.style.opacity = '0';
                setTimeout(() => {
                    instructions.remove();
                }, 500);
            });
        }
    }, 0);
}

// Call these functions when the document is ready
document.addEventListener('DOMContentLoaded', function() {
    // The original initialization will call setupMobileCarousel
    initializeCarousel();
    
    // Add instructions once the carousel is loaded
    if(window.innerWidth < 600){
        setTimeout(addSwipeInstructions, 50);
    }
});