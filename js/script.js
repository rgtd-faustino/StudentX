document.addEventListener("DOMContentLoaded", function() {
    // Hamburger menu code
    var hamburger = document.querySelector(".hamburger");
    const menuContent = document.querySelector('.menu-content');

    if (hamburger && menuContent) {
        hamburger.addEventListener("click", function(e) {
            e.stopPropagation();
            toggleMenu();
        });

        function toggleMenu() {
            menuContent.classList.toggle('active');
            hamburger.classList.toggle('open');
            menuContent.classList.toggle('show');
        }

        document.addEventListener("click", function(event) {
            if (!menuContent.contains(event.target) && !hamburger.contains(event.target)) {
                closeMenu();
            }
        });

        const navLinks = menuContent.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                closeMenu();
            });
        });

        function closeMenu() {
            menuContent.classList.remove('active');
            hamburger.classList.remove('open');
            menuContent.classList.remove('show');
        }
    }

    // PC Carousel code (only execute if window width >= 600)
    if (window.innerWidth >= 600) {
        const itemGroup = document.querySelector('.item-group-mobile');
        const dotsPC = document.querySelectorAll('.dot-pc');

        if (itemGroup && dotsPC.length > 0) {
            let currentIndexPC = 0;
            const itemsPerViewPC = 4;
            const totalItems = 12;

            function updateTransformPC() {
                const translatePercentage = -(currentIndexPC / totalItems) * 100 * (totalItems / itemsPerViewPC);
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

            updateTransformPC();
            
            const nextBtn = document.getElementById('next-mobile');
            const prevBtn = document.getElementById('prev-mobile');
            
            if (nextBtn) {
                nextBtn.addEventListener('click', () => {
                    if (currentIndexPC >= totalItems - itemsPerViewPC) {
                        currentIndexPC = 0;
                    } else {
                        currentIndexPC += itemsPerViewPC;
                    }
                    updateTransformPC();
                });
            }
            
            if (prevBtn) {
                prevBtn.addEventListener('click', () => {
                    if (currentIndexPC <= 0) {
                        currentIndexPC = totalItems - itemsPerViewPC;
                    } else {
                        currentIndexPC -= itemsPerViewPC;
                    }
                    updateTransformPC();
                });
            }
        }
    }

    // Mobile Carousel with swipe functionality (only execute if window width <= 600)
    if (window.innerWidth <= 600) {
        // Function to create carousel items dynamically
        function createCarouselItems(data) {
            const container = document.getElementById('item-group-1-mobile');
            if (!container) return;
            
            // Clear previous items if any
            container.innerHTML = '';
            
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
            
            // Initialize swipe functionality after a short delay to ensure DOM is ready
            setTimeout(initSwipeFunctionality, 100);
        }
        
        // Fetch the JSON file and populate the carousel
        fetch('/json/events.json')
            .then(response => response.json())
            .then(data => createCarouselItems(data))
            .catch(error => {
                console.error('Error loading carousel data:', error);
                // Initialize swipe even if fetch fails (in case items are already in DOM)
                setTimeout(initSwipeFunctionality, 100);
            });
        
        // Function to initialize swipe functionality
        function initSwipeFunctionality() {
            const carousel = document.querySelector('.carousel-mobile');
            const items = document.querySelectorAll('.item-container-mobile');
            
            if (!carousel || items.length === 0) {
                console.log("Carousel or items not found, will try again later");
                return; // Exit if elements aren't found
            }
            
            console.log("Initializing swipe with", items.length, "items");
            
            let currentIndex = 0;
            let startX, moveX;
            let isDragging = false;
            let currentTranslate = 0;
            let prevTranslate = 0;
            
            // Use event delegation to handle all events on the carousel container
            // This handles touch events on the carousel
            carousel.addEventListener('touchstart', function(e) {
                console.log("Touch started"); // Add debugging
                isDragging = true;
                startX = e.touches[0].clientX;
                
                // Find closest item container
                const touchedItem = e.target.closest('.item-container-mobile') || items[currentIndex];
                
                // Set current index based on found item
                items.forEach((item, idx) => {
                    if (item === touchedItem) currentIndex = idx;
                });
                
                // Add active class
                items[currentIndex].classList.add('active');
                
                // Prevent default behavior
                e.preventDefault();
            }, { passive: false });
            
            carousel.addEventListener('touchmove', function(e) {
                if (!isDragging) return;
                
                moveX = e.touches[0].clientX;
                
                // Calculate how far we've moved
                const currentPosition = moveX - startX;
                currentTranslate = prevTranslate + currentPosition;
                
                // Add rotation effect based on swipe direction/distance
                const rotate = currentPosition / 20;
                
                // Apply transform for tinder-like effect
                items[currentIndex].style.transform = `translateX(${currentPosition}px) rotate(${rotate}deg)`;
                
                // Change shadow color based on swipe direction
                if (currentPosition > 0) {
                    // Swiping right (green indicator)
                    items[currentIndex].style.boxShadow = `0 0 10px rgba(0, 255, 0, ${Math.min(Math.abs(currentPosition) / 200, 0.5)})`;
                } else if (currentPosition < 0) {
                    // Swiping left (red indicator)
                    items[currentIndex].style.boxShadow = `0 0 10px rgba(255, 0, 0, ${Math.min(Math.abs(currentPosition) / 200, 0.5)})`;
                }
                
                // Prevent default to stop scrolling
                if (!e.target.closest('a.button-carousel-mobile')) {
                    e.preventDefault();
                }
            }, { passive: false });
            
            carousel.addEventListener('touchend', function(e) {
                if (!isDragging) return;
                
                isDragging = false;
                const movedBy = currentTranslate - prevTranslate;
                
                // Reset active class
                items[currentIndex].classList.remove('active');
                
                // If moved enough to register as a swipe
                if (Math.abs(movedBy) > 50) { // Lower threshold for easier swiping
                    if (movedBy < 0) {
                        // Swiped left - go to next item
                        if (currentIndex < items.length - 1) {
                            // Animate current item flying off to the left
                            animateSwipe(items[currentIndex], -window.innerWidth, -15);
                            setTimeout(() => {
                                // After animation, hide current and show next
                                items[currentIndex].style.display = 'none';
                                currentIndex++;
                                // Make sure next item is visible and properly positioned
                                if (items[currentIndex]) {
                                    items[currentIndex].style.display = 'block';
                                    items[currentIndex].style.transform = 'translateX(0) rotate(0deg)';
                                    items[currentIndex].style.boxShadow = 'none';
                                }
                            }, 300);
                        }
                    } else {
                        // Swiped right - go to previous item
                        if (currentIndex > 0) {
                            // Animate current item flying off to the right
                            animateSwipe(items[currentIndex], window.innerWidth, 15);
                            setTimeout(() => {
                                // After animation, hide current and show previous
                                items[currentIndex].style.display = 'none';
                                currentIndex--;
                                // Make sure previous item is visible and properly positioned
                                if (items[currentIndex]) {
                                    items[currentIndex].style.display = 'block';
                                    items[currentIndex].style.transform = 'translateX(0) rotate(0deg)';
                                    items[currentIndex].style.boxShadow = 'none';
                                }
                            }, 300);
                        }
                    }
                } else {
                    // If not swiped far enough, return to center
                    items[currentIndex].style.transform = 'translateX(0) rotate(0deg)';
                    items[currentIndex].style.boxShadow = 'none';
                }
                
                // Hide all items except the current one
                items.forEach((item, idx) => {
                    if (idx !== currentIndex) {
                        item.style.display = 'none';
                    } else {
                        item.style.display = 'block';
                    }
                });
                
                // Reset tracking variables
                prevTranslate = currentTranslate;
            });
            
            // Animate the swipe effect
            function animateSwipe(element, targetX, rotation) {
                element.style.transition = 'transform 0.3s ease-out';
                element.style.transform = `translateX(${targetX}px) rotate(${rotation}deg)`;
                
                // Remove transition after animation completes
                setTimeout(() => {
                    element.style.transition = '';
                }, 300);
            }
            
            // Set initial state - hide all items except the first one
            items.forEach((item, index) => {
                if (index !== 0) {
                    item.style.display = 'none';
                }
            });
            
            console.log("Swipe functionality initialized");
        }
    }

    // FAQ accordion functionality
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
    
    // Initialize text animations
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
    
    function startMessageRotation(containerId, messages, animationClass) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        let currentIndex = 0;
        
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
    
    // Start rotations if elements exist
    if (document.getElementById('textContainerSlogan')) {
        startMessageRotation('textContainerSlogan', sloganMessages, 'animated-text-slogan');
    }
    
    if (document.getElementById('textContainerOpportunities')) {
        startMessageRotation('textContainerOpportunities', opportunitiesMessages, 'animated-text-opportunities');
    }

    setTimeout(initSwipeFunctionality, 500);
});