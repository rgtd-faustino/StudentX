document.addEventListener("DOMContentLoaded", function () {
    const cookieBanner = document.querySelector(".cookie-banner");
    const functionalCookies = document.getElementById("functional-cookies");
    const analyticsCookies = document.getElementById("analytics-cookies");
    const marketingCookies = document.getElementById("marketing-cookies");
    const moreOptionsBtn = document.getElementById("more-options");
    const acceptSelectedBtn = document.getElementById("accept-selected");

    // Check if cookie preferences are already set
    const savedConsent = localStorage.getItem('cookieConsent');
    
    if (!savedConsent) {
        showCookieBanner();
    } else {
        hideCookieBanner();
        checkSavedConsent(); // Apply saved consent
    }

    function saveCookiePreferences(functional, analytics, marketing) {
        // Save to old storage system (for backwards compatibility)
        localStorage.setItem("functionalCookies", functional);
        localStorage.setItem("analyticsCookies", analytics);
        localStorage.setItem("marketingCookies", marketing);
        
        // Update consent using the new system
        updateConsent({
            functional: functional,
            analytics: analytics,
            marketing: marketing,
            preferences: functional // Using functional as preferences for this implementation
        });
        
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

    document.getElementById("reject-all").addEventListener("click", function () {
        saveCookiePreferences(false, false, false);
    });

    document.getElementById("accept-all").addEventListener("click", function () {
        saveCookiePreferences(true, true, true);
    });

    moreOptionsBtn.addEventListener("click", function () {
        expandCookieBanner();
    });

    acceptSelectedBtn.addEventListener("click", function () {
        saveCookiePreferences(
            functionalCookies.checked,
            analyticsCookies.checked,
            marketingCookies.checked
        );
    });

    document.getElementById("reject-all-expanded").addEventListener("click", function () {
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

    localStorage.setItem('cookieConsent', JSON.stringify(consent));
}

function checkSavedConsent() {
    const savedConsent = localStorage.getItem('cookieConsent');
    if (savedConsent) {
        updateConsent(JSON.parse(savedConsent));
    }
}