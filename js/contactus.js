const WORKER_URL = 'https://formsubmissions.contact-studentx.workers.dev/';

// ========== FORM MANAGEMENT ==========
function showForm(formType) {
    const overlay = document.getElementById('overlay');
    const messageForm = document.getElementById('message-form');
    const eventForm = document.getElementById('event-form');
    const previewContainer = document.getElementById('preview-container');
   
    overlay.classList.add('hidden');
   
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
   
    messageForm.classList.remove('active');
    eventForm.classList.remove('active');
    previewContainer.classList.remove('active');
   
    setTimeout(() => {
        overlay.classList.remove('hidden');
    }, 300);
}

let storedEventImage = null;
let storedEventLogo = null;

// ========== DRAG AND DROP FUNCTIONALITY ==========
function setupDragAndDrop() {
    const fileInputs = [
        { input: document.getElementById('event-image'), label: document.getElementById('file-label'), type: 'thumbnail' },
        { input: document.getElementById('event-image2'), label: document.getElementById('file-label2'), type: 'logo' }
    ];

    fileInputs.forEach(({ input, label, type }) => {
        if (!input || !label) return;

        // Drag and drop events
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            label.addEventListener(eventName, preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            label.addEventListener(eventName, () => label.classList.add('drag-over'), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            label.addEventListener(eventName, () => label.classList.remove('drag-over'), false);
        });

        label.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const file = files[0];
                if (file.type.startsWith('image/')) {
                    try {
                        const dt = new DataTransfer();
                        dt.items.add(file);
                        input.files = dt.files;
                        
                        if (type === 'thumbnail') {
                            storedEventImage = file;
                        } else if (type === 'logo') {
                            storedEventLogo = file;
                        }
                        
                        label.innerHTML = `${file.name} <span class="remove-image" onclick="removeImage('${type}')"></span>`;
                        
                        setTimeout(() => {
                            const changeEvent = new Event('change', { bubbles: true });
                            input.dispatchEvent(changeEvent);
                        }, 10);
                        
                    } catch (error) {
                        console.error(`❌ Failed to set file for ${type}:`, error);
                    }
                } else {
                    console.warn('Invalid file type dropped:', file.type);
                }
            }
        });

        label.addEventListener('click', (e) => {
            if (!e.target.classList.contains('remove-image')) {
                input.click();
            }
        });
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
}

function clearDateError() {
    const existingError = document.getElementById('date-validation-error');
    if (existingError) {
        existingError.remove();
    }
}

function clearTimeError() {
    const existingError = document.getElementById('time-validation-error');
    if (existingError) {
        existingError.remove();
    }
}

// ========== DESCRIPTION FIELD MANAGEMENT ==========
function updateDescriptionFieldState(duration) {
    const eventDescription = document.getElementById('event-description');
    const descriptionContainer = eventDescription?.parentElement;
    
    if (!eventDescription) return;
    
    if (duration >= 132) {
        // Large event - description required
        eventDescription.disabled = false;
        eventDescription.required = true;
        eventDescription.placeholder = "Descrição obrigatória para eventos longos (132+ min)";
        
        if (descriptionContainer) {
            descriptionContainer.style.opacity = '1';
            descriptionContainer.style.cursor = 'auto';
        }
        
        // Add visual indicator for required field
        const label = descriptionContainer?.querySelector('label');
        if (label && !label.textContent.includes('*')) {
            label.textContent = label.textContent + ' *';
        }
        
    } else {
        // Small/medium event - description disabled
        eventDescription.disabled = true;
        eventDescription.required = false;
        eventDescription.value = ''; // Clear any existing text
        eventDescription.placeholder = "Descrição não necessária para eventos curtos";
        
        if (descriptionContainer) {
            descriptionContainer.style.opacity = '1';
            descriptionContainer.style.cursor = 'not-allowed';
        }
        
        // Remove required indicator
        const label = descriptionContainer?.querySelector('label');
        if (label && label.textContent.includes('*')) {
            label.textContent = label.textContent.replace(' *', '');
        }
    }
}

