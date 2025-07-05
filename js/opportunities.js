        
        
        
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

       function parseEventPreferences() {
        const acceptedCookie = getCookie('userEventPreferences_accepted');
        const rejectedCookie = getCookie('userEventPreferences_rejected');
        
        let accepted = [];
        let rejected = [];
        let hasData = false;

        try {
            if (acceptedCookie) {
                accepted = JSON.parse(acceptedCookie);
                hasData = true;
            }
            if (rejectedCookie) {
                rejected = JSON.parse(rejectedCookie);
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

        // Filter out expired events
        const today = new Date();
        const todayValue = (today.getFullYear() * 10000) + ((today.getMonth() + 1) * 100) + today.getDate();
        
        const activeAccepted = accepted.filter(event => {
            if (event.dateValue && typeof event.dateValue === 'number') {
                return event.dateValue >= todayValue;
            }
            if (event.parsedDay && event.parsedMonth && event.parsedYear) {
                const eventDateValue = (event.parsedYear * 10000) + (event.parsedMonth * 100) + event.parsedDay;
                return eventDateValue >= todayValue;
            }
            return true; // Keep events where we can't determine the date
        });
        
        const activeRejected = rejected.filter(event => {
            if (event.dateValue && typeof event.dateValue === 'number') {
                return event.dateValue >= todayValue;
            }
            if (event.parsedDay && event.parsedMonth && event.parsedYear) {
                const eventDateValue = (event.parsedYear * 10000) + (event.parsedMonth * 100) + event.parsedDay;
                return eventDateValue >= todayValue;
            }
            return true; // Keep events where we can't determine the date
        });

        // Update cookies if expired events were removed
        if (activeAccepted.length !== accepted.length) {
            document.cookie = `userEventPreferences_accepted=${encodeURIComponent(JSON.stringify(activeAccepted))};path=/;max-age=${30 * 24 * 60 * 60}`;
        }
        
        if (activeRejected.length !== rejected.length) {
            document.cookie = `userEventPreferences_rejected=${encodeURIComponent(JSON.stringify(activeRejected))};path=/;max-age=${30 * 24 * 60 * 60}`;
        }

        return { 
            accepted: activeAccepted, 
            rejected: activeRejected, 
            hasData: activeAccepted.length > 0 || activeRejected.length > 0 
        };
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
        
            // Handle the correct event object structure from your carousel
            const eventName = event.descriptionTitle || event.name || event.title || event.eventName || 'Nome não disponível';
            const eventDate = event.date || event.eventDate || event.timestamp || null;
        
            let dateDisplay = 'Data não disponível';
            if (eventDate) {
                try {
                    const date = new Date(eventDate);
                    if (!isNaN(date.getTime())) {
                        dateDisplay = date.toLocaleDateString('pt-PT');
                    }
                } catch (e) {
                    console.warn('Erro ao formatar data:', eventDate);
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
        document.addEventListener('DOMContentLoaded', loadEventPreferences);

        // Optional: Refresh data periodically in case cookies are updated
        setInterval(loadEventPreferences, 30000); // Refresh every 30 seconds