// Global variable to store all events data
let allEventsData = [];

function getCookie(name) {
    const nameEQ = encodeURIComponent(name) + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) {
            return decodeURIComponent(c.substring(nameEQ.length, c.length));
        }
    }
    return null;
}

// Load events data from JSON
async function loadEventsData() {
    try {
        const response = await fetch('/json/events.json');
        const data = await response.json();
        allEventsData = data.items;
        return allEventsData;
    } catch (error) {
        console.error('Error loading events data:', error);
        return [];
    }
}

// Function to find event by ID
function findEventById(eventId) {
    return allEventsData.find(event => event.id === parseInt(eventId));
}

// Function to remove event from cookies
function removeEventFromCookies(eventId, type) {
    const cookieName = type === 'accepted' ? 'userEventPreferences_accepted' : 'userEventPreferences_rejected';
    const currentCookie = getCookie(cookieName);
    
    if (currentCookie) {
        try {
            let eventIds = JSON.parse(currentCookie);
            eventIds = eventIds.filter(id => id !== parseInt(eventId));
            
            // Update the cookie with the filtered array
            document.cookie = `${cookieName}=${encodeURIComponent(JSON.stringify(eventIds))};path=/;max-age=${30 * 24 * 60 * 60}`;
            
            // Notify the carousel that an event was removed so it can appear again
            notifyCarouselEventRemoved(parseInt(eventId));
            
            // Reload the preferences to update the display
            loadEventPreferences();
        } catch (e) {
            console.error('Error removing event from cookies:', e);
        }
    }
}

// Enhanced function to check if an event date has passed
function hasEventDatePassed(event) {
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // Handle different date formats and ensure we have valid date information
    if (!event.day || !event.month) {
        console.warn('Event missing date information:', event);
        return false; // If we can't determine the date, keep the event
    }
    
    // Enhanced month mapping with more variations
    const monthMap = {
        'janeiro': 1, 'jan': 1,
        'fevereiro': 2, 'fev': 2,
        'março': 3, 'mar': 3,
        'abril': 4, 'abr': 4,
        'maio': 5, 'mai': 5,
        'junho': 6, 'jun': 6,
        'julho': 7, 'jul': 7,
        'agosto': 8, 'ago': 8,
        'setembro': 9, 'set': 9,
        'outubro': 10, 'out': 10,
        'novembro': 11, 'nov': 11,
        'dezembro': 12, 'dez': 12
    };
    
    // Parse day and month
    const eventDay = parseInt(event.day, 10);
    if (isNaN(eventDay) || eventDay < 1 || eventDay > 31) {
        console.warn('Invalid day for event:', event);
        return false;
    }
    
    let eventMonth;
    if (typeof event.month === 'string') {
        eventMonth = monthMap[event.month.toLowerCase().trim()];
        if (!eventMonth) {
            console.warn('Unrecognized month format for event:', event);
            return false;
        }
    } else {
        eventMonth = parseInt(event.month, 10);
        if (isNaN(eventMonth) || eventMonth < 1 || eventMonth > 12) {
            console.warn('Invalid month for event:', event);
            return false;
        }
    }
    
    // Use event year if available, otherwise use current year
    const eventYear = event.year ? parseInt(event.year, 10) : currentYear;
    
    // Create event date
    const eventDate = new Date(eventYear, eventMonth - 1, eventDay);
    
    // If event has end time, use it for same-day comparison
    if (event.endTime) {
        const timeParts = event.endTime.split(':');
        if (timeParts.length >= 2) {
            const endHour = parseInt(timeParts[0], 10);
            const endMinute = parseInt(timeParts[1], 10);
            
            if (!isNaN(endHour) && !isNaN(endMinute)) {
                eventDate.setHours(endHour, endMinute, 0, 0);
                return now > eventDate;
            }
        }
    }
    
    // For events without end time, consider them expired at end of day
    eventDate.setHours(23, 59, 59, 999);
    return now > eventDate;
}

