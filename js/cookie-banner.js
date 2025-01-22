// Cookie Consent Manager Configuration
const CONSENT_CONFIG = {
    version: '1.0',
    cookieMaxAge: 180,
    cookieCategories: {
        essential: {
            name: 'Essenciais',
            required: true,
            sameSite: 'Lax'
        },
        analytics: {
            name: 'Análise',
            required: false,
            sameSite: 'Lax',
            scripts: [
                {
                    id: 'google-tag-manager',
                    init: function() {
                        window.dataLayer = window.dataLayer || [];
                        window.gtag = function() { dataLayer.push(arguments); }
                        
                        // Load GTM
                        const gtmScript = document.createElement('script');
                        gtmScript.async = true;
                        gtmScript.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-KQDSNF9T';
                        document.head.appendChild(gtmScript);

                        // Load GA4
                        const gtagScript = document.createElement('script');
                        gtagScript.async = true;
                        gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-2EBYGRKLQ6';
                        document.head.appendChild(gtagScript);

                        gtagScript.onload = function() {
                            gtag('js', new Date());
                            gtag('config', 'G-2EBYGRKLQ6');
                        };
                    }
                }
            ]
        },
        marketing: {
            name: 'Publicidade',
            required: false,
            sameSite: 'None',
            scripts: [
                {
                    id: 'google-adsense',
                    init: function() {
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
    }

    init() {
        if (this.initialized) return;

        this.blockTrackingScripts(); // Add this line
        // Initialize consent mode with denied by default
        this.initializeConsentMode();
        
        // Load saved consent
        this.loadSavedConsent();
        
        // Setup DOM elements and events
        this.setupDOMElements();
        this.setupEventListeners();
        this.checkAndEnforceExpiry();
        
        // Apply existing consent if available
        if (this.consentData) {
            this.applyConsent();
        } else {
            this.showBanner();
        }
        
        this.initialized = true;
    }

    blockTrackingScripts() {
        // Create a mutation observer to prevent script loading
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.tagName === 'SCRIPT') {
                        const src = node.src || '';
                        if (src.includes('google-analytics') || 
                            src.includes('googletagmanager') || 
                            src.includes('facebook')) {
                            node.type = 'javascript/blocked';
                            node.parentNode.removeChild(node);
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
        // Remove existing scripts and cookies first
        this.unloadCategoryScripts('analytics');
        this.unloadCategoryScripts('marketing');
        this.removeAnalyticsCookies();
        this.removeMarketingCookies();

        // Then save new preferences
        this.saveConsent({
            essential: true,
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

    async applyConsent() {
        if (!this.consentData) return;

        // Update Google consent mode
        gtag('consent', 'update', {
            'analytics_storage': this.consentData.analytics ? 'granted' : 'denied',
            'ad_storage': this.consentData.marketing ? 'granted' : 'denied',
            'functionality_storage': 'granted',
            'personalization_storage': this.consentData.marketing ? 'granted' : 'denied',
            'security_storage': 'granted'
        });

        // Handle analytics scripts
        if (this.consentData.analytics) {
            await this.loadCategoryScripts('analytics');
        } else {
            this.unloadCategoryScripts('analytics');
            this.removeAnalyticsCookies();
        }

        // Handle marketing scripts
        if (this.consentData.marketing) {
            await this.loadCategoryScripts('marketing');
        } else {
            this.unloadCategoryScripts('marketing');
            this.removeMarketingCookies();
        }
    }

    updateGoogleConsent() {
        if (typeof window.gtag === 'undefined') {
            window.gtag = function() { 
                (window.dataLayer = window.dataLayer || []).push(arguments);
            }
        }
        
        gtag('consent', 'update', {
            'analytics_storage': this.consentData.analytics ? 'granted' : 'denied',
            'ad_storage': this.consentData.marketing ? 'granted' : 'denied',
            'functionality_storage': 'granted', // For essential cookies
            'security_storage': 'granted'
        });
    }

    initializeConsentMode() {
        window.dataLayer = window.dataLayer || [];
        window.gtag = function() { dataLayer.push(arguments); }
        
        gtag('consent', 'default', {
            'analytics_storage': 'denied',
            'ad_storage': 'denied',
            'functionality_storage': 'denied',
            'personalization_storage': 'denied',
            'security_storage': 'granted'
        });
    }

    removeAnalyticsCookies() {
        const analyticsCookies = [
            '_ga', '_gid', '_gat', '_ga_*', 
            '_gac_*', '_gat_gtag_*', '_gat_*'
        ];
        this.removeMatchingCookies(analyticsCookies);
    }

    removeMarketingCookies() {
        const marketingCookies = ['_fbp', '_gcl_au', '__gads', '__gpi'];
        this.removeMatchingCookies(marketingCookies);
    }

    removeMatchingCookies(cookiePatterns) {
        cookiePatterns.forEach(pattern => {
            if (pattern.includes('*')) {
                // Handle wildcard patterns
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

    setupPreferencesLink() {
        const preferencesLink = document.getElementById('cookie-preferences');
        if (preferencesLink) {
            preferencesLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showBanner();
                this.expandBanner();
                
                // Pre-fill checkboxes based on current consent
                if (this.consentData) {
                    this.domElements.analyticsCookie.checked = this.consentData.analytics;
                    this.domElements.marketingCookie.checked = this.consentData.marketing;
                }
            });
        }
    }

    loadScript(script) {
        if (this.loadedScripts.has(script.id)) return Promise.resolve();

        return new Promise((resolve, reject) => {
            if (script.inline) {
                try {
                    const scriptElement = document.createElement('script');
                    scriptElement.id = script.id;
                    scriptElement.text = script.content;
                    document.head.appendChild(scriptElement);
                    this.loadedScripts.add(script.id);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            } else {
                const scriptElement = document.createElement('script');
                scriptElement.id = script.id;
                scriptElement.src = script.src;
                scriptElement.onload = () => {
                    this.loadedScripts.add(script.id);
                    resolve();
                };
                scriptElement.onerror = reject;
                document.head.appendChild(scriptElement);
            }
        });
    }

    async loadCategoryScripts(category) {
        if (this.loadedScripts.has(category)) return;

        const categoryConfig = CONSENT_CONFIG.cookieCategories[category];
        if (!categoryConfig?.scripts) return;

        for (const script of categoryConfig.scripts) {
            try {
                await script.init();
                // Mark scripts with category for future removal
                document.querySelectorAll(`script[src*="${script.id}"]`)
                    .forEach(s => s.setAttribute('data-category', category));
            } catch (error) {
                console.error(`Error loading script ${script.id}:`, error);
            }
        }
        
        this.loadedScripts.add(category);
    }

    unloadCategoryScripts(category) {
        const scripts = document.querySelectorAll(`script[data-category="${category}"]`);
        scripts.forEach(script => script.remove());
        this.loadedScripts.delete(category);

        // Reset consent for this category
        if (category === 'analytics') {
            gtag('consent', 'update', {
                'analytics_storage': 'denied',
                'personalization_storage': 'denied'
            });
        } else if (category === 'marketing') {
            gtag('consent', 'update', {
                'ad_storage': 'denied',
                'personalization_storage': 'denied'
            });
        }
    }


}



const cookieConsent = new CookieConsentManager();
document.addEventListener('DOMContentLoaded', () => {
    cookieConsent.init();
});

window.showCookieBanner = function() {
    cookieConsent.showBanner();
    return false; // Prevents default link behavior
};