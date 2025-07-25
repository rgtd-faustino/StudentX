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
                    // FIXED: Use a more reliable method to set files
                    try {
                        // Method 1: Direct assignment (most reliable)
                        const dt = new DataTransfer();
                        dt.items.add(file);
                        input.files = dt.files;
                        
                        console.log(`✅ File successfully set for ${type}:`, input.files[0]?.name, input.files[0]?.size);
                        
                        // FIXED: Store file reference globally to prevent loss
                        if (type === 'thumbnail') {
                            storedEventImage = file;
                        } else if (type === 'logo') {
                            storedEventLogo = file;
                        }
                        
                        // Update label text
                        label.innerHTML = `${file.name} <span class="remove-image" onclick="removeImage('${type}')">✕</span>`;
                        
                        // Force trigger change event after a small delay to ensure file is set
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
            // Don't trigger file dialog if clicking on remove button
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

    // Setup drag and drop functionality
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

    function validateEventTimes() {
        const eventStartTime = document.getElementById('event-start-time');
        const eventEndTime = document.getElementById('event-end-time');
        
        if (!eventStartTime || !eventEndTime) return true;
        
        const startTime = eventStartTime.value;
        const endTime = eventEndTime.value;
        
        // If both times are selected, validate
        if (startTime && endTime) {
            const startMinutes = timeToMinutes(startTime);
            const endMinutes = timeToMinutes(endTime);
            
            if (startMinutes >= endMinutes) {
                // Show error message
                showTimeError('A hora de início deve ser anterior à hora de fim');
                return false;
            } else {
                // Clear any existing error
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
        // Remove existing error if any
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

    function clearTimeError() {
        const existingError = document.getElementById('time-validation-error');
        if (existingError) {
            existingError.remove();
        }
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

        // FIXED: Don't modify link processing if it affects images - separate the logic
        const processedLink = eventLink ? (eventLink.startsWith('http://') || eventLink.startsWith('https://') ? eventLink : 'https://' + eventLink) : '';
        const displayLink = processedLink || '#';
        
        const formattedDateTime = formatDate(selectedDate, selectedStartTime, selectedEndTime);
        const duration = getEventDuration(selectedStartTime, selectedEndTime);
        const simulatedHeight = getSimulatedEventHeight(duration);
        
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
        console.log(`handleImageChange called for ${imageType}:`, file);
        
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                if (imageType === 'thumbnail') {
                    currentImageSrc = e.target.result;
                    console.log('Thumbnail image loaded');
                } else if (imageType === 'logo') {
                    currentImageSrc2 = e.target.result;
                    console.log('Logo image loaded');
                }
                updatePreviewHTML();
            };
            reader.readAsDataURL(file);
        } else {
            // Reset to default if no valid file
            if (imageType === 'thumbnail') {
                currentImageSrc = '📷';
            } else if (imageType === 'logo') {
                currentImageSrc2 = '📷';
            }
            updatePreviewHTML();
        }
    }

    function resetImageInput(inputElement, labelElement, defaultText, imageType) {
        // Clear the file input
        inputElement.value = '';
        
        // Reset the label text
        labelElement.innerHTML = defaultText;
        
        // Reset the preview
        if (imageType === 'thumbnail') {
            currentImageSrc = '📷';
        } else if (imageType === 'logo') {
            currentImageSrc2 = '📷';
        }
        
        // Update preview
        updatePreviewHTML();
    }

    // Add event listeners for real-time updates
    [eventTitle, eventDescription, eventLinkWebsite, eventLocation, eventLocation2].forEach(el => {
        if (el) el.addEventListener('input', updatePreviewHTML);
    });
    
    [eventCategory, eventDate].forEach(el => {
        if (el) el.addEventListener('change', updatePreviewHTML);
    });

    // Special handling for time inputs with validation
    [eventStartTime, eventEndTime].forEach(el => {
        if (el) {
            el.addEventListener('change', function() {
                if (validateEventTimes()) {
                    updatePreviewHTML();
                }
            });
        }
    });

    // Handle image previews with improved functionality
    if (eventImage) {
        eventImage.addEventListener('change', function() {
            console.log('Event image change detected:', this.files[0]);
            const file = this.files[0];
            const label = document.getElementById('file-label');
            
            if (file && file.type.startsWith('image/') && label) {
                label.innerHTML = `${file.name} <span class="remove-image" onclick="removeImage('thumbnail')">✕</span>`;
                console.log('Updated label for thumbnail:', file.name);
                
                // FIXED: Store file globally for manual input too
                storedEventImage = file;
                
            } else if (label) {
                label.innerHTML = '📷 Clica para selecionar a imagem principal do evento (thumbnail)';
                
                // FIXED: Clear stored file when no valid file
                storedEventImage = null;
            }
            handleImageChange(this, 'thumbnail');
        });
    }

    if (eventImage2) {
        eventImage2.addEventListener('change', function() {
            console.log('Event logo change detected:', this.files[0]);
            const file = this.files[0];
            const label2 = document.getElementById('file-label2');
            
            if (file && file.type.startsWith('image/') && label2) {
                label2.innerHTML = `${file.name} <span class="remove-image" onclick="removeImage('logo')">✕</span>`;
                console.log('Updated label for logo:', file.name);
                
                // FIXED: Store file globally for manual input too
                storedEventLogo = file;
                
            } else if (label2) {
                label2.innerHTML = '📷 Clica para selecionar o logotipo do evento/empresa';
                
                // FIXED: Clear stored file when no valid file
                storedEventLogo = null;
            }
            handleImageChange(this, 'logo');
        });
    }

    // Global function to remove images
    window.removeImage = function(imageType) {
        if (imageType === 'thumbnail') {
            const input = document.getElementById('event-image');
            const label = document.getElementById('file-label');
            resetImageInput(input, label, '📷 Clica para selecionar a imagem principal do evento (thumbnail)', 'thumbnail');
            storedEventImage = null; // Clear stored file
        } else if (imageType === 'logo') {
            const input = document.getElementById('event-image2');
            const label = document.getElementById('file-label2');
            resetImageInput(input, label, '📷 Clica para selecionar o logotipo do evento/empresa', 'logo');
            storedEventLogo = null; // Clear stored file
        }
    };

    updatePreviewHTML();
}

// ========== SUBMISSION FUNCTIONS ==========
async function submitMessage(formData) {
    // Add submission type identifier
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
    // Add submission type identifier
    formData.append('submission_type', 'event');
    
    // Debug: Log form data contents
    console.log('Form data being submitted:');
    for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
            console.log(`${key}: File - ${value.name} (${value.size} bytes, ${value.type})`);
        } else {
            console.log(`${key}: ${value}`);
        }
    }
    
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
    // Reset form fields
    const eventForm = document.getElementById('event-form-element');
    if (eventForm) {
        eventForm.reset();
    }
    
    // Reset file inputs and labels
    const eventImage = document.getElementById('event-image');
    const eventImage2 = document.getElementById('event-image2');
    const fileLabel = document.getElementById('file-label');
    const fileLabel2 = document.getElementById('file-label2');
    
    if (eventImage) eventImage.value = '';
    if (eventImage2) eventImage2.value = '';
    if (fileLabel) fileLabel.innerHTML = '📷 Clica para selecionar a imagem principal do evento (thumbnail)';
    if (fileLabel2) fileLabel2.innerHTML = '📷 Clica para selecionar o logotipo do evento/empresa';
    
    // Reset image previews
    currentImageSrc = '📷';
    currentImageSrc2 = '📷';
    
    // Clear stored files
    storedEventImage = null;
    storedEventLogo = null;
    
    // Clear any validation errors
    clearTimeError();
    
    // Update preview
    updatePreviewHTML();
}