// Function to clean up expired events from cookies
function cleanupExpiredEvents() {
    const acceptedCookie = getCookie('userEventPreferences_accepted');
    const rejectedCookie = getCookie('userEventPreferences_rejected');
    
    let needsUpdate = false;
    
    // Clean up accepted events
    if (acceptedCookie) {
        try {
            const acceptedIds = JSON.parse(acceptedCookie);
            const activeAcceptedIds = acceptedIds.filter(id => {
                const event = findEventById(id);
                return event && !hasEventDatePassed(event);
            });
            
            if (activeAcceptedIds.length !== acceptedIds.length) {
                document.cookie = `userEventPreferences_accepted=${encodeURIComponent(JSON.stringify(activeAcceptedIds))};path=/;max-age=${30 * 24 * 60 * 60}`;
                needsUpdate = true;
                console.log(`Removed ${acceptedIds.length - activeAcceptedIds.length} expired accepted events`);
            }
        } catch (e) {
            console.error('Error cleaning up accepted events:', e);
        }
    }
    
    // Clean up rejected events
    if (rejectedCookie) {
        try {
            const rejectedIds = JSON.parse(rejectedCookie);
            const activeRejectedIds = rejectedIds.filter(id => {
                const event = findEventById(id);
                return event && !hasEventDatePassed(event);
            });
            
            if (activeRejectedIds.length !== rejectedIds.length) {
                document.cookie = `userEventPreferences_rejected=${encodeURIComponent(JSON.stringify(activeRejectedIds))};path=/;max-age=${30 * 24 * 60 * 60}`;
                needsUpdate = true;
                console.log(`Removed ${rejectedIds.length - activeRejectedIds.length} expired rejected events`);
            }
        } catch (e) {
            console.error('Error cleaning up rejected events:', e);
        }
    }
    
    return needsUpdate;
}

function parseEventPreferences() {
    const acceptedCookie = getCookie('userEventPreferences_accepted');
    const rejectedCookie = getCookie('userEventPreferences_rejected');
    
    let acceptedIds = [];
    let rejectedIds = [];
    let hasData = false;

    try {
        if (acceptedCookie) {
            acceptedIds = JSON.parse(acceptedCookie);
            hasData = true;
        }
        if (rejectedCookie) {
            rejectedIds = JSON.parse(rejectedCookie);
            hasData = true;
        }
    } catch (e) {
        console.error('Erro ao processar preferências dos cookies:', e);
        if (acceptedCookie || rejectedCookie) {
            showNoCookiesWarning();
        }
        return { accepted: [], rejected: [], hasData: false };
    }

    if (!hasData) {
        showNoCookiesWarning();
        return { accepted: [], rejected: [], hasData: false };
    }

    // Convert IDs to full event objects and filter out expired events
    const acceptedEvents = acceptedIds
        .map(id => findEventById(id))
        .filter(event => {
            if (!event) {
                console.warn(`Event with ID ${id} not found in events data`);
                return false;
            }
            return !hasEventDatePassed(event);
        });
    
    const rejectedEvents = rejectedIds
        .map(id => findEventById(id))
        .filter(event => {
            if (!event) {
                console.warn(`Event with ID ${id} not found in events data`);
                return false;
            }
            return !hasEventDatePassed(event);
        });

    // Update cookies if expired events were removed
    const activeAcceptedIds = acceptedEvents.map(event => event.id);
    const activeRejectedIds = rejectedEvents.map(event => event.id);
    
    if (activeAcceptedIds.length !== acceptedIds.length) {
        document.cookie = `userEventPreferences_accepted=${encodeURIComponent(JSON.stringify(activeAcceptedIds))};path=/;max-age=${30 * 24 * 60 * 60}`;
        console.log(`Updated accepted events cookie: removed ${acceptedIds.length - activeAcceptedIds.length} expired events`);
    }
    
    if (activeRejectedIds.length !== rejectedIds.length) {
        document.cookie = `userEventPreferences_rejected=${encodeURIComponent(JSON.stringify(activeRejectedIds))};path=/;max-age=${30 * 24 * 60 * 60}`;
        console.log(`Updated rejected events cookie: removed ${rejectedIds.length - activeRejectedIds.length} expired events`);
    }

    return { 
        accepted: acceptedEvents, 
        rejected: rejectedEvents, 
        hasData: acceptedEvents.length > 0 || rejectedEvents.length > 0 
    };
}

function showNoCookiesWarning() {
    const warning = document.getElementById('noCookiesWarning');
    if (warning) {
        warning.style.display = 'block';
    }
}

