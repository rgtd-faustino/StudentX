
// ========== NOTIFICATION SYSTEM ==========
class NotificationSystem {
    constructor() {
        this.container = document.getElementById('notificationContainer');
        this.notifications = new Map();
        this.counter = 0;
    }

    show(type = 'info', title = '', message = '', options = {}) {
        const id = ++this.counter;
        const notification = this.createNotification(id, type, title, message, options);
        
        this.container.appendChild(notification);
        this.notifications.set(id, notification);

        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        if (!options.persistent) {
            const duration = options.duration || 5000;
            setTimeout(() => this.hide(id), duration);
        }

        return id;
    }

    createNotification(id, type, title, message, options) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.dataset.id = id;

        const icons = {
            success: '✅',
            error: '❌', 
            warning: '⚠️',
            info: 'ℹ️'
        };

        const titles = {
            success: title || 'Sucesso!',
            error: title || 'Erro!',
            warning: title || 'Atenção!',
            info: title || 'Informação'
        };

        let actionsHTML = '';
        if (options.actions && options.actions.length > 0) {
            actionsHTML = '<div class="notification-actions">';
            options.actions.forEach(action => {
                actionsHTML += `<button class="notification-action ${action.type || 'primary'}" onclick="${action.onClick}">${action.text}</button>`;
            });
            actionsHTML += '</div>';
        }

        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">${icons[type]}</div>
                <div class="notification-text">
                    <div class="notification-title">${titles[type]}</div>
                    <div class="notification-message">${message}</div>
                    ${actionsHTML}
                </div>
                ${!options.persistent ? '<button class="notification-close" onclick="notifications.hide(' + id + ')">×</button>' : ''}
            </div>
            ${!options.persistent ? '<div class="notification-progress"></div>' : ''}
        `;

        if (!options.silent) {
            notification.classList.add('sound-wave');
        }

        return notification;
    }

    hide(id) {
        const notification = this.notifications.get(id);
        if (!notification) return;

        notification.classList.add('hide');
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            this.notifications.delete(id);
        }, 400);
    }

    hideAll() {
        this.notifications.forEach((notification, id) => {
            this.hide(id);
        });
    }

    success(title, message, options = {}) {
        return this.show('success', title, message, options);
    }

    error(title, message, options = {}) {
        return this.show('error', title, message, options);
    }

    warning(title, message, options = {}) {
        return this.show('warning', title, message, options);
    }

    info(title, message, options = {}) {
        return this.show('info', title, message, options);
    }
}