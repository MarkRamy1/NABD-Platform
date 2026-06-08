// i18n Module - Manage translations
let currentLanguage = localStorage.getItem('language') || 'en';
let translations = {};

// Load translations from locale JSON files
async function loadTranslations(lang) {
    try {
        const response = await fetch(`locales/${lang}/common.json`);
        translations = await response.json();
        currentLanguage = lang;
        localStorage.setItem('language', lang);
        applyLanguage();
    } catch (error) {
        console.error(`Error loading ${lang} translations:`, error);
        // Fallback: Load default English if available
        if (lang !== 'en') {
            try {
                const fallback = await fetch('locales/en/common.json');
                translations = await fallback.json();
                currentLanguage = 'en';
            } catch (fallbackError) {
                console.error('Failed to load fallback translations:', fallbackError);
            }
        }
    }
}

// Get translation for a key (e.g., "nav.home")
function t(key) {
    const keys = key.split('.');
    let value = translations;
    for (let k of keys) {
        value = value[k];
        if (!value) return key; // Return key if not found
    }
    return value;
}

// Apply language to UI
function applyLanguage() {
    const htmlRoot = document.documentElement;
    const bodyRoot = document.body;
    
    // Set language and direction
    htmlRoot.lang = currentLanguage;
    bodyRoot.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
    
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });
    
    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.placeholder = t(key);
    });
    
    // Update select options with data-i18n (for sort/filter dropdowns)
    document.querySelectorAll('option[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });
    
    // Sync language selector if present
    const langSelect = document.getElementById('lang-select');
    if (langSelect) {
        langSelect.value = currentLanguage;
    }
}

// Initialize i18n
function initI18n() {
    loadTranslations(currentLanguage);
}
