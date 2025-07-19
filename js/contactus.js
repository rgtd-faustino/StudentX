function showForm(formType) {
    const overlay = document.getElementById('overlay');
    const messageForm = document.getElementById('message-form');
    const eventForm = document.getElementById('event-form');
    
    // Hide overlay with animation
    overlay.classList.add('hidden');
    
    // Show appropriate form after overlay animation completes
    setTimeout(() => {
        if (formType === 'message') {
            messageForm.classList.add('active');
        } else if (formType === 'event') {
            eventForm.classList.add('active');
        }
    }, 300);
}

function hideForm() {
    const overlay = document.getElementById('overlay');
    const messageForm = document.getElementById('message-form');
    const eventForm = document.getElementById('event-form');
    
    // Hide forms
    messageForm.classList.remove('active');
    eventForm.classList.remove('active');
    
    // Show overlay after form animation completes
    setTimeout(() => {
        overlay.classList.remove('hidden');
    }, 300);
}

// File input handling
document.getElementById('event-image').addEventListener('change', function() {
    const label = document.getElementById('file-label');
    const fileName = this.files[0] ? this.files[0].name : 'Clica para selecionar uma imagem';
    label.textContent = this.files[0] ? `📷 ${fileName}` : '📷 Clica para selecionar uma imagem';
});