function createEventCard(event, type) {
    const card = document.createElement('div');
    card.className = `event-card ${type}`;
    card.dataset.eventId = event.id;
    card.dataset.eventType = type;

    const icon = type === 'accepted' ? '✓' : '✗';
    const statusClass = type === 'accepted' ? 'status-accepted' : 'status-rejected';
    const statusText = type === 'accepted' ? 'Aceite' : 'Rejeitado';

    // Use the new event structure
    const eventName = event.descriptionTitle || 'Nome não disponível';
    
    let dateDisplay = 'Data não disponível';
    if (event.day && event.month) {
        dateDisplay = `${event.day} de ${event.month}`;
        if (event.startTime) {
            dateDisplay += ` às ${event.startTime}`;
        }
    }

    // Build the card content with available information
    let cardContent = `
        <div class="icon ${type}">${icon}</div>
        <div class="event-name">${eventName}</div>
        <div class="event-status ${statusClass}">${statusText}</div>
        <div class="event-date">Data: ${dateDisplay}</div>
    `;

    card.innerHTML = cardContent;

    // Create and add the expand button
    const expandButton = document.createElement('button');
    expandButton.classList.add('expand-event-details');
    const img = document.createElement('img');
    img.src = '/images/plus.png';
    img.alt = 'Expand event details';
    expandButton.appendChild(img);
    expandButton.onclick = () => showExpandedView(event);
    
    card.appendChild(expandButton);

    // Add swipe indicator
    const swipeIndicator = document.createElement('div');
    swipeIndicator.className = 'swipe-indicator-remove';
    swipeIndicator.innerHTML = '<i class="fa fa-trash"></i><span>Deslize para remover</span>';
    card.appendChild(swipeIndicator);

    // Add swipe functionality
    setupSwipeToRemove(card);

    return card;
}

