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

// Function to create carousel items dynamically with chronological sorting
function createCarouselItems(data) {
    const container = document.getElementById('item-group-1-mobile');
    if (!container) return;
    
    // Clear existing content
    container.innerHTML = '';
    
    sortItemsByDate(data.items);
    
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
// Function to sort items by date (most recent first)
function sortItemsByDate(items) {
    // Map of month names to their numerical values
    const monthMap = {
        'janeiro': 1,
        'fevereiro': 2,
        'março': 3,
        'abril': 4,
        'maio': 5, 
        'junho': 6,
        'julho': 7,
        'agosto': 8,
        'setembro': 9,
        'outubro': 10,
        'novembro': 11,
        'dezembro': 12
    };
    
    // Parse date information from the description subtitle or use direct date properties
    items.forEach(item => {
        // Try to extract date from descriptionSubtitle if day/month are not directly available
        if (!item.day || !item.month) {
            const dateRegex = /(\d+)\s+de\s+(\w+)(?:\s+de\s+(\d{4}))?/i;
            const match = item.descriptionSubtitle.match(dateRegex);
            
            if (match) {
                item._parsedDay = parseInt(match[1], 10);
                item._parsedMonth = monthMap[match[2].toLowerCase()] || 0;
                item._parsedYear = match[3] ? parseInt(match[3], 10) : new Date().getFullYear();
            } else {
                // Default values if parsing fails
                item._parsedDay = 1;
                item._parsedMonth = 1;
                item._parsedYear = 2000;
            }
        } else {
            // Use direct day/month properties if available
            item._parsedDay = parseInt(item.day, 10);
            item._parsedMonth = typeof item.month === 'string' ? 
                (monthMap[item.month.toLowerCase()] || 0) : 
                parseInt(item.month, 10);
            item._parsedYear = item.year ? parseInt(item.year, 10) : new Date().getFullYear();
        }
        
        // Create a numeric value for easy comparison (YYYYMMDD)
        item._dateValue = (item._parsedYear * 10000) + (item._parsedMonth * 100) + item._parsedDay;
    });
    
    items.sort((a, b) => a._dateValue - b._dateValue);
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
    let totalItems;

    if(document.querySelectorAll('.item-container-mobile').length <= 12){
       totalItems = document.querySelectorAll('.item-container-mobile').length;
    } else {
        totalItems = 12;
    }
    
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
    let isSwipeLocked = false;
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
   
    // Cache for animation values to avoid recalculation
    let currentItem = null;
    let leftIndicator = null;
    let rightIndicator = null;
    let animationRequest = null;
    let currentDiff = 0;
    let isHorizontalSwipe = false;
    let initialTouchY = 0;
    let isTouchActive = false;
    
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
        const leftInd = document.createElement('div');
        leftInd.className = 'swipe-indicator left-indicator';
        leftInd.innerHTML = '<i class="fa fa-times"></i><span>Reject</span>';
        
        // Create right (good) indicator
        const rightInd = document.createElement('div');
        rightInd.className = 'swipe-indicator right-indicator';
        rightInd.innerHTML = '<i class="fa fa-check"></i><span>Accept</span>';
        
        swipeIndicators.appendChild(leftInd);
        swipeIndicators.appendChild(rightInd);
        item.appendChild(swipeIndicators);
    });
   
    let currentIndex = 0;
   
    // Touch event variables
    let startX, moveX, startTime;
    const minSwipeDistance = 50; // Minimum distance for a swipe to be registered
    const horizontalThreshold = 10; // Pixels of horizontal movement to determine horizontal swipe
    const verticalThreshold = 10; // Pixels of vertical movement to determine vertical swipe
   
    // Add touch event listeners - change passive to false for touchmove to allow preventDefault
    carouselContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
    carouselContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
    carouselContainer.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    // Safety measure - ensure all touches are properly ended if user leaves the page
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'hidden' && isTouchActive) {
            resetTouchState();
        }
    });
   
    function handleTouchStart(e) {
        // Prevent starting a new swipe if locked
        if (isSwipeLocked) return;
        
        // Cancel any ongoing animation
        if (animationRequest) {
            cancelAnimationFrame(animationRequest);
            animationRequest = null;
        }
        
        isTouchActive = true;
        startX = e.touches[0].clientX;
        initialTouchY = e.touches[0].clientY;
        startTime = new Date().getTime();
        isHorizontalSwipe = null; // Reset direction detection
        
        // Get the current visible item and prepare it for animation
        currentItem = carouselItems[currentIndex];
        if (currentItem) {
            leftIndicator = currentItem.querySelector('.left-indicator');
            rightIndicator = currentItem.querySelector('.right-indicator');
            currentItem.style.transition = 'none';
        }
    }
   
    function handleTouchMove(e) {
        if (!startX || !isTouchActive || !currentItem) return;
        
        moveX = e.touches[0].clientX;
        const moveY = e.touches[0].clientY;
        const diffX = moveX - startX;
        const diffY = moveY - initialTouchY;
        
        // Determine swipe direction if not already determined
        if (isHorizontalSwipe === null) {
            // If horizontal movement is greater than vertical and exceeds threshold
            if (Math.abs(diffX) > horizontalThreshold && Math.abs(diffX) > Math.abs(diffY)) {
                isHorizontalSwipe = true;
            } 
            // If vertical movement is greater than horizontal and exceeds threshold
            else if (Math.abs(diffY) > verticalThreshold && Math.abs(diffY) > Math.abs(diffX)) {
                isHorizontalSwipe = false;
            }
            // If neither threshold is met, wait for more movement
        }
        
        // If this is a horizontal swipe, prevent default to stop page scrolling
        if (isHorizontalSwipe === true) {
            e.preventDefault();
            currentDiff = diffX;
            
            // Use requestAnimationFrame to sync with browser's refresh rate
            if (!animationRequest) {
                animationRequest = requestAnimationFrame(updateSwipeAnimation);
            }
        }
    }
    
    function updateSwipeAnimation() {
        animationRequest = null;
        
        if (!currentItem || currentDiff === undefined || !isTouchActive) return;
        
        // Calculate the indicator opacity and scale
        let opacity = Math.min(Math.abs(currentDiff) / 150, 1);
        
        // Add rotation for a more natural feel
        const rotation = currentDiff / 20; // Adjust divisor for more/less rotation
        
        if (currentDiff < 0) {
            // Swiping left (reject)
            if (leftIndicator) {
                leftIndicator.style.opacity = opacity;
                leftIndicator.style.transform = `scale(${0.5 + opacity * 0.5})`;
            }
            if (rightIndicator) {
                rightIndicator.style.opacity = 0;
            }
            
            // Add a red tint to the card when swiping left
            currentItem.style.boxShadow = `0 0 ${Math.abs(currentDiff) / 2}px rgba(255, 0, 0, ${opacity * 0.5})`;
            currentItem.style.backgroundColor = `rgba(255, 240, 240, ${opacity * 0.9})`;
        } else if (currentDiff > 0) {
            // Swiping right (accept)
            if (rightIndicator) {
                rightIndicator.style.opacity = opacity;
                rightIndicator.style.transform = `scale(${0.5 + opacity * 0.5})`;
            }
            if (leftIndicator) {
                leftIndicator.style.opacity = 0;
            }
            
            // Add a green tint to the card when swiping right
            currentItem.style.boxShadow = `0 0 ${Math.abs(currentDiff) / 2}px rgba(0, 255, 0, ${opacity * 0.5})`;
            currentItem.style.backgroundColor = `rgba(240, 255, 240, ${opacity * 0.9})`;
        }
        
        currentItem.style.transform = `translateX(${currentDiff}px) rotate(${rotation}deg)`;
        
        // If touch is still active, request next frame
        if (moveX !== null && isHorizontalSwipe === true && isTouchActive) {
            animationRequest = requestAnimationFrame(updateSwipeAnimation);
        }
    }
    
    function handleTouchEnd(e) {
        if (!isTouchActive) return;
        
        // Store a local reference to the current item and indicators
        const item = currentItem;
        const leftInd = leftIndicator;
        const rightInd = rightIndicator;
        const diff = moveX !== null ? moveX - startX : 0;
        const swipeTime = startTime ? new Date().getTime() - startTime : 0;
        const isHorizontal = isHorizontalSwipe;
        
        // Cancel any ongoing animation frame requests
        if (animationRequest) {
            cancelAnimationFrame(animationRequest);
            animationRequest = null;
        }
        
        // Reset all state variables first
        resetTouchState();
        
        // Only handle card animations if we have a valid item and it was a horizontal swipe
        if (item && isHorizontal === true) {
            // If swipe is significant enough or fast enough to count as an intentional swipe
            if (Math.abs(diff) > minSwipeDistance || (Math.abs(diff) > 20 && swipeTime < 300)) {
                // Lock swipes during animation
                isSwipeLocked = true;
                
                // Calculate direction
                const isLeftSwipe = diff < 0;
                
                // First set up transition for first half of animation
                item.style.transition = 'transform 0.3s ease-out, box-shadow 0.3s ease-out, background-color 0.3s ease-out';
                
                // First move halfway with a longer pause to emphasize the indicator
                const halfwayPosition = isLeftSwipe ? -75 : 75;
                item.style.transform = `translateX(${halfwayPosition}px) rotate(${isLeftSwipe ? -5 : 5}deg)`;
                
                // Manually set indicator to full visibility at halfway point
                if (isLeftSwipe && leftInd) {
                    leftInd.style.opacity = 1;
                    leftInd.style.transform = 'scale(1)';
                    if (rightInd) rightInd.style.opacity = 0;
                    
                    // Add red tint at maximum intensity
                    item.style.boxShadow = `0 0 ${Math.abs(halfwayPosition) / 2}px rgba(255, 0, 0, 0.5)`;
                    item.style.backgroundColor = 'rgba(255, 240, 240, 0.9)';
                } else if (!isLeftSwipe && rightInd) {
                    rightInd.style.opacity = 1;
                    rightInd.style.transform = 'scale(1)';
                    if (leftInd) leftInd.style.opacity = 0;
                    
                    // Add green tint at maximum intensity
                    item.style.boxShadow = `0 0 ${Math.abs(halfwayPosition) / 2}px rgba(0, 255, 0, 0.5)`;
                    item.style.backgroundColor = 'rgba(240, 255, 240, 0.9)';
                }
                
                // Show vibration feedback
                if (navigator.vibrate) {
                    navigator.vibrate(100);
                }
                
                // Then complete the animation after a short delay
                setTimeout(() => {
                    // Check again if the item is still valid
                    if (item) {
                        item.style.transition = 'transform 0.3s ease-out';
                        item.style.transform = isLeftSwipe ? 
                            `translateX(-150%) rotate(-10deg)` : 
                            `translateX(150%) rotate(10deg)`;
                        
                        // Show the next item after animation completes
                        setTimeout(() => {
                            showNextItem();
                            resetCardStyles(item);
                            // Unlock swipes after the full animation sequence is complete
                            isSwipeLocked = false;
                        }, 300);
                    } else {
                        // Unlock swipes if item becomes invalid
                        isSwipeLocked = false;
                    }
                }, 400);
            } else {
                // Not a strong enough swipe, return to center with animation
                isSwipeLocked = true;
                item.style.transition = 'transform 0.3s ease-out, box-shadow 0.3s ease-out, background-color 0.3s ease-out';
                resetCardStyles(item);
                
                // Unlock after the reset animation completes
                setTimeout(() => {
                    isSwipeLocked = false;
                }, 300);
            }
        } else if (item) {
            // If it wasn't a horizontal swipe but we have an item, just reset the card
            isSwipeLocked = true;
            resetCardStyles(item);
            setTimeout(() => {
                isSwipeLocked = false;
            }, 300);
        }
    }
    
    function resetTouchState() {
        // Reset all touch-related variables
        isTouchActive = false;
        startX = null;
        moveX = null;
        initialTouchY = null;
        currentDiff = 0;
        isHorizontalSwipe = null;
        currentItem = null;
        leftIndicator = null;
        rightIndicator = null;
    }
    
    function resetCardStyles(item) {
        if (!item) return;
        
        item.style.transform = 'translateX(0) rotate(0deg)';
        item.style.boxShadow = 'none';
        item.style.backgroundColor = '';
        
        // Reset indicators
        const leftInd = item.querySelector('.left-indicator');
        const rightInd = item.querySelector('.right-indicator');
        if (leftInd) leftInd.style.opacity = 0;
        if (rightInd) rightInd.style.opacity = 0;
    }
    
    function showNextItem() {
        // Check if next item would be beyond the end
        if (currentIndex + 1 >= carouselItems.length) {
            // Create "no more events" message if it doesn't exist yet
            const itemContainer = document.querySelector('.item-group-mobile');
            let nextDayImg = itemContainer.querySelector('img[src="images/nextDay.png"]');
            
            if (!nextDayImg) {
                // Create the image only if it doesn't already exist
                nextDayImg = document.createElement('img');
                nextDayImg.src = 'images/nextDay.png';
                nextDayImg.alt = 'Não há mais eventos para o dia!';
                nextDayImg.id = 'nextDay';
                nextDayImg.style.display = 'none'; // Initially hidden
                
                const style = document.createElement('style');
                style.textContent = `
                    #nextDay {
                        pointer-events: none;
                    }
                `;
                document.head.appendChild(style);
                
                // Append the image to the item container
                itemContainer.appendChild(nextDayImg);
            }
            
            // Now hide current item and show nextDay
            if (carouselItems[currentIndex]) {
                carouselItems[currentIndex].style.display = 'none';
            }
            nextDayImg.style.display = 'block';
            currentIndex++; // Still increment the index
            return;
        }
        
        // Normal case - hide current, show next
        if (carouselItems[currentIndex]) {
            carouselItems[currentIndex].style.display = 'none';
        }
        currentIndex = (currentIndex + 1);
        
        // Get current date
        const today = new Date();
        const currentDay = today.getDate();
        
        // Convert month name to number for comparison
        const monthMap = {
            'janeiro': 0,      // January is 0 in JavaScript Date
            'fevereiro': 1,
            'março': 2,
            'abril': 3,
            'maio': 4, 
            'junho': 5,
            'julho': 6,
            'agosto': 7,
            'setembro': 8,
            'outubro': 9,
            'novembro': 10,
            'dezembro': 11     // December is 11 in JavaScript Date
        };
        
        // Get the current item's month as a number
        const itemMonthNum = typeof carouselItems[currentIndex].month === 'string' ? 
            monthMap[carouselItems[currentIndex].month.toLowerCase()] : 
            parseInt(carouselItems[currentIndex].month, 10) - 1; // Subtract 1 if numeric (JS months are 0-11)
        
        // Compare day and month
        if (carouselItems[currentIndex].day == currentDay && itemMonthNum == today.getMonth()) {
            // Show next item
            carouselItems[currentIndex].style.display = 'block';
            resetCardStyles(carouselItems[currentIndex]);
            
        } else {
            // Not today's event, just show it normally
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