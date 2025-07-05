const CONSENT_CONFIG = {
    version: '1.2',
    cookieCategories: {
        essential: {
            name: 'Essenciais',
            required: true,
            sameSite: 'Lax',
            maxAge: 365, // Essential cookies can be longer (1 year)
            description: 'Cookies estritamente necessários para o funcionamento do website. Validade: 1 ano',
            purposes: [
                'Autenticação', 
                'Segurança', 
                'Funcionalidades básicas',
                'Configurações da interface'
            ],
            duration: '1 ano',
            cookies: [
                'cookieConsent',
                'sessionId',
                'csrfToken'
            ]
        },
        preferences: {
            name: 'Preferências',
            required: false,
            sameSite: 'Lax',
            maxAge: 365, // User preferences typically last 1 year
            description: 'Cookies para guardar as suas preferências de eventos e configurações. Validade: 1 ano',
            purposes: [
                'Preferências de eventos do utilizador',
                'Configurações personalizadas',
                'Idioma preferido'
            ],
            duration: '1 ano',
            cookies: [
                'userEventPreferences_accepted',
                'userEventPreferences_rejected',
                'userLanguage',
                'userTheme'
            ]
        },
        analytics: {
            name: 'Análise',
            required: false,
            sameSite: 'Lax',
            maxAge: 90, // 3 months - reasonable for analytics
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
                                const errorText = await response.text();
                                console.error('Analytics proxy error:', errorText);
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
            maxAge: 90, // 3 months - more reasonable for marketing
            duration: '3 meses',
            description: 'Cookies para publicidade personalizada através do Google Ads. Validade: 3 meses',
            purposes: ['Publicidade direcionada', 'Personalização de anúncios', 'Medição de eficácia'],
            thirdParties: ['Google LLC', 'Meta Platforms'],
            dataTransfers: ['Estados Unidos (adequacy decision)'],
            cookies: ['_fbp', '_gcl_au', '__gads', '__gpi', 'IDE'],
            scripts: [
                {
                    id: 'google-adsense',
                    init: function(manager) {
                        if (!manager.hasConsent('marketing')) return;
                        
                        // Check if AdSense script is already loaded
                        const existingScript = document.querySelector('script[src*="adsbygoogle.js"]');
                        if (existingScript) return;
                        
                        const adsenseScript = document.createElement('script');
                        adsenseScript.async = true;
                        adsenseScript.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2455279266517679';
                        adsenseScript.crossOrigin = 'anonymous';
                        // AdSense scripts don't support data attributes for consent
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
        this.cookieInventory = new Map();
        this.consentExpiryDays = 365; // GDPR: consent expires after 1 year
        this.scriptBlockingActive = false;
    }

    init() {
        if (this.initialized) return;
        
        this.blockTrackingScripts();
        this.initializeConsentMode();
        this.loadSavedConsent();
        this.setupDOMElements();
        this.setupEventListeners();
        this.checkAndEnforceExpiry();
        this.startCookieInventoryMonitoring();
        
        // Only start blocking if we don't have valid consent
        if (!this.consentData || !this.isConsentValid()) {
            this.blockTrackingScripts();
            this.showBanner();
        } else {
            // Apply existing valid consent immediately
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

    // Enhanced cookie inventory monitoring
    startCookieInventoryMonitoring() {
        // Monitor cookies every 5 minutes
        setInterval(() => {
            this.updateCookieInventory();
            this.enforceRetentionLimits();
        }, 5 * 60 * 1000);
        
        // Initial inventory
        this.updateCookieInventory();
    }

    updateCookieInventory() {
        const currentCookies = document.cookie.split(';').filter(c => c.trim());
        const now = new Date();
        
        // Track existing cookies
        const existingCookieNames = new Set();
        
        currentCookies.forEach(cookie => {
            const [name] = cookie.split('=');
            const cookieName = name.trim();
            existingCookieNames.add(cookieName);
            
            if (!this.cookieInventory.has(cookieName)) {
                const category = this.getCookieCategory(cookieName);
                const categoryConfig = CONSENT_CONFIG.cookieCategories[category];
                
                this.cookieInventory.set(cookieName, {
                    category,
                    firstSeen: now,
                    lastSeen: now,
                    maxAge: categoryConfig?.maxAge || 30,
                    hasConsent: this.hasConsent(category)
                });
            } else {
                // Update last seen and consent status
                const entry = this.cookieInventory.get(cookieName);
                entry.lastSeen = now;
                entry.hasConsent = this.hasConsent(entry.category);
            }
        });
        
        // Remove cookies that no longer exist from inventory
        for (const cookieName of this.cookieInventory.keys()) {
            if (!existingCookieNames.has(cookieName)) {
                this.cookieInventory.delete(cookieName);
            }
        }
    }

    enforceRetentionLimits() {
        const now = new Date();
        
        this.cookieInventory.forEach((info, cookieName) => {
            const ageInDays = (now - info.firstSeen) / (1000 * 60 * 60 * 24);
            
            // Remove if expired OR if no consent for non-essential cookies
            const shouldRemove = ageInDays > info.maxAge || 
                                (info.category !== 'essential' && !info.hasConsent);
            
            if (shouldRemove) {
                console.log(`Removing ${shouldRemove ? 'expired' : 'unconsented'} cookie: ${cookieName}`);
                this.deleteCookie(cookieName);
                this.cookieInventory.delete(cookieName);
            }
        });
    }

    blockTrackingScripts() {
        const blockedPatterns = [
            'google-analytics.com',
            'googletagmanager.com',
            'googlesyndication.com',
            'facebook.net',
            'doubleclick.net',
            'googleadservices.com'
        ];

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.tagName === 'SCRIPT' && node.src) {
                        const shouldBlock = blockedPatterns.some(pattern => 
                            node.src.includes(pattern)
                        );
                        
                        // Only block if we don't have consent AND script isn't already approved
                        if (shouldBlock && !node.hasAttribute('data-category') && !node.hasAttribute('data-consent-category')) {
                            const category = this.getScriptCategory(node.src);
                            
                            // Check if we have consent for this category
                            if (!this.hasConsent(category)) {
                                console.log('Blocking unconsented script:', node.src);
                                node.type = 'javascript/blocked';
                                if (node.parentNode) {
                                    node.parentNode.removeChild(node);
                                }
                            } else {
                                // Mark as approved - don't add attributes to AdSense scripts as they don't support them
                                if (!node.src.includes('adsbygoogle.js') && !node.src.includes('googlesyndication.com')) {
                                    node.setAttribute('data-category', category);
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

    // Add method to determine script category
    getScriptCategory(src) {
        if (src.includes('google-analytics.com') || src.includes('googletagmanager.com')) {
            return 'analytics';
        }
        if (src.includes('googlesyndication.com') || src.includes('doubleclick.net')) {
            return 'marketing';
        }
        return 'analytics'; // default
    }

    setupDOMElements() {
        this.domElements = {
            banner: document.getElementById('cookieBanner'),
            acceptAllBtn: document.getElementById('accept-all'),
            rejectAllBtn: document.getElementById('reject-all'),
            moreOptionsBtn: document.getElementById('more-options'),
            acceptSelectedBtn: document.getElementById('accept-selected'),
            rejectAllExpandedBtn: document.getElementById('reject-all-expanded'),
            preferencesCookie: document.getElementById('preferences-cookies'),
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
                
                // Check if consent structure is outdated or expired
                if (this.consentData.version !== CONSENT_CONFIG.version || !this.isConsentValid()) {
                    console.log('Consent version mismatch or expired, resetting');
                    this.resetConsent();
                    return;
                }
                
                // Load consent history
                try {
                    const history = localStorage.getItem('consentHistory');
                    if (history) {
                        this.consentHistory = JSON.parse(history);
                    }
                } catch (e) {
                    console.warn('Could not load consent history:', e);
                }
                
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
            version: CONSENT_CONFIG.version,
            cookieInventory: Array.from(this.cookieInventory.entries()),
            ipAddress: 'anonymized', // For GDPR compliance
            consentMethod: 'explicit' // Track how consent was given
        };
        
        this.consentHistory.push(record);
        // Keep only last 10 records for storage efficiency
        if (this.consentHistory.length > 10) {
            this.consentHistory = this.consentHistory.slice(-10);
        }
        
        try {
            localStorage.setItem('consentHistory', JSON.stringify(this.consentHistory));
        } catch (e) {
            console.warn('Could not save consent history:', e);
        }
    }

    stopScriptBlocking() {
        this.scriptBlockingActive = false;
    }

    async handleAcceptAll() {
        // Stop blocking scripts first
        this.stopScriptBlocking();
        
        // Clean up existing unwanted cookies/scripts
        await this.removeAllTrackingScripts();
        await this.removeAllTrackingCookies();

        this.saveConsent({
            essential: true,
            preferences: true,
            analytics: true,
            marketing: true
        });
    }

    async handleRejectAll() {
        // Keep blocking active for rejected categories
        await this.removeAllTrackingScripts();
        await this.removeAllTrackingCookies();
    
        this.saveConsent({
            essential: true,
            preferences: false,
            analytics: false,
            marketing: false
        });
    }

    async handleSavePreferences() {
        // Stop blocking for accepted categories
        const hasAnyConsent = this.domElements.preferencesCookie?.checked || 
                             this.domElements.analyticsCookie?.checked || 
                             this.domElements.marketingCookie?.checked;
        
        if (hasAnyConsent) {
            this.stopScriptBlocking();
        }
        
        await this.removeAllTrackingScripts();
        await this.removeAllTrackingCookies();
    
        this.saveConsent({
            essential: true,
            preferences: this.domElements.preferencesCookie?.checked || false,
            analytics: this.domElements.analyticsCookie?.checked || false,
            marketing: this.domElements.marketingCookie?.checked || false
        });
    }

    async removeAllTrackingScripts() {
        await this.unloadCategoryScripts('analytics');
        await this.unloadCategoryScripts('marketing');
        await this.unloadCategoryScripts('preferences');
        
        // Remove any remaining tracking scripts - only use data-category attribute
        document.querySelectorAll('script[data-category="analytics"], script[data-category="marketing"], script[data-category="preferences"]')
            .forEach(script => script.remove());
    }

    async removeAllTrackingCookies() {
        this.removeAnalyticsCookies();
        this.removeMarketingCookies();
        this.removePreferencesCookies();
        
        // Clean up cookie inventory for non-essential cookies
        this.cookieInventory.forEach((info, cookieName) => {
            if (info.category !== 'essential') {
                this.deleteCookie(cookieName);
                this.cookieInventory.delete(cookieName);
            }
        });
    }

    removePreferencesCookies() {
        const preferencesCookies = CONSENT_CONFIG.cookieCategories.preferences.cookies || [];
        preferencesCookies.forEach(cookieName => {
            this.deleteCookie(cookieName);
        });
    }

    removeAnalyticsCookies() {
        const analyticsCookies = CONSENT_CONFIG.cookieCategories.analytics.cookies || [];
        this.removeMatchingCookies(analyticsCookies);
    }

    removeMarketingCookies() {
        const marketingCookies = CONSENT_CONFIG.cookieCategories.marketing.cookies || [];
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
            console.log('Consent expired, resetting');
            this.resetConsent();
        }
    }

    resetConsent() {
        this.deleteCookie('cookieConsent');
        this.consentData = null;
        this.removeAllTrackingCookies();
        this.blockTrackingScripts(); // Resume blocking
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

        // Save consent cookie with proper duration
        this.setCookie('cookieConsent', JSON.stringify(this.consentData), {
            days: this.consentExpiryDays,
            sameSite: 'Lax',
            secure: window.location.protocol === 'https:'
        });

        this.saveConsentRecord();
        this.applyConsent();
        this.hideBanner();
        this.dispatchConsentEvent();
        
        // Force page reload to ensure scripts load properly
        if (consentData.analytics || consentData.marketing || consentData.preferences) {
            setTimeout(() => {
                window.location.reload();
            }, 100);
        }
    }

    async applyConsent() {
        if (!this.consentData || !this.isConsentValid()) return;

        // Update Google consent mode
        this.updateGoogleConsent();

        // Handle category scripts
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
            'functionality_storage': this.consentData?.preferences ? 'granted' : 'denied',
            'personalization_storage': this.consentData?.marketing ? 'granted' : 'denied',
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

    setCookie(name, value, options = {}) {
        try {
            let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
            
            // Get category-specific settings
            const cookieCategory = this.getCookieCategory(name);
            const categoryConfig = CONSENT_CONFIG.cookieCategories[cookieCategory];
            
            // Use the category's maxAge or provided days
            let days = options.days;
            if (!days) {
                days = categoryConfig?.maxAge || 30;
            }
            
            if (days > 0) {
                const expiry = new Date();
                expiry.setDate(expiry.getDate() + days);
                cookie += `; expires=${expiry.toUTCString()}`;
                cookie += `; max-age=${days * 24 * 60 * 60}`;
            }
            
            cookie += '; path=/';
            
            const sameSite = options.sameSite || categoryConfig?.sameSite || 'Lax';
            cookie += `; SameSite=${sameSite}`;
            
            if (sameSite === 'None' || options.secure) {
                cookie += '; Secure';
            }
            
            document.cookie = cookie;
            
            // Update inventory
            this.cookieInventory.set(name, {
                category: cookieCategory,
                firstSeen: new Date(),
                lastSeen: new Date(),
                maxAge: days,
                hasConsent: this.hasConsent(cookieCategory)
            });
            
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

    getCookieCategory(cookieName) {
        // Check each category for the cookie name
        for (const [categoryKey, categoryConfig] of Object.entries(CONSENT_CONFIG.cookieCategories)) {
            if (categoryConfig.cookies?.includes(cookieName)) {
                return categoryKey;
            }
            
            // Handle wildcard patterns
            if (categoryConfig.cookies) {
                for (const pattern of categoryConfig.cookies) {
                    if (pattern.includes('*')) {
                        const prefix = pattern.split('*')[0];
                        if (cookieName.startsWith(prefix)) {
                            return categoryKey;
                        }
                    }
                }
            }
        }
        
        // Fallback logic for common cookie patterns
        if (cookieName.startsWith('_ga') || cookieName.startsWith('_gid') || cookieName.startsWith('_gat')) {
            return 'analytics';
        }
        if (cookieName.startsWith('_fbp') || cookieName.startsWith('_gcl') || cookieName.startsWith('__gads')) {
            return 'marketing';
        }
        if (cookieName.startsWith('userEvent') || cookieName.includes('Preferences')) {
            return 'preferences';
        }
        
        return 'essential';
    }

    deleteCookie(name, options = {}) {
        // Set expiry to past date
        const pastDate = new Date(0).toUTCString();
        
        // Delete for current path
        document.cookie = `${encodeURIComponent(name)}=; expires=${pastDate}; path=/`;
        
        // Delete for root path
        document.cookie = `${encodeURIComponent(name)}=; expires=${pastDate}; path=/; max-age=0`;
        
        // Try to delete for parent domain if applicable
        if (window.location.hostname !== 'localhost' && !window.location.hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
            const domain = '.' + window.location.hostname.split('.').slice(-2).join('.');
            document.cookie = `${encodeURIComponent(name)}=; expires=${pastDate}; path=/; domain=${domain}; max-age=0`;
        }
        
        // Remove from inventory
        this.cookieInventory.delete(name);
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
                inventory: Array.from(this.cookieInventory.entries()),
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
        // Remove scripts with category attribute
        document.querySelectorAll(`script[data-category="${category}"]`)
            .forEach(script => script.remove());
        
        this.loadedScripts.delete(category);

        // Update consent mode
        if (typeof gtag !== 'undefined') {
            const updates = {};
            if (category === 'analytics') {
                updates.analytics_storage = 'denied';
            }
            if (category === 'marketing') {
                updates.ad_storage = 'denied';
                updates.personalization_storage = 'denied';
            }
            if (category === 'preferences') {
                updates.functionality_storage = 'denied';
            }
            
            if (Object.keys(updates).length > 0) {
                gtag('consent', 'update', updates);
            }
        }
    }

    // Public method to get consent status for external use
    getConsentStatus() {
        return {
            consent: this.consentData,
            inventory: Array.from(this.cookieInventory.entries()),
            history: this.consentHistory,
            isValid: this.isConsentValid(),
            expiryDate: this.consentData?.timestamp ? 
                new Date(new Date(this.consentData.timestamp).getTime() + (this.consentExpiryDays * 24 * 60 * 60 * 1000)) : null
        };
    }

    // Public method to programmatically update consent
    updateConsent(newConsent) {
        this.saveConsent({
            essential: true,
            ...newConsent
        });
    }

    // Public method to withdraw consent (GDPR right)
    withdrawConsent() {
        this.resetConsent();
        this.showBanner();
        this.expandBanner();
    }

    // Public method to export consent data (GDPR right to data portability)
    exportConsentData() {
        return {
            consentData: this.consentData,
            consentHistory: this.consentHistory,
            cookieInventory: Array.from(this.cookieInventory.entries()),
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
    cookieConsent.expandBanner();
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