function setupSwipeToRemove(card) {
    let isSwipeLocked = false;
    let startX, moveX, startTime;
    let currentDiff = 0;
    let isHorizontalSwipe = false;
    let initialTouchY = 0;
    let isTouchActive = false;
    let swipeIndicator = null;
    let animationRequest = null;

    const minSwipeDistance = 100;
    const horizontalThreshold = 15;
    const verticalThreshold = 15;

    // Get the swipe indicator
    swipeIndicator = card.querySelector('.swipe-indicator-remove');

    // Add touch event listeners
    card.addEventListener('touchstart', handleTouchStart, { passive: true });
    card.addEventListener('touchmove', handleTouchMove, { passive: false });
    card.addEventListener('touchend', handleTouchEnd, { passive: true });

    function handleTouchStart(e) {
        if (isSwipeLocked) return;
        
        if (animationRequest) {
            cancelAnimationFrame(animationRequest);
            animationRequest = null;
        }
        
        isTouchActive = true;
        startX = e.touches[0].clientX;
        initialTouchY = e.touches[0].clientY;
        startTime = new Date().getTime();
        isHorizontalSwipe = null;
        
        card.style.transition = 'none';
    }

    function handleTouchMove(e) {
        if (!startX || !isTouchActive) return;
        
        moveX = e.touches[0].clientX;
        const moveY = e.touches[0].clientY;
        const diffX = moveX - startX;
        const diffY = moveY - initialTouchY;
        
        // Determine swipe direction
        if (isHorizontalSwipe === null) {
            if (Math.abs(diffX) > horizontalThreshold && Math.abs(diffX) > Math.abs(diffY)) {
                isHorizontalSwipe = true;
            } else if (Math.abs(diffY) > verticalThreshold && Math.abs(diffY) > Math.abs(diffX)) {
                isHorizontalSwipe = false;
            }
        }
        
        // Only handle right swipes (positive diffX)
        if (isHorizontalSwipe === true && diffX > 0) {
            e.preventDefault();
            currentDiff = diffX;
            
            if (!animationRequest) {
                animationRequest = requestAnimationFrame(updateSwipeAnimation);
            }
        }
    }

    function updateSwipeAnimation() {
        animationRequest = null;
        
        if (!isTouchActive || currentDiff <= 0) return;
        
        // Calculate opacity and scale for indicator
        let opacity = Math.min(currentDiff / 150, 1);
        let rotation = currentDiff / 30;
        
        // Update swipe indicator
        if (swipeIndicator) {
            swipeIndicator.style.opacity = opacity;
            swipeIndicator.style.transform = `scale(${0.5 + opacity * 0.5})`;
        }
        
        // Update card appearance
        card.style.transform = `translateX(${currentDiff}px) rotate(${rotation}deg)`;
        card.style.boxShadow = `0 0 ${currentDiff / 2}px rgba(255, 0, 0, ${opacity * 0.6})`;
        card.style.backgroundColor = `rgba(255, 240, 240, ${opacity * 0.8})`;
        
        // Continue animation if still swiping
        if (moveX !== null && isHorizontalSwipe === true && isTouchActive) {
            animationRequest = requestAnimationFrame(updateSwipeAnimation);
        }
    }

    function handleTouchEnd(e) {
        if (!isTouchActive) return;
        
        const diff = moveX !== null ? moveX - startX : 0;
        const swipeTime = startTime ? new Date().getTime() - startTime : 0;
        const isHorizontal = isHorizontalSwipe;
        
        if (animationRequest) {
            cancelAnimationFrame(animationRequest);
            animationRequest = null;
        }
        
        resetTouchState();
        
        // Only handle right swipes for removal
        if (isHorizontal === true && diff > 0) {
            if (diff > minSwipeDistance || (diff > 30 && swipeTime < 300)) {
                // Lock swipes during animation
                isSwipeLocked = true;
                
                // Vibration feedback
                if (navigator.vibrate) {
                    navigator.vibrate(100);
                }
                
                // First move halfway to emphasize the action
                card.style.transition = 'transform 0.3s ease-out, box-shadow 0.3s ease-out, background-color 0.3s ease-out';
                card.style.transform = `translateX(100px) rotate(8deg)`;
                
                if (swipeIndicator) {
                    swipeIndicator.style.opacity = 1;
                    swipeIndicator.style.transform = 'scale(1)';
                }
                
                card.style.boxShadow = '0 0 50px rgba(255, 0, 0, 0.6)';
                card.style.backgroundColor = 'rgba(255, 240, 240, 0.9)';
                
                // Complete the removal animation
                setTimeout(() => {
                    card.style.transition = 'transform 0.4s ease-out, opacity 0.4s ease-out';
                    card.style.transform = 'translateX(150%) rotate(15deg)';
                    card.style.opacity = '0';
                    
                    setTimeout(() => {
                        const eventId = card.dataset.eventId;
                        const eventType = card.dataset.eventType;
                        
                        if (eventId && eventType) {
                            removeEventFromCookies(parseInt(eventId), eventType);
                        }
                        
                        isSwipeLocked = false;
                    }, 400);
                }, 300);
            } else {
                // Not enough swipe distance, return to original position
                isSwipeLocked = true;
                card.style.transition = 'transform 0.3s ease-out, box-shadow 0.3s ease-out, background-color 0.3s ease-out';
                resetCardStyles();
                
                setTimeout(() => {
                    isSwipeLocked = false;
                }, 300);
            }
        } else {
            // Reset card for other swipe directions or insufficient movement
            isSwipeLocked = true;
            resetCardStyles();
            setTimeout(() => {
                isSwipeLocked = false;
            }, 300);
        }
    }

    function resetTouchState() {
        isTouchActive = false;
        startX = null;
        moveX = null;
        initialTouchY = null;
        currentDiff = 0;
        isHorizontalSwipe = null;
    }

    function resetCardStyles() {
        card.style.transform = 'translateX(0) rotate(0deg)';
        card.style.boxShadow = '';
        card.style.backgroundColor = '';
        
        if (swipeIndicator) {
            swipeIndicator.style.opacity = '0';
            swipeIndicator.style.transform = 'scale(0.5)';
        }
    }
}

function showExpandedView(event) {
    const modalContainer = document.getElementById('eventModal');
    modalContainer.innerHTML = `
    <div class="modal-content">
        <img src="${event.imageSrc}" alt="${event.altText}" class="event-image-expanded">
        <p class="description-title-calendar-expanded">${event.descriptionTitle}</p>
        <p class="description-subtitle-calendar-expanded">${event.descriptionSubtitle}</p>
        <div class="carousel-line-calendar-expanded"></div>
        <div class="logo-and-place-info-expanded">
            <img src="${event.logoSrc}" alt="${event.logoAlt}" class="event-logo-expanded">
            <div class="place-info-expanded">
                <p class="opp-place-title-calendar-expanded">${event.oppPlaceTitle}</p>
                <p class="opp-place-subtitle-calendar-expanded">${event.oppPlaceSubtitle}</p>
            </div>
        </div>
        <a class="more-info-link-calendar-expanded" href="${event.moreInfoLink}">Mais Informações</a>
    </div>
`;

    modalContainer.style.display = 'flex';

    // Close modal when clicking outside the modal content
    modalContainer.onclick = (e) => {
        const modalContent = modalContainer.querySelector('.modal-content');
        if (!modalContent.contains(e.target)) {
            modalContainer.style.display = 'none';
        }
    };
}

