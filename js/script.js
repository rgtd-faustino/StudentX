document.addEventListener("DOMContentLoaded", function() {
    // Hamburger menu functionality
    var hamburger = document.querySelector(".hamburger");
    const menuContent = document.querySelector('.menu-content');

    // Toggle the navigation menu when hamburger is clicked
    hamburger.addEventListener("click", function(e) {
        e.stopPropagation(); // Prevent click from bubbling to document
                menuContent.classList.toggle('active');
        hamburger.classList.toggle('open');
        menuContent.classList.toggle('show');
    });

    // if we click outside of the navigation bar it closes
    document.addEventListener("click", function(event) {
        if (!menuContent.contains(event.target) && !hamburger.contains(event.target)) {
            closeMenu();
        }
    });

    // if we click on the links of the nav bar it also closes
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

    // FAQ functionality
    var questions = document.querySelectorAll(".faq-question");
    
    questions.forEach(function(question) {
        question.addEventListener("click", function() {
            // after the question, the next element is the response itself
            var answer = this.nextElementSibling;

            // if the question is already showing then we'll close it, if it's not already showing then it'll be now
            if (answer.classList.contains("show")) {
                answer.classList.remove("show");
                this.classList.remove("active");

            } else {
                document.querySelectorAll(".faq-answer.show").forEach(function(item) {
                    item.classList.remove("show");
                    item.previousElementSibling.classList.remove("active");
                });

                answer.classList.add("show");
                this.classList.add("active");
            }
        });
    });

    // to show the video on the homepage we'll open the modal space and add ads 
    if (document.getElementById('videoModal')) {
        window.openModal = function() {
            const modal = document.getElementById('videoModal');
            const video = document.getElementById('modalVideo');
            
            modal.style.display = 'block';
            video.play();
            
            // we show the ads on both the sides of the screen
            /*const leftAd = document.getElementById('leftAd');
            const rightAd = document.getElementById('rightAd');
            
            if (leftAd) leftAd.style.display = 'block';
            if (rightAd) rightAd.style.display = 'block';
            
            if (typeof loadGoogleAds === 'function') {
                loadGoogleAds();
            }*/
        }
        
        // to close the modal we simply display it as none, stop and reset the video and hide the ads
        window.closeModal = function() {
            const modal = document.getElementById('videoModal');
            const video = document.getElementById('modalVideo');
            
            modal.style.display = 'none';
            video.pause();
            video.currentTime = 0;
            
            /*const leftAd = document.getElementById('leftAd');
            const rightAd = document.getElementById('rightAd');
            
            if (leftAd) {
                leftAd.style.display = 'none';
                leftAd.innerHTML = '';
            }
            if (rightAd) {
                rightAd.style.display = 'none';
                rightAd.innerHTML = '';
            }*/
        }
        
        // if we click outside the modal we close it
        window.onclick = function(event) {
            const modal = document.getElementById('videoModal');
            if (event.target == modal) {
                closeModal();
            }
        }
    }

    // this function serves the purpose of showing rotating texts with either the slogan or the opportunities messages
    function startMessageRotation(containerId, messages, animationClass) {
        let currentIndex = 0;
        const container = document.getElementById(containerId);
        
        if (!container) return;
    
        function showNextMessage() {
            const currentElement = container.querySelector(`.${animationClass}`);
            
            // we remove previous message with fade-out animation during 1 second
            if (currentElement) {
                currentElement.classList.add('fade-out');
                setTimeout(() => {
                    currentElement.remove();
                }, 1000);
            }
    
            // after hiding the preivous one we'll show the next message
            const newElement = document.createElement('div');
            newElement.className = animationClass;
            newElement.innerHTML = messages[currentIndex];
            container.appendChild(newElement);
    
            setTimeout(() => {
                newElement.classList.add('active');
            }, 100);
    
            // update the index, at the end it resets
            currentIndex = (currentIndex + 1) % messages.length;
        }
    
        showNextMessage();
    
        // shows a message each 2 seconds
        setInterval(showNextMessage, 2000);
    }
    
    // slogans and opportunities
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

    // call the functions on them
    if (document.getElementById('textContainerSlogan')) {
        startMessageRotation('textContainerSlogan', sloganMessages, 'animated-text-slogan');
    }
    
    if (document.getElementById('textContainerOpportunities')) {
        startMessageRotation('textContainerOpportunities', opportunitiesMessages, 'animated-text-opportunities');
    }

    performMaintenanceCleanup();
    
    // now at the end we start the carousel
    initializeCarousel();
});
