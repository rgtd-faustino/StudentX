const firebaseConfig = {
    apiKey: "your-apiKey",
    authDomain: "your-authDomain",
    projectId: "your-projectId",
    storageBucket: "your-storageBucket",
    messagingSenderId: "your-messagingSenderId",
    appId: "your-appId"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

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

        if (eventLink && !eventLink.startsWith('http')) {
            eventLink = 'https://' + eventLink;
        }
        
        const formattedDateTime = formatDate(selectedDate, selectedStartTime, selectedEndTime);
        const duration = getEventDuration(selectedStartTime, selectedEndTime);
        const simulatedHeight = getSimulatedEventHeight(duration);
        
        let previewHTML = '';

        if (simulatedHeight < 14) {
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
            previewHTML = `
                <div class="preview-wrapper">
                    <h2 class="preview-title">Pré-visualização do Evento (Evento Grande - ${duration} min)</h2>
                    <div class="modal-content large-event">
                        <div class="event-image-expanded">${currentImageSrc === '📷' ? currentImageSrc : `<img src="${currentImageSrc}" style="width: 100%; height: 100%; object-fit: cover;" alt="Event Image" />`}</div>
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
                    moreInfoLink: eventLink || '#',
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
                <div class="event-image-expanded">${event.imageSrc === '📷' ? event.imageSrc : `<img src="${event.imageSrc}" alt="Event Image" />`}</div>
                <p class="description-title-calendar-expanded">${event.descriptionTitle}</p>
                <p class="description-subtitle-calendar-expanded">${event.descriptionSubtitle}</p>
                <div class="carousel-line-calendar-expanded"></div>
            
                <div class="logo-and-place-info-expanded">
                    <div class="event-logo-container">${event.logoSrc === '📷' ? event.logoSrc : `<img src="${event.logoSrc}" alt="Event Logo" />`}</div>
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
            if (imageType === 'thumbnail') {
                currentImageSrc = '📷';
            } else if (imageType === 'logo') {
                currentImageSrc2 = '📷';
            }
            updatePreviewHTML();
        }
    }

    // Add event listeners for real-time updates
    [eventTitle, eventDescription, eventLinkWebsite, eventLocation, eventLocation2].forEach(el => {
        if (el) el.addEventListener('input', updatePreviewHTML);
    });
    
    [eventCategory, eventDate, eventStartTime, eventEndTime].forEach(el => {
        if (el) el.addEventListener('change', updatePreviewHTML);
    });

    // Handle image previews
    if (eventImage) {
        eventImage.addEventListener('change', function() {
            const file = this.files[0];
            const label = document.getElementById('file-label');
            
            if (file && label) {
                label.innerHTML = `📷 ${file.name}`;
            } else if (label) {
                label.innerHTML = '📷 Clica para selecionar a imagem principal do evento (thumbnail)';
            }
            handleImageChange(this, 'thumbnail');
        });
    }

    if (eventImage2) {
        eventImage2.addEventListener('change', function() {
            const file = this.files[0];
            const label2 = document.getElementById('file-label2');
            
            if (file && label2) {
                label2.innerHTML = `📷 ${file.name}`;
            } else if (label2) {
                label2.innerHTML = '📷 Clica para selecionar o logotipo do evento/empresa';
            }
            handleImageChange(this, 'logo');
        });
    }

    updatePreviewHTML();
}

// ========== FIREBASE FUNCTIONS ==========
async function uploadImage(file, path) {
    // Enhanced validation
    if (!file || !(file instanceof File) || file.size === 0 || !file.type.startsWith('image/')) {
        console.error('Invalid file:', {
            exists: !!file,
            isFile: file instanceof File,
            size: file?.size,
            type: file?.type
        });
        throw new Error('Arquivo inválido');
    }

    console.log(`Uploading file: ${file.name} (${file.size} bytes) to ${path}`);
    
    const storageRef = storage.ref().child(path);
    const snapshot = await storageRef.put(file);
    const downloadURL = await snapshot.ref.getDownloadURL();
    
    console.log(`File uploaded successfully: ${downloadURL}`);
    return downloadURL;
}

async function submitMessage(formData) {
    await db.collection('mensagens').add({
        nome: formData.get('name'),
        apelido: formData.get('apelido'),
        email: formData.get('email'),
        assunto: formData.get('assunto'),
        mensagem: formData.get('message'),
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        status: 'nova'
    });
    return true;
}

async function submitEvent(formData) {
    let imagemEventoURL = '';
    let logotipoOrganizacaoURL = '';

    // Handle image uploads
    const eventImageFile = formData.get('event_image');
    const logoImageFile = formData.get('event_image2');

    console.log('Event image file:', eventImageFile); // Debug log
    console.log('Logo image file:', logoImageFile);   // Debug log

    // Fixed condition - check if file exists and is actually a file (not empty string)
    if (eventImageFile && eventImageFile instanceof File && eventImageFile.size > 0) {
        const timestamp = Date.now();
        const imagePath = `eventos/imagens/${timestamp}_${eventImageFile.name}`;
        try {
            imagemEventoURL = await uploadImage(eventImageFile, imagePath);
            console.log('Event image uploaded:', imagemEventoURL); // Debug log
        } catch (error) {
            console.error('Failed to upload event image:', error);
        }
    }

    if (logoImageFile && logoImageFile instanceof File && logoImageFile.size > 0) {
        const timestamp = Date.now();
        const logoPath = `eventos/logos/${timestamp}_${logoImageFile.name}`;
        try {
            logotipoOrganizacaoURL = await uploadImage(logoImageFile, logoPath);
            console.log('Logo image uploaded:', logotipoOrganizacaoURL); // Debug log
        } catch (error) {
            console.error('Failed to upload logo image:', error);
        }
    }

    // Save to Firestore
    const eventData = {
        nome: formData.get('name'),
        apelido: formData.get('apelido'),
        email: formData.get('email'),
        nomeEvento: formData.get('event_title'),
        categoria: formData.get('event_category'),
        dataEvento: formData.get('event_date'),
        horaInicio: formData.get('event_start_time'),
        horaFim: formData.get('event_end_time'),
        organizacao: formData.get('event_location'),
        localEvento: formData.get('event_location2'),
        descricao: formData.get('event_description'),
        linkEvento: formData.get('event_link') || '',
        imagemEvento: imagemEventoURL,
        logotipoOrganizacao: logotipoOrganizacaoURL,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        status: 'pendente',
        aprovado: false
    };

    console.log('Event data being saved:', eventData); // Debug log
    await db.collection('eventos').add(eventData);
    return true;
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
    const eventForm = document.getElementById('event-form-element');
    const messageForm = document.getElementById('message-form-element');
    
    if (eventForm) {
        eventForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            showLoading();
            
            try {
                const formData = new FormData(e.target);
                await submitEvent(formData);
                showMessage('Evento submetido com sucesso!');
                e.target.reset();
                hideForm();
                
                // Reset file labels
                const fileLabel = document.getElementById('file-label');
                const fileLabel2 = document.getElementById('file-label2');
                if (fileLabel) fileLabel.innerHTML = '📷 Clica para selecionar a imagem principal do evento (thumbnail)';
                if (fileLabel2) fileLabel2.innerHTML = '📷 Clica para selecionar o logotipo da empresa';
            } catch (error) {
                console.error('Error submitting event:', error);
                showMessage('Erro ao submeter evento. Tenta novamente.', true);
            } finally {
                hideLoading();
            }
        });
    }

    if (messageForm) {
        messageForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            showLoading();
            
            try {
                const formData = new FormData(e.target);
                await submitMessage(formData);
                showMessage('Mensagem enviada com sucesso!');
                e.target.reset();
                hideForm();
            } catch (error) {
                console.error('Error submitting message:', error);
                showMessage('Erro ao enviar mensagem. Tenta novamente.', true);
            } finally {
                hideLoading();
            }
        });
    }
});