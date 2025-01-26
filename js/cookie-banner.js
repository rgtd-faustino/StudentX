const CONSENT_CONFIG = {
    version: '1.1',
    cookieMaxAge: 180,
    cookieCategories: {
        essential: {
            name: 'Essenciais',
            required: true,
            sameSite: 'Lax',
            description: 'Cookies estritamente necessários para o funcionamento do website. Validade: Sessão',
            purposes: ['Autenticação', 'Segurança', 'Funcionalidades básicas'],
            duration: 'Sessão'
        },
        analytics: {
            name: 'Análise',
            required: false,
            sameSite: 'Lax',
            description: 'Cookies para análise de uso do website através do Google Analytics. Validade: 2 anos',
            purposes: ['Análise de tráfego', 'Melhorias do website', 'Estatísticas de uso'],
            thirdParties: ['Google LLC'],
            duration: '2 anos',
            scripts: [
                {
                    id: 'analytics-proxy',
                    init: function(manager) {
                        if (!manager.hasConsent('analytics')) return;
                       
                        const CLOUDFLARE_ANALYTICS_PROXY = 'https://secretkeys.contact-studentx.workers.dev';

                        // Proxy for Google Tag Manager script
                        const gtmProxyScript = document.createElement('script');
                        gtmProxyScript.async = true;
                        gtmProxyScript.src = new URL('/gtm.js', CLOUDFLARE_ANALYTICS_PROXY).href;
                        
                        // Proxy for Google Analytics script
                        const gtagProxyScript = document.createElement('script');
                        gtagProxyScript.async = true;
                        gtagProxyScript.src = new URL('/gtag/js', CLOUDFLARE_ANALYTICS_PROXY).href;
           
                        gtagProxyScript.onload = function() {
                            gtag('js', new Date());
                            gtag('config', `${CLOUDFLARE_ANALYTICS_PROXY}/gtag/js`, {
                                'transport_url': CLOUDFLARE_ANALYTICS_PROXY,
                                'first_party_collection': true
                            });
                        };
                    }
                }
            ]
        },
        marketing: {
            name: 'Publicidade',
            required: false,
            sameSite: 'None',
            description: 'Cookies para publicidade personalizada através do Google Ads. Validade: 1 ano',
            purposes: ['Publicidade direcionada', 'Personalização de anúncios'],
            thirdParties: ['Google LLC', 'Parceiros de publicidade'],
            dataTransfers: ['EUA (Privacy Shield)'],
            duration: '1 ano',
            scripts: [
                {
                    id: 'google-adsense',
                    init: function(manager) {
                        if (!manager.hasConsent('marketing')) return;
                        
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
        this.consentHistory = [];
    }

    init() {
        if (this.initialized) return;
        
        this.blockTrackingScripts();
        this.initializeConsentMode();
        this.loadSavedConsent();
        this.setupDOMElements();
        this.setupEventListeners();
        this.checkAndEnforceExpiry();
        
        if (this.consentData) {
            this.applyConsent();
        } else {
            this.showBanner();
        }
        
        this.initialized = true;
    }

    hasConsent(category) {
        return this.consentData?.[category] === true;
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

    saveConsentRecord() {
        const record = {
            timestamp: new Date().toISOString(),
            categories: { ...this.consentData },
            userAgent: navigator.userAgent,
            version: CONSENT_CONFIG.version
        };
        
        this.consentHistory.push(record);
        localStorage.setItem('consentHistory', JSON.stringify(this.consentHistory));
    }

    async handleAcceptAll() {
        // First remove all existing scripts and cookies
        await this.removeAllTrackingScripts();
        await this.removeAllTrackingCookies();

        // Then save new consent
        this.saveConsent({
            essential: true,
            analytics: true,
            marketing: true
        });
    }

    async handleRejectAll() {
        // First remove all existing scripts and cookies
        await this.removeAllTrackingScripts();
        await this.removeAllTrackingCookies();
    
        // Then save new consent with only essential cookies
        this.saveConsent({
            essential: true,
            analytics: false,
            marketing: false
        });
    
        // Update Google consent mode explicitly
        this.updateGoogleConsent();
    
        // Reload the page to ensure clean state
        window.location.reload();
    }

    async handleSavePreferences() {
        // First remove all existing scripts and cookies
        await this.removeAllTrackingScripts();
        await this.removeAllTrackingCookies();
    
        // Then save new preferences
        this.saveConsent({
            essential: true,
            analytics: this.domElements.analyticsCookie.checked,
            marketing: this.domElements.marketingCookie.checked
        });
    
        // Reload the page to ensure clean state
        window.location.reload();
    }

    async removeAllTrackingScripts() {
        // Remove all tracking scripts
        await this.unloadCategoryScripts('analytics');
        await this.unloadCategoryScripts('marketing');
        
        // Remove any remaining Google scripts
        document.querySelectorAll('script[src*="googletagmanager"], script[src*="google-analytics"], script[src*="pagead2.googlesyndication.com"]')
            .forEach(script => script.remove());
    }

    async removeAllTrackingCookies() {
        this.removeAnalyticsCookies();
        this.removeMarketingCookies();
        
        // Remove any remaining Google cookies
        const allCookies = document.cookie.split(';');
        allCookies.forEach(cookie => {
            const name = cookie.split('=')[0].trim();
            if (name.startsWith('_ga') || name.startsWith('_gid') || 
                name.startsWith('_gat') || name.startsWith('_gcl') || 
                name.startsWith('_fbp')) {
                this.deleteCookie(name);
            }
        });
    }

    withdrawConsent() {
        this.handleRejectAll();
        this.showBanner();
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

    updateBannerContent() {
        const expandedContent = document.querySelector('.cookie-expanded');
        const categoriesContainer = expandedContent.querySelector('.cookie-categories');
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
                </div>
            `;
            categoriesContainer.appendChild(div);
        });
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
        
        // Explicitly deny all non-essential storage types when consent is withdrawn
        gtag('consent', 'update', {
            'analytics_storage': this.consentData.analytics ? 'granted' : 'denied',
            'ad_storage': this.consentData.marketing ? 'granted' : 'denied',
            'functionality_storage': 'granted',
            'personalization_storage': this.consentData.marketing ? 'granted' : 'denied',
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
                await script.init(this);  // Pass manager instance
                document.querySelectorAll(`script[src*="${script.id}"]`)
                    .forEach(s => s.setAttribute('data-category', category));
            } catch (error) {
                console.error(`Error loading script ${script.id}:`, error);
            }
        }
        
        this.loadedScripts.add(category);
    }

    unloadCategoryScripts(category) {
        // Remove scripts
        document.querySelectorAll(`script[data-category="${category}"]`)
            .forEach(script => script.remove());
        
        // Clear from loaded scripts set
        this.loadedScripts.delete(category);

        // Reset consent mode for the category
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

        // Remove any inline scripts
        document.querySelectorAll(`script[type="text/javascript"][data-category="${category}"]`)
            .forEach(script => script.remove());
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