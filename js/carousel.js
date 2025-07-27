let carouselEventsData = [];
const isMobile = window.innerWidth < 600;
let areInstructionsShowing = false;
let activeFilters = {
    red: true,
    blue: true,
    green: true
};






function initializeCarousel() {
    const itemGroup = document.querySelector('.item-group-mobile');
    
    if (!itemGroup) return;
    
    fetch('/json/events.json')
        .then(response => response.json())
        .then(data => {
            carouselEventsData = data.items;
            
            performMaintenanceCleanup();
            
            createCarouselItems(data);
            
            if (isMobile) {
                setupMobileCarousel();
            } else {
                setupDesktopCarousel();
            }
        })
        .catch(error => {
            console.warn("erro " + error);
            if (isMobile) {
                setupMobileCarousel();
            } else {
                setupDesktopCarousel();
            }
        });
}

function getColorCategory(colorOfEvent) {
    const colorLower = colorOfEvent.toLowerCase();
    if (colorLower.includes('red') || colorLower === '#ff0000' || colorLower === 'red') {
        return 'red';
    } else if (colorLower.includes('blue') || colorLower === '#0000ff' || colorLower === 'blue') {
        return 'blue';
    } else if (colorLower.includes('green') || colorLower === '#008000' || colorLower === 'green') {
        return 'green';
    }
    // Default fallback - you might want to adjust this based on your color scheme
    return 'red';
}

// Function to check if event matches active filters
function eventMatchesFilters(item) {
    if (!item.colorOfEvent) return true; // Show items without color by default
    
    const category = getColorCategory(item.colorOfEvent);
    return activeFilters[category];
}

function handleFilterChange() {
    // Update activeFilters based on checkbox states
    activeFilters.red = document.getElementById('profissional-filter').checked;
    activeFilters.blue = document.getElementById('pessoal-filter').checked;
    activeFilters.green = document.getElementById('curricular-filter').checked;
    
    // Recreate carousel with new filters
    if (carouselEventsData && carouselEventsData.length > 0) {
        createCarouselItems({ items: carouselEventsData });
        
        if (isMobile) {
            setupMobileCarousel();
        } else {
            setupDesktopCarousel();
        }
    }
}

