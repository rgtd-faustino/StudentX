
    const diasDaSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    let events = [];
    let selectedDay = new Date().getDate();
    let currentDate = new Date();
    let currentWeekStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - currentDate.getDay());
    const mediaQuery = window.matchMedia('(max-width: 600px)');


    
    function init() {
        renderWeekButtons();
        renderHours();
        fetchEvents();
        updateMonthYear();
        updateOpportunityTitle();

        const actionButtonsContainer = document.createElement('div');
        actionButtonsContainer.id = 'calendarActions';
        
        const downloadButton = document.createElement('button');
        downloadButton.textContent = 'Transferir Calendário';
        downloadButton.className = 'downloadButton';
        downloadButton.onclick = downloadCalendar;
        downloadButton.title = 'Clique para transferir o calendário e poder importá-lo onde quiser.';
        
        actionButtonsContainer.appendChild(downloadButton);
        
        document.querySelector('.download-calendar').appendChild(actionButtonsContainer);
    }

    function renderWeekButtons() {
        const dayButtonsContainer = document.getElementById('dayButtons');
        dayButtonsContainer.innerHTML = '';
        const today = new Date();
    
        for (let i = 0; i < 7; i++) {
            const day = new Date(currentWeekStart);
            day.setDate(currentWeekStart.getDate() + i);
            const button = document.createElement('button');

            
            button.innerHTML = `<span class="day-number">${day.getDate()}</span><br><span class="day-name">${diasDaSemana[day.getDay()]}</span>`;
            
            button.classList.add('day-button');
            
            if (day.getMonth() !== currentDate.getMonth()) {
                button.classList.add('other-month');
            }
            
            // Check if this day is today
            if (day.getDate() === today.getDate() &&
                day.getMonth() === today.getMonth() &&
                day.getFullYear() === today.getFullYear()) {
                button.classList.add('active');
                selectedDay = day.getDate();
            }
            
            button.onclick = (event) => {
                // Remove 'active' class from all buttons
                document.querySelectorAll('.day-button').forEach(btn => btn.classList.remove('active'));
                // Add 'active' class to the clicked button
                event.currentTarget.classList.add('active');
                selectDay(day.getDate());
            };
            dayButtonsContainer.appendChild(button);
        }
    }


    function renderHours() {
        const hoursContainer = document.getElementById('hours');
        hoursContainer.innerHTML = '';
        for (let i = 6; i <= 24; i++) {
            const hourDiv = document.createElement('div');
            hourDiv.classList.add('hour');
            hourDiv.textContent = `${i}:00`;
            hoursContainer.appendChild(hourDiv);
        }
    }
    


    function fetchEvents() {
        fetch('/json/events.json')
            .then(response => response.json())
            .then(data => {
                events = data.items.map(event => ({
                    day: event.day,
                    month: event.month,
                    startTime: event.startTime,
                    endTime: event.endTime,
                    descriptionTitle: event.descriptionTitle,
                    imageSrc: event.imageSrc,
                    altText: event.altText,
                    descriptionSubtitle: event.descriptionSubtitle,
                    logoSrc: event.logoSrc,
                    logoAlt: event.logoAlt,
                    oppPlaceTitle: event.oppPlaceTitle,
                    oppPlaceSubtitle: event.oppPlaceSubtitle,
                    moreInfoLink: event.moreInfoLink,
                    colorOfEvent: event.colorOfEvent,
                    moreInfoText: event.moreInfoText
                }));
                renderEvents();
                updateOpportunityTitle(); // Add this line
            })
            .catch(error => {
                console.error('Erro ao carregar eventos:', error);
            });
    }
    
    
    function selectDay(day) {
        selectedDay = day;
        document.querySelectorAll('.day-button').forEach(button => {
            button.classList.toggle('active', button.textContent.startsWith(day.toString()));
        });
        renderEvents();
    }
    
    function renderEvents() {
        const eventsContainer = document.getElementById('events');
        eventsContainer.innerHTML = '';
    
        const currentMonth = meses[currentWeekStart.getMonth()].toLowerCase();
        
        const dayEvents = events.filter(event =>
            event.day === selectedDay &&
            event.month.toLowerCase() === currentMonth
        );
    
        const sortedEvents = dayEvents.sort((a, b) => {
            const timeA = convertTimeToMinutes(a.startTime);
            const timeB = convertTimeToMinutes(b.startTime);
            return timeA - timeB;
        });
    
        const columns = [];
        const modalContainer = document.createElement('div');
        modalContainer.id = 'eventModal';
        modalContainer.classList.add('event-modal');
        modalContainer.style.display = 'none';
        document.body.appendChild(modalContainer);
    
        sortedEvents.forEach((event) => {
            const eventStart = convertTimeToMinutes(event.startTime);
            const eventEnd = convertTimeToMinutes(event.endTime);
            
            let columnIndex = 0;
            while (isTimeSlotOccupied(columns, columnIndex, eventStart, eventEnd)) {
                columnIndex++;
            }
    
            if (!columns[columnIndex]) {
                columns[columnIndex] = [];
            }
            columns[columnIndex].push({ start: eventStart, end: eventEnd });
    
            const eventDiv = document.createElement('div');
            eventDiv.classList.add('event');
            eventDiv.style.borderColor = event.colorOfEvent;
            eventDiv.style.border = `0.2vw solid ${event.colorOfEvent}`;
    
            const style = getEventStyle(event);
            Object.assign(eventDiv.style, style);
            const WIDTH_THRESHOLD = 600;
            eventDiv.style.left = window.innerWidth <= WIDTH_THRESHOLD 
                ? `${columnIndex * 250}px` 
                : `${columnIndex * 13}vw`;
            
            
            const condensedView = document.createElement('div');
            condensedView.classList.add('event-condensed');
    
            const expandButton = document.createElement('button');
            expandButton.classList.add('expand-event-details');
            const img = document.createElement('img');
            img.src = '/images/plus.png';
            expandButton.appendChild(img);
            expandButton.onclick = () => showExpandedView(event);
            
            if(window.innerWidth <= 600) {
                eventDiv.style.border = `0.6vw solid ${event.colorOfEvent}`;
                condensedView.innerHTML = `
                    <p class="description-title-calendar">${event.descriptionTitle}</p>
                    <div class="event-info-container">
                        <span class="opp-place-title-calendar">${event.oppPlaceTitle}</span>
                        <span class="opp-place-subtitle-calendar">${event.startTime} - ${event.endTime}</span>
                    </div>
                `;
                eventDiv.appendChild(expandButton);
            } else {
                const eventHeight = parseInt(style.height);
                if (eventHeight >= 14) {
                    condensedView.style.overflowY = 'auto';
                    condensedView.innerHTML = `
                        <img src="${event.imageSrc}" alt="${event.altText}" class="event-image-full">
                        <p class="description-title-calendar">${event.descriptionTitle}</p>
                        <p class="description-subtitle-calendar">${event.descriptionSubtitle}</p>
                        <div class="carousel-line-calendar"></div>
                        ${eventHeight >= 30 && event.moreInfoText ? `
                            <div style="
                                max-width: 13vw;
                                margin: 0.9vw auto;
                                max-height: ${eventHeight - 26.4}vw;
                                overflow: hidden;
                                position: relative;
                                border: 0.2vw solid grey;
                                border-radius: 1vw;
                                padding: 0.6vw;
                            ">
                                <p style="
                                    margin: 0;
                                    font-family: Poppins, sans-serif;
                                    font-size: 0.9vw;
                                    line-height: 1.4;
                                    text-align: center;
                                    display: -webkit-box;
                                    -webkit-line-clamp: ${Math.floor((eventHeight - 26.4) / 1.4)};
                                    -webkit-box-orient: vertical;
                                    overflow: hidden;
                                    text-overflow: ellipsis;
                                    word-wrap: break-word;
                                ">${event.moreInfoText}</p>
                            </div>
                        ` : ''}
                        
                        <div class="logo-and-place-info">
                            <img src="${event.logoSrc}" alt="${event.logoAlt}" class="event-logo">
                            <div class="place-info">
                                <p class="opp-place-title-calendar">${event.oppPlaceTitle}</p>
                                <p class="opp-place-subtitle-calendar">${event.oppPlaceSubtitle}</p>
                            </div>
                        </div>
                        <a class="more-info-link-calendar" href="${event.moreInfoLink}">Mais Informações</a>
                    `;
                    
                } else {
                    eventDiv.appendChild(expandButton);
                    const eventImage = document.createElement('img');
                    eventImage.src = event.imageSrc;
                    eventImage.alt = `${event.descriptionTitle} image`;
                    eventImage.className = 'event-image';
                    condensedView.appendChild(eventImage);
                }
            }
    
            eventDiv.appendChild(condensedView);
            eventsContainer.appendChild(eventDiv);
        });
    
        if (sortedEvents.length > 0) {
            scrollToFirstEvent(sortedEvents[0]);
        } else {
            document.querySelector('.calendar-container').scrollTo(0, 0);
        }
    }
    
    // Helper function to convert time string to minutes since midnight
    function convertTimeToMinutes(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + minutes;
    }
    
    // Helper function to check if a time slot is occupied in a column
    function isTimeSlotOccupied(columns, columnIndex, eventStart, eventEnd) {
        if (!columns[columnIndex]) {
            return false;
        }
        
        return columns[columnIndex].some(slot => {
            // Check if there's any overlap
            return !(eventEnd <= slot.start || eventStart >= slot.end);
        });
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
    
    
    function getEventStyle(event) {
        const startHour = parseInt(event.startTime.split(':')[0]);
        const startMinute = parseInt(event.startTime.split(':')[1]);
        const endHour = parseInt(event.endTime.split(':')[0]);
        const endMinute = parseInt(event.endTime.split(':')[1]);

        // Determine the hour height based on screen width
        const hourHeight = window.innerWidth <= 600
            ? 16.2 
            : 13.1;  

        // Correct minute conversion based on the current hour height
        const minuteHeight = hourHeight / 60;

        // Calculate the top position with 6-hour offset
        const top = ((startHour - 6) * hourHeight) + (startMinute * minuteHeight);

        // Calculate the height of the event (no offset needed for duration)
        const endTop = ((endHour - 6) * hourHeight) + (endMinute * minuteHeight);
        const height = endTop - top;

        return {
            top: `${top}vw`,
            height: `${height}vw`,
        };
    }


    function scrollToFirstEvent(firstEvent) {
        const startHour = parseInt(firstEvent.startTime.split(':')[0]);
        const startMinute = parseInt(firstEvent.startTime.split(':')[1]);
        
        // Use the same hourHeight calculation as getEventStyle for consistency
        const hourHeight = window.innerWidth < 600 
            ? 16.2 
            : 13.1;     
        
        const minuteHeight = hourHeight / 60;
        
        // Calculate position in vw units
        const scrollPosition = ((startHour - 6) * hourHeight) + (startMinute * minuteHeight);
        
        const scrollContainer = document.querySelector('.calendar-container');
        

        let offset = window.innerWidth <= 600 ? 5 : 2;
        
        // Convert the final scroll position from vw to pixels for scrollTop
        const scrollPositionInPixels = (scrollPosition - offset) * (window.innerWidth / 100);
        scrollContainer.scrollTop = Math.max(0, scrollPositionInPixels);
    }
    
    
    
    function updateMonthYear() {
        const monthYearElement = document.getElementById('monthYear');
        const weekStart = new Date(currentWeekStart);
        const weekEnd = new Date(currentWeekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
    
        const formatDate = (date) => {
            return date.getDate();
        };
    
        const formatMonthYear = (date) => {
            return `${meses[date.getMonth()]} ${date.getFullYear()}`;
        };
    
        let dateRangeText = `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;
    
        if (weekStart.getMonth() !== weekEnd.getMonth()) {
            dateRangeText = `${formatDate(weekStart)} ${meses[weekStart.getMonth()]} - ${formatDate(weekEnd)} ${meses[weekEnd.getMonth()]}`;
        }
    
        if (weekStart.getFullYear() !== weekEnd.getFullYear()) {
            dateRangeText = `${formatDate(weekStart)} ${meses[weekStart.getMonth()]} ${weekStart.getFullYear()} - ${formatDate(weekEnd)} ${meses[weekEnd.getMonth()]} ${weekEnd.getFullYear()}`;
        } else {
            dateRangeText = `${formatDate(weekStart)} - ${formatDate(weekEnd)} ${formatMonthYear(weekEnd)}`;
        }
    
        monthYearElement.textContent = dateRangeText;
    }
    
    function nextWeek() {
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        updateCalendar();
    }
    
    function prevWeek() {
        currentWeekStart.setDate(currentWeekStart.getDate() - 7);
        updateCalendar();
    }


    
    function updateCalendar() {
        renderWeekButtons();
        updateMonthYear();
        renderEvents();
        console.debug(currentDate.getFullYear());
    }
    
    function countTodayEvents() {
        const today = new Date();
        const todayDay = today.getDate();
        const todayMonth = meses[today.getMonth()].toLowerCase();
    
        const todayEvents = events.filter(event => 
            event.day === todayDay && 
            event.month.toLowerCase() === todayMonth
        );
    
        return todayEvents.length;
    }

    function updateOpportunityTitle() {
        const opportunityTitle = document.getElementById('opportunityTitle');
        const eventCount = countTodayEvents();
        const pluralSuffix = eventCount === 1 ? '' : 's';
        opportunityTitle.innerHTML = `<strong>Hoje</strong> tens <strong>${eventCount} Oportunidade${pluralSuffix}</strong>`;
    }














    // Helper function to escape special characters in ICS text fields
    function escapeICSText(text) {
        if (!text) return '';
        return text.replace(/[,;\\]/g, '\\$&')
                .replace(/\n/g, '\\n')
                .replace(/\r/g, '')
                .split('').join('');
    }

    // Helper function to format date-time for ICS
    function formatDateForICS(date) {
        return date.toISOString()
                .replace(/[-:]/g, '')
                .replace(/\.\d{3}/, '');
    }

    // Generate unique identifier for events
    function generateUID() {
        return 'event-' + Math.random().toString(36).substr(2, 9) + 
            '-' + Date.now() + '@studentx.com';
    }

    // Create timestamp for calendar creation
    function getCurrentTimestamp() {
        return formatDateForICS(new Date());
    }

    // Helper function to get event datetime
    function getEventDateTime(event) {
        const monthIndex = meses.findIndex(m => 
            m.toLowerCase() === event.month.toLowerCase()
        );
        
        // Handle year rollover
        let eventYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();
        if (monthIndex < currentMonth) {
            eventYear++; // Event is in next year
        }
        
        const [startHour, startMinute] = event.startTime.split(':');
        const eventDate = new Date(
            eventYear,
            monthIndex,
            event.day,
            parseInt(startHour),
            parseInt(startMinute)
        );
        
        return eventDate;
    }

    // Helper function to check if event is in the future
    function isFutureEvent(event) {
        const now = new Date();
        const eventDateTime = getEventDateTime(event);
        return eventDateTime >= now;
    }

    function createICSFile() {
        const timestamp = getCurrentTimestamp();
        let icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//StudentX//Calendar//PT',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            'X-WR-CALNAME:StudentX Calendar',
            'X-WR-TIMEZONE:Europe/Lisbon',
            'X-WR-CALDESC:Calendário de Eventos StudentX',
            `DTSTAMP:${timestamp}`
        ].join('\r\n') + '\r\n';

        // Filter and sort future events
        const futureEvents = events
            .filter(isFutureEvent)
            .sort((a, b) => {
                const dateA = getEventDateTime(a);
                const dateB = getEventDateTime(b);
                return dateA - dateB;
            });

        futureEvents.forEach(event => {
            // Get event dates
            const eventStart = getEventDateTime(event);
            const eventEnd = new Date(eventStart);
            
            // Set end time
            const [endHour, endMinute] = event.endTime.split(':');
            eventEnd.setHours(parseInt(endHour), parseInt(endMinute));

            // Create event description with rich formatting
            const description = [
                event.descriptionSubtitle,
                '',
                'Local: ' + event.oppPlaceSubtitle,
                event.moreInfoText ? 'Informação Adicional: ' + event.moreInfoText : '',
                '',
                'Mais informações: ' + event.moreInfoLink
            ].filter(Boolean).join('\\n');

            // Generate unique identifier for the event
            const uid = generateUID();

            // Build event block
            const eventBlock = [
                'BEGIN:VEVENT',
                `UID:${uid}`,
                `DTSTAMP:${timestamp}`,
                `DTSTART:${formatDateForICS(eventStart)}`,
                `DTEND:${formatDateForICS(eventEnd)}`,
                `SUMMARY:${escapeICSText(event.descriptionTitle)}`,
                `DESCRIPTION:${escapeICSText(description)}`,
                `LOCATION:${escapeICSText(event.oppPlaceTitle)}`,
                'CATEGORIES:StudentX',
                `URL:${escapeICSText(event.moreInfoLink)}`,
                `STATUS:CONFIRMED`,
                `SEQUENCE:0`,
                `CREATED:${timestamp}`,
                `LAST-MODIFIED:${timestamp}`,
                // Add color if supported by calendar client
                `X-APPLE-CALENDAR-COLOR:${event.colorOfEvent}`,
                'TRANSP:OPAQUE',
                'END:VEVENT'
            ].join('\r\n') + '\r\n';

            icsContent += eventBlock;
        });

        icsContent += 'END:VCALENDAR\r\n';
        return icsContent;
    }

    // Updated download function with error handling and MIME type
    function downloadCalendar() {
        try {
            const icsContent = createICSFile();
            
            // Check if there are any future events
            if (!icsContent.includes('BEGIN:VEVENT')) {
                alert('Não existem eventos futuros para exportar.');
                return;
            }
            
            const blob = new Blob([icsContent], { 
                type: 'text/calendar;charset=utf-8;method=PUBLISH' 
            });
            
            // Create filename with date
            const today = new Date();
            const filename = `calendario-studentx-${today.getFullYear()}${(today.getMonth()+1).toString().padStart(2, '0')}.ics`;
            
            // Create and trigger download
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            
            // Cleanup
            setTimeout(() => {
                URL.revokeObjectURL(link.href);
                document.body.removeChild(link);
            }, 100);
        } catch (error) {
            console.error('Error generating calendar file:', error);
            alert('Ocorreu um erro ao gerar o calendário. Por favor, tente novamente.');
        }
    }
    
    init();


      