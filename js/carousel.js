let allEventsData = [];

function initializeCarousel() {
    const isMobile = window.innerWidth < 600;
    const itemGroup = document.querySelector('.item-group-mobile');
    
    if (!itemGroup) return;
    
    fetch('/json/events.json')
        .then(response => response.json())
        .then(data => {
            // Store all events globally for day navigation
            allEventsData = data.items;
            
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
    const parts = [
        item.descriptionTitle?.trim() || '',
        item.descriptionSubtitle?.trim() || '',
        item.oppPlaceTitle?.trim() || '',
        item.day || '',
        item.month || '',
        item.startTime || ''
    ];
    
    return parts.filter(part => part !== '').join('_').replace(/[^a-zA-Z0-9_]/g, '');
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
        const today = new Date();
        const todayValue = (today.getFullYear() * 10000) + ((today.getMonth() + 1) * 100) + today.getDate();
        
        // Filter out events that have already passed (including time-based filtering)
        const currentEvents = data.items.filter(item => {
            const isToday = item._dateValue === todayValue;
            const hasNotPassed = !hasEventTimePassed(item);
            console.log(`Event: ${item.descriptionTitle}, Date: ${item._dateValue}, IsToday: ${isToday}, HasNotPassed: ${hasNotPassed}`);
            return isToday && hasNotPassed;
        });
        
        console.log('Current events (today, not passed):', currentEvents.length);

        // Filter out events user has already interacted with
        filteredItems = currentEvents.filter(item => {
            const hasInteracted = hasUserInteractedWithItem(item);
            console.log(`Event: ${item.descriptionTitle}, HasInteracted: ${hasInteracted}`);
            return !hasInteracted;
        });
    } else {
        // Desktop logic remains the same
        const currentEvents = data.items.filter(item => {
            return !hasEventTimePassed(item);
        });

        const nonInteractedEvents = currentEvents.filter(item => {
            return !hasUserInteractedWithItem(item);
        });

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
        
        // Store unique identifier
        itemContainer.eventId = createEventId(item);
        
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
    let currentDay = new Date();
    let noMoreEventsCard = null;
    
    // Helper function to get date value in YYYYMMDD format
    function getDateValue(date) {
        return (date.getFullYear() * 10000) + ((date.getMonth() + 1) * 100) + date.getDate();
    }
    
    const todayValue = getDateValue(currentDay);
    
    // Check if there are any valid events for today (considering time)
    let hasTodayEvent = false;
    carouselItems.forEach((item) => {
        if (item._dateValue === todayValue && !hasEventTimePassed(item._originalEventData)) {
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
    if (!hasTodayEvent) {
        noMoreEventsCard = createNoMoreEventsCard();
        noMoreEventsCard.style.display = 'block';
    } else {
        // Find the first valid event for today and show it
        for (let i = 0; i < carouselItems.length; i++) {
            const item = carouselItems[i];
            if (item._dateValue === todayValue && !hasEventTimePassed(item._originalEventData)) {
                item.style.display = 'block';
                break;
            }
        }
    }

    let currentIndex = 0;
   
    // touch event variables
    let startX, moveX, startTime;
    const minSwipeDistance = 50;
    const horizontalThreshold = 10;
    const verticalThreshold = 10;
   
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

    function handleNoMoreEventsCardSwipe(isLeftSwipe) {
        // Both left and right swipes go to next day
        const nextDay = findNextDayWithEvents(currentDay);
        
        if (nextDay) {
            console.log(`Moving to next day: ${nextDay.date.toDateString()}, Events found: ${nextDay.events.length}`);
            
            // Update current day
            currentDay = nextDay.date;
            
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
            itemContainer.eventId = createEventId(item);
            
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

    addSwipeInstructions();
}

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
    console.log('=== SETTING ESSENTIAL DATA ===');
    console.log('Key:', key);
    console.log('Value type:', typeof value);
    console.log('Value length:', Array.isArray(value) ? value.length : 'not array');
    console.log('Value content:', value);
    
    try {
        // Use the existing cookie consent manager's setCookie method for essential cookies
        if (window.cookieConsent && typeof window.cookieConsent.setCookie === 'function') {
            console.log('Using cookieConsent.setCookie method');
            const jsonValue = JSON.stringify(value);
            console.log('Stringified value length:', jsonValue.length);
            window.cookieConsent.setCookie(key, jsonValue, {
                days: days,
                sameSite: 'Lax',
                secure: true
            });
            console.log('Cookie set via cookieConsent.setCookie');
        } else {
            console.log('Using fallback cookie method');
            // Fallback method if consent manager isn't available
            const expires = new Date();
            expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
            const cookieValue = `${key}=${encodeURIComponent(JSON.stringify(value))};expires=${expires.toUTCString()};path=/;SameSite=Lax;Secure`;
            console.log('Setting cookie with value length:', cookieValue.length);
            document.cookie = cookieValue;
            console.log('Cookie set via document.cookie');
        }
        
        // Immediate verification
        setTimeout(() => {
            const verification = getEssentialData(key);
            console.log('Immediate verification for key', key, ':', verification ? verification.length : 'null');
        }, 10);
        
    } catch (error) {
        console.error('Error in setEssentialData:', error);
    }
}

function getEssentialData(key) {
    console.log('=== GETTING ESSENTIAL DATA ===');
    console.log('Requested key:', key);
    
    try {
        // Use the existing cookie consent manager's getCookie method
        if (window.cookieConsent && typeof window.cookieConsent.getCookie === 'function') {
            console.log('Using cookieConsent.getCookie method');
            const value = window.cookieConsent.getCookie(key);
            console.log('Raw value from cookieConsent:', value);
            const parsed = value ? JSON.parse(value) : null;
            console.log('Parsed value:', parsed ? (Array.isArray(parsed) ? `Array with ${parsed.length} items` : parsed) : 'null');
            return parsed;
        } else {
            console.log('Using fallback cookie method');
            // Fallback method
            const nameEQ = key + "=";
            const ca = document.cookie.split(';');
            console.log('Total cookies found:', ca.length);
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) === ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) === 0) {
                    const rawValue = c.substring(nameEQ.length, c.length);
                    console.log('Found cookie, raw value length:', rawValue.length);
                    const decoded = decodeURIComponent(rawValue);
                    console.log('Decoded value length:', decoded.length);
                    const parsed = JSON.parse(decoded);
                    console.log('Parsed value:', parsed ? (Array.isArray(parsed) ? `Array with ${parsed.length} items` : parsed) : 'null');
                    return parsed;
                }
            }
            console.log('Cookie not found');
            return null;
        }
    } catch (error) {
        console.error('Error in getEssentialData:', error);
        return null;
    }
}

function getAcceptedItems() {
    return getEssentialData('userEventPreferences_accepted') || [];
}

function getRejectedItems() {
    return getEssentialData('userEventPreferences_rejected') || [];
}

function addAcceptedItem(item) {
    console.log('=== ADDING ACCEPTED ITEM ===');
    console.log('Item DOM element:', item);
    console.log('Item._originalEventData:', item._originalEventData);
    console.log('Item properties:', {
        _dateValue: item._dateValue,
        day: item.day,
        month: item.month,
        startTime: item.startTime,
        endTime: item.endTime
    });
    
    const acceptedItems = getAcceptedItems();
    const currentYear = new Date().getFullYear();
    const originalData = item._originalEventData || {};
    
    // Log the original data to see what we're working with
    console.log('Original data keys:', Object.keys(originalData));
    console.log('Original data values:', originalData);
    
    const eventId = createEventId(originalData);
    console.log('Generated event ID:', eventId);
    
    const itemData = {
        id: eventId,
        descriptionTitle: originalData.descriptionTitle?.trim() || '',
        descriptionSubtitle: originalData.descriptionSubtitle?.trim() || '',
        oppPlaceTitle: originalData.oppPlaceTitle?.trim() || '',
        oppPlaceSubtitle: originalData.oppPlaceSubtitle?.trim() || '',
        moreInfoLink: originalData.moreInfoLink || '',
        imageSrc: originalData.imageSrc || '',
        altText: originalData.altText || '',
        logoSrc: originalData.logoSrc || '',
        logoAlt: originalData.logoAlt || '',
        
        // Store both original and parsed date values
        dateValue: originalData._dateValue || item._dateValue || null,
        parsedDay: originalData._parsedDay || item._parsedDay || null,
        parsedMonth: originalData._parsedMonth || item._parsedMonth || null,
        parsedYear: originalData._parsedYear || item._parsedYear || currentYear,
        day: originalData.day || item.day || null,
        month: originalData.month || item.month || null,
        startTime: originalData.startTime || item.startTime || null,
        endTime: originalData.endTime || item.endTime || null,
        
        timestamp: new Date().toISOString(),
        userAction: 'accepted'
    };
    
    console.log('Final itemData to store:', itemData);
    console.log('Event ID for storage:', itemData.id);
    
    const isDuplicate = acceptedItems.some(existingItem => {
        console.log('Comparing with existing item ID:', existingItem.id);
        return existingItem.id === itemData.id;
    });
    
    console.log('Is duplicate check result:', isDuplicate);
    console.log('Current accepted items count before addition:', acceptedItems.length);
    
    if (!isDuplicate) {
        try {
            acceptedItems.push(itemData);
            console.log('About to call setEssentialData with:', acceptedItems.length, 'items');
            setEssentialData('userEventPreferences_accepted', acceptedItems);
            console.log('✅ Successfully added accepted item:', itemData.descriptionTitle);
            console.log('Total accepted items now:', acceptedItems.length);
            
            // Immediate verification
            const immediateCheck = getAcceptedItems();
            console.log('Immediate cookie verification - items count:', immediateCheck.length);
            if (immediateCheck.length > 0) {
                console.log('Last item in cookie:', immediateCheck[immediateCheck.length - 1]);
            }
        } catch (error) {
            console.error('❌ Error adding accepted item:', error);
        }
    } else {
        console.log('❌ Duplicate accepted item not added:', itemData.descriptionTitle);
    }
    
    // Verify the cookie was set with additional delay
    setTimeout(() => {
        const verifyAccepted = getAcceptedItems();
        console.log('Delayed verification - Total accepted items in cookie:', verifyAccepted.length);
        if (verifyAccepted.length > 0) {
            console.log('Delayed verification - Last added item:', verifyAccepted[verifyAccepted.length - 1]);
        }
        
        // Also check the raw cookie
        const rawCookie = document.cookie;
        console.log('Raw cookie content includes userEventPreferences_accepted:', rawCookie.includes('userEventPreferences_accepted'));
    }, 100);
}

// Enhanced logging version of addRejectedItem
function addRejectedItem(item) {
    console.log('=== ADDING REJECTED ITEM ===');
    console.log('Item DOM element:', item);
    console.log('Item._originalEventData:', item._originalEventData);
    
    const rejectedItems = getRejectedItems();
    const currentYear = new Date().getFullYear();
    const originalData = item._originalEventData || {};
    
    console.log('Original data keys:', Object.keys(originalData));
    console.log('Original data values:', originalData);
    
    const eventId = createEventId(originalData);
    console.log('Generated event ID:', eventId);
    
    const itemData = {
        id: eventId,
        descriptionTitle: originalData.descriptionTitle?.trim() || '',
        descriptionSubtitle: originalData.descriptionSubtitle?.trim() || '',
        oppPlaceTitle: originalData.oppPlaceTitle?.trim() || '',
        oppPlaceSubtitle: originalData.oppPlaceSubtitle?.trim() || '',
        moreInfoLink: originalData.moreInfoLink || '',
        imageSrc: originalData.imageSrc || '',
        altText: originalData.altText || '',
        logoSrc: originalData.logoSrc || '',
        logoAlt: originalData.logoAlt || '',
        
        // Store both original and parsed date values
        dateValue: originalData._dateValue || item._dateValue || null,
        parsedDay: originalData._parsedDay || item._parsedDay || null,
        parsedMonth: originalData._parsedMonth || item._parsedMonth || null,
        parsedYear: originalData._parsedYear || item._parsedYear || currentYear,
        day: originalData.day || item.day || null,
        month: originalData.month || item.month || null,
        startTime: originalData.startTime || item.startTime || null,
        endTime: originalData.endTime || item.endTime || null,
        
        timestamp: new Date().toISOString(),
        userAction: 'rejected'
    };
    
    console.log('Final itemData to store:', itemData);
    
    const isDuplicate = rejectedItems.some(existingItem => {
        console.log('Comparing with existing item ID:', existingItem.id);
        return existingItem.id === itemData.id;
    });
    
    if (!isDuplicate) {
        rejectedItems.push(itemData);
        setEssentialData('userEventPreferences_rejected', rejectedItems);
        console.log('✅ Successfully added rejected item:', itemData.descriptionTitle);
        console.log('Total rejected items now:', rejectedItems.length);
    } else {
        console.log('❌ Duplicate rejected item not added:', itemData.descriptionTitle);
    }
    
    // Verify the cookie was set
    setTimeout(() => {
        const verifyRejected = getRejectedItems();
        console.log('Verification - Total rejected items in cookie:', verifyRejected.length);
        console.log('Verification - Last added item:', verifyRejected[verifyRejected.length - 1]);
    }, 100);
}


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

function hasUserInteractedWithItem(item) {
    console.log('=== CHECKING USER INTERACTION ===');
    console.log('Item to check:', item);
    
    const accepted = getAcceptedItems();
    const rejected = getRejectedItems();
    
    console.log('Current accepted items:', accepted.length);
    console.log('Current rejected items:', rejected.length);
    
    // Create a more robust comparison using multiple identifiers
    const itemIdentifiers = {
        descriptionTitle: item.descriptionTitle?.trim() || '',
        descriptionSubtitle: item.descriptionSubtitle?.trim() || '',
        oppPlaceTitle: item.oppPlaceTitle?.trim() || '',
        day: item.day,
        month: item.month,
        startTime: item.startTime,
        // Use the event ID as primary identifier if available
        eventId: createEventId(item)
    };
    
    console.log('Item identifiers:', itemIdentifiers);
    
    const hasAccepted = accepted.some(userItem => {
        console.log('Checking against accepted item:', {
            id: userItem.id,
            title: userItem.descriptionTitle,
            subtitle: userItem.descriptionSubtitle,
            place: userItem.oppPlaceTitle
        });
        
        // Primary check: use eventId if both items have it
        if (userItem.id && itemIdentifiers.eventId) {
            const match = userItem.id === itemIdentifiers.eventId;
            console.log(`ID match: ${match} (${userItem.id} === ${itemIdentifiers.eventId})`);
            return match;
        }
        
        // Fallback: check core properties
        const titleMatch = userItem.descriptionTitle?.trim() === itemIdentifiers.descriptionTitle;
        const subtitleMatch = userItem.descriptionSubtitle?.trim() === itemIdentifiers.descriptionSubtitle;
        const placeMatch = userItem.oppPlaceTitle?.trim() === itemIdentifiers.oppPlaceTitle;
        
        console.log(`Property matches: title=${titleMatch}, subtitle=${subtitleMatch}, place=${placeMatch}`);
        
        // Additional check: day and month if available
        const dayMatch = !userItem.day || !itemIdentifiers.day || userItem.day === itemIdentifiers.day;
        const monthMatch = !userItem.month || !itemIdentifiers.month || userItem.month === itemIdentifiers.month;
        
        const matches = titleMatch && subtitleMatch && placeMatch && dayMatch && monthMatch;
        
        if (matches) {
            console.log('✅ Found accepted match:', userItem.descriptionTitle);
        }
        
        return matches;
    });
    
    const hasRejected = rejected.some(userItem => {
        console.log('Checking against rejected item:', {
            id: userItem.id,
            title: userItem.descriptionTitle,
            subtitle: userItem.descriptionSubtitle,
            place: userItem.oppPlaceTitle
        });
        
        // Primary check: use eventId if both items have it
        if (userItem.id && itemIdentifiers.eventId) {
            const match = userItem.id === itemIdentifiers.eventId;
            console.log(`ID match: ${match} (${userItem.id} === ${itemIdentifiers.eventId})`);
            return match;
        }
        
        // Fallback: check core properties
        const titleMatch = userItem.descriptionTitle?.trim() === itemIdentifiers.descriptionTitle;
        const subtitleMatch = userItem.descriptionSubtitle?.trim() === itemIdentifiers.descriptionSubtitle;
        const placeMatch = userItem.oppPlaceTitle?.trim() === itemIdentifiers.oppPlaceTitle;
        
        console.log(`Property matches: title=${titleMatch}, subtitle=${subtitleMatch}, place=${placeMatch}`);
        
        // Additional check: day and month if available
        const dayMatch = !userItem.day || !itemIdentifiers.day || userItem.day === itemIdentifiers.day;
        const monthMatch = !userItem.month || !itemIdentifiers.month || userItem.month === itemIdentifiers.month;
        
        const matches = titleMatch && subtitleMatch && placeMatch && dayMatch && monthMatch;
        
        if (matches) {
            console.log('✅ Found rejected match:', userItem.descriptionTitle);
        }
        
        return matches;
    });
    
    const result = hasAccepted || hasRejected;
    console.log(`Final interaction result for ${itemIdentifiers.descriptionTitle}: ${result}`);
    
    return result;
}



function hasEventDatePassed(event) {
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

function filterExpiredEvents() {
    const acceptedItems = getAcceptedItems();
    const rejectedItems = getRejectedItems();
    
    // Filter out expired events
    const activeAccepted = acceptedItems.filter(event => !hasEventDatePassed(event));
    const activeRejected = rejectedItems.filter(event => !hasEventDatePassed(event));
    
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

document.addEventListener('DOMContentLoaded', function() {
    performMaintenanceCleanup();
    
    // Set up periodic cleanup (every hour)
    setInterval(performMaintenanceCleanup, 60 * 60 * 1000);
});

function performMaintenanceCleanup() {
    const result = filterExpiredEvents();
    if (result.removedCount > 0) {
        console.log(`Removed ${result.removedCount} expired events from preferences`);
    }
}