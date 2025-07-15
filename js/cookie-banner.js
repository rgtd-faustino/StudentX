const CONSENT_CONFIG = {
    version: '1.0',
    cookieCategories: {
        essential: {
            name: 'Essenciais',
            required: true,
            sameSite: 'Lax',
            maxAge: 365,
            description: 'Cookies estritamente necessários para o funcionamento do website. Validade: 1 ano',
            purposes: ['Autenticação', 'Segurança', 'Preferências de eventos'],
            duration: '1 ano',
            cookies: [
                'cookieConsent',
                'userEventPreferences_accepted',
                'userEventPreferences_rejected',
                'userEventDay'
            ]
        },
        analytics: {
            name: 'Análise',
            required: false,
            sameSite: 'Lax',
            maxAge: 90,
            description: 'Cookies para análise de uso do website através do Google Analytics. Validade: 3 meses',
            purposes: ['Análise de tráfego', 'Melhorias do website', 'Estatísticas de uso'],
            thirdParties: ['Google LLC'],
            dataTransfers: ['Estados Unidos (adequacy decision)'],
            duration: '3 meses',
            cookies: ['_ga', '_gid', '_gat_*', '_ga_*'],
            scripts: [
                {
                    id: 'analytics-proxy',
                    init: async function(manager) {
                        if (!manager.hasConsent('analytics')) return;
                        
                        try {
                            const response = await fetch('https://analytics-proxyjs.contact-studentx.workers.dev/', {
                                method: 'GET',
                                mode: 'cors',
                                credentials: 'omit',
                                headers: {
                                    'X-Requested-With': 'XMLHttpRequest',
                                    'Origin': window.location.origin
                                }
                            });
                            
                            if (!response.ok) {
                                throw new Error(`HTTP error! status: ${response.status}`);
                            }
                            
                            const script = await response.text();
                            const scriptElement = document.createElement('script');
                            scriptElement.textContent = script;
                            scriptElement.async = true;
                            scriptElement.setAttribute('data-category', 'analytics');
                            document.head.appendChild(scriptElement);
                        } catch (error) {
                            console.error('Analytics loading failed:', error);
                        }
                    }
                }
            ]
        },
        marketing: {
            name: 'Publicidade',
            required: false,
            sameSite: 'None',
            maxAge: 90,
            duration: '3 meses',
            description: 'Cookies para publicidade personalizada através do Google Ads. Validade: 3 meses',
            purposes: ['Publicidade direcionada', 'Personalização de anúncios', 'Medição de eficácia'],
            thirdParties: ['Google LLC'],
            dataTransfers: ['Estados Unidos (adequacy decision)'],
            cookies: ['_gcl_au', '__gads', '__gpi'],
            scripts: [
                {
                    id: 'google-adsense',
                    init: function(manager) {
                        if (!manager.hasConsent('marketing')) return;
                        
                        const existingScript = document.querySelector('script[src*="adsbygoogle.js"]');
                        if (existingScript) return;
                        
                        const adsenseScript = document.createElement('script');
                        adsenseScript.async = true;
                        adsenseScript.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2455279266517679';
                        adsenseScript.crossOrigin = 'anonymous';
                        document.head.appendChild(adsenseScript);
                    }
                }
            ]
        }
    }
};

class CookieConsentManager {
    constructor() {
        this.consentData = null;
        this.domElements = {};
        this.initialized = false;
        this.loadedScripts = new Set();
        this.consentExpiryDays = 365;
    }

    init() {
        if (this.initialized) return;
        
        this.initializeConsentMode();
        this.loadSavedConsent();
        this.setupDOMElements();
        this.setupEventListeners();
        this.checkAndEnforceExpiry();
        
        if (!this.consentData || !this.isConsentValid()) {
            this.blockTrackingScripts();
            this.showBanner();
        } else {
            this.applyConsent();
        }
        
        this.initialized = true;
    }

    hasConsent(category) {
        return this.consentData?.[category] === true && this.isConsentValid();
    }

    isConsentValid() {
        if (!this.consentData?.timestamp) return false;
        
        const consentDate = new Date(this.consentData.timestamp);
        const expiryDate = new Date(consentDate.getTime() + (this.consentExpiryDays * 24 * 60 * 60 * 1000));
        
        return new Date() < expiryDate;
    }

