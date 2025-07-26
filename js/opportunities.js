// Global variable to store all events data
let opportunitiesEventsData = [];
let eventsDataLoaded = false;

// Safety function to check if events data is ready
function isEventsDataReady() {
    return eventsDataLoaded && opportunitiesEventsData && opportunitiesEventsData.length > 0;
}

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
        opportunitiesEventsData = data.items;
        eventsDataLoaded = true;
        return opportunitiesEventsData;
    } catch (error) {
        console.error('Error loading events data:', error);
        eventsDataLoaded = false;
        opportunitiesEventsData = [];
        return [];
    }
}

// Function to find event by ID
function findEventById(eventId) {
    // Always compare as integer
    return opportunitiesEventsData.find(event => parseInt(event.id) === parseInt(eventId));
}

// Function to remove event from cookies
function removeEventFromCookies(eventId, type) {
    const cookieName = type === 'accepted' ? 'userEventPreferences_accepted' : 'userEventPreferences_rejected';
    let eventIds = getEssentialData(cookieName) || [];
    // Convert all IDs to integers for consistency
    eventIds = eventIds.map(id => parseInt(id));
    if (eventIds.length > 0) {
        try {
            eventIds = eventIds.filter(id => id !== parseInt(eventId));
            setEssentialData(cookieName, eventIds);
            window.refreshCarouselAfterEventRemoval();
            loadEventPreferences();
        } catch (e) {
            console.error('Error removing event from cookies:', e);
        }
    }
}

function isFutureEvent(event) {
    const now = new Date();
    const [endHour, endMinute] = event.endTime.split(':').map(Number);
    const eventEnd = new Date(event.year, event.month - 1, event.day, endHour, endMinute);
    return eventEnd >= now;
}

// Function to clean up expired events from cookies
function cleanupExpiredEvents() {
    // Don't run cleanup if events data is not loaded yet
    if (!isEventsDataReady()) {
        return false;
    }
    
    const acceptedIds = getEssentialData('userEventPreferences_accepted');
    const rejectedIds = getEssentialData('userEventPreferences_rejected');
    // Convert all IDs to integers for consistency
    const acceptedIdsInt = acceptedIds ? acceptedIds.map(id => parseInt(id)) : [];
    const rejectedIdsInt = rejectedIds ? rejectedIds.map(id => parseInt(id)) : [];
    let needsUpdate = false;
    // Clean up accepted events
    if (acceptedIdsInt && Array.isArray(acceptedIdsInt)) {
        try {
            const activeAcceptedIds = acceptedIdsInt.filter(id => {
                const event = findEventById(id);
                if (!event) {
                    console.warn(`Event with ID ${id} not found in events data - keeping in cookies`);
                    return true;
                }
                return isFutureEvent(event);
            });
            if (activeAcceptedIds.length !== acceptedIdsInt.length) {
                setEssentialData('userEventPreferences_accepted', activeAcceptedIds);
                needsUpdate = true;
            }
        } catch (e) {
            console.error('Error cleaning up accepted events:', e);
        }
    }
    // Clean up rejected events
    if (rejectedIdsInt && Array.isArray(rejectedIdsInt)) {
        try {
            const activeRejectedIds = rejectedIdsInt.filter(id => {
                const event = findEventById(id);
                if (!event) {
                    console.warn(`Event with ID ${id} not found in events data - keeping in cookies`);
                    return true;
                }
                return isFutureEvent(event);
            });
            if (activeRejectedIds.length !== rejectedIdsInt.length) {
                setEssentialData('userEventPreferences_rejected', activeRejectedIds);
                needsUpdate = true;
            }
        } catch (e) {
            console.error('Error cleaning up rejected events:', e);
        }
    }
    return needsUpdate;
}

