document.addEventListener("DOMContentLoaded", function() {
    // Selectors
    var languageSelector = document.querySelector(".dropdown-content");
    var currentLanguageButton = document.querySelector(".current-language");
    var hamburger = document.querySelector(".hamburger");

    // Language Selector Toggle
    currentLanguageButton.addEventListener("click", function(event) {
        event.stopPropagation(); // Prevents the click from being detected by the document event listener
        languageSelector.classList.toggle("active");
    });

    // Close the language options if clicked outside
    document.addEventListener("click", function(event) {
        if (!languageSelector.contains(event.target) && !currentLanguageButton.contains(event.target)) {
            languageSelector.classList.remove("active");
        }
    });

    // Toggle the navigation menu when hamburger is clicked
    hamburger.addEventListener("click", function() {
        toggleMenu();  // Call the toggleMenu function when the hamburger icon is clicked
    });

    function toggleMenu() {
        const menuContent = document.querySelector('.menu-content');
        menuContent.classList.toggle('active');
        hamburger.classList.toggle('open'); // Toggle the 'open' class to animate lines
        menuContent.classList.toggle('show'); // Toggle the visibility of the menu content (optional)
    }

    // Close the navigation menu if clicked outside
    document.addEventListener("click", function(event) {
        const menuContent = document.querySelector('.menu-content');
        if (!menuContent.contains(event.target) && !hamburger.contains(event.target)) {
            menuContent.classList.remove('active');
            hamburger.classList.remove('open');
            menuContent.classList.remove('show');
        }
    });



    const itemGroup = document.querySelector('.item-group-mobile');
    const dotsPC = document.querySelectorAll('.dot-pc');
    const dotsMobile = document.querySelectorAll('.dot-mobile');

    let currentIndexMobile = 0;  // Current index for the mobile carousel
    let currentIndexPC = 0;      // Current index for the PC carousel

    const itemsPerViewPC = 4;    // Number of items per view for PC
    const itemsPerViewMobile = 1; // Mobile only shows 1 item per view
    const totalItems = 12;        // Total number of items
    
    if (window.innerWidth >= 600) {
        function updateTransformPC() {
            // Calculate the percentage translation based on currentIndex
            const translatePercentage = -(currentIndexPC / totalItems) * 100 * (totalItems / itemsPerViewPC);
            
            // Apply the transform inline to the itemGroup element, ensuring no scaling is applied
            itemGroup.style.transform = `translateX(${translatePercentage}%)`;
            
            updateDotsPC();
        }
        
        function updateDotsPC() {
            dotsPC.forEach((dot, index) => {
                if (index === Math.floor(currentIndexPC / itemsPerViewPC)) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }
        // Initial call to set the correct active dot
        updateTransformPC();
        
        document.getElementById('next-mobile').addEventListener('click', () => {
            if (currentIndexPC >= totalItems - itemsPerViewPC) {
                // Reset to the beginning
                currentIndexPC = 0;
            } else {
                currentIndexPC += itemsPerViewPC;
            }
            updateTransformPC();
        });
        
        document.getElementById('prev-mobile').addEventListener('click', () => {
            if (currentIndexPC <= 0) {
                // Move to the end
                currentIndexPC = totalItems - itemsPerViewPC;
            } else {
                currentIndexPC -= itemsPerViewPC;
            }
            updateTransformPC();
        });
    }







    if (window.innerWidth <= 600) {
        let isAnimating = false;
    
        function updateTransformMobile() {
            // Calculate the percentage translation based on currentIndex
            const translatePercentage = -(currentIndexMobile / totalItems) * 100 * (totalItems / itemsPerViewMobile);
            
            // Apply the transform inline to the itemGroup element, ensuring no scaling is applied
            itemGroup.style.transform = `translateX(${translatePercentage}%)`;
            itemGroup.style.transition = 'transform 0.5s ease-in-out';
            
            updateDotsMobile();
        }
        
        function updateDotsMobile() {
            dotsMobile.forEach((dot, index) => {
                if (index === Math.floor(currentIndexMobile / itemsPerViewMobile)) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }
    
        function moveCarousel(direction) {
            if (isAnimating) return;
            isAnimating = true;
    
            if (direction === 'next') {
                currentIndexMobile = (currentIndexMobile + 1) % totalItems;
            } else {
                currentIndexMobile = (currentIndexMobile - 1 + totalItems) % totalItems;
            }
    
            updateTransformMobile();
    
            setTimeout(() => {
                isAnimating = false;
            }, 350); // Match this with the transition duration
        }
    
        // Initial call to set the correct active dot
        updateTransformMobile();
        
        document.getElementById('next-mobile').addEventListener('click', () => moveCarousel('next'));
        document.getElementById('prev-mobile').addEventListener('click', () => moveCarousel('prev'));
    
        itemGroup.addEventListener('transitionend', () => {
            isAnimating = false;
        });
    }

});    








// DO NOT MESS WITH THIS
document.addEventListener('DOMContentLoaded', function () {
    // Function to create carousel items dynamically
    function createCarouselItems(data) {
      const container = document.getElementById('item-group-1-mobile');
  
      data.items.forEach(item => {
        const itemContainer = document.createElement('div');
        itemContainer.className = 'item-container-mobile';
  
        // Item Image
        const img = document.createElement('img');
        img.src = item.imageSrc;
        img.alt = item.altText;
        itemContainer.appendChild(img);
  
        // Description
        const description = document.createElement('div');
        description.className = 'description-mobile';
  
        const descriptionTitle = document.createElement('p');
        descriptionTitle.className = 'description-title-mobile';
        descriptionTitle.textContent = item.descriptionTitle;
  
        const descriptionSubtitle = document.createElement('p');
        descriptionSubtitle.className = 'description-subtitle-mobile';
        descriptionSubtitle.textContent = item.descriptionSubtitle;
  
        description.appendChild(descriptionTitle);
        description.appendChild(descriptionSubtitle);
        itemContainer.appendChild(description);
  
        // Carousel Line
        const carouselLine = document.createElement('div');
        carouselLine.className = 'carousel-line';
        itemContainer.appendChild(carouselLine);
  
        // Opportunity Place
        const oppPlace = document.createElement('div');
        oppPlace.className = 'opp-place-mobile';
  
        const oppPlaceContainer = document.createElement('div');
        oppPlaceContainer.className = 'opp-place-container';
  
        const logoImg = document.createElement('img');
        logoImg.src = item.logoSrc;
        logoImg.alt = item.logoAlt;
  
        const oppPlaceTexts = document.createElement('div');
        oppPlaceTexts.className = 'opp-place-texts';
  
        const oppPlaceTitle = document.createElement('p');
        oppPlaceTitle.className = 'opp-place-title-mobile';
        oppPlaceTitle.textContent = item.oppPlaceTitle;
  
        const oppPlaceSubtitle = document.createElement('p');
        oppPlaceSubtitle.className = 'opp-place-subtitle-mobile';
        oppPlaceSubtitle.textContent = item.oppPlaceSubtitle;
  
        oppPlaceTexts.appendChild(oppPlaceTitle);
        oppPlaceTexts.appendChild(oppPlaceSubtitle);
        oppPlaceContainer.appendChild(logoImg);
        oppPlaceContainer.appendChild(oppPlaceTexts);
        oppPlace.appendChild(oppPlaceContainer);
        itemContainer.appendChild(oppPlace);
  
        // More Info Button
        const moreInfoBtn = document.createElement('a');
        moreInfoBtn.href = item.moreInfoLink;
        moreInfoBtn.className = 'button-carousel-mobile';
        moreInfoBtn.textContent = 'Mais Informações';
  
        itemContainer.appendChild(moreInfoBtn);
  
        // Append item container to the carousel container
        container.appendChild(itemContainer);
      });
    }
  
    // Fetch the JSON file and populate the carousel
    fetch('events.json')
      .then(response => response.json())
      .then(data => createCarouselItems(data))
      .catch(error => console.error('Error loading carousel data:', error));
    });
  


    document.addEventListener("DOMContentLoaded", function() {
        var questions = document.querySelectorAll(".faq-question");
    
        questions.forEach(function(question) {
            question.addEventListener("click", function() {
                var answer = this.nextElementSibling;
    
                if (answer.classList.contains("show")) {
                    answer.classList.remove("show");
                    this.classList.remove("active");
                } else {
                    // Hide other answers
                    document.querySelectorAll(".faq-answer.show").forEach(function(item) {
                        item.classList.remove("show");
                        item.previousElementSibling.classList.remove("active");
                    });
    
                    answer.classList.add("show");
                    this.classList.add("active");
                }
            });
        });
    });

    
    const diasDaSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    let events = [];
    let selectedDay = new Date().getDate();
    let currentDate = new Date();
    let currentWeekStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - currentDate.getDay());
    
    function init() {
        renderWeekButtons();
        renderHours();
        fetchEvents();
        updateMonthYear();
        updateOpportunityTitle(); // Add this line
    }
    
    function renderWeekButtons() {
        const dayButtonsContainer = document.getElementById('dayButtons');
        dayButtonsContainer.innerHTML = '';
        for (let i = 0; i < 7; i++) {
            const day = new Date(currentWeekStart);
            day.setDate(currentWeekStart.getDate() + i);
            const button = document.createElement('button');
            button.textContent = `${day.getDate()} ${diasDaSemana[day.getDay()]}`;
            button.classList.add('day-button');
            if (day.getMonth() !== currentDate.getMonth()) {
                button.classList.add('other-month');
            }
            button.onclick = (event) => {
                // Remove 'active' class from all buttons
                document.querySelectorAll('.day-button').forEach(btn => btn.classList.remove('active'));
                // Add 'active' class to the clicked button
                event.target.classList.add('active');
                selectDay(day.getDate());
            };
            dayButtonsContainer.appendChild(button);
        }
        // Remove the line that adds 'active' class to the first button
        // document.querySelector('.day-button').classList.add('active');
    }
    
    function renderHours() {
        const hoursContainer = document.getElementById('hours');
        hoursContainer.innerHTML = '';
        for (let i = 0; i < 24; i++) {
            const hourDiv = document.createElement('div');
            hourDiv.classList.add('hour');
            hourDiv.textContent = `${i}:00`;
            hoursContainer.appendChild(hourDiv);
        }
    }
    


    function fetchEvents() {
        fetch('events.json')
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
                    moreInfoLink: event.moreInfoLink
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
            
            // Create condensed view
            const condensedView = document.createElement('div');
            condensedView.classList.add('event-condensed');
            condensedView.innerHTML = `
                <strong>${event.descriptionTitle}</strong><br>
                ${event.startTime} - ${event.endTime}
            `;
    
            // Create expand button
            const expandButton = document.createElement('button');
            expandButton.textContent = 'Expand';
            expandButton.classList.add('expand-event-details');
            expandButton.onclick = () => {
                showExpandedView(event);
            };
    
            eventDiv.appendChild(condensedView);
            eventDiv.appendChild(expandButton);
    
            const style = getEventStyle(event);
            Object.assign(eventDiv.style, style);
            eventDiv.style.left = `${column * 210}px`;
            eventsContainer.appendChild(eventDiv);
        });
    }
    function showExpandedView(event) {
        const modalContainer = document.getElementById('eventModal');
        modalContainer.innerHTML = `
        <div class="modal-content">
            <img src="${event.imageSrc}" alt="${event.altText}" class="event-image">
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
            <a href="${event.moreInfoLink}">More Info</a>
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
        const top = startHour * 61 + startMinute;
        const height = (endHour * 61 + endMinute) - top;
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
            dateRangeText = `| ${formatDate(weekStart)} ${meses[weekStart.getMonth()]} - ${formatDate(weekEnd)} ${meses[weekEnd.getMonth()]} |`;
        }
    
        if (weekStart.getFullYear() !== weekEnd.getFullYear()) {
            dateRangeText = `| ${formatDate(weekStart)} ${meses[weekStart.getMonth()]} ${weekStart.getFullYear()} - ${formatDate(weekEnd)} ${meses[weekEnd.getMonth()]} ${weekEnd.getFullYear()} |`;
        } else {
            dateRangeText = `| ${formatDate(weekStart)} - ${formatDate(weekEnd)} ${formatMonthYear(weekEnd)} |`;
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
    
    init();

    