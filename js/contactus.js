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

            function convertTimeToMinutes(timeString) {
                if (!timeString) return 0;
                const [hours, minutes] = timeString.split(':').map(Number);
                return hours * 60 + minutes;
            }

            function getEventDuration(startTime, endTime) {
                if (!startTime || !endTime) return 60;
                const startMinutes = convertTimeToMinutes(startTime);
                const endMinutes = convertTimeToMinutes(endTime);
                return endMinutes - startMinutes;
            }

            function getSimulatedEventHeight(duration) {
                const hourHeight = 13.1;
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

        // ========== FIREBASE FUNCTIONS ==========
        
        // Function to upload image to Firebase Storage
        async function uploadImage(file, path) {
            try {
                // Validate file
                if (!file || file.size === 0) {
                    throw new Error('Arquivo inválido ou vazio');
                }

                // Check if file is actually an image
                if (!file.type.startsWith('image/')) {
                    throw new Error('Arquivo deve ser uma imagem');
                }

                const storageRef = storage.ref().child(path);
                
                // Upload with metadata
                const metadata = {
                    contentType: file.type,
                    customMetadata: {
                        'uploadedAt': new Date().toISOString()
                    }
                };

                const snapshot = await storageRef.put(file, metadata);
                const downloadURL = await snapshot.ref.getDownloadURL();
                return downloadURL;
            } catch (error) {
                console.error('Erro detalhado no upload da imagem:', error);
                console.error('File info:', {
                    name: file?.name,
                    size: file?.size,
                    type: file?.type
                });
                throw error;
            }
        }

        // Function to submit message
        async function submitMessage(formData) {
            try {
                const docRef = await db.collection('mensagens').add({
                    nome: formData.get('name'),
                    apelido: formData.get('apelido'),
                    email: formData.get('email'),
                    assunto: formData.get('assunto'),
                    mensagem: formData.get('message'),
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    status: 'nova'
                });
                
                return true;
            } catch (error) {
                console.error('Erro ao enviar mensagem: ', error);
                throw error;
            }
        }

        // Function to submit event
        async function submitEvent(formData) {
            try {
                console.log('Starting event submission...');
                
                let imagemEventoURL = '';
                let logotipoOrganizacaoURL = '';

                // Get file inputs directly from DOM
                const eventImageInput = document.getElementById('event-image');
                const eventImage2Input = document.getElementById('event-image2');

                console.log('Event image input:', eventImageInput);
                console.log('Event image files:', eventImageInput?.files);
                console.log('Logo image input:', eventImage2Input);
                console.log('Logo image files:', eventImage2Input?.files);

                // Upload event image if provided
                if (eventImageInput?.files?.[0]) {
                    const eventImageFile = eventImageInput.files[0];
                    console.log('Processing event image:', eventImageFile.name);
                    
                    const timestamp = Date.now();
                    const imagePath = `eventos/imagens/${timestamp}_${eventImageFile.name}`;
                    
                    try {
                        imagemEventoURL = await uploadImage(eventImageFile, imagePath);
                        console.log('Event image uploaded successfully:', imagemEventoURL);
                    } catch (error) {
                        console.error('Failed to upload event image:', error);
                        // Don't throw here - continue with submission without image
                    }
                } else {
                    console.log('No event image file selected');
                }

                // Upload organization logo if provided
                if (eventImage2Input?.files?.[0]) {
                    const eventImage2File = eventImage2Input.files[0];
                    console.log('Processing logo image:', eventImage2File.name);
                    
                    const timestamp = Date.now();
                    const logoPath = `eventos/logos/${timestamp}_${eventImage2File.name}`;
                    
                    try {
                        logotipoOrganizacaoURL = await uploadImage(eventImage2File, logoPath);
                        console.log('Logo image uploaded successfully:', logotipoOrganizacaoURL);
                    } catch (error) {
                        console.error('Failed to upload logo image:', error);
                        // Don't throw here - continue with submission without logo
                    }
                } else {
                    console.log('No logo image file selected');
                }

                // Create the document data
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

                console.log('Final event data before saving:', eventData);

                const docRef = await db.collection('eventos').add(eventData);
                console.log('Event saved successfully with ID:', docRef.id);
                return true;
            } catch (error) {
                console.error('Erro ao submeter evento: ', error);
                throw error;
            }
        }

        // ========== FORM SUBMISSION HANDLERS ==========
        
        function showLoading() {
            document.getElementById('loadingOverlay').style.display = 'flex';
        }

        function hideLoading() {
            document.getElementById('loadingOverlay').style.display = 'none';
        }

        function showSuccessMessage(message) {
            alert(message);
        }

        function showErrorMessage(message) {
            alert(message);
        }

        // Event listeners for form submissions
        document.addEventListener('DOMContentLoaded', function() {
            // Message form submission
            const messageForm = document.getElementById('message-form-element');
            if (messageForm) {
                messageForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    
                    showLoading();
                    
                    try {
                        const formData = new FormData(e.target);
                        const success = await submitMessage(formData);
                        
                        if (success) {
                            showSuccessMessage('Mensagem enviada com sucesso!');
                            e.target.reset();
                            hideForm();
                        }
                    } catch (error) {
                        showErrorMessage('Erro ao enviar mensagem. Tenta novamente.');
                    } finally {
                        hideLoading();
                    }
                });
            }

            // Event form submission
            const eventForm = document.getElementById('event-form-element');
            if (eventForm) {
                eventForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    
                    showLoading();
                    
                    try {
                        const formData = new FormData(e.target);
                        const success = await submitEvent(formData);
                        
                        if (success) {
                            showSuccessMessage('Evento submetido com sucesso!');
                            e.target.reset();
                            hideForm();
                            
                            // Reset file labels
                            const fileLabel = document.getElementById('file-label');
                            const fileLabel2 = document.getElementById('file-label2');
                            if (fileLabel) {
                                fileLabel.innerHTML = '📷 Clica para selecionar a imagem principal do evento (thumbnail)';
                            }
                            if (fileLabel2) {
                                fileLabel2.innerHTML = '📷 Clica para selecionar o logotipo do evento/empresa';
                            }
                        }
                    } catch (error) {
                        showErrorMessage('Erro ao submeter evento. Tenta novamente.');
                    } finally {
                        hideLoading();
                    }
                });
            }
        });