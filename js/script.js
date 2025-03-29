document.addEventListener("DOMContentLoaded", function() {

    var hamburger = document.querySelector(".hamburger");
    const menuContent = document.querySelector('.menu-content');

    // Toggle the navigation menu when hamburger is clicked
    hamburger.addEventListener("click", function(e) {
        e.stopPropagation(); // Prevent click from bubbling to document
        toggleMenu();
    });

    function toggleMenu() {
        menuContent.classList.toggle('active');
        hamburger.classList.toggle('open');
        menuContent.classList.toggle('show');
    }

    // Close the navigation menu if clicked outside
    document.addEventListener("click", function(event) {
        if (!menuContent.contains(event.target) && !hamburger.contains(event.target)) {
            closeMenu();
        }
    });

    // Add click event listeners to all navigation links
    const navLinks = menuContent.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            closeMenu();
        });
    });

    // Function to close the menu
    function closeMenu() {
        menuContent.classList.remove('active');
        hamburger.classList.remove('open');
        menuContent.classList.remove('show');
    }



    const itemGroup = document.querySelector('.item-group-mobile');
    const dotsPC = document.querySelectorAll('.dot-pc');

    let currentIndexPC = 0;      // Current index for the PC carousel

    const itemsPerViewPC = 4;    // Number of items per view for PC
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
    fetch('/json/events.json')
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
    
    function openModal() {
        const modal = document.getElementById('videoModal');
        const video = document.getElementById('modalVideo');
        
        modal.style.display = 'block';
        video.play();
        
        // Show ad containers
        leftAd.style.display = 'block';
        rightAd.style.display = 'block';
        
        loadGoogleAds();
    }
    
    function closeModal() {
        const modal = document.getElementById('videoModal');
        const video = document.getElementById('modalVideo');
        
        modal.style.display = 'none';
        video.pause();
        video.currentTime = 0;
        
        // Hide ad containers
        leftAd.style.display = 'none';
        rightAd.style.display = 'none';
        
        // Clear ad contents
        leftAd.innerHTML = '';
        rightAd.innerHTML = '';
    }
    
    // Close modal when clicking outside the video
    window.onclick = function(event) {
        const modal = document.getElementById('videoModal');
        if (event.target == modal) {
            closeModal();
        }
    }


    const messages = [
        "<span class='x-highlight'>X</span>-CEED YOUR LIMITS",
        "<span class='x-highlight'>X</span>-PLORE NEW OPPORTUNITIES",
        "LEARN FROM<span class='x-highlight'>&nbsp;X</span>-PERTS",
        "PURSUE<span class='x-highlight'>&nbsp;X</span>-CELLENCE",
        "<span class='x-highlight'>X</span>-PAND YOUR NETWORK",
        "GET<span class='x-highlight'>&nbsp;X</span>-CLUSIVE INSIGHTS",
        "<span class='x-highlight'>X</span>-PECT THE BEST"
    ];

    function startMessageRotation(containerId, messages, animationClass) {
        let currentIndex = 0;
        const container = document.getElementById(containerId);
    
        function showNextMessage() {
            const currentElement = container.querySelector(`.${animationClass}`);
            
            // Remove previous message with fade-out animation
            if (currentElement) {
                currentElement.classList.add('fade-out');
                setTimeout(() => {
                    currentElement.remove();
                }, 1000);
            }
    
            // Create and show new message
            const newElement = document.createElement('div');
            newElement.className = animationClass;
            newElement.innerHTML = messages[currentIndex];
            container.appendChild(newElement);
    
            // Trigger animation
            setTimeout(() => {
                newElement.classList.add('active');
            }, 100);
    
            // Update index
            currentIndex = (currentIndex + 1) % messages.length;
        }
    
        // Initial display
        showNextMessage();
    
        // Set interval for message rotation
        setInterval(showNextMessage, 2000);
    }
    
    // Define messages and containers
    const sloganMessages = [
        "<span class='x-highlight'>X</span>-CEED YOUR LIMITS",
        "<span class='x-highlight'>X</span>-PLORE NEW OPPORTUNITIES",
        "LEARN FROM<span class='x-highlight'>&nbsp;X</span>-PERTS",
        "PURSUE<span class='x-highlight'>&nbsp;X</span>-CELLENCE",
        "<span class='x-highlight'>X</span>-PAND YOUR NETWORK",
        "GET<span class='x-highlight'>&nbsp;X</span>-CLUSIVE INSIGHTS",
        "<span class='x-highlight'>X</span>-PECT THE BEST"
    ];
    
    const opportunitiesMessages = [
        "Palestras e workshops",
        "Academias e grupos de jovens",
        "Programas de embaixadores",
        "Núcleos de estudantes",
        "Voluntariado",
        "Júnior empresas",
        "Feiras de emprego",
        "Empresas",
        "Instituições de ensino",
        "Associações e federações de estudantes"
    ];
    
    // Start rotations for both sections
    startMessageRotation('textContainerSlogan', sloganMessages, 'animated-text-slogan');
    startMessageRotation('textContainerOpportunities', opportunitiesMessages, 'animated-text-opportunities');
    