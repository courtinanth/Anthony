/**
 * Cookie Consent Manager
 * Creates a clean popup for GDPR compliance
 */

(function () {
    'use strict';

    const COOKIE_NAME = 'anthony_courtin_consent';
    const GTM_ID = 'G-XXXXXXXXXX'; // Remplacez par votre ID Google Analytics réel si vous en avez un

    function initCookieBanner() {
        // Check if user has already made a choice
        if (localStorage.getItem(COOKIE_NAME)) {
            const consent = localStorage.getItem(COOKIE_NAME);
            if (consent === 'accepted') {
                loadAnalytics();
            }
            return;
        }

        // Create Banner HTML
        const banner = document.createElement('div');
        banner.id = 'cookie-banner';
        banner.className = 'cookie-banner fade-in';
        banner.innerHTML = `
            <div class="cookie-content">
                <div class="cookie-text">
                    <h3>🍪 Cookies & Confidentialité</h3>
                    <p>J'utilise des cookies pour analyser le trafic et améliorer votre expérience. Aucune donnée personnelle n'est vendue.</p>
                </div>
                <div class="cookie-actions">
                    <button id="btn-decline" class="btn-cookie btn-cookie-secondary">Refuser</button>
                    <button id="btn-accept" class="btn-cookie btn-cookie-primary">Accepter</button>
                    <a href="/confidentialite.html" class="cookie-link">En savoir plus</a>
                </div>
            </div>
        `;

        document.body.appendChild(banner);

        // Add Event Listeners
        document.getElementById('btn-accept').addEventListener('click', () => {
            localStorage.setItem(COOKIE_NAME, 'accepted');
            closeBanner(banner);
            loadAnalytics();
        });

        document.getElementById('btn-decline').addEventListener('click', () => {
            localStorage.setItem(COOKIE_NAME, 'declined');
            closeBanner(banner);
        });
    }

    function closeBanner(banner) {
        banner.classList.add('fade-out');
        setTimeout(() => {
            banner.remove();
        }, 300);
    }

    function loadAnalytics() {
        console.log('Cookies accepted - Loading Analytics...');
        // Ici vous pouvez inclure le code de Google Analytics dynamiquement
        /*
        const script = document.createElement('script');
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GTM_ID}`;
        script.async = true;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', GTM_ID);
        */
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCookieBanner);
    } else {
        initCookieBanner();
    }

})();