function createCarouselItems(data) {
    const container = document.getElementById('item-group-1-mobile');
    if (!container) return;
    
    container.innerHTML = '';
    let filteredItems;
    
    sortItemsByDate(data.items);

    if (isMobile) {
        const currentDay = getCurrentDay();
        const currentDayValue = (currentDay.getFullYear() * 10000) + ((currentDay.getMonth() + 1) * 100) + currentDay.getDate();
        
        const currentEvents = data.items.filter(item => {
            return item.dateValue === currentDayValue && 
                   isFutureEvent(item) && 
                   eventMatchesFilters(item); // Add filter check
        });

        filteredItems = currentEvents.filter(item => {
            return !hasUserInteractedWithItem(item);
        });

    } else {
        const currentEvents = data.items.filter(item => {
            return isFutureEvent(item) && 
                   item.destaque === true && 
                   eventMatchesFilters(item); // Add filter check
        });

        const nonInteractedEvents = currentEvents.filter(item => {
            return !hasUserInteractedWithItem(item);
        });

        filteredItems = nonInteractedEvents.slice(0, 12);
    }

    const uniqueItems = [];
    const seenIds = new Set();
    
    filteredItems.forEach(item => {
        const eventId = item.id;
        if (!seenIds.has(eventId)) {
            seenIds.add(eventId);
            uniqueItems.push(item);
        }
    });
    
    // Rest of the createCarouselItems function remains the same...
    uniqueItems.forEach(item => {
        const itemContainer = document.createElement('div');
        itemContainer.className = 'item-container-mobile';

        itemContainer.id = item.id;
        itemContainer.dateValue = item.dateValue;
        itemContainer.startTime = item.startTime;
        itemContainer.year = item.year;
        itemContainer.month = item.month;
        itemContainer.day = item.day;
        itemContainer.imageSrc = item.imageSrc;
        itemContainer.altText = item.altText;
        itemContainer.descriptionTitle = item.descriptionTitle;
        itemContainer.descriptionSubtitle = item.descriptionSubtitle;
        itemContainer.logoSrc = item.logoSrc;
        itemContainer.logoAlt = item.logoAlt;
        itemContainer.oppPlaceTitle = item.oppPlaceTitle;
        itemContainer.oppPlaceSubtitle = item.oppPlaceSubtitle;
        itemContainer.moreInfoLink = item.moreInfoLink;
        itemContainer.endTime = item.endTime;
        itemContainer.colorOfEvent = item.colorOfEvent;

        if(isMobile){
            itemContainer.style.border = `0.8vw solid ${item.colorOfEvent}`;
        } else{
            itemContainer.style.border = `0.2vw solid ${item.colorOfEvent}`;
        }

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

function sortItemsByDate(items) {
    items.forEach(item => {
        item.dateValue = (item.year * 10000) + (item.month * 100) + item.day;
    });
    
    items.sort((a, b) => a.dateValue - b.dateValue);
}

function setupDesktopCarousel() {
    const itemGroup = document.querySelector('.item-group-mobile');
    const dotsPC = document.querySelectorAll('.dot-pc');
    const arrowsAndDots = document.querySelector('.arrows-and-dots');
    
    if (!itemGroup || !dotsPC.length) return;
    
    if (arrowsAndDots) arrowsAndDots.style.display = 'flex';
    
    let currentIndexPC = 0;
    const itemsPerViewPC = 4;
    
    const actualItemCount = document.querySelectorAll('.item-container-mobile').length;
    
    const totalItems = Math.min(actualItemCount, 12);
    
    if (totalItems <= itemsPerViewPC) {
        if (arrowsAndDots) arrowsAndDots.style.display = 'none';
        return;
    }
    
    function updateTransformPC() {
        const translatePercentage = -(currentIndexPC / totalItems) * 100 * (totalItems / itemsPerViewPC);
        
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
    
    updateTransformPC();
    
    const nextButton = document.getElementById('next-mobile');
    const prevButton = document.getElementById('prev-mobile');
    
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            if (currentIndexPC >= totalItems - itemsPerViewPC) {
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
   
    if (arrowsAndDots) arrowsAndDots.style.display = 'none';
   
    const carouselItems = document.querySelectorAll('.item-container-mobile');
    let noMoreEventsCard = null;  

    if (!carouselItems.length) {
        
        if (carouselEventsData && Array.isArray(carouselEventsData)) {
            const currentDay = getCurrentDay();
            const currentDayValue = getDateValue(currentDay);
            
            const todayEvents = carouselEventsData.filter(item => {
                if (!item.dateValue) {
                    sortItemsByDate([item]);
                }
                return item.dateValue === currentDayValue && isFutureEvent(item);
            });

            noMoreEventsCard = createNoMoreEventsCard();
            noMoreEventsCard.style.display = 'block';
        }
    }
   
    itemGroup.style.transform = 'none';
    itemGroup.style.display = 'block';
   
    let currentItem = null;
    let leftIndicator = null;
    let rightIndicator = null;
    let animationRequest = null;
    let currentDiff = 0;
    let isHorizontalSwipe = false;
    let initialTouchY = 0;
    let isTouchActive = false;
    let currentDay = getCurrentDay();
    
    function getDateValue(date) {
        return (date.getFullYear() * 10000) + ((date.getMonth() + 1) * 100) + date.getDate();
    }

    const currentDayValue  = getDateValue(currentDay);
    let hasCurrentDayEvent = false;
    
    if (carouselEventsData && Array.isArray(carouselEventsData)) {
        const todayEvents = carouselEventsData.filter(item => {
            if (!item.dateValue) {
                sortItemsByDate([item]);
            }
            
            return item.dateValue === currentDayValue && isFutureEvent(item) && !hasUserInteractedWithItem(item);
        });
        
        hasCurrentDayEvent = todayEvents.length > 0;
    }
    
    carouselItems.forEach((item) => {
        item.style.display = 'none';
        
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
        item.appendChild(swipeIndicators);
    });

    function createNoMoreEventsCard() {
        const itemContainer = document.querySelector('.item-group-mobile');
        
        const existingCard = itemContainer.querySelector('.no-more-events-card');
        if (existingCard) existingCard.remove();
        
        const noMoreCard = document.createElement('div');
        noMoreCard.className = 'no-more-events-card item-container-mobile';
        noMoreCard.style.display = 'none';

        const imageContainer = document.createElement('div');
        imageContainer.className = 'no-more-events-image-container';

        const img = document.createElement('img');
        img.src = 'images/nextDay.webp';
        img.alt = 'Não há mais eventos para o dia!';
        img.id = 'nextDay';
        img.className = 'no-more-events-image';
        
        imageContainer.appendChild(img);
        noMoreCard.appendChild(imageContainer);
        
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
        
        const carouselLine = document.createElement('div');
        carouselLine.className = 'carousel-line';
        noMoreCard.appendChild(carouselLine);
        
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


    function getEventsForDay(dateValue) {
        if (!carouselEventsData || !Array.isArray(carouselEventsData)) {
            console.warn('No events data available');
            return [];
        }

        return carouselEventsData.filter(item => {
            if (!item.dateValue) {
                sortItemsByDate([item]);
            }

            return item.dateValue === dateValue && 
                isFutureEvent(item) && 
                !hasUserInteractedWithItem(item) &&
                eventMatchesFilters(item); // Add filter check
        });
    }

    function findNextDayWithEvents(startDate) {
        const maxDaysToCheck = 31;
        let checkDate = new Date(startDate);
        
        for (let i = 0; i < maxDaysToCheck; i++) {
            checkDate.setDate(checkDate.getDate() + 1);
            const dateValue = getDateValue(checkDate);
            const events = getEventsForDayWithFilter(dateValue); // Use filtered version
            
            if (events.length > 0) {
                return { date: new Date(checkDate), events: events };
            }
        }
        return null;
    }

    if (!hasCurrentDayEvent) {
        noMoreEventsCard = createNoMoreEventsCard();
        noMoreEventsCard.style.display = 'block';
        addSwipeInstructions(true);

    } else {
        let foundValidEvent = false;
        for (let i = 0; i < carouselItems.length; i++) {
            const item = carouselItems[i];
            if (item.dateValue === currentDayValue && isFutureEvent(item)) {
                item.style.display = 'block';
                foundValidEvent = true;
                addSwipeInstructions(false);
                break;
            }
        }
        
        if (!foundValidEvent) {
            console.warn('hasCurrentDayEvent was true but no valid DOM item found, showing no-more-events card');
            noMoreEventsCard = createNoMoreEventsCard();
            noMoreEventsCard.style.display = 'block';
            addSwipeInstructions(true);
        }
    }


    let currentIndex = 0;
    let startX, moveX, startTime;
    const minSwipeDistance = 50;
    const horizontalThreshold = 10;
    const verticalThreshold = 10;

    carouselContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
    carouselContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
    carouselContainer.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'hidden' && isTouchActive) {
            resetTouchState();
        }
    });
   
    function handleTouchStart(e) {
        if (isSwipeLocked || areInstructionsShowing) return; // Added areInstructionsShowing check
        
        if (animationRequest) {
            cancelAnimationFrame(animationRequest);
            animationRequest = null;
        }
        
        isTouchActive = true;
        startX = e.touches[0].clientX;
        initialTouchY = e.touches[0].clientY;
        startTime = new Date().getTime();
        isHorizontalSwipe = null;
        
        currentItem = document.querySelector('.item-container-mobile[style*="display: block"], .no-more-events-card[style*="display: block"]');
        if (currentItem) {
            leftIndicator = currentItem.querySelector('.left-indicator');
            rightIndicator = currentItem.querySelector('.right-indicator');
            currentItem.style.transition = 'none';
        }
    }
   
    function handleTouchMove(e) {
        if (!startX || !isTouchActive || !currentItem || areInstructionsShowing) return; // Added areInstructionsShowing check
        
        moveX = e.touches[0].clientX;
        const moveY = e.touches[0].clientY;
        const diffX = moveX - startX;
        const diffY = moveY - initialTouchY;
        
        if (isHorizontalSwipe === null) {
            if (Math.abs(diffX) > horizontalThreshold && Math.abs(diffX) > Math.abs(diffY)) {
                isHorizontalSwipe = true;
            } 
            else if (Math.abs(diffY) > verticalThreshold && Math.abs(diffY) > Math.abs(diffX)) {
                isHorizontalSwipe = false;
            }
        }
        
        if (isHorizontalSwipe === true) {
            e.preventDefault();
            currentDiff = diffX;
            
            if (!animationRequest) {
                animationRequest = requestAnimationFrame(updateSwipeAnimation);
            }
        }
    }
    
    function updateSwipeAnimation() {
        animationRequest = null;
        
        if (!currentItem || currentDiff === undefined || !isTouchActive) return;
        
        let opacity = Math.min(Math.abs(currentDiff) / 150, 1);
        const rotation = currentDiff / 20;
        const isNoMoreEventsCard = currentItem.classList.contains('no-more-events-card');
        
        if (currentDiff < 0) {
            if (leftIndicator) {
                leftIndicator.style.opacity = opacity;
                leftIndicator.style.transform = `scale(${0.5 + opacity * 0.5})`;
            }
            if (rightIndicator) {
                rightIndicator.style.opacity = 0;
            }
            
            if (isNoMoreEventsCard) {
                currentItem.classList.add('swiping-left');
                currentItem.classList.remove('swiping-right');
                currentItem.style.boxShadow = `0 0 ${Math.abs(currentDiff) / 1.5}px rgba(33, 150, 243, ${opacity * 0.8})`;
            } else {
                currentItem.style.boxShadow = `0 0 ${Math.abs(currentDiff) / 2}px rgba(255, 0, 0, ${opacity * 0.5})`;
                currentItem.style.backgroundColor = `rgba(255, 240, 240, ${opacity * 0.9})`;
            }
        } else if (currentDiff > 0) {
            if (rightIndicator) {
                rightIndicator.style.opacity = opacity;
                rightIndicator.style.transform = `scale(${0.5 + opacity * 0.5})`;
            }
            if (leftIndicator) {
                leftIndicator.style.opacity = 0;
            }
            
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
        
        if (moveX !== null && isHorizontalSwipe === true && isTouchActive) {
            animationRequest = requestAnimationFrame(updateSwipeAnimation);
        }
    }
    
    function handleTouchEnd(e) {
        if (!isTouchActive || areInstructionsShowing) return; // Added areInstructionsShowing check
        
        const item = currentItem;
        const leftInd = leftIndicator;
        const rightInd = rightIndicator;
        const diff = moveX !== null ? moveX - startX : 0;
        const swipeTime = startTime ? new Date().getTime() - startTime : 0;
        const isHorizontal = isHorizontalSwipe;
        
        if (animationRequest) {
            cancelAnimationFrame(animationRequest);
            animationRequest = null;
        }
        
        resetTouchState();
        
        if (item && isHorizontal === true) {
            if (Math.abs(diff) > minSwipeDistance || (Math.abs(diff) > 20 && swipeTime < 300)) {
                isSwipeLocked = true;
                
                const isLeftSwipe = diff < 0;
                const isNoMoreEventsCard = item.classList.contains('no-more-events-card');
                
                item.style.transition = 'transform 0.3s ease-out, box-shadow 0.3s ease-out, background-color 0.3s ease-out';
                
                const halfwayPosition = isLeftSwipe ? -75 : 75;
                item.style.transform = `translateX(${halfwayPosition}px) rotate(${isLeftSwipe ? -5 : 5}deg)`;
                
                if (isLeftSwipe && leftInd) {
                    leftInd.style.opacity = 1;
                    leftInd.style.transform = 'scale(1)';
                    if (rightInd) rightInd.style.opacity = 0;
                    
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
                    
                    if (isNoMoreEventsCard) {
                        item.style.boxShadow = `0 0 ${Math.abs(halfwayPosition) / 2}px rgba(40, 167, 69, 0.5)`;
                        item.style.backgroundColor = 'rgba(240, 255, 240, 0.9)';
                    } else {
                        item.style.boxShadow = `0 0 ${Math.abs(halfwayPosition) / 2}px rgba(0, 255, 0, 0.5)`;
                        item.style.backgroundColor = 'rgba(240, 255, 240, 0.9)';
                    }
                }
                
                if (navigator.vibrate) {
                    navigator.vibrate(100);
                }
                
                setTimeout(() => {
                    if (item) {
                        item.style.transition = 'transform 0.3s ease-out';
                        item.style.transform = isLeftSwipe ? 
                            `translateX(-150%) rotate(-10deg)` : 
                            `translateX(150%) rotate(10deg)`;
                        
                        setTimeout(() => {
                            if (isNoMoreEventsCard) {
                                handleNoMoreEventsCardSwipe();
                            } else {
                                if (isLeftSwipe) {
                                    addRejectedItem(item);
                                } else {
                                    addAcceptedItem(item);
                                }
                                showNextItem();
                            }
                            
                            resetCardStyles(item);
                            isSwipeLocked = false;
                        }, 300);
                    } else {
                        isSwipeLocked = false;
                    }
                }, 400);
            } else {
                isSwipeLocked = true;
                item.style.transition = 'transform 0.3s ease-out, box-shadow 0.3s ease-out, background-color 0.3s ease-out';
                resetCardStyles(item);
                
                setTimeout(() => {
                    isSwipeLocked = false;
                }, 300);
            }
        } else if (item) {
            isSwipeLocked = true;
            resetCardStyles(item);
            setTimeout(() => {
                isSwipeLocked = false;
            }, 300);
        }
    }


    function handleNoMoreEventsCardSwipe() {
        const nextDay = findNextDayWithEvents(currentDay);
        
        if (nextDay) {
            
            currentDay = nextDay.date;
            setCurrentDay(currentDay);
            
            if (noMoreEventsCard) {
                noMoreEventsCard.style.display = 'none';
            }
            
            const carouselItems = document.querySelectorAll('.item-container-mobile');
            carouselItems.forEach(item => {
                if (!item.classList.contains('no-more-events-card')) {
                    item.style.display = 'none';
                }
            });
            
            createNewDayCarouselItems(nextDay.events);
            
        } else {
            if (noMoreEventsCard) {
                noMoreEventsCard.style.display = 'block';
                resetCardStyles(noMoreEventsCard);
            }
        }
    }

    function createNewDayCarouselItems(events) {
        const container = document.getElementById('item-group-1-mobile');
        if (!container) return;
        
        const existingItems = container.querySelectorAll('.item-container-mobile:not(.no-more-events-card)');
        existingItems.forEach(item => item.remove());
        
        events.forEach((item, index) => {
            const itemContainer = document.createElement('div');
            itemContainer.className = 'item-container-mobile';
            
            itemContainer.id = item.id;
            itemContainer.dateValue = item.dateValue;
            itemContainer.startTime = item.startTime;
            itemContainer.year = item.year;
            itemContainer.month = item.month;
            itemContainer.day = item.day;
            itemContainer.endTime = item.endTime;
            itemContainer.imageSrc = item.imageSrc;
            itemContainer.altText = item.altText;
            itemContainer.descriptionTitle = item.descriptionTitle;
            itemContainer.descriptionSubtitle = item.descriptionSubtitle;
            itemContainer.logoSrc = item.logoSrc;
            itemContainer.logoAlt = item.logoAlt;
            itemContainer.oppPlaceTitle = item.oppPlaceTitle;
            itemContainer.oppPlaceSubtitle = item.oppPlaceSubtitle;
            itemContainer.moreInfoLink = item.moreInfoLink;
            itemContainer.colorOfEvent = item.colorOfEvent;

            if(isMobile){
                itemContainer.style.border = `0.8vw solid ${item.colorOfEvent}`;
                
            } else{
                itemContainer.style.border = `0.2vw solid ${item.colorOfEvent}`;

            }
            
            itemContainer.style.display = index === 0 ? 'block' : 'none';
            
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
            
            if (noMoreEventsCard && noMoreEventsCard.parentNode) {
                container.insertBefore(itemContainer, noMoreEventsCard);
            } else {
                container.appendChild(itemContainer);
            }
        });
        
        currentIndex = 0;
        
        const firstEvent = container.querySelector('.item-container-mobile:not(.no-more-events-card)');
        if (firstEvent) {
            firstEvent.style.display = 'block';
            resetCardStyles(firstEvent);
        }
    }
    
    function resetTouchState() {
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
        
        if (!item.classList.contains('no-more-events-card')) {
            item.style.backgroundColor = '';
        } else {
            item.classList.remove('swiping-left', 'swiping-right');
        }
        
        const leftInd = item.querySelector('.left-indicator');
        const rightInd = item.querySelector('.right-indicator');
        if (leftInd) leftInd.style.opacity = 0;
        if (rightInd) rightInd.style.opacity = 0;
    }

    function showNextItem() {
        const currentDayValue = getDateValue(currentDay);
        const carouselItems = document.querySelectorAll('.item-container-mobile:not(.no-more-events-card)');
        
        if (carouselItems[currentIndex]) {
            carouselItems[currentIndex].style.display = 'none';
        }
        
        currentIndex++;
        
        let nextItemIndex = -1;
        for (let i = currentIndex; i < carouselItems.length; i++) {
            const item = carouselItems[i];
            const itemDateValue = item.dateValue;
            const itemId = item.id;
            
            if (itemDateValue === currentDayValue && isFutureEvent(item) && !hasUserInteractedWithItem(item)) {
                nextItemIndex = i;
                break;
            }
        }
        
        if (nextItemIndex !== -1) {
            currentIndex = nextItemIndex;
            carouselItems[currentIndex].style.display = 'block';
            resetCardStyles(carouselItems[currentIndex]);

        } else {
            if (!noMoreEventsCard) {
                noMoreEventsCard = createNoMoreEventsCard();
            }
            noMoreEventsCard.style.display = 'block';
            resetCardStyles(noMoreEventsCard);
        }
    }
}

function addSwipeInstructions(isNoEventsCard) {
    const firstCard = document.querySelector('.item-container-mobile');
    
    if (firstCard) {
        const instructions = document.createElement('div');

        if(isNoEventsCard){
            instructions.className = 'swipe-instructions';
            instructions.innerHTML = `
                <h3>Dá Swipe para navegar</h3>
                <p class="instruction-navigation" style="font-size:4.2vw;">
                    <i class="fa fa-arrow-left instruction-icon"></i>
                    <i class="fa fa-arrow-right instruction-icon"></i>
                    Deslize para ESQUERDA ou DIREITA para ver o próximo dia
                </p>
                <button id="got-it-btn">Entendido!</button>
            `;
            
        } else{
            instructions.className = 'swipe-instructions';
            instructions.innerHTML = `
                <h3>Dá Swipe para escolher</h3>
                <p class="instruction-right" style="font-size:4.2vw;">
                    <i class="fa fa-check instruction-icon"></i>
                    Dá Swipe para a DIREITA para ACEITAR
                </p>
                <p class="instruction-left" style="font-size:4.2vw;">
                    <i class="fa fa-times instruction-icon"></i>
                    Dá Swipe para a ESQUERDA para RECUSAR
                </p>
                <button id="got-it-btn">Entendido!</button>
            `;
        }
        
        areInstructionsShowing = true; // Set flag to disable swiping

        firstCard.appendChild(instructions);
        
        setTimeout(() => {
            const gotItBtn = document.getElementById('got-it-btn');
            if (gotItBtn) {
                gotItBtn.addEventListener('click', () => {
                    areInstructionsShowing = false; // Enable swiping when button is clicked
                    instructions.style.opacity = '0';
                    setTimeout(() => {
                        instructions.remove();
                    }, 500);
                });
            }
        }, 0);
    }
}

function setEssentialData(key, value, days = 365) {
    if (window.cookieConsent && typeof window.cookieConsent.setCookie === 'function') {
        window.cookieConsent.setCookie(key, JSON.stringify(value), {
            days: days,
            sameSite: 'Lax',
            secure: true
        });
    } else {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${key}=${encodeURIComponent(JSON.stringify(value))};expires=${expires.toUTCString()};path=/;SameSite=Lax;Secure`;
    }
}

function getEssentialData(key) {
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


function getAcceptedItems() {
    return getEssentialData('userEventPreferences_accepted') || [];
}

function getRejectedItems() {
    return getEssentialData('userEventPreferences_rejected') || [];
}

function addAcceptedItem(item) {
    const acceptedItems = getAcceptedItems();
    const eventId = item.id;
    
    if (!acceptedItems.includes(eventId)) {
        acceptedItems.push(eventId);
        setEssentialData('userEventPreferences_accepted', acceptedItems);
    }
}


function addRejectedItem(item) {
    const rejectedItems = getRejectedItems();
    const eventId = item.id;
    
    if (!rejectedItems.includes(eventId)) {
        rejectedItems.push(eventId);
        setEssentialData('userEventPreferences_rejected', rejectedItems);
    }
}


function getUserPreferenceStats() {
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

function hasUserInteractedWithItem(item) {
    if (!item) {
        console.warn('Invalid item provided to hasUserInteractedWithItem', item);
        return false;
    }
    
    let eventId = item.id;
    
    if (isNaN(eventId)) {
        console.warn('Could not determine event ID for interaction check', item);
        return false;
    }
    
    const accepted = getAcceptedItems();
    const rejected = getRejectedItems();
    
    // Convert both eventId and stored IDs to strings for consistent comparison
    const eventIdStr = String(eventId);
    const acceptedIds = accepted.map(id => String(id));
    const rejectedIds = rejected.map(id => String(id));
    
    return acceptedIds.includes(eventIdStr) || rejectedIds.includes(eventIdStr);
}



function filterExpiredEvents() {
    const acceptedItems = getAcceptedItems();
    const rejectedItems = getRejectedItems();
    
    const activeAccepted = acceptedItems.filter(eventId => {
        // Convert both to strings for consistent comparison
        const event = carouselEventsData.find(item => String(item.id) === String(eventId));
        return event && isFutureEvent(event);
    });
    
    const activeRejected = rejectedItems.filter(eventId => {
        // Convert both to strings for consistent comparison
        const event = carouselEventsData.find(item => String(item.id) === String(eventId));
        return event && isFutureEvent(event);
    });
    
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
    if (!carouselEventsData || carouselEventsData.length === 0) {
        return;
    }
}

function getCurrentDay() {
    const savedDay = getEssentialData('userCurrentDay');
    if (savedDay) {
        return new Date(savedDay);
    }
    return new Date();
}

function setCurrentDay(date) {
    setEssentialData('userCurrentDay', date.toISOString());
}




function findEarliestDayWithEvents() {
    if (!carouselEventsData || !Array.isArray(carouselEventsData) || carouselEventsData.length === 0) return null;
    
    const today = new Date();
    const todayValue = (today.getFullYear() * 10000) + ((today.getMonth() + 1) * 100) + today.getDate();
    
    const daySet = new Set();
    
    carouselEventsData.forEach(item => {
        if (!item.dateValue) {
            sortItemsByDate([item]);
        }
        
        // Include events from today onwards that haven't passed and haven't been interacted with
        if (isFutureEvent(item) && !hasUserInteractedWithItem(item)) {
            // Only include events from today onwards
            if (item.dateValue >= todayValue) {
                daySet.add(item.dateValue);
            }
        }
    });
    
    if (daySet.size === 0) {
        return null;
    }
    
    const sortedDays = Array.from(daySet).sort((a, b) => a - b);
    return sortedDays[0];
}

async function refreshCarouselAfterEventRemoval() {

    // If no events are loaded, fetch them
    if (carouselEventsData.length === 0) {
        try {
            const response = await fetch('/json/events.json');
            const data = await response.json();
            carouselEventsData = data.items || [];
        } catch (error) {
            console.error('Failed to fetch events:', error);
            // Optionally, show an error message or fallback UI here
            return;
        }
    }
    
    
    // Always find the earliest day with events from today onwards
    const earliestDayValue = findEarliestDayWithEvents();
    
    if (earliestDayValue) {
        const year = Math.floor(earliestDayValue / 10000);
        const month = Math.floor((earliestDayValue % 10000) / 100) - 1;
        const day = earliestDayValue % 100;
        const newDate = new Date(year, month, day);
        
        setCurrentDay(newDate);
        
        
        // Force recreation of carousel items
        createCarouselItems({ items: carouselEventsData });
        
        if (isMobile) {
            setupMobileCarousel();
        } else {
            setupDesktopCarousel();
        }
    } else {
        // No events available, fallback to today and show empty carousel
        const today = new Date();
        setCurrentDay(today);
        createCarouselItems({ items: carouselEventsData });
        if (isMobile) {
            setupMobileCarousel();
        } else {
            setupDesktopCarousel();
        }
    }
}

window.refreshCarouselAfterEventRemoval = refreshCarouselAfterEventRemoval;

// Also add a debug function to manually test
window.debugCarouselRefresh = function() {
    refreshCarouselAfterEventRemoval();
};