
// function starts the entire carousel
function initializeCarousel() {
    // first, we take into account if the user is on a cellphone or not
    const isMobile = window.innerWidth < 600;
    const itemGroup = document.querySelector('.item-group-mobile');
    
    if (!itemGroup) return; // if carousel elements don't exist we exit
    
    // we go to the events.json and retrieve all of the items for the carousel (the events)
    fetch('/json/events.json')
        .then(response => response.json())
        .then(data => {
            // for each response we create a card for the carousel
            createCarouselItems(data);
            
            // depending on the interface of the user we setup things differently
            if (isMobile) {
                setupMobileCarousel();
            } else {
                setupDesktopCarousel();
            }
        })
        .catch(error => {
            console.error('Error loading carousel data:', error);

            // we try again using the informations we already have if the fetch doesn't work
            if (isMobile) {
                setupMobileCarousel();
            } else {
                setupDesktopCarousel();
            }
        });
        
}

// this function creates the cards of the carousel
function createCarouselItems(data) {
    const container = document.getElementById('item-group-1-mobile');
    if (!container) return;
    
    container.innerHTML = '';
    
    // after we add a datevalue to each of the items in format YYYYMMDD and sort them by the most recent we can show them
    sortItemsByDate(data.items);
    
    // so for each item we add all of their informations
    data.items.forEach(item => {
        const itemContainer = document.createElement('div');
        itemContainer.className = 'item-container-mobile';
        
        // item Image
        const img = document.createElement('img');
        img.src = item.imageSrc;
        img.alt = item.altText;
        itemContainer.appendChild(img);
        
        // description
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
        
        // carousel Line
        const carouselLine = document.createElement('div');
        carouselLine.className = 'carousel-line';
        itemContainer.appendChild(carouselLine);
        
        // opportunity Place
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
        
        // more Info Button
        const moreInfoBtn = document.createElement('a');
        moreInfoBtn.href = item.moreInfoLink;
        moreInfoBtn.className = 'button-carousel-mobile';
        moreInfoBtn.textContent = 'Mais Informações';
        
        itemContainer.appendChild(moreInfoBtn);

        itemContainer._dateValue = item._dateValue;
                
        // append item container to the carousel container
        container.appendChild(itemContainer);
    });
}

