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
        function updateTransformMobile() {
            // Calculate the percentage translation based on currentIndex
            const translatePercentage = -(currentIndexMobile / totalItems) * 100 * (totalItems / itemsPerViewMobile);
            
            // Apply the transform inline to the itemGroup element, ensuring no scaling is applied
            itemGroup.style.transform = `translateX(${translatePercentage}%)`;
            
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
        // Initial call to set the correct active dot
        updateTransformMobile();
        
        document.getElementById('next-mobile').addEventListener('click', () => {
            if (currentIndexMobile >= totalItems - itemsPerViewMobile) {
                // Reset to the beginning
                currentIndexMobile = 0;
            } else {
                currentIndexMobile += itemsPerViewMobile;
            }
            updateTransformMobile();
        });
        
        document.getElementById('prev-mobile').addEventListener('click', () => {
            if (currentIndexMobile <= 0) {
                // Move to the end
                currentIndexMobile = totalItems - itemsPerViewMobile;
            } else {
                currentIndexMobile -= itemsPerViewMobile;
            }
            updateTransformMobile();
        });
    }
    

    function addEvent(day, startTime, endTime, title) {
        const calendar = document.getElementById('calendar-carousel');
  
        const eventElement = document.createElement('div');
        eventElement.className = 'event';
        eventElement.innerHTML = title;
  
        const startHour = parseInt(startTime.split(':')[0]);
        const endHour = parseInt(endTime.split(':')[0]);
  
        eventElement.style.gridRowStart = startHour + 1;
        eventElement.style.gridRowEnd = endHour + 1;
  
        const dayElement = calendar.querySelector(`[data-day="${day}"]`);
        if (dayElement) {
          dayElement.appendChild(eventElement);
        }
      }
  
      // Fetch events from the JSON file
      fetch('events.json')
        .then(response => response.json())
        .then(events => {
          events.forEach(event => {
            addEvent(event.day, event.startTime, event.endTime, event.title);
          });
        })
        .catch(error => console.error('Error loading events:', error));


        
    
});






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
    fetch('carousel-data.json')
      .then(response => response.json())
      .then(data => createCarouselItems(data))
      .catch(error => console.error('Error loading carousel data:', error));
  });
  









  document.addEventListener('DOMContentLoaded', function() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // Current month
    const daysInMonth = new Date(year, month + 1, 0).getDate(); // Days in month
    const firstDay = new Date(year, month, 1).getDay(); // First day of the month (0 = Sunday)
    const weeks = [];
    const dayNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  
    let currentDay = 1;
    
    // Create weeks
    while (currentDay <= daysInMonth) {
      const week = [];
      
      for (let i = 0; i < 7; i++) {
        if (currentDay > daysInMonth) break;
        week.push(currentDay++);
      }
      
      weeks.push(week);
    }
    
    const carouselWeek = document.getElementById('carousel-week');
    let currentWeekIndex = 0;
    let events = [];

    
    // Fetch events from the JSON file
    fetch('events.json')
    .then(response => response.json())
    .then(data => {
    events = data;
    renderWeek(); // Initial rendering of the first week after loading events
    })
    .catch(error => console.error('Error loading events:', error));

    // Function to render the current week
    function renderWeek() {
        carouselWeek.innerHTML = ''; // Clear the current content
        const week = weeks[currentWeekIndex];
        const weekDiv = document.createElement('div');
        weekDiv.classList.add('week');
        
        week.forEach(day => {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('day');
        dayDiv.textContent = `${dayNames[(firstDay + day - 1) % 7]} ${day}`;
        
        // Filter events for the current day
        const dayEvents = events.filter(event => event.day === day);
        
        // Add event details to the day div
        dayEvents.forEach(event => {
            const eventDiv = document.createElement('div');
            eventDiv.classList.add('event');
            eventDiv.innerHTML = `
            <div class="event-title">${event.title}</div>
            <div class="event-time">${event.startTime} - ${event.endTime}</div>
            `;
            dayDiv.appendChild(eventDiv);
        });
    
        weekDiv.appendChild(dayDiv);
        });
    
        carouselWeek.appendChild(weekDiv);
    }
    
    // Navigation controls
    document.getElementById('prevWeek').addEventListener('click', () => {
        if (currentWeekIndex > 0) {
        currentWeekIndex--;
        renderWeek();
        }
    });
    
    document.getElementById('nextWeek').addEventListener('click', () => {
        if (currentWeekIndex < weeks.length - 1) {
        currentWeekIndex++;
        renderWeek();
        }
    });
});