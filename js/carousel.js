let allEventsData = [];


// function starts the entire carousel
function initializeCarousel() {
    const isMobile = window.innerWidth < 600;
    const itemGroup = document.querySelector('.item-group-mobile');
    
    if (!itemGroup) return;
    
    fetch('/json/events.json')
        .then(response => response.json())
        .then(data => {
            // Store all events globally for day navigation
            allEventsData = data.items;
            
            // Now that events data is loaded, we can safely run maintenance cleanup
            performMaintenanceCleanup();
            
            // Set up periodic cleanup (every hour) - only after data is loaded
            setInterval(performMaintenanceCleanup, 60 * 60 * 1000);
            
            createCarouselItems(data);
            
            if (isMobile) {
                setupMobileCarousel();
            } else {
                setupDesktopCarousel();
            }
        })
        .catch(error => {
            console.error('Error loading carousel data:', error);
            if (isMobile) {
                setupMobileCarousel();
            } else {
                setupDesktopCarousel();
            }
        });

}

function hasEventTimePassed(item) {
    const now = new Date();
    const today = new Date();
    const todayValue = (today.getFullYear() * 10000) + ((today.getMonth() + 1) * 100) + today.getDate();
    
    // If the event is not today, use the existing date logic
    if (item._dateValue !== todayValue) {
        return item._dateValue < todayValue;
    }
    
    // If it's today, check the time
    if (item.endTime) {
        // Parse endTime (assuming format like "14:30" or "14:30:00")
        const endTimeParts = item.endTime.split(':');
        const endHour = parseInt(endTimeParts[0], 10);
        const endMinute = parseInt(endTimeParts[1], 10);
        
        const eventEndTime = new Date();
        eventEndTime.setHours(endHour, endMinute, 0, 0);
        
        // Event has passed if current time is after end time
        return now > eventEndTime;
    }
    
    // If no endTime, check startTime
    if (item.startTime) {
        // Parse startTime (assuming format like "14:30" or "14:30:00")
        const startTimeParts = item.startTime.split(':');
        const startHour = parseInt(startTimeParts[0], 10);
        const startMinute = parseInt(startTimeParts[1], 10);
        
        const eventStartTime = new Date();
        eventStartTime.setHours(startHour, startMinute, 0, 0);
        
        // Event has passed if current time is after start time (assuming 2-hour duration)
        const eventEndTime = new Date(eventStartTime.getTime() + (2 * 60 * 60 * 1000));
        return now > eventEndTime;
    }
    
    // If no time information, consider it valid for the whole day
    return false;
}

function createEventId(item) {
    // Use the actual event ID from the JSON data
    return item.id || `${item.descriptionTitle || ''}_${item.descriptionSubtitle || ''}_${item.oppPlaceTitle || ''}_${item.day || ''}_${item.month || ''}_${item.startTime || ''}`;
}

// Updated createCarouselItems function to handle desktop vs mobile differently
function createCarouselItems(data) {
    const container = document.getElementById('item-group-1-mobile');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Sort items by date first
    sortItemsByDate(data.items);

    // Check if we're on mobile
    const isMobile = window.innerWidth < 600;
    
    let filteredItems;
    
    if (isMobile) {
        // Mobile: Filter for today's events only and check time
        const currentDay = getCurrentDay();
        const currentDayValue = (currentDay.getFullYear() * 10000) + ((currentDay.getMonth() + 1) * 100) + currentDay.getDate();
        
        // Filter for current day's events only and check time
        const currentEvents = data.items.filter(item => {
            return item._dateValue === currentDayValue && !hasEventTimePassed(item);
        });

        // Filter out events user has already interacted with
        filteredItems = currentEvents.filter(item => {
            const hasInteracted = hasUserInteractedWithItem(item);
            if (hasInteracted) {
                console.log(`Filtering out event ID ${item.id} - user has already interacted`);
            }
            return !hasInteracted;
        });

    } else {
        // Desktop: Get first 12 upcoming events (any day, starting from current time)
        const currentEvents = data.items.filter(item => {
            return !hasEventTimePassed(item);
        });

        // Filter out events user has already interacted with
        const nonInteractedEvents = currentEvents.filter(item => {
            const hasInteracted = hasUserInteractedWithItem(item);
            if (hasInteracted) {
                console.log(`Filtering out event ID ${item.id} - user has already interacted`);
            }
            return !hasInteracted;
        });

        // Take only the first 12 events for desktop
        filteredItems = nonInteractedEvents.slice(0, 12);
    }

    // Remove duplicates based on unique identifier
    const uniqueItems = [];
    const seenIds = new Set();
    
    filteredItems.forEach(item => {
        const eventId = createEventId(item);
        if (!seenIds.has(eventId)) {
            seenIds.add(eventId);
            uniqueItems.push(item);
        }
    });
    
    console.log(`Total events: ${data.items.length}, After time filter: ${isMobile ? 'Today only' : 'All upcoming'}, After interaction filter: ${filteredItems.length}, After duplicate removal: ${uniqueItems.length}`);
    
    uniqueItems.forEach(item => {
        const itemContainer = document.createElement('div');
        itemContainer.className = 'item-container-mobile';
        
        // IMPORTANT: Store the original event data on the DOM element
        itemContainer._originalEventData = { ...item };
        
        // Ensure date values are properly stored
        itemContainer._dateValue = item._dateValue;
        itemContainer._parsedDay = item._parsedDay;
        itemContainer._parsedMonth = item._parsedMonth;
        itemContainer._parsedYear = item._parsedYear;
        
        // Store original JSON properties for better cookie storage
        itemContainer.day = item.day;
        itemContainer.month = item.month;
        itemContainer.startTime = item.startTime;
        itemContainer.endTime = item.endTime;
        
        // Store the actual event ID
        itemContainer.id = item.id;
        itemContainer.eventId = item.id;
        
        // Rest of your existing code for creating the carousel item...
        const img = document.createElement('img');
        img.src = item.imageSrc;
        img.alt = item.altText;
        itemContainer.appendChild(img);
        
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
        
        const carouselLine = document.createElement('div');
        carouselLine.className = 'carousel-line';
        itemContainer.appendChild(carouselLine);
        
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
        
        const moreInfoBtn = document.createElement('a');
        moreInfoBtn.href = item.moreInfoLink;
        moreInfoBtn.className = 'button-carousel-mobile';
        moreInfoBtn.textContent = 'Mais Informações';
        
        itemContainer.appendChild(moreInfoBtn);
        
        container.appendChild(itemContainer);
    });
}

// we have to show the most recents events first so this function does exactly that
function sortItemsByDate(items) {
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
    
    items.forEach(item => {
        item._parsedDay = parseInt(item.day, 10);
        item._parsedMonth = typeof item.month === 'string' ? (monthMap[item.month.toLowerCase()] || 0) : parseInt(item.month, 10);
        item._parsedYear = new Date().getFullYear();
        
        item._dateValue = (item._parsedYear * 10000) + (item._parsedMonth * 100) + item._parsedDay;
    });
    
    items.sort((a, b) => a._dateValue - b._dateValue);
}