// ========== UI HELPERS ==========
function showLoading() {
    document.getElementById('loadingOverlay').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

function showMessage(message, isError = false) {
    alert(message);
}

// ========== FORM HANDLERS ==========
document.addEventListener('DOMContentLoaded', function() {
    // Initialize drag and drop ONCE when page loads
    setupDragAndDrop();
    
    const eventForm = document.getElementById('event-form-element');
    const messageForm = document.getElementById('message-form-element');
    
    if (eventForm) {
        eventForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // ADDED: Validate required fields including images and link
            const eventLinkWebsite = document.getElementById('event-link');
            const eventImage = document.getElementById('event-image');
            const eventImage2 = document.getElementById('event-image2');
            
            // Check if link is provided
            if (!eventLinkWebsite || !eventLinkWebsite.value.trim()) {
                showMessage('Por favor, forneça um link para o evento.', true);
                return;
            }
            
            // Check if thumbnail image is provided
            const eventImageFile = (eventImage && eventImage.files && eventImage.files[0]) || storedEventImage;
            if (!eventImageFile) {
                showMessage('Por favor, selecione uma imagem principal (thumbnail) para o evento.', true);
                return;
            }
            
            // Check if logo image is provided
            const eventLogoFile = (eventImage2 && eventImage2.files && eventImage2.files[0]) || storedEventLogo;
            if (!eventLogoFile) {
                showMessage('Por favor, selecione um logotipo para o evento/empresa.', true);
                return;
            }

            // Validate times before submission
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
                        showMessage('Por favor, corrija os horários antes de submeter.', true);
                        return;
                    }
                }
            }

            showLoading();
            
            try {
                const formData = new FormData(e.target);
                
                console.log('Pre-submission file check:');
                console.log('Event Image input:', eventImage);
                console.log('Event Image files property:', eventImage ? eventImage.files : 'input not found');
                console.log('Stored Event Image:', storedEventImage);
                console.log('Event Logo input:', eventImage2);  
                console.log('Event Logo files property:', eventImage2 ? eventImage2.files : 'input not found');
                console.log('Stored Event Logo:', storedEventLogo);
                
                if (eventImageFile) {
                    formData.set('event_image', eventImageFile);
                    console.log('✅ Event Image attached:', eventImageFile.name, eventImageFile.size);
                } else {
                    console.log('❌ Event Image: No valid file found');
                    formData.delete('event_image');
                }
                
                if (eventLogoFile) {
                    formData.set('event_image2', eventLogoFile);
                    console.log('✅ Event Logo attached:', eventLogoFile.name, eventLogoFile.size);
                } else {
                    console.log('❌ Event Logo: No valid file found');
                    formData.delete('event_image2');
                }
                
                const result = await submitEvent(formData);
                showMessage(result.message || 'Evento submetido com sucesso!');
                
                // CHANGED: Use the new complete reset function
                resetEventForm();
                hideForm();
                
            } catch (error) {
                console.error('Error submitting event:', error);
                showMessage(error.message || 'Erro ao submeter evento. Tenta novamente.', true);
            } finally {
                hideLoading();
            }
        });
    }

    // Message form handler remains the same
    if (messageForm) {
        messageForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            showLoading();
            
            try {
                const formData = new FormData(e.target);
                const result = await submitMessage(formData);
                showMessage(result.message || 'Mensagem enviada com sucesso!');
                e.target.reset();
                hideForm();
            } catch (error) {
                console.error('Error submitting message:', error);
                showMessage(error.message || 'Erro ao enviar mensagem. Tenta novamente.', true);
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
        
        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            label.addEventListener(eventName, preventDefaults, false);
            document.body.addEventListener(eventName, preventDefaults, false);
        });
        
        // Highlight drop area when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            label.addEventListener(eventName, () => highlight(label), false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            label.addEventListener(eventName, () => unhighlight(label), false);
        });
        
        // Handle dropped files
        label.addEventListener('drop', (e) => handleDrop(e, input, label, originalText), false);
        
        // Handle file selection via click
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
        
        // Check if it's an image
        if (file.type.startsWith('image/')) {
            // FIXED: More robust file setting
            try {
                const newDt = new DataTransfer();
                newDt.items.add(file);
                input.files = newDt.files;
                
                // Verify the file was actually set
                if (input.files && input.files[0]) {
                    updateLabelWithFile(label, file, originalText);
                    
                    // Trigger change event after ensuring file is set
                    setTimeout(() => {
                        const event = new Event('change', { bubbles: true });
                        input.dispatchEvent(event);
                    }, 10);
                    
                    console.log('✅ File dropped and verified:', file.name, input.files[0].name);
                    
                    // FIXED: Store file reference globally
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
        console.log('File selected via click:', file.name);
    } else {
        resetLabel(label, originalText);
    }
}

function updateLabelWithFile(label, file, originalText) {
    label.classList.add('file-selected');
    
    // Determine image type for remove function
    const imageType = label.id === 'file-label' ? 'thumbnail' : 'logo';
    
    // Create preview container
    const preview = document.createElement('div');
    preview.style.cssText = `
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-weight: 600;
        justify-content: space-between;
    `;
    
    // Add file info container
    const fileInfo = document.createElement('div');
    fileInfo.style.cssText = `
        display: flex;
        align-items: center;
        gap: 0.75rem;
    `;
    
    // Add file icon
    const icon = document.createElement('span');
    icon.textContent = '🖼️';
    icon.style.fontSize = '1.2rem';
    
    // Add file info
    const info = document.createElement('div');
    info.innerHTML = `
        <div style="color: #059669; font-size: 0.9rem;">${file.name}</div>
        <div style="color: #6b7280; font-size: 0.8rem;">${formatFileSize(file.size)}</div>
    `;
    
    // Add remove button
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeDragDrop);