// Cookie Consent Manager Configuration
const CONSENT_CONFIG = {
    version: '1.0',
    cookieMaxAge: 180, // Days until consent expires
    cookieCategories: {
        essential: {
            name: 'Essenciais',
            required: true,
            sameSite: 'Lax' // Essential cookies default to Lax
        },
        analytics: {
            name: 'Análise',
            required: false,
            sameSite: 'Lax' // Analytics cookies can use Lax
        },
        marketing: {
            name: 'Publicidade',
            required: false,
            sameSite: 'None' // Marketing cookies need None for third-party context
        }
    }
};

class CookieConsentManager {
    constructor() {
        this.consentData = null;
        this.domElements = {};
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        
        // Load consent before DOM setup to prevent flash
        this.loadSavedConsent();
        this.setupDOMElements();
        this.setupEventListeners();
        this.checkAndEnforceExpiry();
        this.initializeConsentMode();
        
        // Only show banner if no consent is saved
        if (!this.consentData) {
            this.showBanner();
        }
        
        this.initialized = true;
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
        this.domElements.acceptAllBtn.addEventListener('click', () => this.handleAcceptAll());
        this.domElements.rejectAllBtn.addEventListener('click', () => this.handleRejectAll());
        this.domElements.moreOptionsBtn.addEventListener('click', () => this.expandBanner());
        this.domElements.acceptSelectedBtn.addEventListener('click', () => this.handleSavePreferences());
        this.domElements.rejectAllExpandedBtn.addEventListener('click', () => this.handleRejectAll());
        
        this.domElements.privacyPolicyLink?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showPrivacyPolicy();
        });
    }

    loadSavedConsent() {
        const savedConsent = this.getCookie('cookieConsent');
        if (savedConsent) {
            try {
                this.consentData = JSON.parse(savedConsent);
                // Don't call showBanner/hideBanner here since DOM isn't ready
            } catch (e) {
                console.error('Error parsing saved consent:', e);
                this.consentData = null;
            }
        }
    }

    handleAcceptAll() {
        this.saveConsent({
            essential: true,
            analytics: true,
            marketing: true
        });
    }

    handleRejectAll() {
        this.saveConsent({
            essential: true, // Essential cookies are always enabled
            analytics: false,
            marketing: false
        });
    }

    handleSavePreferences() {
        this.saveConsent({
            essential: true, // Essential cookies are always enabled
            analytics: this.domElements.analyticsCookie.checked,
            marketing: this.domElements.marketingCookie.checked
        });
    }

    saveConsent(consentData) {
        this.consentData = {
            ...consentData,
            timestamp: new Date().toISOString(),
            version: CONSENT_CONFIG.version
        };

        // Save consent cookie with Lax SameSite as it's essential
        this.setCookie('cookieConsent', JSON.stringify(this.consentData), {
            days: CONSENT_CONFIG.cookieMaxAge,
            sameSite: 'Lax',
            secure: true
        });

        this.applyConsent();
        this.hideBanner();
        this.dispatchConsentEvent();
    }

    applyConsent() {
        if (!this.consentData) return;

        // Update Google consent mode
        this.updateGoogleConsent();

        // Apply consent to checkboxes
        if (this.domElements.analyticsCookie) {
            this.domElements.analyticsCookie.checked = this.consentData.analytics;
        }
        if (this.domElements.marketingCookie) {
            this.domElements.marketingCookie.checked = this.consentData.marketing;
        }

        // Remove cookies for non-consented categories
        if (!this.consentData.analytics) {
            this.removeAnalyticsCookies();
        }
        if (!this.consentData.marketing) {
            this.removeMarketingCookies();
        }
    }

    updateGoogleConsent() {
        if (typeof gtag === 'function') {
            gtag('consent', 'update', {
                'analytics_storage': this.consentData.analytics ? 'granted' : 'denied',
                'ad_storage': this.consentData.marketing ? 'granted' : 'denied',
                'functionality_storage': 'granted', // For essential cookies
                'security_storage': 'granted'
            });
        }
    }

    initializeConsentMode() {
        window.dataLayer = window.dataLayer || [];
        function gtag() {
            dataLayer.push(arguments);
        }
        
        // Set default consent mode to denied
        gtag('consent', 'default', {
            'analytics_storage': 'denied',
            'ad_storage': 'denied',
            'functionality_storage': 'granted',
            'security_storage': 'granted',
            'wait_for_update': 500
        });
    }

    removeAnalyticsCookies() {
        const analyticsCookies = ['_ga', '_gid', '_gat'];
        analyticsCookies.forEach(cookieName => 
            this.deleteCookie(cookieName, {
                sameSite: CONSENT_CONFIG.cookieCategories.analytics.sameSite
            })
        );
    }

    removeMarketingCookies() {
        const marketingCookies = ['_fbp', '_gcl_au'];
        marketingCookies.forEach(cookieName => 
            this.deleteCookie(cookieName, {
                sameSite: CONSENT_CONFIG.cookieCategories.marketing.sameSite
            })
        );
    }

    checkAndEnforceExpiry() {
        if (this.consentData?.timestamp) {
            const consentDate = new Date(this.consentData.timestamp);
            const expiryDate = new Date(consentDate.getTime() + (CONSENT_CONFIG.cookieMaxAge * 24 * 60 * 60 * 1000));
            
            if (new Date() > expiryDate) {
                this.resetConsent();
            }
        }
    }

    resetConsent() {
        this.deleteCookie('cookieConsent');
        this.consentData = null;
        this.showBanner();
    }

    expandBanner() {
        this.domElements.banner.classList.add('expanded');
    }

    setCookie(name, value, options = {}) {
        let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
        
        if (options.days) {
            const expiry = new Date();
            expiry.setDate(expiry.getDate() + options.days);
            cookie += `; expires=${expiry.toUTCString()}`;
        }
        
        cookie += '; path=/';
        
        // Handle SameSite attribute based on cookie category
        const cookieCategory = this.getCookieCategory(name);
        const sameSite = options.sameSite || 
                        (cookieCategory && CONSENT_CONFIG.cookieCategories[cookieCategory].sameSite) ||
                        'Lax';
        
        cookie += `; SameSite=${sameSite}`;
        
        // If SameSite=None, the Secure attribute must be set
        if (sameSite === 'None') {
            cookie += '; Secure';
        } else if (options.secure) {
            cookie += '; Secure';
        }
        
        document.cookie = cookie;
    }

    getCookie(name) {
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
            const [cookieName, cookieValue] = cookie.split('=').map(c => c.trim());
            if (cookieName === name) {
                return decodeURIComponent(cookieValue);
            }
        }
        return null;
    }

    getCookieCategory(cookieName) {
        const marketingCookies = ['_fbp', '_gcl_au'];
        const analyticsCookies = ['_ga', '_gid', '_gat'];
        
        if (marketingCookies.includes(cookieName)) return 'marketing';
        if (analyticsCookies.includes(cookieName)) return 'analytics';
        return 'essential';
    }

    deleteCookie(name, options = {}) {
        this.setCookie(name, '', { 
            days: -1,
            ...options
        });
    }

    showBanner() {
        if (this.domElements.banner) {
            this.domElements.banner.style.display = 'block';
            document.dispatchEvent(new Event('cookieBannerShow'));
        }
    }

    hideBanner() {
        this.domElements.banner.style.display = 'none';
        document.dispatchEvent(new Event('cookieBannerHide'));
    }

    dispatchConsentEvent() {
        const event = new CustomEvent('cookieConsentUpdate', {
            detail: this.consentData
        });
        document.dispatchEvent(event);
    }

    showPrivacyPolicy() {
        // Implement privacy policy display logic or navigation
        window.location.href = this.domElements.privacyPolicyLink.href;
    }
}

const cookieConsent = new CookieConsentManager();
document.addEventListener('DOMContentLoaded', () => {
    cookieConsent.init();
});