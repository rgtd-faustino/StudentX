// Cookie utility functions
const CookieUtil = {
    set: function(name, value, days = 365, path = '/') {
        const expires = new Date(Date.now() + days * 864e5).toUTCString();
        document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=${path}; SameSite=Strict; Secure`;
    },
    
    get: function(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
        return null;
    },
    
    delete: function(name) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Strict; Secure`;
    }
};

// Security and loading state management
const SecurityManager = {
    sessionId: null,
    csrfToken: null,

    initializeSecurity() {
        this.sessionId = this.generateSessionId();
        this.csrfToken = this.generateToken();
        CookieUtil.set('sessionId', this.sessionId, 1); // 1 day expiry
        CookieUtil.set('csrfToken', this.csrfToken, 1);
    },

    generateSessionId() {
        return 'sess_' + Math.random().toString(36).substr(2, 9);
    },

    generateToken() {
        return 'csrf_' + Math.random().toString(36).substr(2, 9);
    },

    validateSession() {
        return CookieUtil.get('sessionId') === this.sessionId;
    }
};

// Location detection and management
const LocationManager = {
    async detectLocation() {
        // Try IP geolocation first (faster)
        try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            this.saveLocation(data.country_code, data.city);
        } catch (error) {
            // Fallback to browser geolocation
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        try {
                            const response = await fetch(
                                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}`
                            );
                            const data = await response.json();
                            this.saveLocation(data.countryCode, data.city);
                        } catch (err) {
                            console.error('Geocoding failed:', err);
                        }
                    },
                    (error) => {
                        console.error('Geolocation failed:', error);
                    }
                );
            }
        }
    },

    saveLocation(countryCode, city) {
        CookieUtil.set('userCountry', countryCode);
        CookieUtil.set('userCity', city);
    }
};

// Loading state management
const LoadingManager = {
    startTime: null,

    trackPageLoad() {
        this.startTime = performance.now();
        window.addEventListener('load', () => {
            const loadTime = performance.now() - this.startTime;
            CookieUtil.set('lastPageLoadTime', loadTime.toString());
        });
    }
};

// Enhanced cookie consent management
document.addEventListener("DOMContentLoaded", function () {
    const cookieBanner = document.querySelector(".cookie-banner");
    const functionalCookies = document.getElementById("functional-cookies");
    const analyticsCookies = document.getElementById("analytics-cookies");
    const marketingCookies = document.getElementById("marketing-cookies");
    const moreOptionsBtn = document.getElementById("more-options");
    const acceptSelectedBtn = document.getElementById("accept-selected");

    // Initialize systems
    SecurityManager.initializeSecurity();
    LoadingManager.trackPageLoad();
    LocationManager.detectLocation();

    // Check existing consent
    const savedConsent = localStorage.getItem('cookieConsent');
    if (!savedConsent) {
        showCookieBanner();
    } else {
        hideCookieBanner();
        checkSavedConsent();
    }

    function saveCookiePreferences(functional, analytics, marketing) {
        const consent = {
            functional: functional,
            analytics: analytics,
            marketing: marketing,
            preferences: functional,
            timestamp: new Date().toISOString(),
            version: '1.0'
        };

        // Save to localStorage
        localStorage.setItem('cookieConsent', JSON.stringify(consent));

        // Set individual cookies
        CookieUtil.set('functionalCookies', functional);
        CookieUtil.set('analyticsCookies', analytics);
        CookieUtil.set('marketingCookies', marketing);

        // Update Google consent mode
        updateConsent(consent);

        hideCookieBanner();
    }

    function hideCookieBanner() {
        cookieBanner.style.display = "none";
    }

    function showCookieBanner() {
        cookieBanner.style.display = "block";
    }

    function expandCookieBanner() {
        cookieBanner.classList.add('expanded');
    }

    // Event listeners
    document.getElementById("reject-all").addEventListener("click", () => {
        saveCookiePreferences(false, false, false);
    });

    document.getElementById("accept-all").addEventListener("click", () => {
        saveCookiePreferences(true, true, true);
    });

    moreOptionsBtn.addEventListener("click", expandCookieBanner);

    acceptSelectedBtn.addEventListener("click", () => {
        saveCookiePreferences(
            functionalCookies.checked,
            analyticsCookies.checked,
            marketingCookies.checked
        );
    });

    document.getElementById("reject-all-expanded").addEventListener("click", () => {
        saveCookiePreferences(false, false, false);
    });
});

// Consent mode functions
function updateConsent(consent) {
    gtag('consent', 'update', {
        'analytics_storage': consent.analytics ? 'granted' : 'denied',
        'ad_storage': consent.marketing ? 'granted' : 'denied',
        'functionality_storage': consent.functional ? 'granted' : 'denied',
        'personalization_storage': consent.preferences ? 'granted' : 'denied'
    });
}

function checkSavedConsent() {
    const savedConsent = localStorage.getItem('cookieConsent');
    if (savedConsent) {
        updateConsent(JSON.parse(savedConsent));
    }
}