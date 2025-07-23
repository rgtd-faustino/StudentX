        function showForm(formType) {
            const overlay = document.getElementById('overlay');
            const messageForm = document.getElementById('message-form');
            const eventForm = document.getElementById('event-form');
            const previewContainer = document.getElementById('preview-container');
           
            // Hide overlay with animation
            overlay.classList.add('hidden');
           
            // Show appropriate form after overlay animation completes
            setTimeout(() => {
                if (formType === 'message') {
                    messageForm.classList.add('active');
                    previewContainer.classList.remove('active');
                } else if (formType === 'event') {
                    eventForm.classList.add('active');
                    previewContainer.classList.add('active');
                    setupEventPreview();
                }
            }, 300);
        }

        function hideForm() {
            const overlay = document.getElementById('overlay');
            const messageForm = document.getElementById('message-form');
            const eventForm = document.getElementById('event-form');
            const previewContainer = document.getElementById('preview-container');
           
            // Hide forms and preview
            messageForm.classList.remove('active');
            eventForm.classList.remove('active');
            previewContainer.classList.remove('active');
           
            // Show overlay after form animation completes
            setTimeout(() => {
                overlay.classList.remove('hidden');
            }, 300);
        }

function setupEventPreview() {
    const eventTitle = document.getElementById('event-title');
    const eventDescription = document.getElementById('event-description');
    const eventLinkWebsite = document.getElementById('event-link');
    const eventLocation = document.getElementById('event-location');
    const eventLocation2 = document.getElementById('event-location2');
    const eventImage = document.getElementById('event-image');
    const eventImage2 = document.getElementById('event-image2');
    const eventCategory = document.getElementById('event-category');
    const eventDate = document.getElementById('event-date');
    const eventStartTime = document.getElementById('event-start-time');
    const eventEndTime = document.getElementById('event-end-time');

    const previewContainer = document.getElementById('preview-container');

    // Category color mapping
    const categoryColors = {
        'Desenvolvimento Curricular': 'green',
        'Desenvolvimento Pessoal': 'red',
        'Desenvolvimento Profissional': 'blue'
    };

    // Store current image sources
    let currentImageSrc = '📷';
    let currentImageSrc2 = '📷';

    function formatDate(dateString, timeStartString, timeEndString) {
        if (!dateString) return 'Data não definida';
        
        const date = new Date(dateString);
        const months = [
            'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
            'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
        ];
        
        const day = date.getDate();
        const month = months[date.getMonth()];
        const weekdays = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
        const weekday = weekdays[date.getDay()];
        
        let result = `${weekday}, ${day} de ${month}`;
        if (timeStartString && timeEndString) {
            result += ` às ${timeStartString} - ${timeEndString}`;
        }
        
        return result;
    }

    // Function to convert time to minutes (copied from calendar logic)
    function convertTimeToMinutes(timeString) {
        if (!timeString) return 0;
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + minutes;
    }

    // Function to calculate event duration in minutes
    function getEventDuration(startTime, endTime) {
        if (!startTime || !endTime) return 60; // Default 1 hour
        const startMinutes = convertTimeToMinutes(startTime);
        const endMinutes = convertTimeToMinutes(endTime);
        return endMinutes - startMinutes;
    }

    // Function to simulate event height based on duration (like calendar logic)
    function getSimulatedEventHeight(duration) {
        const hourHeight = 13.1; // Same as calendar
        const minuteHeight = hourHeight / 60;
        return (duration * minuteHeight);
    }

    function updatePreviewHTML() {
        const eventName = eventTitle.value.trim() || 'Nome do Evento';
        const eventDesc = eventDescription.value.trim() || 'Descrição do evento';
        let eventLink = eventLinkWebsite.value.trim();
        const eventLoc = eventLocation.value.trim() || 'Organização';
        const eventLoc2 = eventLocation2.value.trim() || 'Local do evento';
        const selectedCategory = eventCategory.value;
        const selectedDate = eventDate.value;
        const selectedStartTime = eventStartTime.value;
        const selectedEndTime = eventEndTime.value;

        if (eventLink && !eventLink.startsWith('http://') && !eventLink.startsWith('https://')) {
            eventLink = 'https://' + eventLink;
        }
        
        // Format the subtitle with date and time
        const formattedDateTime = formatDate(selectedDate, selectedStartTime, selectedEndTime);
        
        // Calculate event duration and simulated height
        const duration = getEventDuration(selectedStartTime, selectedEndTime);
        const simulatedHeight = getSimulatedEventHeight(duration);
        
        let previewHTML = '';


        
        // Apply same logic as calendar: small events show only image, larger events show more content
        if (simulatedHeight < 14) {
            // Small event - show only main image (like calendar logic)
            previewHTML = `
                <div class="preview-wrapper">
                    <h2 class="preview-title">Pré-visualização do Evento (Evento Pequeno - ${duration} min)</h2>
                    <div class="modal-content small-event">
                        <button class="expand-event-details">
                            <img src="/images/plus.webp" alt="Expande os detalhes do evento">
                        </button>
                        <div class="event-image-expanded">${currentImageSrc === '📷' ? currentImageSrc : `<img src="${currentImageSrc}" alt="Event Image" />`}</div>
                    </div>
                </div>
            `;
        } else if (simulatedHeight >= 14 && simulatedHeight < 30) {
            // Medium event - show basic content (like calendar logic)
            previewHTML = `
                <div class="preview-wrapper">
                    <h2 class="preview-title">Pré-visualização do Evento (Evento Médio - ${duration} min)</h2>
                    <div class="modal-content medium-event">
                        <div class="event-image-expanded">${currentImageSrc === '📷' ? currentImageSrc : `<img src="${currentImageSrc}" style="width: 100%; height: 100%; object-fit: cover;" alt="Event Image" />`}</div>
                        <p class="description-title-calendar-expanded">${eventName}</p>
                        <p class="description-subtitle-calendar-expanded">${formattedDateTime}</p>
                        <div class="carousel-line-calendar-expanded"></div>
                        <div class="logo-and-place-info-expanded">
                            <div class="event-logo-container">${currentImageSrc2 === '📷' ? currentImageSrc2 : `<img src="${currentImageSrc2}" alt="Event Logo" />`}</div>
                            <div class="place-info-expanded">
                                <p class="opp-place-title-calendar-expanded">${eventLoc}</p>
                                <p class="opp-place-subtitle-calendar-expanded">${eventLoc2}</p>
                            </div>
                        </div>
                        <a class="more-info-link-calendar-expanded" href="${eventLink}" target="_blank">Mais Informações</a>
                    </div>
                </div>
            `;
        } else {
            // Large event - show all content including description text (like calendar logic)
            previewHTML = `
                <div class="preview-wrapper">
                    <h2 class="preview-title">Pré-visualização do Evento (Evento Grande - ${duration} min)</h2>
                    <div class="modal-content large-event">
                        <div class="event-image-expanded">${currentImageSrc === '📷' ? currentImageSrc : `<img src="${currentImageSrc}" style="width: 100%; height: 100%; object-fit: cover;" alt="Event Image" />`}</div>
                        <p class="description-title-calendar-expanded">${eventName}</p>
                        <p class="description-subtitle-calendar-expanded">${formattedDateTime}</p>
                        <div class="carousel-line-calendar-expanded"></div>
                        
                        <!-- Description text container (like calendar's addTextContainer) -->
                        <div class="text-container">
                            <div class="text-wrapper">
                                <p class="text-element">
                                    ${eventDesc || 'Descrição do evento não fornecida.'}
                                </p>
                            </div>
                        </div>
                        
                        <div class="logo-and-place-info-expanded">
                            <div class="event-logo-container">${currentImageSrc2 === '📷' ? currentImageSrc2 : `<img src="${currentImageSrc2}" alt="Event Logo" />`}</div>
                            <div class="place-info-expanded">
                                <p class="opp-place-title-calendar-expanded">${eventLoc}</p>
                                <p class="opp-place-subtitle-calendar-expanded">${eventLoc2}</p>
                            </div>
                        </div>
                        <a class="more-info-link-calendar-expanded" href="${eventLink}" target="_blank">Mais Informações</a>
                    </div>
                </div>
            `;
        }
        
        // Update the preview container
        previewContainer.innerHTML = previewHTML;

        const previewBorder = previewContainer.querySelector('.modal-content');
        if (previewBorder && selectedCategory && categoryColors[selectedCategory]) {
            previewBorder.style.border = `0.2vw solid ${categoryColors[selectedCategory]}`;
        } else if (previewBorder) {
            previewBorder.style.border = '0.2vw solid rgb(173, 173, 173)';
        }

        // Add expand button functionality for small events
        const expandButton = previewContainer.querySelector('.expand-event-details');
        if (expandButton) {
            expandButton.onclick = () => {
                // Show expanded view similar to calendar's showExpandedView
                showExpandedEventPreview({
                    imageSrc: currentImageSrc,
                    altText: 'Event Image',
                    descriptionTitle: eventName,
                    descriptionSubtitle: formattedDateTime,
                    logoSrc: currentImageSrc2,
                    logoAlt: 'Event Logo',
                    oppPlaceTitle: eventLoc,
                    oppPlaceSubtitle: eventLoc2,
                    moreInfoLink: eventLink || '#',
                    moreInfoText: eventDesc
                });
            };
        }
    }

    // Function to show expanded view for small events (similar to calendar)
    function showExpandedEventPreview(event) {
        let modalContainer = document.getElementById('eventModal');
        if (!modalContainer) {
            modalContainer = document.createElement('div');
            modalContainer.id = 'eventModal';
            modalContainer.classList.add('event-modal');
            document.body.appendChild(modalContainer);
        }

        modalContainer.innerHTML = `
            <div class="modal-content">
                <div class="event-image-expanded">${event.imageSrc === '📷' ? event.imageSrc : `<img src="${event.imageSrc}" alt="${event.altText}" />`}</div>
                <p class="description-title-calendar-expanded">${event.descriptionTitle}</p>
                <p class="description-subtitle-calendar-expanded">${event.descriptionSubtitle}</p>
                <div class="carousel-line-calendar-expanded"></div>
            
                ${event.moreInfoText ? `
                <div class="text-container">
                    <div class="text-wrapper">
                        <p class="text-element">
                            ${event.moreInfoText || 'Descrição do evento não fornecida.'}
                        </p>
                    </div>
                </div>
                ` : ''}
            
                <div class="logo-and-place-info-expanded">
                    <div class="event-logo-container">${event.logoSrc === '📷' ? event.logoSrc : `<img src="${event.logoSrc}" alt="${event.logoAlt}" />`}</div>
                    <div class="place-info-expanded">
                        <p class="opp-place-title-calendar-expanded">${event.oppPlaceTitle}</p>
                        <p class="opp-place-subtitle-calendar-expanded">${event.oppPlaceSubtitle}</p>
                    </div>
                </div>
                <a href="${event.moreInfoLink}" target="_blank" class="more-info-link-calendar-expanded">Mais Informações</a>
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

    function updatePreview() {
        updatePreviewHTML();
    }

    // Handle first image (event thumbnail)
    function handleImageChange(fileInput, imageType) {
        const file = fileInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                if (imageType === 'thumbnail') {
                    currentImageSrc = e.target.result;
                } else if (imageType === 'logo') {
                    currentImageSrc2 = e.target.result;
                }
                updatePreviewHTML();
            };
            reader.readAsDataURL(file);
        } else {
            // Reset to placeholder when no file is selected
            if (imageType === 'thumbnail') {
                currentImageSrc = '📷';
            } else if (imageType === 'logo') {
                currentImageSrc2 = '📷';
            }
            updatePreviewHTML();
        }
    }

    // Add event listeners for real-time updates
    if (eventTitle) eventTitle.addEventListener('input', updatePreview);
    if (eventDescription) eventDescription.addEventListener('input', updatePreview);
    if (eventLinkWebsite) eventLinkWebsite.addEventListener('input', updatePreview);
    if (eventLocation) eventLocation.addEventListener('input', updatePreview);
    if (eventLocation2) eventLocation2.addEventListener('input', updatePreview);
    if (eventCategory) eventCategory.addEventListener('change', updatePreview);
    if (eventDate) eventDate.addEventListener('change', updatePreview);
    if (eventStartTime) eventStartTime.addEventListener('change', updatePreview);
    if (eventEndTime) eventEndTime.addEventListener('change', updatePreview);

    // Handle image preview for thumbnail
    if (eventImage) {
        eventImage.addEventListener('change', function() {
            const file = this.files[0];
            const label = document.getElementById('file-label');
            
            if (file) {
                if (label) {
                    label.innerHTML = `📷 ${file.name}`;
                }
                handleImageChange(this, 'thumbnail');
            } else {
                if (label) {
                    label.innerHTML = '📷 Clica para selecionar a imagem principal do evento (thumbnail)';
                }
                handleImageChange(this, 'thumbnail');
            }
        });
    }

    // Handle image preview for logo
    if (eventImage2) {
        eventImage2.addEventListener('change', function() {
            const file = this.files[0];
            const label2 = document.getElementById('file-label2');
            
            if (file) {
                if (label2) {
                    label2.innerHTML = `📷 ${file.name}`;
                }
                handleImageChange(this, 'logo');
            } else {
                if (label2) {
                    label2.innerHTML = '📷 Clica para selecionar o logotipo do evento/empresa';
                }
                handleImageChange(this, 'logo');
            }
        });
    }

    // Initial update to set default values
    updatePreview();
}