    blockTrackingScripts() {
        const blockedPatterns = [
            'google-analytics.com',
            'googletagmanager.com',
            'googlesyndication.com',
            'googleadservices.com'
        ];
        
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.tagName === 'SCRIPT' && node.src) {
                        const shouldBlock = blockedPatterns.some(pattern => node.src.includes(pattern));
                        
                        if (shouldBlock && !node.hasAttribute('data-category')) {
                            const category = this.getScriptCategory(node.src);
                            
                            if (!this.hasConsent(category)) {
                                console.log('Blocking unconsented script:', node.src);
                                if (node.parentNode) {
                                    node.parentNode.removeChild(node);
                                }
                            }
                        }
                    }
                });
            });
        });
        
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }

    getScriptCategory(src) {
        if (src.includes('google-analytics.com') || src.includes('googletagmanager.com')) {
            return 'analytics';
        }
        if (src.includes('googlesyndication.com') || src.includes('googleadservices.com')) {
            return 'marketing';
        }
        return 'analytics';
    }

    setupDOMElements() {
        this.domElements = {
            banner: document.getElementById('cookieBanner'),
            acceptAllBtn: document.getElementById('accept-all'),
            rejectAllBtn: document.getElementById('reject-all'),
            moreOptionsBtn: document.getElementById('more-options'),
            acceptSelectedBtn: document.getElementById('accept-selected'),
            rejectAllExpandedBtn: document.getElementById('reject-all-expanded'),
            analyticsCookie: document.getElementById('analytics-cookies'),
            marketingCookie: document.getElementById('marketing-cookies'),
            privacyPolicyLink: document.getElementById('read-more')
        };
    }

    setupEventListeners() {
        this.domElements.acceptAllBtn?.addEventListener('click', () => this.handleAcceptAll());
        this.domElements.rejectAllBtn?.addEventListener('click', () => this.handleRejectAll());
        this.domElements.moreOptionsBtn?.addEventListener('click', () => this.expandBanner());
        this.domElements.acceptSelectedBtn?.addEventListener('click', () => this.handleSavePreferences());
        this.domElements.rejectAllExpandedBtn?.addEventListener('click', () => this.handleRejectAll());
        
        this.domElements.privacyPolicyLink?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showPrivacyPolicy();
        });
        
        document.querySelectorAll('.manage-cookies').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.showBanner();
                this.expandBanner();
            });
        });
    }

    loadSavedConsent() {
        const savedConsent = this.getCookie('cookieConsent');
        if (savedConsent) {
            try {
                this.consentData = JSON.parse(savedConsent);
                
                if (this.consentData.version !== CONSENT_CONFIG.version || !this.isConsentValid()) {
                    this.resetConsent();
                    return;
                }
            } catch (e) {
                console.error('Error parsing saved consent:', e);
                this.consentData = null;
            }
        }
    }

    async handleAcceptAll() {
        await this.removeAllTrackingScripts();
        await this.removeAllTrackingCookies();
        
        this.saveConsent({
            essential: true,
            analytics: true,
            marketing: true
        });
    }

    async handleRejectAll() {
        await this.removeAllTrackingScripts();
        await this.removeAllTrackingCookies();
        
        this.saveConsent({
            essential: true,
            analytics: false,
            marketing: false
        });
    }

    async handleSavePreferences() {
        await this.removeAllTrackingScripts();
        await this.removeAllTrackingCookies();
        
        this.saveConsent({
            essential: true,
            analytics: this.domElements.analyticsCookie?.checked || false,
            marketing: this.domElements.marketingCookie?.checked || false
        });
    }

    async removeAllTrackingScripts() {
        await this.unloadCategoryScripts('analytics');
        await this.unloadCategoryScripts('marketing');
        
        document.querySelectorAll('script[data-category="analytics"], script[data-category="marketing"]')
            .forEach(script => script.remove());
        
        document.querySelectorAll('script[src*="adsbygoogle.js"], script[src*="googlesyndication.com"], script[src*="googleadservices.com"]')
            .forEach(script => script.remove());
        
        const trackingPatterns = ['google-analytics.com', 'googletagmanager.com'];
        trackingPatterns.forEach(pattern => {
            document.querySelectorAll(`script[src*="${pattern}"]`)
                .forEach(script => script.remove());
        });
    }

    async removeAllTrackingCookies() {
        this.removeAnalyticsCookies();
        this.removeMarketingCookies();
    }

    removeAnalyticsCookies() {
        const analyticsCookies = ['_ga', '_gid', '_gat_*', '_ga_*'];
        this.removeMatchingCookies(analyticsCookies);
    }

    removeMarketingCookies() {
        const marketingCookies = ['_gcl_au', '__gads', '__gpi'];
        this.removeMatchingCookies(marketingCookies);
    }

    removeMatchingCookies(cookiePatterns) {
        cookiePatterns.forEach(pattern => {
            if (pattern.includes('*')) {
                const prefix = pattern.split('*')[0];
                document.cookie.split(';').forEach(cookie => {
                    const name = cookie.split('=')[0].trim();
                    if (name.startsWith(prefix)) {
                        this.deleteCookie(name);
                    }
                });
            } else {
                this.deleteCookie(pattern);
            }
        });
    }

    checkAndEnforceExpiry() {
        if (!this.isConsentValid()) {
            this.resetConsent();
        }
    }

    resetConsent() {
        this.deleteCookie('cookieConsent');
        this.consentData = null;
        this.removeAllTrackingCookies();
        this.blockTrackingScripts();
        this.showBanner();
    }

    expandBanner() {
        this.domElements.banner?.classList.add('expanded');
        this.updateBannerContent();
    }

    updateBannerContent() {
        const expandedContent = document.querySelector('.cookie-expanded');
        if (!expandedContent) return;
        
        const categoriesContainer = expandedContent.querySelector('.cookie-categories');
        if (!categoriesContainer) return;
        
        categoriesContainer.innerHTML = '';
        Object.entries(CONSENT_CONFIG.cookieCategories).forEach(([key, category]) => {
            const div = document.createElement('div');
            div.className = 'cookie-category';
            div.innerHTML = `
                <div class="category-header">
                    <input type="checkbox" id="${key}-cookies"
                           ${category.required ? 'checked disabled' : ''}>
                    <label for="${key}-cookies">${category.name}</label>
                </div>
                <div class="category-details">
                    <p>${category.description}</p>
                    <p><strong>Finalidades:</strong> ${category.purposes.join(', ')}</p>
                    ${category.thirdParties ? 
                      `<p><strong>Destinatários:</strong> ${category.thirdParties.join(', ')}</p>` : ''}
                    ${category.dataTransfers ? 
                      `<p><strong>Transferências:</strong> ${category.dataTransfers.join(', ')}</p>` : ''}
                    <p><strong>Duração:</strong> ${category.duration}</p>
                    <p><strong>Cookies:</strong> ${category.cookies?.join(', ') || 'N/A'}</p>
                </div>
            `;
            categoriesContainer.appendChild(div);
        });
    }

    saveConsent(consentData) {
        this.consentData = {
            ...consentData,
            timestamp: new Date().toISOString(),
            version: CONSENT_CONFIG.version
        };
        
        this.setCookie('cookieConsent', JSON.stringify(this.consentData), {
            days: this.consentExpiryDays,
            sameSite: 'Lax',
            secure: window.location.protocol === 'https:'
        });
        
        this.applyConsent();
        this.hideBanner();
        this.dispatchConsentEvent();
        
        if (consentData.analytics || consentData.marketing) {
            setTimeout(() => {
                window.location.reload();
            }, 100);
        }
    }

    async applyConsent() {
        if (!this.consentData || !this.isConsentValid()) return;
        
        this.updateGoogleConsent();
        
        for (const [category, hasConsent] of Object.entries(this.consentData)) {
            if (category === 'essential' || category === 'timestamp' || category === 'version') continue;
            
            if (hasConsent) {
                await this.loadCategoryScripts(category);
            } else {
                this.unloadCategoryScripts(category);
                this.removeCategoryCookies(category);
            }
        }
    }

    removeCategoryCookies(category) {
        const categoryConfig = CONSENT_CONFIG.cookieCategories[category];
        if (!categoryConfig?.cookies) return;
        
        categoryConfig.cookies.forEach(cookieName => {
            if (cookieName.includes('*')) {
                const prefix = cookieName.split('*')[0];
                document.cookie.split(';').forEach(cookie => {
                    const name = cookie.split('=')[0].trim();
                    if (name.startsWith(prefix)) {
                        this.deleteCookie(name);
                    }
                });
            } else {
                this.deleteCookie(cookieName);
            }
        });
    }

    updateGoogleConsent() {
        if (typeof gtag === 'undefined') {
            window.gtag = function() {
                (window.dataLayer = window.dataLayer || []).push(arguments);
            }
        }
        
        gtag('consent', 'update', {
            'analytics_storage': this.consentData?.analytics ? 'granted' : 'denied',
            'ad_storage': this.consentData?.marketing ? 'granted' : 'denied',
            'security_storage': 'granted'
        });
    }

    initializeConsentMode() {
        window.dataLayer = window.dataLayer || [];
        window.gtag = function() { dataLayer.push(arguments); }
        
        gtag('consent', 'default', {
            'analytics_storage': 'denied',
            'ad_storage': 'denied',
            'security_storage': 'granted'
        });
    }

    setCookie(name, value, options = {}) {
        try {
            let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
            
            const days = options.days || 365;
            
            if (days > 0) {
                const expiry = new Date();
                expiry.setDate(expiry.getDate() + days);
                cookie += `; expires=${expiry.toUTCString()}`;
            }
            
            cookie += '; path=/';
            
            const sameSite = options.sameSite || 'Lax';
            cookie += `; SameSite=${sameSite}`;
            
            if (sameSite === 'None' || options.secure) {
                cookie += '; Secure';
            }
            
            document.cookie = cookie;
        } catch (error) {
            console.error('Error setting cookie:', error);
        }
    }

    getCookie(name) {
        const nameEQ = encodeURIComponent(name) + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) {
                return decodeURIComponent(c.substring(nameEQ.length, c.length));
            }
        }
        return null;
    }

    deleteCookie(name) {
        const pastDate = new Date(0).toUTCString();
        document.cookie = `${encodeURIComponent(name)}=; expires=${pastDate}; path=/; max-age=0`;
        
        if (window.location.hostname !== 'localhost' && !window.location.hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
            const domain = '.' + window.location.hostname.split('.').slice(-2).join('.');
            document.cookie = `${encodeURIComponent(name)}=; expires=${pastDate}; path=/; domain=${domain}; max-age=0`;
        }
    }

    showBanner() {
        if (this.domElements.banner) {
            this.domElements.banner.style.display = 'block';
            document.dispatchEvent(new Event('cookieBannerShow'));
        }
    }

    hideBanner() {
        if (this.domElements.banner) {
            this.domElements.banner.style.display = 'none';
            document.dispatchEvent(new Event('cookieBannerHide'));
        }
    }

    dispatchConsentEvent() {
        const event = new CustomEvent('cookieConsentUpdate', {
            detail: {
                consent: this.consentData,
                isValid: this.isConsentValid()
            }
        });
        document.dispatchEvent(event);
    }

    showPrivacyPolicy() {
        if (this.domElements.privacyPolicyLink?.href) {
            window.open(this.domElements.privacyPolicyLink.href, '_blank');
        }
    }

    async loadCategoryScripts(category) {
        if (this.loadedScripts.has(category)) return;
        const categoryConfig = CONSENT_CONFIG.cookieCategories[category];
        if (!categoryConfig?.scripts) return;
        
        for (const script of categoryConfig.scripts) {
            try {
                await script.init(this);
                this.loadedScripts.add(category);
            } catch (error) {
                console.error(`Error loading script ${script.id}:`, error);
            }
        }
    }

    unloadCategoryScripts(category) {
        document.querySelectorAll(`script[data-category="${category}"]`)
            .forEach(script => script.remove());
        
        this.loadedScripts.delete(category);
    }

    getConsentStatus() {
        return {
            consent: this.consentData,
            isValid: this.isConsentValid(),
            expiryDate: this.consentData?.timestamp ?
                new Date(new Date(this.consentData.timestamp).getTime() + (this.consentExpiryDays * 24 * 60 * 60 * 1000)) : null
        };
    }

    updateConsent(newConsent) {
        this.saveConsent({
            essential: true,
            ...newConsent
        });
    }

    withdrawConsent() {
        this.resetConsent();
        this.showBanner();
        this.expandBanner();
    }

    exportConsentData() {
        return {
            consentData: this.consentData,
            exportDate: new Date().toISOString(),
            version: CONSENT_CONFIG.version
        };
    }
}

// Initialize the manager
const cookieConsent = new CookieConsentManager();

document.addEventListener('DOMContentLoaded', () => {
    cookieConsent.init();
});

// Global functions for external use
window.cookieConsent = cookieConsent;
window.showCookieBanner = function() {
    cookieConsent.showBanner();
    return false;
};
window.getCookieConsent = function() {
    return cookieConsent.getConsentStatus();
};
window.withdrawCookieConsent = function() {
    cookieConsent.withdrawConsent();
    return false;
};
window.exportCookieData = function() {
    return cookieConsent.exportConsentData();
};