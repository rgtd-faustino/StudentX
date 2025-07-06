        
        
        
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
        const today = new Date();
        const todayValue = (today.getFullYear() * 10000) + ((today.getMonth() + 1) * 100) + today.getDate();
        
        const acceptedEvents = acceptedIds
            .map(id => findEventById(id))
            .filter(event => event && !hasEventDatePassed(event));
        
        const rejectedEvents = rejectedIds
            .map(id => findEventById(id))
            .filter(event => event && !hasEventDatePassed(event));

        // Update cookies if expired events were removed
        const activeAcceptedIds = acceptedEvents.map(event => event.id);
        const activeRejectedIds = rejectedEvents.map(event => event.id);
        
        if (activeAcceptedIds.length !== acceptedIds.length) {
            document.cookie = `userEventPreferences_accepted=${encodeURIComponent(JSON.stringify(activeAcceptedIds))};path=/;max-age=${30 * 24 * 60 * 60}`;
        }
        
        if (activeRejectedIds.length !== rejectedIds.length) {
            document.cookie = `userEventPreferences_rejected=${encodeURIComponent(JSON.stringify(activeRejectedIds))};path=/;max-age=${30 * 24 * 60 * 60}`;
        }

        return { 
            accepted: acceptedEvents, 
            rejected: rejectedEvents, 
            hasData: acceptedEvents.length > 0 || rejectedEvents.length > 0 
        };
    }

    // Helper function to check if an event date has passed
    function hasEventDatePassed(event) {
        const today = new Date();
        const todayValue = (today.getFullYear() * 10000) + ((today.getMonth() + 1) * 100) + today.getDate();
        
        // Calculate event date value from day and month
        if (event.day && event.month) {
            const monthMap = {
                'janeiro': 1, 'fevereiro': 2, 'março': 3, 'abril': 4,
                'maio': 5, 'junho': 6, 'julho': 7, 'agosto': 8,
                'setembro': 9, 'outubro': 10, 'novembro': 11, 'dezembro': 12
            };
            
            const eventDay = parseInt(event.day, 10);
            const eventMonth = typeof event.month === 'string' ? 
                (monthMap[event.month.toLowerCase()] || 0) : parseInt(event.month, 10);
            const eventYear = new Date().getFullYear();
            
            const eventDateValue = (eventYear * 10000) + (eventMonth * 100) + eventDay;
            
            if (eventDateValue < todayValue) {
                return true;
            }
            
            // If it's today, check the time
            if (eventDateValue === todayValue && event.endTime) {
                const now = new Date();
                const endTimeParts = event.endTime.split(':');
                const endHour = parseInt(endTimeParts[0], 10);
                const endMinute = parseInt(endTimeParts[1], 10);
                
                const eventEndTime = new Date();
                eventEndTime.setHours(endHour, endMinute, 0, 0);
                
                return now > eventEndTime;
            }
        }
        
        return false; // If we can't determine the date, assume it's still valid
    }

        function showNoCookiesWarning() {
            const warning = document.getElementById('noCookiesWarning');
            warning.style.display = 'block';
        }

        function createEventCard(event, type) {
            const card = document.createElement('div');
            card.className = `event-card ${type}`;
        
            const icon = type === 'accepted' ? '✓' : '✗';
            const statusClass = type === 'accepted' ? 'status-accepted' : 'status-rejected';
            const statusText = type === 'accepted' ? 'Aceite' : 'Rejeitado';
        
            // Use the new event structure
            const eventName = event.descriptionTitle || 'Nome não disponível';
            const eventSubtitle = event.descriptionSubtitle || '';
            const eventPlace = event.oppPlaceTitle || '';
            
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
        
            return card;
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
            document.getElementById('acceptedCount').textContent = accepted.length;
            document.getElementById('rejectedCount').textContent = rejected.length;
            document.getElementById('totalCount').textContent = accepted.length + rejected.length;
        }

        function loadEventPreferences() {
            const preferences = parseEventPreferences();
            const acceptedContainer = document.getElementById('acceptedEvents');
            const rejectedContainer = document.getElementById('rejectedEvents');
            
            // Clear existing content
            acceptedContainer.innerHTML = '';
            rejectedContainer.innerHTML = '';
            
            // Update statistics
            updateStats(preferences.accepted, preferences.rejected);
            
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

        // Load preferences when page loads
        document.addEventListener('DOMContentLoaded', async function() {
            await loadEventsData(); // Load events data first
            loadEventPreferences(); // Then load preferences
        });

        // Optional: Refresh data periodically in case cookies are updated
        setInterval(loadEventPreferences, 30000); // Refresh every 30 seconds