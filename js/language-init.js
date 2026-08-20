
// Language initialization script
function initializePreferredLanguage() {
    try {
        // Get saved language preference
        const savedLang = localStorage.getItem('userPreferredLanguage');
        if (savedLang && ['vi', 'en', 'zh'].includes(savedLang)) {
            window.changeLanguage(savedLang);
        } else {
            // Use browser language or default to Vietnamese
            const browserLang = navigator.language.split('-')[0];
            if (['vi', 'en', 'zh'].includes(browserLang)) {
                window.changeLanguage(browserLang);
            } else {
                window.changeLanguage('vi'); // Default to Vietnamese
            }
        }
    } catch (error) {
        console.error('Error initializing language:', error);
        // Fallback to Vietnamese
        window.changeLanguage('vi');
    }
}

window.addEventListener('translationsLoaded', initializePreferredLanguage);

// Handle pages where language.js finished before this helper was evaluated.
if (window.langSystem?.isLoaded) {
    initializePreferredLanguage();
}