function setupDesktopCarousel() {
    const itemGroup = document.querySelector('.item-group-mobile');
    const dotsPC = document.querySelectorAll('.dot-pc');
    const arrowsAndDots = document.querySelector('.arrows-and-dots');
    
    if (!itemGroup || !dotsPC.length) return;
    
    // Show arrows and dots for desktop
    if (arrowsAndDots) arrowsAndDots.style.display = 'flex';
    
    let currentIndexPC = 0;
    const itemsPerViewPC = 4;
    
    // Get the actual number of items in the carousel
    const actualItemCount = document.querySelectorAll('.item-container-mobile').length;
    
    // For desktop, we want to show exactly what we have (up to 12 items)
    const totalItems = Math.min(actualItemCount, 12);
    
    // If we have fewer than 4 items, adjust the display
    if (totalItems <= itemsPerViewPC) {
        // If we have 4 or fewer items, show them all and hide navigation
        if (arrowsAndDots) arrowsAndDots.style.display = 'none';
        return;
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
    let currentDay = getCurrentDay();
    let noMoreEventsCard = null;
    
    // Helper function to get date value in YYYYMMDD format
    function getDateValue(date) {
        return (date.getFullYear() * 10000) + ((date.getMonth() + 1) * 100) + date.getDate();
    }
    
    const currentDayValue  = getDateValue(currentDay);
    
    // Check if there are any valid events for today (considering time)
    let hasCurrentDayEvent = false;
    carouselItems.forEach((item) => {
        if (item._dateValue === currentDayValue && !hasEventTimePassed(item._originalEventData)) {
            hasCurrentDayEvent = true;
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

    function createNoMoreEventsCard() {
        const itemContainer = document.querySelector('.item-group-mobile');
        
        // Remove existing card if it exists
        const existingCard = itemContainer.querySelector('.no-more-events-card');
        if (existingCard) existingCard.remove();
        
        // Create new card
        const noMoreCard = document.createElement('div');
        noMoreCard.className = 'no-more-events-card item-container-mobile';
        noMoreCard.style.display = 'none';

        // Image container
        const imageContainer = document.createElement('div');
        imageContainer.className = 'no-more-events-image-container';

        const img = document.createElement('img');
        img.src = 'images/nextDay.png';
        img.alt = 'Não há mais eventos para o dia!';
        img.id = 'nextDay';
        img.className = 'no-more-events-image';
        
        imageContainer.appendChild(img);
        noMoreCard.appendChild(imageContainer);
        
        // Description
        const description = document.createElement('div');
        description.className = 'description-mobile';

        const descriptionTitle = document.createElement('p');
        descriptionTitle.className = 'description-title-mobile';
        descriptionTitle.textContent = 'Não há mais eventos hoje';
        
        const descriptionSubtitle = document.createElement('p');
        descriptionSubtitle.className = 'description-subtitle-mobile';
        descriptionSubtitle.textContent = 'Deslize para ver o próximo dia';
        
        description.appendChild(descriptionTitle);
        description.appendChild(descriptionSubtitle);
        noMoreCard.appendChild(description);
        
        // Carousel line
        const carouselLine = document.createElement('div');
        carouselLine.className = 'carousel-line';
        noMoreCard.appendChild(carouselLine);
        
        // Placeholder section
        const placeholderSection = document.createElement('div');
        placeholderSection.className = 'next-day-section';

        const placeholderText = document.createElement('p');
        placeholderText.textContent = '← Próximo dia →';
        placeholderText.className = 'next-day-text';
        
        placeholderSection.appendChild(placeholderText);
        noMoreCard.appendChild(placeholderSection);
        
        itemContainer.appendChild(noMoreCard);
        return noMoreCard;
    }


    // Function to find events for a specific day
    function getEventsForDay(dateValue) {
        if (!allEventsData || !Array.isArray(allEventsData)) {
            console.warn('No events data available');
            return [];
        }
        
        return allEventsData.filter(item => {
            // Ensure the item has the proper date value calculated
            if (!item._dateValue) {
                sortItemsByDate([item]); // This will calculate _dateValue
            }
            
            return item._dateValue === dateValue && 
                !hasEventTimePassed(item) && 
                !hasUserInteractedWithItem(item);
        });
    }

    // Function to find next day with events
    function findNextDayWithEvents(startDate) {
        const maxDaysToCheck = 30;
        let checkDate = new Date(startDate);
        
        for (let i = 0; i < maxDaysToCheck; i++) {
            checkDate.setDate(checkDate.getDate() + 1);
            const dateValue = getDateValue(checkDate);
            const events = getEventsForDay(dateValue);
            
            if (events.length > 0) {
                return { date: new Date(checkDate), events: events };
            }
        }
        return null;
    }

    // Initialize the carousel
    if (!hasCurrentDayEvent) {
        noMoreEventsCard = createNoMoreEventsCard();
        noMoreEventsCard.style.display = 'block';
    } else {
        // Find the first valid event for current day and show it
        for (let i = 0; i < carouselItems.length; i++) {
            const item = carouselItems[i];
            if (item._dateValue === currentDayValue && !hasEventTimePassed(item._originalEventData)) {
                item.style.display = 'block';
                break;
            }
        }
    }

    // Add swipe instructions for mobile users
    addSwipeInstructions();

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
        currentItem = document.querySelector('.item-container-mobile[style*="display: block"], .no-more-events-card[style*="display: block"]');
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
    
    // Update the updateSwipeAnimation function to handle no-more-events card properly
    function updateSwipeAnimation() {
        animationRequest = null;
        
        if (!currentItem || currentDiff === undefined || !isTouchActive) return;
        
        // Calculate the indicator opacity and scale
        let opacity = Math.min(Math.abs(currentDiff) / 150, 1);
        
        // Add rotation for a more natural feel
        const rotation = currentDiff / 20; // Adjust divisor for more/less rotation
        
        const isNoMoreEventsCard = currentItem.classList.contains('no-more-events-card');
        
        if (currentDiff < 0) {
            // Swiping left
            if (leftIndicator) {
                leftIndicator.style.opacity = opacity;
                leftIndicator.style.transform = `scale(${0.5 + opacity * 0.5})`;
            }
            if (rightIndicator) {
                rightIndicator.style.opacity = 0;
            }
            
            // Enhanced blue colors for no-more-events card (both directions)
            if (isNoMoreEventsCard) {
                currentItem.classList.add('swiping-left');
                currentItem.classList.remove('swiping-right');
                currentItem.style.boxShadow = `0 0 ${Math.abs(currentDiff) / 1.5}px rgba(33, 150, 243, ${opacity * 0.8})`;
            } else {
                currentItem.style.boxShadow = `0 0 ${Math.abs(currentDiff) / 2}px rgba(255, 0, 0, ${opacity * 0.5})`;
                currentItem.style.backgroundColor = `rgba(255, 240, 240, ${opacity * 0.9})`;
            }
        } else if (currentDiff > 0) {
            // Swiping right
            if (rightIndicator) {
                rightIndicator.style.opacity = opacity;
                rightIndicator.style.transform = `scale(${0.5 + opacity * 0.5})`;
            }
            if (leftIndicator) {
                leftIndicator.style.opacity = 0;
            }
            
            // Enhanced blue colors for no-more-events card (both directions)
            if (isNoMoreEventsCard) {
                currentItem.classList.add('swiping-right');
                currentItem.classList.remove('swiping-left');
                currentItem.style.boxShadow = `0 0 ${Math.abs(currentDiff) / 1.5}px rgba(33, 150, 243, ${opacity * 0.8})`;
            } else {
                currentItem.style.boxShadow = `0 0 ${Math.abs(currentDiff) / 2}px rgba(0, 255, 0, ${opacity * 0.5})`;
                currentItem.style.backgroundColor = `rgba(240, 255, 240, ${opacity * 0.9})`;
            }
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
                const isNoMoreEventsCard = item.classList.contains('no-more-events-card');
                
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
                    
                    // Different colors for no-more-events card
                    if (isNoMoreEventsCard) {
                        item.style.boxShadow = `0 0 ${Math.abs(halfwayPosition) / 2}px rgba(0, 123, 255, 0.5)`;
                        item.style.backgroundColor = 'rgba(240, 248, 255, 0.9)';
                    } else {
                        item.style.boxShadow = `0 0 ${Math.abs(halfwayPosition) / 2}px rgba(255, 0, 0, 0.5)`;
                        item.style.backgroundColor = 'rgba(255, 240, 240, 0.9)';
                    }
                } else if (!isLeftSwipe && rightInd) {
                    rightInd.style.opacity = 1;
                    rightInd.style.transform = 'scale(1)';
                    if (leftInd) leftInd.style.opacity = 0;
                    
                    // Different colors for no-more-events card
                    if (isNoMoreEventsCard) {
                        item.style.boxShadow = `0 0 ${Math.abs(halfwayPosition) / 2}px rgba(40, 167, 69, 0.5)`;
                        item.style.backgroundColor = 'rgba(240, 255, 240, 0.9)';
                    } else {
                        item.style.boxShadow = `0 0 ${Math.abs(halfwayPosition) / 2}px rgba(0, 255, 0, 0.5)`;
                        item.style.backgroundColor = 'rgba(240, 255, 240, 0.9)';
                    }
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
                        
                        // Handle different actions based on card type and swipe direction
                        setTimeout(() => {
                            if (isNoMoreEventsCard) {
                                handleNoMoreEventsCardSwipe(isLeftSwipe);
                            } else {
                                // Regular event card - store in cookies
                                if (isLeftSwipe) {
                                    addRejectedItem(item);
                                } else {
                                    addAcceptedItem(item);
                                }
                                showNextItem();
                            }
                            
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

    // Update the handleNoMoreEventsCardSwipe function to handle both directions
    function handleNoMoreEventsCardSwipe(isLeftSwipe) {
        // Both left and right swipes go to next day
        const nextDay = findNextDayWithEvents(currentDay);
        
        if (nextDay) {
            console.log(`Moving to next day: ${nextDay.date.toDateString()}, Events found: ${nextDay.events.length}`);
            
            // Update current day AND save it
            currentDay = nextDay.date;
            setCurrentDay(currentDay); // Save the new current day
            
            // Hide the no-more-events card
            if (noMoreEventsCard) {
                noMoreEventsCard.style.display = 'none';
            }
            
            // Hide all currently visible carousel items
            const carouselItems = document.querySelectorAll('.item-container-mobile');
            carouselItems.forEach(item => {
                if (!item.classList.contains('no-more-events-card')) {
                    item.style.display = 'none';
                }
            });
            
            // Create new carousel items for the next day's events
            createNewDayCarouselItems(nextDay.events);
            
        } else {
            console.log('No more days with events found');
            // No more days with events - stay on current card
            if (noMoreEventsCard) {
                noMoreEventsCard.style.display = 'block';
                resetCardStyles(noMoreEventsCard);
            }
        }
    }

    function createNewDayCarouselItems(events) {
        const container = document.getElementById('item-group-1-mobile');
        if (!container) return;
        
        // Remove existing event items (keep no-more-events card)
        const existingItems = container.querySelectorAll('.item-container-mobile:not(.no-more-events-card)');
        existingItems.forEach(item => item.remove());
        
        // Create new items for the day's events
        events.forEach((item, index) => {
            const itemContainer = document.createElement('div');
            itemContainer.className = 'item-container-mobile';
            
            // Store the original event data
            itemContainer._originalEventData = { ...item };
            itemContainer._dateValue = item._dateValue;
            itemContainer._parsedDay = item._parsedDay;
            itemContainer._parsedMonth = item._parsedMonth;
            itemContainer._parsedYear = item._parsedYear;
            itemContainer.day = item.day;
            itemContainer.month = item.month;
            itemContainer.startTime = item.startTime;
            itemContainer.endTime = item.endTime;
            itemContainer.id = item.id;
            itemContainer.eventId = item.id;
            
            // Initially hide all items except the first one
            itemContainer.style.display = index === 0 ? 'block' : 'none';
            
            // Create the carousel item content
            const img = document.createElement('img');
            img.src = item.imageSrc;
            img.alt = item.altText;
            itemContainer.appendChild(img);
            
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
            
            const carouselLine = document.createElement('div');
            carouselLine.className = 'carousel-line';
            itemContainer.appendChild(carouselLine);
            
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
            
            const moreInfoBtn = document.createElement('a');
            moreInfoBtn.href = item.moreInfoLink;
            moreInfoBtn.className = 'button-carousel-mobile';
            moreInfoBtn.textContent = 'Mais Informações';
            
            itemContainer.appendChild(moreInfoBtn);
            
            // Add swipe indicators
            const swipeIndicators = document.createElement('div');
            swipeIndicators.className = 'swipe-indicators';
            
            const leftInd = document.createElement('div');
            leftInd.className = 'swipe-indicator left-indicator';
            leftInd.innerHTML = '<i class="fa fa-times"></i><span>Reject</span>';
            
            const rightInd = document.createElement('div');
            rightInd.className = 'swipe-indicator right-indicator';
            rightInd.innerHTML = '<i class="fa fa-check"></i><span>Accept</span>';
            
            swipeIndicators.appendChild(leftInd);
            swipeIndicators.appendChild(rightInd);
            itemContainer.appendChild(swipeIndicators);
            
            // Insert before the no-more-events card
            if (noMoreEventsCard && noMoreEventsCard.parentNode) {
                container.insertBefore(itemContainer, noMoreEventsCard);
            } else {
                container.appendChild(itemContainer);
            }
        });
        
        // Reset current index to show the first event of the new day
        currentIndex = 0;
        
        // Ensure the first event is properly displayed
        const firstEvent = container.querySelector('.item-container-mobile:not(.no-more-events-card)');
        if (firstEvent) {
            firstEvent.style.display = 'block';
            resetCardStyles(firstEvent);
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
    
    // Update the resetCardStyles function to preserve no-more-events card styling
    function resetCardStyles(item) {
        if (!item) return;
        
        item.style.transform = 'translateX(0) rotate(0deg)';
        item.style.boxShadow = 'none';
        
        // Only reset background color for regular cards, not no-more-events card
        if (!item.classList.contains('no-more-events-card')) {
            item.style.backgroundColor = '';
        } else {
            // For no-more-events card, remove the swiping classes but keep the base styling
            item.classList.remove('swiping-left', 'swiping-right');
            // Don't reset backgroundColor - let the CSS handle the default styling
        }
        
        // Reset indicators
        const leftInd = item.querySelector('.left-indicator');
        const rightInd = item.querySelector('.right-indicator');
        if (leftInd) leftInd.style.opacity = 0;
        if (rightInd) rightInd.style.opacity = 0;
    }

    function showNextItem() {
        const currentDayValue = getDateValue(currentDay);
        const carouselItems = document.querySelectorAll('.item-container-mobile:not(.no-more-events-card)');
        
        // Hide current item
        if (carouselItems[currentIndex]) {
            carouselItems[currentIndex].style.display = 'none';
        }
        
        // Move to next index
        currentIndex++;
        
        // Look for the next valid item for current day
        let nextItemIndex = -1;
        for (let i = currentIndex; i < carouselItems.length; i++) {
            const item = carouselItems[i];
            if (item._dateValue === currentDayValue && !hasEventTimePassed(item._originalEventData)) {
                nextItemIndex = i;
                break;
            }
        }
        
        if (nextItemIndex !== -1) {
            currentIndex = nextItemIndex;
            carouselItems[currentIndex].style.display = 'block';
            resetCardStyles(carouselItems[currentIndex]);
        } else {
            // No more valid items for current day - show "no more events" card
            if (!noMoreEventsCard) {
                noMoreEventsCard = createNoMoreEventsCard();
            }
            noMoreEventsCard.style.display = 'block';
            resetCardStyles(noMoreEventsCard);
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

function setEssentialData(key, value, days = 365) {
    // Use the existing cookie consent manager's setCookie method for essential cookies
    // Default to 365 days (1 year) for essential functionality like event preferences
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
    
    // Debug logging
    console.log(`Stored ${key}:`, value);
}

function getEssentialData(key) {
    let value = null;
    
    // Use the existing cookie consent manager's getCookie method
    if (window.cookieConsent && typeof window.cookieConsent.getCookie === 'function') {
        value = window.cookieConsent.getCookie(key);
    } else {
        // Fallback method
        const nameEQ = key + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) {
                value = decodeURIComponent(c.substring(nameEQ.length, c.length));
                break;
            }
        }
    }
    
    // Parse the JSON if we have a value
    if (value) {
        try {
            const parsed = JSON.parse(value);
            console.log(`Retrieved ${key}:`, parsed);
            return parsed;
        } catch (e) {
            console.error(`Error parsing ${key} from cookies:`, e);
            return null;
        }
    }
    
    console.log(`No data found for ${key}`);
    return null;
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
    
    // Get the event ID from the original event data and ensure it's an integer
    const eventId = parseInt(item._originalEventData?.id || item.id);
    
    // Only proceed if we have a valid number (including 0)
    if (!isNaN(eventId) && eventId !== undefined && eventId !== null && !acceptedItems.includes(eventId)) {
        acceptedItems.push(eventId);
        setEssentialData('userEventPreferences_accepted', acceptedItems);
        console.log(`Added event ID ${eventId} to accepted items. Total accepted:`, acceptedItems);
    } else {
        console.log(`Failed to add event ID ${eventId} to accepted items. Current accepted:`, acceptedItems);
    }
}


// Updated addRejectedItem function to store only event ID
function addRejectedItem(item) {
    const rejectedItems = getRejectedItems();
    
    // Get the event ID from the original event data and ensure it's an integer
    const eventId = parseInt(item._originalEventData?.id || item.id);
    
    // Only proceed if we have a valid number (including 0)
    if (!isNaN(eventId) && eventId !== undefined && eventId !== null && !rejectedItems.includes(eventId)) {
        rejectedItems.push(eventId);
        setEssentialData('userEventPreferences_rejected', rejectedItems);
        console.log(`Added event ID ${eventId} to rejected items. Total rejected:`, rejectedItems);
    } else {
        console.log(`Failed to add event ID ${eventId} to rejected items. Current rejected:`, rejectedItems);
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
            preferenceRatio: accepted.length / (accepted.length + rejected.length) || 0
        };
    }
    return null;
}

// Function to check if an event was previously interacted with
function hasUserInteractedWithEvent(eventItem) {
    const eventId = eventItem._originalEventData?.id || eventItem.id;
    
    if (!eventId) return false;
    
    const accepted = getAcceptedItems();
    const rejected = getRejectedItems();
    
    return accepted.includes(eventId) || rejected.includes(eventId);
}

function hasUserInteractedWithItem(item) {
    // Get the event ID and ensure it's an integer
    const eventId = parseInt(item.id || item.eventId);
    
    // Return false only if eventId is NaN or undefined, but 0 is valid
    if (isNaN(eventId) || eventId === undefined || eventId === null) return false;
    
    const accepted = getAcceptedItems();
    const rejected = getRejectedItems();
    
    // Convert all stored IDs to integers for comparison and filter out invalid values
    const acceptedIds = accepted.map(id => parseInt(id)).filter(id => !isNaN(id));
    const rejectedIds = rejected.map(id => parseInt(id)).filter(id => !isNaN(id));
    
    const hasInteracted = acceptedIds.includes(eventId) || rejectedIds.includes(eventId);
    
    // Debug logging
    console.log(`Checking interaction for event ID ${eventId}:`, {
        accepted: acceptedIds,
        rejected: rejectedIds,
        hasInteracted: hasInteracted
    });
    
    return hasInteracted;
}


// Updated function to check if an event date has passed
function hasEventDatePassed(event) {
    const today = new Date();
    const todayValue = (today.getFullYear() * 10000) + ((today.getMonth() + 1) * 100) + today.getDate();
    
    // For stored event IDs, we need to find the event in allEventsData
    if (typeof event === 'number' || (typeof event === 'string' && !isNaN(event))) {
        const eventId = parseInt(event);
        const fullEvent = allEventsData.find(e => parseInt(e.id) === eventId);
        
        if (!fullEvent) {
            // If we can't find the event, assume it's expired
            return true;
        }
        
        // Use the full event data for date checking
        return hasEventDatePassedForFullEvent(fullEvent);
    }
    
    // If it's already a full event object, use it directly
    return hasEventDatePassedForFullEvent(event);
}

function hasEventDatePassedForFullEvent(event) {
    const today = new Date();
    const todayValue = (today.getFullYear() * 10000) + ((today.getMonth() + 1) * 100) + today.getDate();
    
    // Check if the event has a dateValue (YYYYMMDD format)
    if (event.dateValue && typeof event.dateValue === 'number') {
        // If it's a past date, it has passed
        if (event.dateValue < todayValue) {
            return true;
        }
        
        // If it's today, check the time
        if (event.dateValue === todayValue) {
            return hasEventTimePassed(event);
        }
        
        // If it's a future date, it hasn't passed
        return false;
    }
    
    // Check if the event has _dateValue (calculated date value)
    if (event._dateValue && typeof event._dateValue === 'number') {
        if (event._dateValue < todayValue) {
            return true;
        }
        
        if (event._dateValue === todayValue) {
            return hasEventTimePassed(event);
        }
        
        return false;
    }
    
    // Fallback: try to construct date from day/month properties
    if (event.parsedDay && event.parsedMonth && event.parsedYear) {
        const eventDateValue = (event.parsedYear * 10000) + (event.parsedMonth * 100) + event.parsedDay;
        
        if (eventDateValue < todayValue) {
            return true;
        }
        
        if (eventDateValue === todayValue) {
            return hasEventTimePassed(event);
        }
        
        return false;
    }
    
    // If we can't determine the date, assume it's still valid
    return false;
}

// Updated function to filter out expired events from stored preferences
function filterExpiredEvents() {
    const acceptedItems = getAcceptedItems();
    const rejectedItems = getRejectedItems();
    
    // Filter out expired events by checking each event ID (convert to integers)
    const activeAccepted = acceptedItems.filter(eventId => !hasEventDatePassed(parseInt(eventId)));
    const activeRejected = rejectedItems.filter(eventId => !hasEventDatePassed(parseInt(eventId)));
    
    // Update cookies only if there were changes
    if (activeAccepted.length !== acceptedItems.length) {
        setEssentialData('userEventPreferences_accepted', activeAccepted);
    }
    
    if (activeRejected.length !== rejectedItems.length) {
        setEssentialData('userEventPreferences_rejected', activeRejected);
    }
    
    return {
        accepted: activeAccepted,
        rejected: activeRejected,
        removedCount: (acceptedItems.length - activeAccepted.length) + (rejectedItems.length - activeRejected.length)
    };
}

function performMaintenanceCleanup() {
    // Only run cleanup if events data is loaded
    if (!allEventsData || allEventsData.length === 0) {
        console.log('Skipping maintenance cleanup - events data not loaded yet');
        return;
    }
    
    const result = filterExpiredEvents();
    if (result.removedCount > 0) {
        console.log(`Removed ${result.removedCount} expired events from preferences`);
    }
}

function getCurrentDay() {
    const savedDay = getEssentialData('userCurrentDay');
    if (savedDay) {
        return new Date(savedDay);
    }
    return new Date(); // Default to today
}

function setCurrentDay(date) {
    setEssentialData('userCurrentDay', date.toISOString());
}