// we have to show the most recents events first so this function does exactly that
function sortItemsByDate(items) {
    // dictionairy that combines the months to their respective numbers
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
    // we use the day and month properties each event has on the json file to check for their dates
    items.forEach(item => {
        item._parsedDay = parseInt(item.day, 10);
        item._parsedMonth = typeof item.month === 'string' ? (monthMap[item.month.toLowerCase()] || 0) : parseInt(item.month, 10);
        item._parsedYear = new Date().getFullYear();
        
        // we add a numeric value for easy comparison (YYYYMMDD)
        item._dateValue = (item._parsedYear * 10000) + (item._parsedMonth * 100) + item._parsedDay;
    });
    
    // and now we sort them based on that date value
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

// if the user is using a cellphone we set this up with a swipe like effect to accept or deny the showing items
function setupMobileCarousel() {
    let isSwipeLocked = false;
    const carouselContainer = document.querySelector('.carousel-container-mobile');
    const itemGroup = document.querySelector('.item-group-mobile');
    const arrowsAndDots = document.querySelector('.arrows-and-dots');
   
    if (!carouselContainer || !itemGroup) return;
   
    // we won't need to show the amount of events because at the end it will show a specific card saying so
    if (arrowsAndDots) arrowsAndDots.style.display = 'none';
   
    // we grab all of the items we added
    const carouselItems = document.querySelectorAll('.item-container-mobile');
    if (!carouselItems.length) return;
   
    // reset any previous styles
    itemGroup.style.transform = 'none';
    itemGroup.style.display = 'block';
   
    // cache for animation values to avoid recalculation
    let currentItem = null;
    let leftIndicator = null;
    let rightIndicator = null;
    let animationRequest = null;
    let currentDiff = 0;
    let isHorizontalSwipe = false;
    let initialTouchY = 0;
    let isTouchActive = false;
    const today = new Date();
    const todayValue = (today.getFullYear() * 10000) + ((today.getMonth() + 1) * 100) + today.getDate();
    let hasTodayEvent = false;



    carouselItems.forEach((item) => {


        if (item._dateValue === todayValue) {
            hasTodayEvent = true;
        }

        item.style.display = 'none';
        
        // add swipe indicator containers to each item
        const swipeIndicators = document.createElement('div');
        swipeIndicators.className = 'swipe-indicators';
        
        // create left (bad) indicator
        const leftInd = document.createElement('div');
        leftInd.className = 'swipe-indicator left-indicator';
        leftInd.innerHTML = '<i class="fa fa-times"></i><span>Reject</span>';
        
        // create right (good) indicator
        const rightInd = document.createElement('div');
        rightInd.className = 'swipe-indicator right-indicator';
        rightInd.innerHTML = '<i class="fa fa-check"></i><span>Accept</span>';
        
        swipeIndicators.appendChild(leftInd);
        swipeIndicators.appendChild(rightInd);
        item.appendChild(swipeIndicators);
    });

    if (!hasTodayEvent) {
        const itemContainer = document.querySelector('.item-group-mobile');
        let nextDayImg = itemContainer.querySelector('img[src="images/nextDay.png"]');

        if (!nextDayImg) {
            nextDayImg = document.createElement('img');
            nextDayImg.src = 'images/nextDay.png';
            nextDayImg.alt = 'Não há mais eventos para o dia!';
            nextDayImg.id = 'nextDay';
            nextDayImg.style.display = 'block';

            const style = document.createElement('style');
            style.textContent = `
                #nextDay {
                    pointer-events: none;
                }
            `;
            document.head.appendChild(style);

            itemContainer.appendChild(nextDayImg);
        }
        
    } else {
        if (carouselItems[0]) {
            carouselItems[0].style.display = 'block';
        }
    }
    


    let currentIndex = 0;
   
    // touch event variables
    let startX, moveX, startTime;
    const minSwipeDistance = 50; // minimum distance for a swipe to be registered
    const horizontalThreshold = 10; // pixels of horizontal movement to determine horizontal swipe
    const verticalThreshold = 10; // pixels of vertical movement to determine vertical swipe
   
    // add touch event listeners - change passive to false for touchmove to allow preventDefault
    carouselContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
    carouselContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
    carouselContainer.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    // safety measure - ensure all touches are properly ended if user leaves the page
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'hidden' && isTouchActive) {
            resetTouchState();
        }
    });
   
    function handleTouchStart(e) {
        // prevent starting a new swipe if locked (it's locked when we're already animating a previous card)
        if (isSwipeLocked) return;
        
        // cancel any ongoing animation
        if (animationRequest) {
            cancelAnimationFrame(animationRequest);
            animationRequest = null;
        }
        
        isTouchActive = true;
        startX = e.touches[0].clientX;
        initialTouchY = e.touches[0].clientY;
        startTime = new Date().getTime();
        isHorizontalSwipe = null; // reset direction detection
        
        // get the current visible item and prepare it for animation
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
                        // Store the item in cookies based on swipe direction
                        if (isLeftSwipe) {
                            addRejectedItem(item);
                        } else {
                            addAcceptedItem(item);
                        }
                        
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
        // Get today's date in YYYYMMDD format
        const today = new Date();
        const todayValue = (today.getFullYear() * 10000) + ((today.getMonth() + 1) * 100) + today.getDate();
        
        // Check if the next event is not today
        const nextItem = carouselItems[currentIndex + 1];
        if (nextItem && nextItem._dateValue !== todayValue) {
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
            
            // Hide current item and show nextDay
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
        
        carouselItems[currentIndex].style.display = 'block';
        resetCardStyles(carouselItems[currentIndex]);
            
    }

    addSwipeInstructions();

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

function setEssentialData(key, value, days = 30) {
    // Use the existing cookie consent manager's setCookie method for essential cookies
    if (window.cookieConsent && typeof window.cookieConsent.setCookie === 'function') {
        window.cookieConsent.setCookie(key, JSON.stringify(value), {
            days: days,
            sameSite: 'Lax',
            secure: true
        });
    } else {
        // Fallback method if consent manager isn't available
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${key}=${encodeURIComponent(JSON.stringify(value))};expires=${expires.toUTCString()};path=/;SameSite=Lax;Secure`;
    }
}

function getEssentialData(key) {
    // Use the existing cookie consent manager's getCookie method
    if (window.cookieConsent && typeof window.cookieConsent.getCookie === 'function') {
        const value = window.cookieConsent.getCookie(key);
        return value ? JSON.parse(value) : null;
    } else {
        // Fallback method
        const nameEQ = key + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) {
                return JSON.parse(decodeURIComponent(c.substring(nameEQ.length, c.length)));
            }
        }
        return null;
    }
}


// Updated functions to manage accepted/rejected items using essential cookies
function getAcceptedItems() {
    return getEssentialData('userEventPreferences_accepted') || [];
}

function getRejectedItems() {
    return getEssentialData('userEventPreferences_rejected') || [];
}

function addAcceptedItem(item) {
    const acceptedItems = getAcceptedItems();
    
    // Create a simplified version of the item for storage (avoid storing DOM elements)
    const itemData = {
        id: item.id || `event_${Date.now()}`,
        descriptionTitle: item.querySelector('.description-title-mobile')?.textContent || '',
        descriptionSubtitle: item.querySelector('.description-subtitle-mobile')?.textContent || '',
        oppPlaceTitle: item.querySelector('.opp-place-title-mobile')?.textContent || '',
        moreInfoLink: item.querySelector('.button-carousel-mobile')?.href || '',
        timestamp: new Date().toISOString(),
        dateValue: item._dateValue || null
    };
    
    // Check if this event is already in the accepted list
    const isDuplicate = acceptedItems.some(existingItem => 
        existingItem.descriptionTitle === itemData.descriptionTitle && 
        existingItem.descriptionSubtitle === itemData.descriptionSubtitle &&
        existingItem.oppPlaceTitle === itemData.oppPlaceTitle
    );
    
    // Only add if it's not a duplicate
    if (!isDuplicate) {
        acceptedItems.push(itemData);
        setEssentialData('userEventPreferences_accepted', acceptedItems);
    }
}

function addRejectedItem(item) {
    const rejectedItems = getRejectedItems();
    
    // Create a simplified version of the item for storage
    const itemData = {
        id: item.id || `event_${Date.now()}`,
        descriptionTitle: item.querySelector('.description-title-mobile')?.textContent || '',
        descriptionSubtitle: item.querySelector('.description-subtitle-mobile')?.textContent || '',
        oppPlaceTitle: item.querySelector('.opp-place-title-mobile')?.textContent || '',
        timestamp: new Date().toISOString(),
        dateValue: item._dateValue || null
    };
    
    // Check if this event is already in the rejected list
    const isDuplicate = rejectedItems.some(existingItem => 
        existingItem.descriptionTitle === itemData.descriptionTitle && 
        existingItem.descriptionSubtitle === itemData.descriptionSubtitle &&
        existingItem.oppPlaceTitle === itemData.oppPlaceTitle
    );
    
    // Only add if it's not a duplicate
    if (!isDuplicate) {
        rejectedItems.push(itemData);
        setEssentialData('userEventPreferences_rejected', rejectedItems);
    }
}

// Function to clean up old preferences (optional - helps with storage management)
function cleanupOldPreferences() {
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
    const cutoffTime = new Date(Date.now() - maxAge);
    
    // Clean accepted items
    const acceptedItems = getAcceptedItems();
    const filteredAccepted = acceptedItems.filter(item => {
        const itemDate = new Date(item.timestamp);
        return itemDate > cutoffTime;
    });
    if (filteredAccepted.length !== acceptedItems.length) {
        setEssentialData('userEventPreferences_accepted', filteredAccepted);
    }
    
    // Clean rejected items
    const rejectedItems = getRejectedItems();
    const filteredRejected = rejectedItems.filter(item => {
        const itemDate = new Date(item.timestamp);
        return itemDate > cutoffTime;
    });
    if (filteredRejected.length !== rejectedItems.length) {
        setEssentialData('userEventPreferences_rejected', filteredRejected);
    }
}

// Function to get user preferences for analytics (if analytics cookies are accepted)
function getUserPreferenceStats() {
    // Only return stats if analytics cookies are accepted
    if (window.cookieConsent && window.cookieConsent.hasConsent('analytics')) {
        const accepted = getAcceptedItems();
        const rejected = getRejectedItems();
        
        return {
            totalAccepted: accepted.length,
            totalRejected: rejected.length,
            preferenceRatio: accepted.length / (accepted.length + rejected.length) || 0,
            lastActivity: Math.max(
                ...accepted.map(item => new Date(item.timestamp).getTime()),
                ...rejected.map(item => new Date(item.timestamp).getTime())
            )
        };
    }
    return null;
}

// Function to check if an event was previously interacted with
function hasUserInteractedWithEvent(eventItem) {
    const eventTitle = eventItem.querySelector('.description-title-mobile')?.textContent || '';
    const eventSubtitle = eventItem.querySelector('.description-subtitle-mobile')?.textContent || '';
    const eventPlace = eventItem.querySelector('.opp-place-title-mobile')?.textContent || '';
    
    const accepted = getAcceptedItems();
    const rejected = getRejectedItems();
    
    const hasAccepted = accepted.some(item => 
        item.descriptionTitle === eventTitle && 
        item.descriptionSubtitle === eventSubtitle &&
        item.oppPlaceTitle === eventPlace
    );
    
    const hasRejected = rejected.some(item => 
        item.descriptionTitle === eventTitle && 
        item.descriptionSubtitle === eventSubtitle &&
        item.oppPlaceTitle === eventPlace
    );
    
    return hasAccepted || hasRejected;
}

// Initialize cleanup on page load
document.addEventListener('DOMContentLoaded', function() {
    // Clean up old preferences when the page loads
    cleanupOldPreferences();
    
    // Initialize carousel as before
    initializeCarousel();
    

});