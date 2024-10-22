
document.addEventListener("DOMContentLoaded", function () {
    const cookieBanner = document.querySelector(".cookie-banner");
    const functionalCookies = document.getElementById("functional-cookies");
    const analyticsCookies = document.getElementById("analytics-cookies");
    const marketingCookies = document.getElementById("marketing-cookies");
    const moreOptionsBtn = document.getElementById("more-options");
    const acceptSelectedBtn = document.getElementById("accept-selected");

    // Check if cookie preferences are already set
    const functionalPreference = localStorage.getItem("functionalCookies");
    const analyticsPreference = localStorage.getItem("analyticsCookies");
    const marketingPreference = localStorage.getItem("marketingCookies");

    if (functionalPreference === null || analyticsPreference === null || marketingPreference === null) {
        showCookieBanner();
    } else {
        hideCookieBanner();
    }

    function saveCookiePreferences(functional, analytics, marketing) {
        localStorage.setItem("functionalCookies", functional);
        localStorage.setItem("analyticsCookies", analytics);
        localStorage.setItem("marketingCookies", marketing);
        hideCookieBanner();
        applyCookiePreferences();
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

    function applyCookiePreferences() {
        // Apply functional cookies
        if (localStorage.getItem("functionalCookies") === "true") {
            // Set functional cookies here
            console.log("Functional cookies enabled");
        }

    // Apply analytics cookies (Google Analytics 4)
    if (localStorage.getItem("analyticsCookies") === "true") {
        // Load Google Analytics 4
        (function(w,d,s,l,i){
            w[l] = w[l] || [];
            w[l].push({'gtm.start': new Date().getTime(), event:'gtm.js'});
            w[l].push({
                'js': new Date(),
                'config': 'G-2EBYGRKLQ6'
            });
            var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s);
            j.async=true;
            j.src = 'https://www.googletagmanager.com/gtag/js?id=' + i;
            f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','G-2EBYGRKLQ6');

        console.log("Analytics cookies enabled");
    } else {
        // Disable Google Analytics 4
        window['ga-disable-G-2EBYGRKLQ6'] = true;
        console.log("Analytics cookies disabled");
    }

        // Apply marketing cookies
        if (localStorage.getItem("marketingCookies") === "true") {
            // Set marketing cookies here
            console.log("Marketing cookies enabled");
        }
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
        saveCookiePreferences(functionalCookies.checked, analyticsCookies.checked, marketingCookies.checked);
    });

    document.getElementById("reject-all-expanded").addEventListener("click", function () {
        saveCookiePreferences(false, false, false);
    });


});