// ========== EVENT PREVIEW FUNCTIONALITY ==========
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

    const categoryColors = {
        'Desenvolvimento Curricular': 'green',
        'Desenvolvimento Pessoal': 'red',
        'Desenvolvimento Profissional': 'blue'
    };

    let currentImageSrc = '📷';
    let currentImageSrc2 = '📷';

    setupDragAndDrop();

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

    function validateEventDate() {
        const eventDate = document.getElementById('event-date');
        
        if (!eventDate || !eventDate.value) return true;
        
        const selectedDate = new Date(eventDate.value);
        const today = new Date();
        
        today.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            showDateError('A data do evento deve ser hoje ou no futuro');
            return false;
        } else {
            clearDateError();
            return true;
        }
    }

    function showDateError(message) {
        clearDateError();
        
        const eventDate = document.getElementById('event-date');
        const errorDiv = document.createElement('div');
        errorDiv.id = 'date-validation-error';
        errorDiv.style.cssText = `
            color: #dc2626;
            font-size: 0.875rem;
            margin-top: 0.25rem;
            margin-bottom: 0.25rem;
            padding: 0.5rem;
            background-color: #fee2e2;
            border: 1px solid #fca5a5;
            border-radius: 0.375rem;
        `;
        errorDiv.textContent = message;
        
        eventDate.parentNode.insertBefore(errorDiv, eventDate.nextSibling);
    }

    function validateEventTimes() {
        const eventStartTime = document.getElementById('event-start-time');
        const eventEndTime = document.getElementById('event-end-time');
        
        if (!eventStartTime || !eventEndTime) return true;
        
        const startTime = eventStartTime.value;
        const endTime = eventEndTime.value;
        
        if (startTime && endTime) {
            const startMinutes = timeToMinutes(startTime);
            const endMinutes = timeToMinutes(endTime);
            
            if (startMinutes >= endMinutes) {
                showTimeError('A hora de início deve ser anterior à hora de fim');
                return false;
            } else {
                clearTimeError();
                return true;
            }
        }
        
        return true;
    }

    function timeToMinutes(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + minutes;
    }

    function showTimeError(message) {
        clearTimeError();
        
        const eventEndTime = document.getElementById('event-end-time');
        const errorDiv = document.createElement('div');
        errorDiv.id = 'time-validation-error';
        errorDiv.style.cssText = `
            color: #dc2626;
            font-size: 0.875rem;
            margin-top: 0.25rem;
            margin-bottom: 0.25rem;
            padding: 0.5rem;
            background-color: #fee2e2;
            border: 1px solid #fca5a5;
            border-radius: 0.375rem;
        `;
        errorDiv.textContent = message;
        
        eventEndTime.parentNode.insertBefore(errorDiv, eventEndTime.nextSibling);
    }

    function getEventDuration(startTime, endTime) {
        if (!startTime || !endTime) return 60;
        const startMinutes = startTime.split(':').map(Number);
        const endMinutes = endTime.split(':').map(Number);
        return (endMinutes[0] * 60 + endMinutes[1]) - (startMinutes[0] * 60 + startMinutes[1]);
    }

    function getSimulatedEventHeight(duration) {
        return (duration * 13.1) / 60;
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

        const processedLink = eventLink ? (eventLink.startsWith('http://') || eventLink.startsWith('https://') ? eventLink : 'https://' + eventLink) : '';
        const displayLink = processedLink || '#';
        
        const formattedDateTime = formatDate(selectedDate, selectedStartTime, selectedEndTime);
        const duration = getEventDuration(selectedStartTime, selectedEndTime);
        const simulatedHeight = getSimulatedEventHeight(duration);
        
        // Update description field state based on duration
        updateDescriptionFieldState(duration);
        
        let previewHTML = '';

        if (simulatedHeight < 14) {
            previewHTML = `
                <div class="preview-wrapper">
                    <h2 class="preview-title">Pré-visualização do Evento (Evento Pequeno - ${duration} min)</h2>
                    <div class="modal-content small-event" style="height: ${simulatedHeight}vw; min-height: ${simulatedHeight}vw;">
                        <button class="expand-event-details">
                            <img src="/images/plus.webp" alt="Expande os detalhes do evento">
                        </button>
                        <div class="event-image-expanded${currentImageSrc !== '📷' ? ' has-image' : ''}"${currentImageSrc !== '📷' ? ' style="background-color: transparent;"' : ''}>${currentImageSrc === '📷' ? currentImageSrc : `<img src="${currentImageSrc}" alt="Event Image" />`}</div>
                    </div>
                </div>
            `;
        } else if (simulatedHeight >= 14 && simulatedHeight < 30) {
            previewHTML = `
                <div class="preview-wrapper">
                    <h2 class="preview-title">Pré-visualização do Evento (Evento Médio - ${duration} min)</h2>
                    <div class="modal-content medium-event">
                        <div class="event-image-expanded${currentImageSrc !== '📷' ? ' has-image' : ''}"${currentImageSrc !== '📷' ? ' style="background-color: transparent;"' : ''}>${currentImageSrc === '📷' ? currentImageSrc : `<img src="${currentImageSrc}" style="width: 100%; height: 100%; object-fit: cover;" alt="Event Image" />`}</div>
                        <p class="description-title-calendar-expanded">${eventName}</p>
                        <p class="description-subtitle-calendar-expanded">${formattedDateTime}</p>
                        <div class="carousel-line-calendar-expanded"></div>
                        <div class="logo-and-place-info-expanded">
                            <div class="event-logo-container${currentImageSrc2 !== '📷' ? ' has-image' : ''}"${currentImageSrc2 !== '📷' ? ' style="background-color: transparent;"' : ''}>${currentImageSrc2 === '📷' ? currentImageSrc2 : `<img src="${currentImageSrc2}" alt="Event Logo" />`}</div>
                            <div class="place-info-expanded">
                                <p class="opp-place-title-calendar-expanded">${eventLoc}</p>
                                <p class="opp-place-subtitle-calendar-expanded">${eventLoc2}</p>
                            </div>
                        </div>
                        <a class="more-info-link-calendar-expanded" href="${displayLink}" target="_blank">Mais Informações</a>
                    </div>
                </div>
            `;
        } else {
            previewHTML = `
                <div class="preview-wrapper">
                    <h2 class="preview-title">Pré-visualização do Evento (Evento Grande - ${duration} min)</h2>
                    <div class="modal-content large-event">
                        <div class="event-image-expanded${currentImageSrc !== '📷' ? ' has-image' : ''}"${currentImageSrc !== '📷' ? ' style="background-color: transparent;"' : ''}>${currentImageSrc === '📷' ? currentImageSrc : `<img src="${currentImageSrc}" style="width: 100%; height: 100%; object-fit: cover;" alt="Event Image" />`}</div>
                        <p class="description-title-calendar-expanded">${eventName}</p>
                        <p class="description-subtitle-calendar-expanded">${formattedDateTime}</p>
                        <div class="carousel-line-calendar-expanded"></div>
                        
                        <div class="text-container">
                            <div class="text-wrapper">
                                <p class="text-element">
                                    ${eventDesc || 'Descrição do evento não fornecida.'}
                                </p>
                            </div>
                        </div>
                        
                        <div class="logo-and-place-info-expanded">
                            <div class="event-logo-container${currentImageSrc2 !== '📷' ? ' has-image' : ''}"${currentImageSrc2 !== '📷' ? ' style="background-color: transparent;"' : ''}>${currentImageSrc2 === '📷' ? currentImageSrc2 : `<img src="${currentImageSrc2}" alt="Event Logo" />`}</div>
                            <div class="place-info-expanded">
                                <p class="opp-place-title-calendar-expanded">${eventLoc}</p>
                                <p class="opp-place-subtitle-calendar-expanded">${eventLoc2}</p>
                            </div>
                        </div>
                        <a class="more-info-link-calendar-expanded" href="${displayLink}" target="_blank">Mais Informações</a>
                    </div>
                </div>
            `;
        }
        
        previewContainer.innerHTML = previewHTML;

        const previewBorder = previewContainer.querySelector('.modal-content');
        if (previewBorder && selectedCategory && categoryColors[selectedCategory]) {
            previewBorder.style.border = `0.2vw solid ${categoryColors[selectedCategory]}`;
        } else if (previewBorder) {
            previewBorder.style.border = '0.2vw solid rgb(173, 173, 173)';
        }

        const expandButton = previewContainer.querySelector('.expand-event-details');
        if (expandButton) {
            expandButton.onclick = () => {
                showExpandedEventPreview({
                    imageSrc: currentImageSrc,
                    descriptionTitle: eventName,
                    descriptionSubtitle: formattedDateTime,
                    logoSrc: currentImageSrc2,
                    oppPlaceTitle: eventLoc,
                    oppPlaceSubtitle: eventLoc2,
                    moreInfoLink: displayLink,
                    moreInfoText: eventDesc
                });
            };
        }
    }

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
                <div class="event-image-expanded${event.imageSrc !== '📷' ? ' has-image' : ''}"${event.imageSrc !== '📷' ? ' style="background-color: transparent;"' : ''}>${event.imageSrc === '📷' ? event.imageSrc : `<img src="${event.imageSrc}" alt="Event Image" />`}</div>
                <p class="description-title-calendar-expanded">${event.descriptionTitle}</p>
                <p class="description-subtitle-calendar-expanded">${event.descriptionSubtitle}</p>
                <div class="carousel-line-calendar-expanded"></div>
            
                <div class="logo-and-place-info-expanded">
                    <div class="event-logo-container${event.logoSrc !== '📷' ? ' has-image' : ''}"${event.logoSrc !== '📷' ? ' style="background-color: transparent;"' : ''}>${event.logoSrc === '📷' ? event.logoSrc : `<img src="${event.logoSrc}" alt="Event Logo" />`}</div>
                    <div class="place-info-expanded">
                        <p class="opp-place-title-calendar-expanded">${event.oppPlaceTitle}</p>
                        <p class="opp-place-subtitle-calendar-expanded">${event.oppPlaceSubtitle}</p>
                    </div>
                </div>
                <a href="${event.moreInfoLink}" target="_blank" class="more-info-link-calendar-expanded">Mais Informações</a>
            </div>
        `;
        
        modalContainer.style.display = 'flex';

        modalContainer.onclick = (e) => {
            const modalContent = modalContainer.querySelector('.modal-content');
            if (!modalContent.contains(e.target)) {
                modalContainer.style.display = 'none';
            }
        };
    }

    function handleImageChange(fileInput, imageType) {
        const file = fileInput.files[0];
        
        if (file && file.type.startsWith('image/')) {
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
            if (imageType === 'thumbnail') {
                currentImageSrc = '📷';
            } else if (imageType === 'logo') {
                currentImageSrc2 = '📷';
            }
            updatePreviewHTML();
        }
    }

    function resetImageInput(inputElement, labelElement, defaultText, imageType) {
        inputElement.value = '';
        labelElement.innerHTML = defaultText;
        
        if (imageType === 'thumbnail') {
            currentImageSrc = '📷';
        } else if (imageType === 'logo') {
            currentImageSrc2 = '📷';
        }
        
        updatePreviewHTML();
    }

    function setupTextFieldUpdates(element) {
        if (!element) return;
        
        element.addEventListener('blur', updatePreviewHTML);
        
        element.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                updatePreviewHTML();
                element.blur();
            }
        });
    }

    setupTextFieldUpdates(eventTitle);
    setupTextFieldUpdates(eventDescription);
    setupTextFieldUpdates(eventLinkWebsite);
    setupTextFieldUpdates(eventLocation);
    setupTextFieldUpdates(eventLocation2);

    [eventCategory].forEach(el => {
        if (el) el.addEventListener('change', updatePreviewHTML);
    });
    
    if (eventDate) {
        eventDate.addEventListener('change', function() {
            if (validateEventDate()) {
                updatePreviewHTML();
            }
        });
    }

    [eventStartTime, eventEndTime].forEach(el => {
        if (el) {
            el.addEventListener('change', function() {
                const dateValid = validateEventDate();
                const timeValid = validateEventTimes();
                
                if (dateValid && timeValid) {
                    updatePreviewHTML();
                }
            });
        }
    });

    if (eventImage) {
        eventImage.addEventListener('change', function() {
            const file = this.files[0];
            const label = document.getElementById('file-label');
            
            if (file && file.type.startsWith('image/') && label) {
                label.innerHTML = `${file.name} <span class="remove-image" onclick="removeImage('thumbnail')"></span>`;
                storedEventImage = file;
            } else if (label) {
                label.innerHTML = '📷 Clica para selecionar a imagem principal do evento (thumbnail)';
                storedEventImage = null;
            }
            handleImageChange(this, 'thumbnail');
        });
    }

    if (eventImage2) {
        eventImage2.addEventListener('change', function() {
            const file = this.files[0];
            const label2 = document.getElementById('file-label2');
            
            if (file && file.type.startsWith('image/') && label2) {
                label2.innerHTML = `${file.name} <span class="remove-image" onclick="removeImage('logo')"></span>`;
                storedEventLogo = file;
            } else if (label2) {
                label2.innerHTML = '📷 Clica para selecionar o logotipo do evento/empresa';
                storedEventLogo = null;
            }
            handleImageChange(this, 'logo');
        });
    }

    window.removeImage = function(imageType) {
        if (imageType === 'thumbnail') {
            const input = document.getElementById('event-image');
            const label = document.getElementById('file-label');
            resetImageInput(input, label, '📷 Clica para selecionar a imagem principal do evento (thumbnail)', 'thumbnail');
            storedEventImage = null;
        } else if (imageType === 'logo') {
            const input = document.getElementById('event-image2');
            const label = document.getElementById('file-label2');
            resetImageInput(input, label, '📷 Clica para selecionar o logotipo do evento/empresa', 'logo');
            storedEventLogo = null;
        }
    };

    updatePreviewHTML();
}

// ========== FORM VALIDATION ==========
function validateEventForm() {
    const requiredFields = [
        { id: 'event-title', name: 'Título do Evento' },
        { id: 'event-category', name: 'Categoria do Evento' },
        { id: 'event-date', name: 'Data do Evento' },
        { id: 'event-start-time', name: 'Hora de Início' },
        { id: 'event-end-time', name: 'Hora de Fim' },
        { id: 'event-location', name: 'Organização' },
        { id: 'event-location2', name: 'Local do Evento' },
        { id: 'event-link', name: 'Link do Evento' }
    ];

    const missingFields = [];
    
    // Check basic required fields
    requiredFields.forEach(field => {
        const element = document.getElementById(field.id);
        if (!element || !element.value.trim()) {
            missingFields.push(field.name);
        }
    });

    // Check images (always required)
    const eventImage = document.getElementById('event-image');
    const eventImage2 = document.getElementById('event-image2');
    
    if (!eventImage?.files?.[0] && !storedEventImage) {
        missingFields.push('Imagem Principal (Thumbnail)');
    }
    
    if (!eventImage2?.files?.[0] && !storedEventLogo) {
        missingFields.push('Logotipo do Evento/Empresa');
    }

    // Check description for large events
    const eventStartTime = document.getElementById('event-start-time');
    const eventEndTime = document.getElementById('event-end-time');
    const eventDescription = document.getElementById('event-description');
    
    if (eventStartTime?.value && eventEndTime?.value) {
        const duration = getEventDuration(eventStartTime.value, eventEndTime.value);
        if (duration >= 132 && (!eventDescription?.value?.trim())) {
            missingFields.push('Descrição do Evento (obrigatória para eventos longos)');
        }
    }

    return missingFields;
}

function getEventDuration(startTime, endTime) {
    if (!startTime || !endTime) return 60;
    const startMinutes = startTime.split(':').map(Number);
    const endMinutes = endTime.split(':').map(Number);
    return (endMinutes[0] * 60 + endMinutes[1]) - (startMinutes[0] * 60 + startMinutes[1]);
}

// ========== SUBMISSION FUNCTIONS ==========
async function submitMessage(formData) {
    formData.append('submission_type', 'message');
    
    const response = await fetch(WORKER_URL, {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
        throw new Error(errorData.message || 'Erro ao enviar mensagem');
    }

    return await response.json();
}

async function submitEvent(formData) {
    formData.append('submission_type', 'event');
    
    const response = await fetch(WORKER_URL, {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
        throw new Error(errorData.message || 'Erro ao submeter evento');
    }

    return await response.json();
}

function resetEventForm() {
    const eventForm = document.getElementById('event-form-element');
    if (eventForm) {
        eventForm.reset();
    }
    
    const eventImage = document.getElementById('event-image');
    const eventImage2 = document.getElementById('event-image2');
    const fileLabel = document.getElementById('file-label');
    const fileLabel2 = document.getElementById('file-label2');
    
    if (eventImage) {
        eventImage.value = '';
        try {
            const dt = new DataTransfer();
            eventImage.files = dt.files;
        } catch (e) {
            console.warn('Could not clear file input completely:', e);
        }
    }
    
    if (eventImage2) {
        eventImage2.value = '';
        try {
            const dt = new DataTransfer();
            eventImage2.files = dt.files;
        } catch (e) {
            console.warn('Could not clear file input completely:', e);
        }
    }
    
    if (fileLabel) {
        fileLabel.innerHTML = '📷 Clica para selecionar a imagem principal do evento (thumbnail)';
        fileLabel.className = fileLabel.className.replace(/drag-over|file-selected/g, '').trim();
        fileLabel.style.borderColor = '';
        fileLabel.style.color = '';
        fileLabel.style.backgroundColor = '';
    }
    
    if (fileLabel2) {
        fileLabel2.innerHTML = '📷 Clica para selecionar o logotipo do evento/empresa';
        fileLabel2.className = fileLabel2.className.replace(/drag-over|file-selected/g, '').trim();
        fileLabel2.style.borderColor = '';
        fileLabel2.style.color = '';
        fileLabel2.style.backgroundColor = '';
    }
    
    // Reset description field state
    const eventDescription = document.getElementById('event-description');
    const descriptionContainer = eventDescription?.parentElement;
    if (eventDescription) {
        eventDescription.disabled = false;
        eventDescription.required = false;
        eventDescription.value = '';
        eventDescription.placeholder = "Descrição do evento";
        
        if (descriptionContainer) {
            descriptionContainer.style.opacity = '1';
            descriptionContainer.style.cursor = 'auto';
        }
        
        const label = descriptionContainer?.querySelector('label');
        if (label && label.textContent.includes('*')) {
            label.textContent = label.textContent.replace(' *', '');
        }
    }
    
    if (typeof currentImageSrc !== 'undefined') {
        currentImageSrc = '📷';
    }
    if (typeof currentImageSrc2 !== 'undefined') {
        currentImageSrc2 = '📷';
    }
    
    storedEventImage = null;
    storedEventLogo = null;
    
    clearTimeError();
    clearDateError();
    
    const previewContainer = document.getElementById('preview-container');
    if (previewContainer) {
        previewContainer.innerHTML = '';
        previewContainer.classList.remove('active');
    }
    
    const eventModal = document.getElementById('eventModal');
    if (eventModal) {
        eventModal.style.display = 'none';
    }
    
    if (typeof updatePreviewHTML === 'function') {
        setTimeout(() => {
            updatePreviewHTML();
        }, 50);
    }
    
    const errorElements = document.querySelectorAll('#date-validation-error, #time-validation-error');
    errorElements.forEach(el => el.remove());
    
    console.log('✅ Form completely reset');
}

// ========== UI HELPERS ==========
function showLoading() {
    document.getElementById('loadingOverlay').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

// ========== FORM HANDLERS ==========
document.addEventListener('DOMContentLoaded', function() {
    setupDragAndDrop();
    
    const eventForm = document.getElementById('event-form-element');
    const messageForm = document.getElementById('message-form-element');
    
    if (eventForm) {
        eventForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // *** DEFINE VARIABLES FIRST ***
            const eventImage = document.getElementById('event-image');
            const eventImage2 = document.getElementById('event-image2');

            // Comprehensive form validation - THIS RUNS FIRST
            const missingFields = validateEventForm();
            
            if (missingFields.length > 0) {
                const fieldsList = missingFields.join(', ');
                notifications.warning(
                    'Campos Obrigatórios em Falta', 
                    `Por favor, preencha os seguintes campos: ${fieldsList}`,
                    { duration: 8000 }
                );
                return; // STOPS HERE if validation fails
            }

            // Validate event date is not in the past
            const eventDate = document.getElementById('event-date');
            if (eventDate && eventDate.value) {
                const selectedDate = new Date(eventDate.value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                selectedDate.setHours(0, 0, 0, 0);
                
                if (selectedDate < today) {
                    notifications.warning('Data Inválida', 'Por favor, selecione uma data futura para o evento.');
                    return;
                }
            }

            // Validate times
            const eventStartTime = document.getElementById('event-start-time');
            const eventEndTime = document.getElementById('event-end-time');
            
            if (eventStartTime && eventEndTime) {
                const startTime = eventStartTime.value;
                const endTime = eventEndTime.value;
                
                if (startTime && endTime) {
                    const startMinutes = startTime.split(':').map(Number);
                    const endMinutes = endTime.split(':').map(Number);
                    const startTotal = startMinutes[0] * 60 + startMinutes[1];
                    const endTotal = endMinutes[0] * 60 + endMinutes[1];
                    
                    if (startTotal >= endTotal) {
                        notifications.warning('Horários Inválidos', 'A hora de início deve ser anterior à hora de fim.');
                        return;
                    }
                }
            }

            showLoading();
            
            try {
                const formData = new FormData(e.target);
                
                // NOW these variables are properly defined
                const eventImageFile = (eventImage && eventImage.files && eventImage.files[0]) || storedEventImage;
                const eventLogoFile = (eventImage2 && eventImage2.files && eventImage2.files[0]) || storedEventLogo;
                
                if (eventImageFile) {
                    formData.set('event_image', eventImageFile);
                } else {
                    formData.delete('event_image');
                }
                
                if (eventLogoFile) {
                    formData.set('event_image2', eventLogoFile);
                } else {
                    formData.delete('event_image2');
                }
                
                const result = await submitEvent(formData);
                notifications.success('Evento Submetido!', 'O seu evento foi submetido com sucesso e será analisado pela nossa equipa.');
                
                resetEventForm();
                hideForm();
                
            } catch (error) {
                console.error('Error submitting event:', error);
                notifications.error('Erro na Submissão', error.message || 'Erro ao submeter evento. Tenta novamente.');
            } finally {
                hideLoading();
            }
        });
    }

    if (messageForm) {
        messageForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Validate message form
            const name = document.getElementById('message-name');
            const email = document.getElementById('message-email');
            const message = document.getElementById('message-text');
            
            const missingMessageFields = [];
            
            if (!name?.value?.trim()) missingMessageFields.push('Nome');
            if (!email?.value?.trim()) missingMessageFields.push('Email');
            if (!message?.value?.trim()) missingMessageFields.push('Mensagem');
            
            if (missingMessageFields.length > 0) {
                const fieldsList = missingMessageFields.join(', ');
                notifications.warning(
                    'Campos Obrigatórios em Falta', 
                    `Por favor, preencha os seguintes campos: ${fieldsList}`
                );
                return;
            }
            
            // Basic email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (email?.value && !emailRegex.test(email.value.trim())) {
                notifications.warning('Email Inválido', 'Por favor, insira um endereço de email válido.');
                return;
            }
            
            showLoading();
            
            try {
                const formData = new FormData(e.target);
                const result = await submitMessage(formData);
                notifications.success('Mensagem Enviada!', 'A sua mensagem foi enviada com sucesso. Responderemos em breve.');
                e.target.reset();
                hideForm();
            } catch (error) {
                console.error('Error submitting message:', error);
                notifications.error('Erro no Envio', error.message || 'Erro ao enviar mensagem. Tenta novamente.');
            } finally {
                hideLoading();
            }
        });
    }
});

// ========== ENHANCED DRAG DROP FUNCTIONALITY ==========
function initializeDragDrop() {
    const fileInputs = document.querySelectorAll('input[type="file"]');
    
    fileInputs.forEach(input => {
        const label = input.closest('.file-input-label') || document.querySelector(`label[for="${input.id}"]`);
        if (!label) return;
        
        const originalText = label.textContent.trim();
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            label.addEventListener(eventName, preventDefaults, false);
            document.body.addEventListener(eventName, preventDefaults, false);
        });
        
        ['dragenter', 'dragover'].forEach(eventName => {
            label.addEventListener(eventName, () => highlight(label), false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            label.addEventListener(eventName, () => unhighlight(label), false);
        });
        
        label.addEventListener('drop', (e) => handleDrop(e, input, label, originalText), false);
        input.addEventListener('change', () => handleFileSelect(input, label, originalText));
    });
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight(label) {
    label.classList.add('drag-over');
}

function unhighlight(label) {
    label.classList.remove('drag-over');
}

function handleDrop(e, input, label, originalText) {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    if (files.length > 0) {
        const file = files[0];
        
        if (file.type.startsWith('image/')) {
            try {
                const newDt = new DataTransfer();
                newDt.items.add(file);
                input.files = newDt.files;
                
                if (input.files && input.files[0]) {
                    updateLabelWithFile(label, file, originalText);
                    
                    setTimeout(() => {
                        const event = new Event('change', { bubbles: true });
                        input.dispatchEvent(event);
                    }, 10);
                    
                    const imageType = input.id === 'event-image' ? 'thumbnail' : 'logo';
                    if (imageType === 'thumbnail') {
                        storedEventImage = file;
                    } else if (imageType === 'logo') {
                        storedEventLogo = file;
                    }
                } else {
                    console.error('❌ File drop failed - not found in input after setting');
                }
            } catch (error) {
                console.error('❌ Error setting dropped file:', error);
                showError(label, 'Erro ao processar ficheiro. Tenta novamente.');
            }
        } else {
            showError(label, 'Por favor, selecione apenas imagens.');
        }
    }
}

function handleFileSelect(input, label, originalText) {
    if (input.files.length > 0) {
        const file = input.files[0];
        updateLabelWithFile(label, file, originalText);
    } else {
        resetLabel(label, originalText);
    }
}

function updateLabelWithFile(label, file, originalText) {
    label.classList.add('file-selected');
    
    const imageType = label.id === 'file-label' ? 'thumbnail' : 'logo';
    
    const preview = document.createElement('div');
    preview.style.cssText = `
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-weight: 600;
        justify-content: space-between;
    `;
    
    const fileInfo = document.createElement('div');
    fileInfo.style.cssText = `
        display: flex;
        align-items: center;
        gap: 0.75rem;
    `;
    
    const icon = document.createElement('span');
    icon.textContent = '🖼️';
    icon.style.fontSize = '1.2rem';
    
    const info = document.createElement('div');
    info.innerHTML = `
        <div style="color: #059669; font-size: 0.9rem;">${file.name}</div>
        <div style="color: #6b7280; font-size: 0.8rem;">${formatFileSize(file.size)}</div>
    `;
    
    const removeBtn = document.createElement('span');
    removeBtn.textContent = '✕';
    removeBtn.className = 'remove-image';
    removeBtn.style.cssText = `
        cursor: pointer;
        color: #ef4444;
        font-weight: bold;
        padding: 0.25rem;
        border-radius: 50%;
        transition: background-color 0.2s;
    `;
    removeBtn.onclick = (e) => {
        e.stopPropagation();
        window.removeImage(imageType);
    };
    
    fileInfo.appendChild(icon);
    fileInfo.appendChild(info);
    preview.appendChild(fileInfo);
    preview.appendChild(removeBtn);
    
    label.innerHTML = '';
    label.appendChild(preview);
}

function resetLabel(label, originalText) {
    label.classList.remove('file-selected');
    label.textContent = originalText;
}

function showError(label, message) {
    const originalBorder = label.style.borderColor;
    label.style.borderColor = '#ef4444';
    label.style.color = '#dc2626';
    
    const originalText = label.textContent;
    label.textContent = `❌ ${message}`;
    
    setTimeout(() => {
        label.style.borderColor = originalBorder;
        label.style.color = '';
        label.textContent = originalText;
    }, 3000);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

document.addEventListener('DOMContentLoaded', initializeDragDrop);

// ========== NOTIFICATION SYSTEM ==========
class NotificationSystem {
    constructor() {
        this.container = document.getElementById('notificationContainer');
        this.notifications = new Map();
        this.counter = 0;
    }

    show(type = 'info', title = '', message = '', options = {}) {
        const id = ++this.counter;
        const notification = this.createNotification(id, type, title, message, options);
        
        this.container.appendChild(notification);
        this.notifications.set(id, notification);

        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        if (!options.persistent) {
            const duration = options.duration || 5000;
            setTimeout(() => this.hide(id), duration);
        }

        return id;
    }

    createNotification(id, type, title, message, options) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.dataset.id = id;

        const icons = {
            success: '✅',
            error: '❌', 
            warning: '⚠️',
            info: 'ℹ️'
        };

        const titles = {
            success: title || 'Sucesso!',
            error: title || 'Erro!',
            warning: title || 'Atenção!',
            info: title || 'Informação'
        };

        let actionsHTML = '';
        if (options.actions && options.actions.length > 0) {
            actionsHTML = '<div class="notification-actions">';
            options.actions.forEach(action => {
                actionsHTML += `<button class="notification-action ${action.type || 'primary'}" onclick="${action.onClick}">${action.text}</button>`;
            });
            actionsHTML += '</div>';
        }

        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">${icons[type]}</div>
                <div class="notification-text">
                    <div class="notification-title">${titles[type]}</div>
                    <div class="notification-message">${message}</div>
                    ${actionsHTML}
                </div>
                ${!options.persistent ? '<button class="notification-close" onclick="notifications.hide(' + id + ')">×</button>' : ''}
            </div>
            ${!options.persistent ? '<div class="notification-progress"></div>' : ''}
        `;

        if (!options.silent) {
            notification.classList.add('sound-wave');
        }

        return notification;
    }

    hide(id) {
        const notification = this.notifications.get(id);
        if (!notification) return;

        notification.classList.add('hide');
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            this.notifications.delete(id);
        }, 400);
    }

    hideAll() {
        this.notifications.forEach((notification, id) => {
            this.hide(id);
        });
    }

    success(title, message, options = {}) {
        return this.show('success', title, message, options);
    }

    error(title, message, options = {}) {
        return this.show('error', title, message, options);
    }

    warning(title, message, options = {}) {
        return this.show('warning', title, message, options);
    }

    info(title, message, options = {}) {
        return this.show('info', title, message, options);
    }
}

