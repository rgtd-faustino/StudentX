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

});    




document.addEventListener('DOMContentLoaded', function() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const weeks = [];   
    const dayNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

    const monthNamesInPortuguese = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", 
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
   
    let currentDay = 1;

    // Create the weeks for the current month
    while (currentDay <= daysInMonth) {
        const week = [];
        for (let i = 0; i < 7; i++) {
            if ((currentDay === 1 && i < firstDay) || currentDay > daysInMonth) {
                week.push(null);
            } else {
                week.push(currentDay++);
            }
        }
        weeks.push(week);
    }

    // Fill the last week with the next month's days
    const lastWeek = weeks[weeks.length - 1];
    let overflowDay = 1;
    for (let i = 0; i < 7; i++) {
        if (lastWeek[i] === null && currentDay > daysInMonth) {
            lastWeek[i] = overflowDay++;
        }
    }

    let currentWeekIndex = 0;

    // Function to render the week
    function renderWeek() {
        const calendar = document.getElementById('calendar');
        const weekRange = document.getElementById('weekRange');
        calendar.innerHTML = ''; // Clear existing days
        const week = weeks[currentWeekIndex];
    
        // Create each day as a button with both the day name and number
        const weekRow = document.createElement('div');
        weekRow.classList.add('week-row');
        week.forEach((day, index) => {
            const dayElement = document.createElement('button');
            dayElement.classList.add('day-button');
    
            if (day !== null) {
                dayElement.innerHTML = `${dayNames[index]}<br>${day}`;
            } else {
                dayElement.textContent = `${dayNames[index]}`;
                dayElement.classList.add('empty-day');
                dayElement.disabled = true;
            }
            
            weekRow.appendChild(dayElement);
        });
        calendar.appendChild(weekRow);
    
        // Update the week range display
        const firstDayOfWeek = week.find(day => day !== null);
        const lastDayOfWeek = [...week].reverse().find(day => day !== null);
    
        const translatedMonthName = monthNamesInPortuguese[month];
    
        const firstDayIndex = week.indexOf(firstDayOfWeek);
        const lastDayIndex = week.indexOf(lastDayOfWeek);
    
        const translatedFirstDayOfWeek = dayNames[firstDayIndex];
        const translatedLastDayOfWeek = dayNames[lastDayIndex];
    
        weekRange.textContent = `${firstDayOfWeek} - ${lastDayOfWeek} ${translatedMonthName} ${year}`;
    }

    // Function to create and display the grid
    function displayGrid(showGrid) {
        const calendar = document.getElementById('calendar-grid-events');
        
        // Remove the grid if `showGrid` is false
        if (!showGrid) {
            const existingGrid = calendar.querySelector('.grid-container');
            if (existingGrid) {
                calendar.removeChild(existingGrid);
            }
            return;
        }

        // Create and display the grid
        const gridContainer = document.createElement('div');
        gridContainer.classList.add('grid-container');

        for (let i = 0; i < 5; i++) {
            const column = document.createElement('div');
            column.classList.add('grid-column');
            column.textContent = `Column ${i + 1}`;
            gridContainer.appendChild(column);
        }

        // Remove any existing grid before adding a new one
        const existingGrid = calendar.querySelector('.grid-container');
        if (existingGrid) {
            calendar.removeChild(existingGrid);
        }

        calendar.appendChild(gridContainer);
    }

    // Function to attach event listeners to day buttons
    function attachDayButtonListeners() {
        const dayButtons = document.querySelectorAll('.day-button');

        dayButtons.forEach(button => {
            button.addEventListener('click', function() {
                dayButtons.forEach(btn => btn.classList.remove('selected'));
                this.classList.add('selected');

                // Display grid when a day is selected, or remove it if no button is selected
                if (this.classList.contains('selected')) {
                    displayGrid(true); // Display grid
                } else {
                    displayGrid(false); // Hide grid
                }
            });
        });

        // Additional logic to hide the grid if no buttons are selected
        document.addEventListener('click', function(event) {
            if (!event.target.classList.contains('day-button')) {
                dayButtons.forEach(btn => btn.classList.remove('selected'));
                displayGrid(false); // Hide grid if no day button is selected
            }
        });

        
    }

    // Function to create and display the hours column
    function displayHoursColumn() {
        const hoursColumn = document.querySelector('.hours-column');
        
        for (let i = 0; i < 24; i++) {
            const hourDiv = document.createElement('div');
            hourDiv.className = 'hour';
            hourDiv.textContent = `${i.toString().padStart(2, '0')}:00`;
            hoursColumn.appendChild(hourDiv);
        }
    }

    // Call the function to display the hours column
    displayHoursColumn();


    // Button event listeners for previous and next weeks
    document.getElementById('prevWeek').addEventListener('click', () => {
        if (currentWeekIndex > 0) {
            currentWeekIndex--;
            renderWeek();
            attachDayButtonListeners();
        }
    });

    document.getElementById('nextWeek').addEventListener('click', () => {
        if (currentWeekIndex < weeks.length - 1) {
            currentWeekIndex++;
            renderWeek();
            attachDayButtonListeners();
        }
    });

    // Initial render of the first week
    renderWeek();
    attachDayButtonListeners();
});

document.addEventListener('DOMContentLoaded', function() {
    // Select all elements with the class 'day-button'
    const dayButtons = document.querySelectorAll('.day-button');

        // Add 'selected' class to the first button
        if (dayButtons.length > 0) {
            dayButtons[0].classList.add('selected');
        }

        // Add click event listener to each button
        dayButtons.forEach(button => {
            button.addEventListener('click', function() {
            // Remove 'selected' class from all buttons
            dayButtons.forEach(btn => btn.classList.remove('selected'));
            
            // Add 'selected' class to the clicked button
            this.classList.add('selected');

        });
    });
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
  