function parseEventPreferences() {
    const acceptedIds = getEssentialData('userEventPreferences_accepted');
    const rejectedIds = getEssentialData('userEventPreferences_rejected');
    // Convert all IDs to integers for consistency
    let acceptedArray = acceptedIds ? acceptedIds.map(id => parseInt(id)) : [];
    let rejectedArray = rejectedIds ? rejectedIds.map(id => parseInt(id)) : [];
    let hasData = false;
    try {
        if (acceptedArray && Array.isArray(acceptedArray) && acceptedArray.length > 0) {
            hasData = true;
        }
        if (rejectedArray && Array.isArray(rejectedArray) && rejectedArray.length > 0) {
            hasData = true;
        }
    } catch (e) {
        console.error('Erro ao processar preferências dos cookies:', e);
        if (acceptedIds || rejectedIds) {
            showNoCookiesWarning();
        }
        return { accepted: [], rejected: [], hasData: false };
    }
    if (!hasData) {
        showNoCookiesWarning();
        return { accepted: [], rejected: [], hasData: false };
    }
    // Convert IDs to full event objects and filter out expired events
    const acceptedEvents = acceptedArray
        .map(id => findEventById(id))
        .filter(event => {
            if (!event) {
                console.warn(`Event with ID ${id} not found in events data - keeping in preferences`);
                return false; // Don't display unknown events, but don't remove from cookies here
            }
            return isFutureEvent(event);
        });
    const rejectedEvents = rejectedArray
        .map(id => findEventById(id))
        .filter(event => {
            if (!event) {
                console.warn(`Event with ID ${id} not found in events data - keeping in preferences`);
                return false; // Don't display unknown events, but don't remove from cookies here
            }
            return isFutureEvent(event);
        });
    // Only update cookies for expired events, not missing events (to avoid data loss)
    const activeAcceptedIds = acceptedArray.filter(id => {
        const event = findEventById(id);
        if (!event) return true; // Keep unknown events in cookies
        return isFutureEvent(event);
    });
    const activeRejectedIds = rejectedArray.filter(id => {
        const event = findEventById(id);
        if (!event) return true; // Keep unknown events in cookies
        return isFutureEvent(event);
    });
    if (activeAcceptedIds.length !== acceptedArray.length) {
        const removedCount = acceptedArray.length - activeAcceptedIds.length;
        if (removedCount > 0) {
            setEssentialData('userEventPreferences_accepted', activeAcceptedIds);
        }
    }
    if (activeRejectedIds.length !== rejectedArray.length) {
        const removedCount = rejectedArray.length - activeRejectedIds.length;
        if (removedCount > 0) {
            setEssentialData('userEventPreferences_rejected', activeRejectedIds);
        }
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
    card.style.boxShadow = `
    inset 0 0.8vw 0 0 ${event.colorOfEvent}, 
    inset -0.8vw 0 0 0 ${event.colorOfEvent}, 
    inset 0 -0.8vw 0 0 ${event.colorOfEvent}, 
    0 1vw 3vw rgba(0,0,0,0.3)
    `;
    card.dataset.eventId = event.id;
    card.dataset.eventType = type;

    const icon = type === 'accepted' ? '✓' : '✗';
    const statusClass = type === 'accepted' ? 'status-accepted' : 'status-rejected';
    const statusText = type === 'accepted' ? 'Aceite' : 'Rejeitado';

    // Use the new event structure
    const eventName = event.descriptionTitle || 'Nome não disponível';
    
    let dateDisplay = 'Data não disponível';
    if (event.day && event.month) {
        dateDisplay = `${event.day}/${event.month}/${event.year}`;
        if (event.startTime) {
            dateDisplay += ` às ${event.startTime} - ${event.endTime}`;
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
    img.src = '/images/plus.webp';
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
        
        // Get the event to maintain the original colored border shadow
        const event = findEventById(card.dataset.eventId);
        if (event) {
            // Combine the original colored border shadow with the red glow effect
            card.style.boxShadow = `
                inset 0 0.8vw 0 0 ${event.colorOfEvent}, 
                inset -0.8vw 0 0 0 ${event.colorOfEvent}, 
                inset 0 -0.8vw 0 0 ${event.colorOfEvent}, 
                0 1vw 3vw rgba(0,0,0,0.3),
                0 0 ${currentDiff / 2}px rgba(255, 0, 0, ${opacity * 0.6})
            `;
        }
        
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
        const event = findEventById(card.dataset.eventId);
        
        card.style.transform = 'translateX(0) rotate(0deg)';
        
        // Restore the original colored box shadow instead of clearing it
        if (event) {
            card.style.boxShadow = `
                inset 0 0.8vw 0 0 ${event.colorOfEvent}, 
                inset -0.8vw 0 0 0 ${event.colorOfEvent}, 
                inset 0 -0.8vw 0 0 ${event.colorOfEvent}, 
                0 1vw 3vw rgba(0,0,0,0.3)
            `;
        } else {
            // Fallback if event is not found - clear the box shadow
            card.style.boxShadow = '';
        }
        
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
    if (preferences.accepted.length === 0 && preferences.rejected.length === 0 && (getEssentialData('userEventPreferences_accepted') || getEssentialData('userEventPreferences_rejected'))) {
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

}

// Essential data cookie management functions (matching carousel.js system)
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

// Load preferences when page loads
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Load events data first and ensure it's successful
        await loadEventsData();
        
        // Verify events data is loaded
        if (!isEventsDataReady()) {
            console.warn('No events data loaded - deferring cleanup');
            // Try to load preferences without cleanup first
            loadEventPreferences();
            return;
        }
        
        
        // Clean up any expired events, but only if we have events data
        const wasUpdated = cleanupExpiredEvents();
        
        // Load and display preferences
        loadEventPreferences();

    } catch (error) {
        console.error('Error during initialization:', error);
        // Still try to load preferences even if events data failed
        loadEventPreferences();
    }
});

// Cleanup is handled automatically:
// - On page load (DOMContentLoaded)
// - When parsing preferences (parseEventPreferences)
// - When displaying events (loadEventPreferences)
// No additional cleanup needed - events are filtered in real-time


document.addEventListener('DOMContentLoaded', function() {
    let allEvents = []; // Store all events for filtering
    let currentFilteredEvents = []; // Store currently filtered events
    
    // Initialize filters after events are loaded
    function initializeFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const eventCountElement = document.getElementById('event-count');
        const eventsGrid = document.getElementById('events-grid');
        
        if (!filterButtons.length || !eventCountElement || !eventsGrid) {
            console.warn('Filter elements not found, retrying in 500ms...');
            setTimeout(initializeFilters, 500);
            return;
        }
        
        // Add click event listeners to filter buttons
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                const category = this.dataset.category;
                
                // Update active button state
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // Filter and display events
                filterEvents(category);
            });
        });
        
        // Initial load - show all events
        filterEvents('all');
    }
    
    // Filter events based on category
    function filterEvents(category) {
        if (!allEvents.length) {
            console.warn('No events loaded yet');
            return;
        }
        
        let filteredEvents;
        
        if (category === 'all') {
            filteredEvents = allEvents;
        } else {
            // Filter events by category (case-insensitive matching)
            filteredEvents = allEvents.filter(event => {
                // Assuming category is stored in event.category or similar field
                // Adjust this based on your actual event data structure
                const eventCategory = (event.colorOfEvent || '').toLowerCase();
                return eventCategory.includes(category.toLowerCase());
            });
        }
        
        currentFilteredEvents = filteredEvents;
        updateEventGrid(filteredEvents);
        updateEventCount(filteredEvents.length);
    }
    
    // Update the events grid with filtered events
    function updateEventGrid(events) {
        const container = document.getElementById('events-grid');
        if (!container) return;
        
        // Clear existing content
        container.innerHTML = '';
        
        if (events.length === 0) {
            // Show empty state
            container.innerHTML = `
                <div class="empty-filter-state">
                    <h3>Nenhum evento encontrado</h3>
                    <p>Não há eventos disponíveis para esta categoria.</p>
                </div>
            `;
            return;
        }
        
        // Create grid items for filtered events
        events.forEach(item => {
            const gridItem = document.createElement('div');
            gridItem.className = 'grid-item';
            gridItem.dataset.category = item.category || '';
            
            const color = item.colorOfEvent || '#000000';
            gridItem.style.setProperty('border', `0.2vw solid ${color}`, 'important');
            
            gridItem.innerHTML = `
                <img src="${item.imageSrc}" alt="${item.altText}">
                <div class="description">
                    <p class="description-title">${item.descriptionTitle}</p>
                    <p class="description-subtitle">${item.descriptionSubtitle}</p>
                </div>
                <div class="carousel-line"></div>
                <div class="opp-place">
                    <img src="${item.logoSrc}" alt="${item.logoAlt}">
                    <div>
                        <p class="opp-place-title">${item.oppPlaceTitle}</p>
                        <p class="opp-place-subtitle">${item.oppPlaceSubtitle}</p>
                    </div>
                </div>
                <a href="${item.moreInfoLink}" class="button-more-info">Mais Informações</a>
            `;
            
            container.appendChild(gridItem);
        });
    }
    
    // Update the event count display
    function updateEventCount(count) {
        const eventCountElement = document.getElementById('event-count');
        if (eventCountElement) {
            eventCountElement.textContent = count;
        }
    }
    
    // Enhanced createEventGrid function that stores events for filtering
    function createEventGrid(data) {
        const container = document.getElementById('events-grid');
        const oppCountElement = document.getElementById('opp-count');
        
        // Store all events for filtering
        allEvents = data.items;
        
        // Clear container first
        if (container) {
            container.innerHTML = '';
        }
        
        // Create grid items
        data.items.forEach(item => {
            const gridItem = document.createElement('div');
            gridItem.className = 'grid-item';
            gridItem.dataset.category = item.category || '';

            const color = item.colorOfEvent || '#000000';
            gridItem.style.setProperty('border', `0.2vw solid ${color}`, 'important');

            gridItem.innerHTML = `
                <img src="${item.imageSrc}" alt="${item.altText}">
                <div class="description">
                    <p class="description-title">${item.descriptionTitle}</p>
                    <p class="description-subtitle">${item.descriptionSubtitle}</p>
                </div>
                <div class="carousel-line"></div>
                <div class="opp-place">
                    <img src="${item.logoSrc}" alt="${item.logoAlt}">
                    <div>
                        <p class="opp-place-title">${item.oppPlaceTitle}</p>
                        <p class="opp-place-subtitle">${item.oppPlaceSubtitle}</p>
                    </div>
                </div>
                <a href="${item.moreInfoLink}" class="button-more-info">Mais Informações</a>
            `;
            
            if (container) {
                container.appendChild(gridItem);
            }
        });
        
        // Update count displays
        if (oppCountElement) {
            oppCountElement.textContent = data.items.length;
        }
        updateEventCount(data.items.length);
        
        // Initialize filters after events are loaded
        setTimeout(initializeFilters, 100);
    }
    
    // Function to check if event is in the future (from your existing code)
    function isFutureEvent(event) {
        const now = new Date();
        const [endHour, endMinute] = event.endTime.split(':').map(Number);
        const eventEnd = new Date(event.year, event.month - 1, event.day, endHour, endMinute);
        return eventEnd >= now;
    }
    
    // Load events and set up filtering
    fetch('/json/events.json')
        .then(response => response.json())
        .then(data => {
            const futureItems = data.items.filter(isFutureEvent);
            createEventGrid({ items: futureItems });
        })
        .catch(error => {
            console.error('Error loading event data:', error);
            updateEventCount(0);
        });
    
    // Public function to get current filtered events (useful for other parts of your app)
    window.getCurrentFilteredEvents = function() {
        return currentFilteredEvents;
    };
    
    // Public function to refresh filters (useful if events data changes)
    window.refreshFilters = function() {
        const activeButton = document.querySelector('.filter-btn.active');
        if (activeButton) {
            const category = activeButton.dataset.category;
            filterEvents(category);
        }
    };
});