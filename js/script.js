document.addEventListener("DOMContentLoaded", function() {
    // simbolo do hamburguer
    var hamburger = document.querySelector(".hamburger");
    const menuContent = document.querySelector('.menu-content');

    // adicionamos um event listener para quando seja clicado abrimos a barra de navegação
    hamburger.addEventListener("click", function(e) {
        e.stopPropagation(); // normalmente usado para menus, impede que o clique se proague para o resto do documento
        menuContent.classList.toggle('active');
        hamburger.classList.toggle('open');
        menuContent.classList.toggle('show');
    });

    // se clicarmos fora da barra de navegação ela fecha
    document.addEventListener("click", function(event) {
        if (!menuContent.contains(event.target) && !hamburger.contains(event.target)) {
            closeMenu();
        }
    });

    // também desliga se clicarmos num dos links
    const navLinks = menuContent.querySelectorAll('a');
    navLinks.forEach(link => { // para cada link metemos um event listener que fecha a nav bar
        link.addEventListener('click', () => {
            closeMenu();
        });
    });

    function closeMenu() {
        menuContent.classList.remove('active');
        hamburger.classList.remove('open');
        menuContent.classList.remove('show');
    }

    // FAQ perguntas
    var questions = document.querySelectorAll(".faq-question");
    
    // para cada pergunta metemos um event listener e quando clicadas mostramos a resposta
    questions.forEach(function(question) {
        question.addEventListener("click", function() {
            var answer = this.nextElementSibling; // isto apanha o próximo element irmão que será a resposta

            // se a pergunta já estiver a ser mostrada, fechamo-la, senão abrimo-la
            if (answer.classList.contains("show")) {
                answer.classList.remove("show");
                this.classList.remove("active");

            } else {
                // quando abrimos uma pergunta fechamos todas as outras
                document.querySelectorAll(".faq-answer.show").forEach(function(item) {
                    item.classList.remove("show");
                    item.previousElementSibling.classList.remove("active");
                });

                answer.classList.add("show");
                this.classList.add("active");
            }
        });
    });

    // para mostrarmos o vídeo da página inicial abrimos o modal video e começamos o vídeo
    if (document.getElementById('videoModal')) {
        window.openModal = function() {
            const modal = document.getElementById('videoModal');
            const video = document.getElementById('modalVideo');
            
            modal.style.display = 'block';
            video.play();
            
            // mostramos um anúncio na esquerda e outro na direita
            /*const leftAd = document.getElementById('leftAd');
            const rightAd = document.getElementById('rightAd');
            
            if (leftAd) leftAd.style.display = 'block';
            if (rightAd) rightAd.style.display = 'block';
            
            if (typeof loadGoogleAds === 'function') {
                loadGoogleAds();
            }*/
        }
        
        // ao fechar o modal video escondemos o mesmo, paramos o video e metemo-lo no início
        window.closeModal = function() {
            const modal = document.getElementById('videoModal');
            const video = document.getElementById('modalVideo');
            
            modal.style.display = 'none';
            video.pause();
            video.currentTime = 0;
            
            // escondemos os anúncios
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
        
        // para fechar o modal basta clicar fora dele
        window.onclick = function(event) {
            const modal = document.getElementById('videoModal');
            if (event.target == modal) {
                closeModal();
            }
        }
    }

    // esta função roda os textos do slogan ou das oportunidades
    function startMessageRotation(containerId, messages, animationClass) { // html container, mensagens, css class
        let currentIndex = 0;
        const container = document.getElementById(containerId); // container onde vamos mostrar as mensagens
        
        if (!container) return;
    
        function showNextMessage() {
            const currentElement = container.querySelector(`.${animationClass}`);
            
            // removemos a mensagem anterior com um fade out de 1 segundo
            if (currentElement) {
                currentElement.classList.add('fade-out');
                setTimeout(() => {
                    currentElement.remove();
                }, 1000);
            }
    
            // e depois mostramos a próxima mensagem criando uma div e adicionando-a ao container
            const newElement = document.createElement('div');
            newElement.className = animationClass;
            newElement.innerHTML = messages[currentIndex];
            container.appendChild(newElement);
    
            setTimeout(() => {
                newElement.classList.add('active');
            }, 100);
    
            // atualizamos o index para ir para a próxima mensagem na lista e usamos o mod para resetar de volta ao início
            currentIndex = (currentIndex + 1) % messages.length;
        }
    
        showNextMessage();
    
        // mostra uma mensagem nova a cada 2 segundos
        setInterval(showNextMessage, 2000);
    }
    
    // slogans e oportunidaddes
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

    // chamamos as funções para ambas as mensagens
    if (document.getElementById('textContainerSlogan')) {
        startMessageRotation('textContainerSlogan', sloganMessages, 'animated-text-slogan');
    }
    
    if (document.getElementById('textContainerOpportunities')) {
        startMessageRotation('textContainerOpportunities', opportunitiesMessages, 'animated-text-opportunities');
    }

    // inicializamos o carrossel que depois vai verificar se é para telemóvel ou computador
    if (typeof initializeCarousel === 'function') {
        initializeCarousel();
    }
});

// Mobile Filter Dropdown Functionality
document.addEventListener('DOMContentLoaded', function() {
    const filterHeader = document.querySelector('.filter-header-mobile');
    const filterOptions = document.querySelector('.filter-options-mobile');
   
    if (filterHeader && filterOptions) {
        // Add click event to toggle dropdown
        filterHeader.addEventListener('click', function() {
            // Toggle the active class on header (for arrow rotation)
            filterHeader.classList.toggle('active');
           
            // Toggle the open class on options (for showing/hiding)
            filterOptions.classList.toggle('open');
        });
        // Make header focusable for accessibility
        filterHeader.setAttribute('tabindex', '0');
        filterHeader.setAttribute('role', 'button');
        filterHeader.setAttribute('aria-expanded', 'false');
        filterHeader.setAttribute('aria-controls', 'filterOptionsMobile');
        // Update aria-expanded when dropdown state changes
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const isOpen = filterOptions.classList.contains('open');
                    filterHeader.setAttribute('aria-expanded', isOpen.toString());
                }
            });
        });
       
        observer.observe(filterOptions, { attributes: true });
    }

    // Function to count how many checkboxes are currently checked
    function getCheckedCount() {
        const checkboxes = document.querySelectorAll('.filter-checkbox');
        let checkedCount = 0;
        checkboxes.forEach(function(checkbox) {
            if (checkbox.checked) {
                checkedCount++;
            }
        });
        return checkedCount;
    }

    // Function to update checkbox states (disable/enable based on checked count)
    function updateCheckboxStates() {
        const checkboxes = document.querySelectorAll('.filter-checkbox');
        const checkedCount = getCheckedCount();
        
        checkboxes.forEach(function(checkbox) {
            if (checkbox.checked && checkedCount === 1) {
                // This is the last checked checkbox, disable it
                checkbox.disabled = true;
                checkbox.parentElement.style.opacity = '0.6';
                checkbox.parentElement.style.cursor = 'not-allowed';
            } else {
                // Enable the checkbox
                checkbox.disabled = false;
                checkbox.parentElement.style.opacity = '1';
                checkbox.parentElement.style.cursor = 'pointer';
            }
        });
    }

    const checkboxes = document.querySelectorAll('.filter-checkbox');
    checkboxes.forEach(function(checkbox) {
        checkbox.addEventListener('change', function() {
            const category = this.getAttribute('data-category');
            const isChecked = this.checked;
            
            // If trying to uncheck and it would leave no checkboxes checked, prevent it
            if (!isChecked && getCheckedCount() === 0) {
                this.checked = true; // Force it back to checked
                
                // Show a brief visual feedback
                const label = this.parentElement;
                const originalBg = label.style.backgroundColor;
                label.style.backgroundColor = '#ffebee';
                label.style.transition = 'background-color 0.3s ease';
                
                setTimeout(function() {
                    label.style.backgroundColor = originalBg;
                }, 500);
                
                // Optional: Show a tooltip or message
                showMinimumFilterMessage();
                return;
            }
           
            // Update checkbox states after change
            updateCheckboxStates();
            
            // Handle the filter change
            handleFilterChange();
           
            // Dispatch custom event for other parts of your app
            document.dispatchEvent(new CustomEvent('filterChange', {
                detail: {
                    category: category,
                    enabled: isChecked,
                    element: this
                }
            }));
        });
    });

    // Function to show a brief message when user tries to disable the last filter
    function showMinimumFilterMessage() {
        // Remove any existing message
        const existingMessage = document.querySelector('.minimum-filter-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create and show message
        const message = document.createElement('div');
        message.className = 'minimum-filter-message';
        message.textContent = 'Deve manter pelo menos um filtro ativo!';

        document.body.appendChild(message);

        // Remove message after animation
        setTimeout(function() {
            if (message.parentNode) {
                message.remove();
            }
        }, 2000);
    }

    // Initialize checkbox states on page load
    updateCheckboxStates();
});