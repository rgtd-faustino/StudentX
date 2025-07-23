const diasDaSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    let events = [];
    let selectedDay = new Date(); // exemplo: Wed Jul 09 2025 15:30:00 GMT+0100
    let currentDate = new Date(); // exemplo: Wed Jul 09 2025 15:30:00 GMT+0100
    // retorna o ano, mês, e o primeiro dia de cada semana (domingo)
    // ex: .getDate() retorna 9 e .getDay() retorna 3 (quarta feira pq domingo == 0).
    // não sabemos que dia semana é o dia 9, então precisamos de saber o dia atual e o seu indíce, para chegarmos ao domingo vamos ao dia atual e subtraímos esse valor
    let currentWeekStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - currentDate.getDay());
    const mediaQuery = window.matchMedia('(max-width: 600px)');


    // para inicializar o calendário metemos os dias da semana, as horas, os eventos, o dia mês e ano, e a quantidade de eventos no dia atual
    function init() {
        renderWeekButtons();
        renderHours();
        fetchEvents();
        updateMonthYear();
        updateOpportunityTitle();

        const actionButtonsContainer = document.createElement('div');
        actionButtonsContainer.id = 'calendarActions';
        
        // adicionamos um botão para fazer download de todos os eventos presentes no calendário
        const downloadButton = document.createElement('button');
        downloadButton.textContent = 'Transferir Calendário';
        downloadButton.className = 'downloadButton';
        downloadButton.onclick = downloadCalendar;
        downloadButton.title = 'Clique para transferir o calendário e poder importá-lo onde quiser.'; // se ficarmos tempo extra com o rato em cima apareste isto
        
        actionButtonsContainer.appendChild(downloadButton);
        
        document.querySelector('.download-calendar').appendChild(actionButtonsContainer);
    }

    function renderWeekButtons() {
        const dayButtonsContainer = document.getElementById('dayButtons');
        dayButtonsContainer.innerHTML = '';
        const today = new Date();

        // para cada dia numa semana metemos o dia atual a somar com o número índice do dia da semana e metemos o nome do dia da semana
        for (let i = 0; i < 7; i++) {
            // exemplo de new date e set dade: Sund Jul 06 2025
            const day = new Date(currentWeekStart);
            day.setDate(currentWeekStart.getDate() + i);
            const button = document.createElement('button');
            
            // não esquecer que o get day retorna o índice do dia da semana e não o dia em si do mês
            // metemos a classe para o day-number porque depois iremos usá-la para sabermos o dia novo para usar os eventos dele
            button.innerHTML = `<span class="day-number">${day.getDate()}</span><br><span class="day-name">${diasDaSemana[day.getDay()]}</span>`;
            
            button.classList.add('day-button');
            
            // se o dia no loop for o dia atual então será o dia "ativo" do calendário, ou seja, é o dia que vai estar highlighted
            if (day.getDate() === today.getDate() && day.getMonth() === today.getMonth() && day.getFullYear() === today.getFullYear()) {
                button.classList.add('active');
                // passa a ser o dia selecionado e mostramos os eventos desse mesmo dia na função render events, temos de usar é depois getDate()
                selectedDay = day;
            }
            
            button.onclick = () => {
                // quando clicamos num botão removemos o highlight dos outros dias e metemos no botão clicado
                document.querySelectorAll('.day-button').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                selectDay(day); // atualizamos o selected day para a nova data (depois metemos o dia exato na função)
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
    
    // para apanharmos os eventos usamos um fetch para o ficheiro json e apanhamos as informações relevantes (não precisamos do id do evento)
    function fetchEvents() {
        fetch('/json/events.json')
            .then(response => response.json())
            .then(data => {
                events = data.items.map(event => ({ // atualizamos a variável que contém todos os eventos
                    day: event.day,
                    month: event.month,
                    year: event.year,
                    id: event.id,
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
                renderEvents(); // agora que temos os eventos mostramo-los
                updateOpportunityTitle(); // atualizamos o título na página html para conter o número de eventos disponíveis hoje
            })
            .catch(error => {
                console.error('Erro ao carregar eventos:', error);
            });
    }
    
    
    function selectDay(day) {
        selectedDay = day;
        document.querySelectorAll('.day-button').forEach(button => {
            // apanhamos o day number na span do button e passamos para int para mostrarmos os eventos desse dia após atualizar a variável selectedDay
            const dayNumber = parseInt(button.querySelector('.day-number').textContent);
            button.classList.toggle('active', dayNumber === day.getDate());
        });
        renderEvents();
    }
    
    function renderEvents() {
        const eventsContainer = document.getElementById('events');
        eventsContainer.innerHTML = '';
    
        // filtramos todos os eventos para que tenham apenas o dia selecionado pelo utilizador e que tenham o mesmo mês
        const dayEvents = events.filter(event =>
            event.day === selectedDay.getDate() &&
            event.month === (selectedDay.getMonth() + 1) && // nós estamos a contar os meses a partir do índice 1 então temos de somar um valor para ser igual
            event.year === selectedDay.getFullYear()
        );
    
        // agora apanhamso os tempos de início e fim de cada eventos para calcular a duração dos mesmos para os ordenarmos
        const sortedEvents = dayEvents.sort((a, b) => {
            const timeA = convertTimeToMinutes(a.startTime);
            const timeB = convertTimeToMinutes(b.startTime);
            return timeA - timeB; // o evento que for o primeiro no dia
        });
    
        const columns = [];
        const modalContainer = document.createElement('div');
        modalContainer.id = 'eventModal';
        modalContainer.classList.add('event-modal');
        modalContainer.style.display = 'none';
        document.body.appendChild(modalContainer);
    
        // agora para todos os eventos já ordenados vamos metê-los em cada coluna e preencher o espaço do evento desde que começou até que acabou
        sortedEvents.forEach((event) => {
            const eventStart = convertTimeToMinutes(event.startTime);
            const eventEnd = convertTimeToMinutes(event.endTime);
            
            // para cada evento vamos adicionado às colunas, se a coluna já estiver ocupada avançamos para a próxima
            let columnIndex = 0;
            while (isTimeSlotOccupied(columns, columnIndex, eventStart, eventEnd)) {
                columnIndex++;
            }
    
            if (!columns[columnIndex]) {
                columns[columnIndex] = [];
            }
            // push mete o intervalo de tempo do evento no fim do array para ficar ordenado de acordo com a lista que já foi ordenada
            columns[columnIndex].push({ start: eventStart, end: eventEnd });
    
            const eventDiv = document.createElement('div');
            eventDiv.classList.add('event');
            eventDiv.style.borderColor = event.colorOfEvent;
            eventDiv.style.border = `0.2vw solid ${event.colorOfEvent}`;
    
            const style = getEventStyle(event);
            Object.assign(eventDiv.style, style);

            eventDiv.style.left = `${columnIndex * 13}vw`;
            
            const condensedView = document.createElement('div');
            condensedView.classList.add('event-condensed');
    
            desktopView(event, eventDiv, condensedView, style);
    
            eventDiv.appendChild(condensedView);
            eventsContainer.appendChild(eventDiv);
        });
    
        // se existirem eventos no dia selecionado pelo utilizador damos scroll para o primeiro para haver sempre algo a mostrar no calendário
        if (sortedEvents.length > 0) {
            scrollToFirstEvent(sortedEvents[0]);
        } else {
            // senão vamos para o ínicio do dia
            document.querySelector('.calendar-container').scrollTo(0, 0);
        }
    }
    
    // para eventos mais pequenos onde não conseguimos mostrar todas as informações fazemos um botão que deixe o utilizador expandi-lo
    function createExpandButton(event) {
        const expandButton = document.createElement('button');
        expandButton.classList.add('expand-event-details');
        const img = document.createElement('img');
        img.src = '/images/plus.webp';
        img.alt = 'Expand event details';
        expandButton.appendChild(img);
        expandButton.onclick = () => showExpandedView(event); // função que expande o evento
        return expandButton;
    }
    
    // mostra o calendário para telmóvel e computador, mas como só já mostramos no computador só nos importa este
    function desktopView(event, eventDiv, condensedView, style) {
        const eventHeight = parseInt(style.height);
        
        if (eventHeight >= 14) {
            condensedView.style.overflowY = 'auto';
            condensedView.style.display = 'flex';
            condensedView.style.flexDirection = 'column';
            condensedView.style.height = '100%';
            
            const baseContentDiv = document.createElement('div');
            baseContentDiv.innerHTML = `
                <img src="${event.imageSrc}" alt="${event.altText}" class="event-image-full">
                <p class="description-title-calendar">${event.descriptionTitle}</p>
                <p class="description-subtitle-calendar">${event.descriptionSubtitle}</p>
                <div class="carousel-line-calendar"></div>
            `;
            condensedView.appendChild(baseContentDiv);
    
            // se o evento for muito grande adicionamos um pequeno resumo sobre o evento
            if (eventHeight >= 30 && event.moreInfoText) {
                addTextContainer(event, condensedView, baseContentDiv);

            } else { // senão só adicionamos o resto das informações normalmente /porque o resumo encontra-se no meio das informações evento)
                const footerDiv = createFooterContent(event);
                condensedView.appendChild(footerDiv);
            }

        } else {
            eventDiv.appendChild(createExpandButton(event));
            const eventImage = document.createElement('img');
            eventImage.src = event.imageSrc;
            eventImage.alt = `${event.altText}`;
            eventImage.className = 'event-image';
            condensedView.appendChild(eventImage);
        }
    }

    // quando o evento é demasiado grande e preenche muito espaço vazio no calendário decidimos preenchê-lo com um pequeno texto resumo sobre o evento
    function addTextContainer(event, condensedView, baseContentDiv) {
        const textContainer = document.createElement('div');
        textContainer.className = 'text-container';
    
        const textWrapper = document.createElement('div');
        textWrapper.className = 'text-wrapper';
    
        const textElement = document.createElement('p');
        textElement.className = 'text-element';
        textElement.textContent = event.moreInfoText;
    
        textWrapper.appendChild(textElement);
        textContainer.appendChild(textWrapper);
        condensedView.appendChild(textContainer);
    
        const footerDiv = createFooterContent(event);
        condensedView.appendChild(footerDiv);
    
        handleTextOverflow(textWrapper, textElement, baseContentDiv, footerDiv, condensedView, textContainer);
    }
    
    function createFooterContent(event) {
        const footerDiv = document.createElement('div');
        footerDiv.style.marginTop = 'auto';
        footerDiv.innerHTML = `
            <div class="logo-and-place-info">
                <img src="${event.logoSrc}" alt="${event.logoAlt}" class="event-logo">
                <div class="place-info">
                    <p class="opp-place-title-calendar">${event.oppPlaceTitle}</p>
                    <p class="opp-place-subtitle-calendar">${event.oppPlaceSubtitle}</p>
                </div>
            </div>
            <a class="more-info-link-calendar" href="${event.moreInfoLink}">Mais Informações</a>
        `;
        return footerDiv;
    }

    
    function handleTextOverflow(textWrapper, textElement, baseContentDiv, footerDiv, condensedView, textContainer) {
        // usamos request animation frame para esperar que a página carregue inteiramente antes da mudarmos
        requestAnimationFrame(() => {
            const containerHeight = condensedView.offsetHeight;
            const baseContentHeight = baseContentDiv.offsetHeight;
            const footerHeight = footerDiv.offsetHeight;
            const marginSpace = parseFloat(getComputedStyle(textContainer).margin) * 2;
            const maxTextHeight = containerHeight - baseContentHeight - footerHeight - marginSpace;
            
            textContainer.style.maxHeight = `${maxTextHeight}px`;
    
            const isOverflowing = textElement.scrollHeight > textWrapper.clientHeight;
            
            if (isOverflowing || textWrapper.clientHeight < textElement.scrollHeight - 10) {
                textWrapper.style.maskImage = 'linear-gradient(to bottom, black calc(100% - 2vw), transparent 100%)';
                textWrapper.style.webkitMaskImage = 'linear-gradient(to bottom, black calc(100% - 2vw), transparent 100%)';
            } else {
                textWrapper.style.maskImage = 'none';
                textWrapper.style.webkitMaskImage = 'none';
            }
        });
    }

    // apanhamos individualmente o número das horas e minutos e passamos tudo para minutos
    function convertTimeToMinutes(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + minutes;
    }

    function isFutureEvent(event) {
        const now = new Date();
        const [endHour, endMinute] = event.endTime.split(':').map(Number);
        const eventEnd = new Date(event.year, event.month - 1, event.day, endHour, endMinute);
        return eventEnd >= now;
    }

    
    function getEventDateTime(event) {
        const startTime = event.startTime;
        const year = event.year;
        const month = event.month;
        const day = event.day;
        
        const [startHour, startMinute] = startTime.split(':');
        const eventDate = new Date(
            year,
            month - 1,
            day,
            parseInt(startHour),
            parseInt(startMinute)
        );
        
        return eventDate;
    }
    
    // checka se a coluna está ocupada desde o ínicio até ao fim de um determinado evento
    function isTimeSlotOccupied(columns, columnIndex, eventStart, eventEnd) {
        if (!columns[columnIndex]) { // se não tiver nada é porque está vazia
            return false;
        }
        
        // se tiver alguma coisa pode ser que não tenha no tempo específico do evento parâmetro
        // função some retorna true quando encontrar um elemento que cumpra uma condição e falso otherwise
        return columns[columnIndex].some(slot => {
            // então vemos se há overlap
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

        // dependendo se era telemóvel ou computador o evento teria tamanhos diferentes baseado nas horas
        const hourHeight = window.innerWidth <= 600
            ? 16.2 
            : 13.1;  

        const minuteHeight = hourHeight / 60;

        // começamos no ínicio das horas que estabelecemos (começa a partir das 6:00)
        const top = ((startHour - 6) * hourHeight) + (startMinute * minuteHeight);

        // e agora calculamos o tamanho do evento
        const endTop = ((endHour - 6) * hourHeight) + (endMinute * minuteHeight);
        const height = endTop - top;

        return {
            top: `${top}vw`,
            height: `${height}vw`,
        };
    }

    // para darmos scroll até ao primeiro exemplo apanhamos o intervalo de tempo do primeiro evento (como a lista é ordenada é o mais recente)
    function scrollToFirstEvent(firstEvent) {
        const startHour = parseInt(firstEvent.startTime.split(':')[0]);
        const startMinute = parseInt(firstEvent.startTime.split(':')[1]);
        
        // quando o calendário estava disponível para o telemóvel tinhamos de ter em conta o tamanho de cada hora no html
        const hourHeight = window.innerWidth < 600 
            ? 16.2 
            : 13.1;     
        
        const minuteHeight = hourHeight / 60;
        
        const scrollPosition = ((startHour - 6) * hourHeight) + (startMinute * minuteHeight);
        
        const scrollContainer = document.querySelector('.calendar-container');

        let offset = window.innerWidth <= 600 ? 5 : 2; // dependendo se era telemóvel ou não
        
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
    
        let dateRangeText;
    
        // se o ano for diferente temos do atualizar
        if (weekStart.getFullYear() !== weekEnd.getFullYear()) {
            dateRangeText = `${formatDate(weekStart)} - ${formatDate(weekEnd)} ${formatMonthYear(weekEnd)}`;
        } else {
            // mostramos sempre o mês e ano da última semana
            dateRangeText = `${formatDate(weekStart)} - ${formatDate(weekEnd)} ${formatMonthYear(weekEnd)}`;
        }
    
        monthYearElement.textContent = dateRangeText;
    }
    
    function nextWeek() {
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        updateCalendar(false);
    }
    
    function prevWeek() {
        currentWeekStart.setDate(currentWeekStart.getDate() - 7);
        updateCalendar(false);
    }
    
    // apenas damos render dos eventos quando o utilizador clicar num botão de dia da semana
    function updateCalendar(renderEvents) {
        renderWeekButtons();
        updateMonthYear();
        if(renderEvents)
            renderEvents();
        console.debug(currentDate.getFullYear());
    }

    // função que atualiza o número de eventos hoje no título do calendário
    function updateOpportunityTitle() {
        const opportunityTitles = document.querySelectorAll('.opportunityTitle');
        const eventCount = countTodayEvents();
        const pluralSuffix = eventCount === 1 ? '' : 's'; // evento ou eventos, se é plural ou não dependendo da quantidade dos mesmos
        const content = `<strong>Hoje</strong> tens <strong>${eventCount} Oportunidade${pluralSuffix}</strong>`;
    
        opportunityTitles.forEach(title => {
            title.innerHTML = content;
        });
    }
    
    function countTodayEvents() {
        const today = new Date();
        const todayDay = today.getDate();
        const todayMonth = today.getMonth() + 1; // mais um valor porque contamos os meses a partir do índice 1 no JSON mas o objeto Date começa no 0
    
        // apanhamos apenas os eventos que sejam de hoje e que combinem também com o mês de hoje e ano
        const todayEvents = events.filter(event => 
            event.day === todayDay && event.month === todayMonth && event.year === today.getFullYear()
        );
    
        return todayEvents.length;
    }






















    function escapeICSText(text) {
        if (!text) return '';
        return text
            .replace(/\\/g, '\\\\')    // Escape backslashes first
            .replace(/;/g, '\\;')      // Escape semicolons
            .replace(/,/g, '\\,')      // Escape commas
            .replace(/\r?\n/g, '\\n')  // Convert line breaks to ICS format
            .replace(/\r/g, '');       // Remove carriage returns
    }

    function formatDescriptionText(text) {
        if (!text) return '';
        
        // Convert literal "\n" strings to actual line breaks
        let formattedText = text.replace(/\\n/g, '\n');
        
        // Clean up the text
        return formattedText
            .split('\n')
            .map(line => line.trim())
            .filter(line => line)
            .join('\n\n');
    }

    function formatDateForICS(date) {
        return date.toISOString()
            .replace(/[-:]/g, '')
            .replace(/\.\d{3}/, '');
    }

    function formatLocalDateForICS(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hour = String(date.getHours()).padStart(2, '0');
        const minute = String(date.getMinutes()).padStart(2, '0');
        const second = String(date.getSeconds()).padStart(2, '0');
        
        return `${year}${month}${day}T${hour}${minute}${second}`;
    }


    function createICSFile() {
        const timestamp = formatDateForICS(new Date());
        
        // Fixed VCALENDAR header without DTSTAMP
        let icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//StudentX//Calendar//PT',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            'X-WR-CALNAME:StudentX Calendar',
            'X-WR-TIMEZONE:Europe/Lisbon',
            'X-WR-CALDESC:Calendário de Eventos StudentX'
        ].join('\r\n') + '\r\n';

        // Add timezone definition for better compatibility
        icsContent += [
            'BEGIN:VTIMEZONE',
            'TZID:Europe/Lisbon',
            'BEGIN:STANDARD',
            'DTSTART:20071028T020000',
            'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU',
            'TZNAME:WET',
            'TZOFFSETFROM:+0100',
            'TZOFFSETTO:+0000',
            'END:STANDARD',
            'BEGIN:DAYLIGHT',
            'DTSTART:20070325T010000',
            'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU',
            'TZNAME:WEST',
            'TZOFFSETFROM:+0000',
            'TZOFFSETTO:+0100',
            'END:DAYLIGHT',
            'END:VTIMEZONE'
        ].join('\r\n') + '\r\n';

        let futureEvents = [];

        function findEventById(eventId) {
            return events.find(event => parseInt(event.id) === parseInt(eventId));
        }

        // tecnicamente isto devia estar no script do carrossel porque só vais descarregar os eventos que o utilizador der swipe accept nele
        // no entanto como o código do ICS está aqui eu aproveitei e continuei aqui
        if(window.innerWidth <= 600){
            const acceptedIds = getEssentialData('userEventPreferences_accepted');
            
            if (acceptedIds && Array.isArray(acceptedIds)   ) {
                futureEvents = acceptedIds
                    .map(id => findEventById(id)) // isto faz um array novo do mesmo array para novos elementos
                    .filter(event => event !== null) // removes results that are null
                    .filter(event => isFutureEvent(event)) // remove todos os eventos passados
                    .sort((a, b) => {
                        const dateA = getEventDateTime(a);
                        const dateB = getEventDateTime(b);
                        return dateA - dateB;
                });
            }

        } else{
            futureEvents = events
                .filter(event => isFutureEvent(event))
                .sort((a, b) => {
                    const dateA = getEventDateTime(a);
                    const dateB = getEventDateTime(b);
                    return dateA - dateB;
            });
        }


        futureEvents.forEach(event => {
            const eventStart = getEventDateTime(event);
            const eventEnd = new Date(eventStart);
            
            const [endHour, endMinute] = event.endTime.split(':');
            eventEnd.setHours(parseInt(endHour), parseInt(endMinute));

            // Format description with proper structure
            let descriptionParts = [
                event.descriptionSubtitle || '',
                '',
                `Local: ${event.oppPlaceSubtitle || ''}`,
            ];

            if (event.moreInfoText) {
                descriptionParts.push('', `Informação Adicional: ${event.moreInfoText}`);
            }

            descriptionParts.push('', `Mais informações: ${event.moreInfoLink || ''}`);

            const description = formatDescriptionText(descriptionParts.filter(Boolean).join('\n'));

            // Generate unique UID if not available
            const uid = event.id || `event-${event.day}-${event.month}-${event.year}-${event.startTime.replace(':', '')}-${Date.now()}`;

            // Use local timezone format
            const eventStartLocal = formatLocalDateForICS(eventStart);
            const eventEndLocal = formatLocalDateForICS(eventEnd);

            const eventBlock = [
                'BEGIN:VEVENT',
                `UID:${uid}@studentx.pt`,
                `DTSTAMP:${timestamp}`,
                `DTSTART;TZID=Europe/Lisbon:${eventStartLocal}`,
                `DTEND;TZID=Europe/Lisbon:${eventEndLocal}`,
                `SUMMARY:${escapeICSText(event.descriptionTitle || '')}`,
                `DESCRIPTION:${escapeICSText(description)}`,
                `LOCATION:${escapeICSText(`${event.oppPlaceTitle}, ${event.oppPlaceSubtitle}` || '')}`,
                'CATEGORIES:StudentX',
                `URL:${escapeICSText(event.moreInfoLink || '')}`,
                'STATUS:CONFIRMED',
                'SEQUENCE:0',
                `CREATED:${timestamp}`,
                `LAST-MODIFIED:${timestamp}`,
                'TRANSP:OPAQUE',
                'END:VEVENT'
            ].join('\r\n') + '\r\n';

            icsContent += eventBlock;
        });

        icsContent += 'END:VCALENDAR\r\n';
        return icsContent;
    }

    // Download function with error handling
   function downloadCalendar() {
        try {
            const icsContent = createICSFile();
            
            // Check if there are any events to export
            if (!icsContent.includes('BEGIN:VEVENT')) {
                alert('Não existem eventos futuros para exportar.');
                return;
            }
            
            // Create blob with proper MIME type
            const blob = new Blob([icsContent], { 
                type: 'text/calendar;charset=utf-8' 
            });
            
            const filename = `Calendário StudentX.ics`;
            
            // Create download link
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            link.style.display = 'none';
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            
            // Clean up
            setTimeout(() => {
                URL.revokeObjectURL(link.href);
                document.body.removeChild(link);
            }, 100);
            
            console.log('Calendar downloaded successfully');
            
        } catch (error) {
            console.error('Error generating calendar file:', error);
            alert('Ocorreu um erro ao gerar o calendário. Por favor, dê refresh ao website e tente novamente.');
        }
    }
    
    init();