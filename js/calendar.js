
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
                    colorOfEvent: event.colorOfEvent
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
    
        // Get the month of the currently displayed week
        const currentMonth = meses[currentWeekStart.getMonth()].toLowerCase();
    
        // Filter events for the selected day and current month
        const dayEvents = events.filter(event =>
            event.day === selectedDay &&
            event.month.toLowerCase() === currentMonth
        );
    
        const sortedEvents = dayEvents.sort((a, b) => a.startTime.localeCompare(b.startTime));
        const columns = [];
    
        // Create modal container
        const modalContainer = document.createElement('div');
        modalContainer.id = 'eventModal';
        modalContainer.classList.add('event-modal');
        modalContainer.style.display = 'none';
        document.body.appendChild(modalContainer);
    
        sortedEvents.forEach((event, index) => {
            let column = 0;
            while (columns[column] && columns[column] > event.startTime) {
                column++;
            }
            columns[column] = event.endTime;
    
            const eventDiv = document.createElement('div');
            eventDiv.classList.add('event');

            eventDiv.style.borderColor = event.colorOfEvent;
            eventDiv.style.border = `0.2vw solid ${event.colorOfEvent}`;

            // Get event's calculated style
            const style = getEventStyle(event);
            Object.assign(eventDiv.style, style);
            
            // Create condensed view
            const condensedView = document.createElement('div');
            condensedView.classList.add('event-condensed');

            // Create expand button
            const expandButton = document.createElement('button');
            expandButton.classList.add('expand-event-details');

            // Create an img element
            const img = document.createElement('img');
            img.src = '/images/plus.png'; // Replace with the actual path to your image

            // Append the img element to the button
            expandButton.appendChild(img);

            expandButton.onclick = () => {
                showExpandedView(event);
            };
            
            if(window.innerWidth <= 600){
                eventDiv.style.border = `0.6vw solid ${event.colorOfEvent}`;

                condensedView.innerHTML = `
                    <p class="description-title-calendar">${event.descriptionTitle}</p>
                    <div class="event-info-container">
                        <span class="opp-place-title-calendar">${event.oppPlaceTitle}</span>
                        <span class="opp-place-subtitle-calendar">${event.startTime} - ${event.endTime}</span>
                    </div>
                `;
                eventDiv.appendChild(expandButton);
            } else{
                if (parseInt(style.height) >= 375) {
                    // Add title and time to the condensed view
                    condensedView.style.overflowY = 'auto';
                    condensedView.innerHTML = `
                        <img src="${event.imageSrc}" alt="${event.altText}" class="event-image-full">
                        <p class="description-title-calendar">${event.descriptionTitle}</p>
                        <p class="description-subtitle-calendar">${event.descriptionSubtitle}</p>
                        <div class="carousel-line-calendar"></div>
                        <div class="logo-and-place-info">
                            <img src="${event.logoSrc}" alt="${event.logoAlt}" class="event-logo">
                            <div class="place-info">
                                <p class="opp-place-title-calendar">${event.oppPlaceTitle}</p>
                                <p class="opp-place-subtitle-calendar">${event.oppPlaceSubtitle}</p>
                            </div>
                        </div>
                        <a class="more-info-link-calendar" href="${event.moreInfoLink}">Mais Informações</a>
                    `;
                }else{
                    eventDiv.appendChild(expandButton);
                    const eventImage = document.createElement('img');
                    eventImage.src = event.imageSrc;
                    eventImage.alt = `${event.descriptionTitle} image`;
                    eventImage.className = 'event-image';  // Set the class name
                    condensedView.appendChild(eventImage);
                }
            }


    



            eventDiv.appendChild(condensedView);
            eventDiv.style.left = `${column * 250}px`;
            eventsContainer.appendChild(eventDiv);
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
        const hourHeight = window.innerWidth <= 600 ? 61 : 251;
        
        // Correct minute conversion based on the current hour height
        const minuteHeight = hourHeight / 60;
    
        // Calculate the top position
        const top = (startHour * hourHeight) + (startMinute * minuteHeight);
    
        // Calculate the height of the event
        const endTop = (endHour * hourHeight) + (endMinute * minuteHeight);
        const height = endTop - top;
    
        return {
            top: `${top}px`,
            height: `${height}px`,
        };
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

    function createICSFile() {
        let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//StudentX//StudentX//PT\n";
        
        events.forEach(event => {
            const startDate = new Date(currentDate.getFullYear(), meses.indexOf(event.month), event.day);
            const endDate = new Date(startDate);
            
            const [startHour, startMinute] = event.startTime.split(':');
            const [endHour, endMinute] = event.endTime.split(':');
            
            startDate.setHours(parseInt(startHour), parseInt(startMinute));
            endDate.setHours(parseInt(endHour), parseInt(endMinute));
            
            icsContent += "BEGIN:VEVENT\n";
            icsContent += `DTSTART:${formatDateForICS(startDate)}\n`;
            icsContent += `DTEND:${formatDateForICS(endDate)}\n`;
            icsContent += `SUMMARY:${event.descriptionTitle}\n`;
            icsContent += `DESCRIPTION:${event.descriptionSubtitle}\n`;
            icsContent += `LOCATION:${event.oppPlaceTitle}\n`;
            icsContent += "END:VEVENT\n";
        });
        
        icsContent += "END:VCALENDAR";
        
        return icsContent;
    }
    
    function formatDateForICS(date) {
        return date.toISOString().replace(/-|:|\.\d{3}/g, '');
    }
    
    function downloadCalendar() {
        const icsContent = createICSFile();
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'calendário.ics';
        link.click();
    }

    
    init();


      