function updateStats(accepted, rejected) {
    const acceptedElement = document.getElementById('acceptedCount');
    const rejectedElement = document.getElementById('rejectedCount');
    const totalElement = document.getElementById('totalCount');
    
    if (acceptedElement) acceptedElement.textContent = accepted.length;
    if (rejectedElement) rejectedElement.textContent = rejected.length;
    if (totalElement) totalElement.textContent = accepted.length + rejected.length;
}

function loadEventPreferences() {
    const preferences = parseEventPreferences();
    const acceptedContainer = document.getElementById('acceptedEvents');
    const rejectedContainer = document.getElementById('rejectedEvents');
    
    if (!acceptedContainer || !rejectedContainer) {
        console.error('Required containers not found');
        return;
    }
    
    // Clear existing content
    acceptedContainer.innerHTML = '';
    rejectedContainer.innerHTML = '';
    
    // Update statistics
    updateStats(preferences.accepted, preferences.rejected);
    
    // Check if all events have been removed
    if (preferences.accepted.length === 0 && preferences.rejected.length === 0 && (getCookie('userEventPreferences_accepted') || getCookie('userEventPreferences_rejected'))) {
        showNoCookiesWarning();
    }
    
    // Display accepted events
    if (preferences.accepted.length > 0) {
        preferences.accepted.forEach(event => {
            acceptedContainer.appendChild(createEventCard(event, 'accepted'));
        });
    } else {
        acceptedContainer.innerHTML = `
            <div class="empty-state">
                <h3>Nenhum evento aceite</h3>
                <p>Os eventos que aceitar aparecerão aqui</p>
            </div>
        `;
    }
    
    // Display rejected events
    if (preferences.rejected.length > 0) {
        preferences.rejected.forEach(event => {
            rejectedContainer.appendChild(createEventCard(event, 'rejected'));
        });
    } else {
        rejectedContainer.innerHTML = `
            <div class="empty-state">
                <h3>Nenhum evento rejeitado</h3>
                <p>Os eventos que rejeitar aparecerão aqui</p>
            </div>
        `;
    }

    // Debug information (remove in production)
    console.log('Event preferences loaded:', {
        accepted: preferences.accepted,
        rejected: preferences.rejected,
        hasData: preferences.hasData
    });
}

// Function to notify carousel that an event was removed and should appear again
function notifyCarouselEventRemoved(eventId) {
    // Dispatch a custom event that the carousel can listen to
    const event = new CustomEvent('eventRemovedFromPreferences', {
        detail: {
            eventId: eventId,
            timestamp: Date.now()
        }
    });
    
    window.dispatchEvent(event);
    
    // Also try to directly call carousel refresh if the function exists
    if (typeof window.refreshCarouselItems === 'function') {
        window.refreshCarouselItems();
    } else if (typeof initializeCarousel === 'function') {
        // Fallback: re-initialize the carousel
        initializeCarousel();
    }
    
    console.log(`Notified carousel that event ${eventId} was removed from preferences`);
}

// Load preferences when page loads
document.addEventListener('DOMContentLoaded', async function() {
    await loadEventsData(); // Load events data first
    
    // Clean up any expired events immediately
    const wasUpdated = cleanupExpiredEvents();
    
    // Load and display preferences
    loadEventPreferences();
    
    if (wasUpdated) {
        console.log('Expired events were cleaned up on page load');
    }
});

// Enhanced periodic cleanup - check more frequently and clean up expired events
setInterval(() => {
    cleanupExpiredEvents();
    loadEventPreferences();
}, 30000); // Refresh every 30 seconds

// Additional cleanup on window focus (when user returns to tab)
window.addEventListener('focus', () => {
    cleanupExpiredEvents();
    loadEventPreferences();
});