const notifications = new NotificationSystem();

function showNotification(type, title, message) {
    notifications.show(type, title, message);
}

function showNotificationWithActions() {
    notifications.show('info', 'Confirmação', 'Tem certeza que deseja submeter este evento?', {
        persistent: true,
        actions: [
            { text: 'Submeter', type: 'primary', onClick: 'handleSubmit()' },
            { text: 'Cancelar', type: 'secondary', onClick: 'handleCancel()' }
        ]
    });
}

function showLongNotification() {
    notifications.show('success', 'Evento Criado!', 'O seu evento foi submetido com sucesso e será analisado pela nossa equipa. Receberá uma confirmação por email dentro de 24 horas. Obrigado por contribuir para a comunidade Student X!', {
        duration: 8000
    });
}

function showPersistentNotification() {
    notifications.show('error', 'Erro Crítico', 'Ocorreu um erro inesperado. Por favor, contacte o suporte técnico.', {
        persistent: true
    });
}

function handleSubmit() {
    notifications.hideAll();
    notifications.success('Submetido!', 'Evento submetido com sucesso!');
}

function handleCancel() {
    notifications.hideAll();
    notifications.info('Cancelado', 'Submissão cancelada.');
}

function showMessage(message, isError = false, options = {}) {
    if (isError) {
        notifications.error('', message, options);
    } else {
        notifications.success('', message, options);
    }
}

function showFormValidationError(fieldName, message) {
    notifications.warning('Campo Obrigatório', `${fieldName}: ${message}`);
}

function showFormSuccess(message) {
    notifications.success('Enviado!', message || 'Formulário submetido com sucesso!');
}

function showNetworkError() {
    notifications.error('Erro de Conexão', 'Verifique a sua ligação à internet e tente novamente.', {
        duration: 7000
    });
}