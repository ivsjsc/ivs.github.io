// Minimal language helper used by the site and tests.
// This file intentionally contains a small, robust implementation of translate()
// that the app and tests rely on. It avoids complex loading/initialization logic
// so it can be exercised directly by Playwright tests.

/* globals window */

'use strict';

(function () {
  // Ensure langSystem exists with sane defaults
  window.langSystem = window.langSystem || {};
  window.langSystem.defaultLanguage = window.langSystem.defaultLanguage || 'vi';
  window.langSystem.currentLanguage = window.langSystem.currentLanguage || window.langSystem.defaultLanguage;
  window.langSystem.translations = window.langSystem.translations || {};

  // Function to load translations
  async function loadTranslations() {
    try {
      const langs = ['vi', 'en', 'zh'];
      for (const lang of langs) {
        const response = await fetch(`/lang/${lang}.json`);
        if (!response.ok) {
          throw new Error(`Failed to load ${lang}.json`);
        }
        window.langSystem.translations[lang] = await response.json();
      }
      window.langSystem.isLoaded = true;
      // Dispatch a custom event when translations are loaded
      window.dispatchEvent(new CustomEvent('translationsLoaded'));
    } catch (error) {
      console.error('Failed to load translations:', error);
    }
  }

  // Load translations when the script is executed
  loadTranslations();

  function isUsableTranslation(value, key) {
    if (value === null) return true;
    if (typeof value !== 'string' || value.trim() === '') return false;
    const normalized = value.trim();
    if (normalized === key) return false;
    return !/^(?:translated\s+|translate\s+|title$|description$|text$|subtitle$|label$|button$|content$)/i.test(normalized);
  }

  // translate(key, lang?) — skips legacy placeholder values and falls back to
  // another complete locale before ever exposing a raw translation key.
  function translate(key, lang) {
    lang = lang || window.langSystem.currentLanguage;

    const fallbackOrder = lang === 'zh' ? ['zh', 'en', 'vi'] : (lang === 'en' ? ['en', 'vi'] : ['vi', 'en']);
    for (const candidate of fallbackOrder) {
      const locale = window.langSystem.translations?.[candidate];
      if (!locale || !Object.prototype.hasOwnProperty.call(locale, key)) continue;
      const value = locale[key];
      if (!isUsableTranslation(value, key)) continue;
      if (value === null) return '';
      return value;
    }

    // No translation found — return key (caller can detect this)
    return key;
  }

  // Expose globally for tests and application code
  window.translate = translate;

  function setElementTranslation(elem, translated) {
    if (elem.tagName === 'META') {
      elem.setAttribute('content', translated);
    } else if (elem.tagName === 'INPUT' || elem.tagName === 'TEXTAREA') {
      elem.placeholder = translated;
    } else if (elem.children.length > 0) {
      const directTextNodes = Array.from(elem.childNodes).filter(function(node) {
        return node.nodeType === Node.TEXT_NODE && node.textContent.trim();
      });
      if (directTextNodes.length) {
        directTextNodes[0].textContent = ' ' + translated + ' ';
        directTextNodes.slice(1).forEach(function(node) { node.remove(); });
      } else {
        elem.textContent = translated;
      }
    } else {
      elem.textContent = translated;
    }

    if (elem.hasAttribute('data-lang-aria-label')) {
      elem.setAttribute('aria-label', translated);
    }
  }

  // Change the current language and update UI/storage
  // Returns a Promise that resolves after language change is complete
  window.changeLanguage = function (newLang) {
    return Promise.resolve().then(function() {
      if (!newLang) throw new Error('Language code required');
      
      // Validate language code
      const validLangs = ['vi', 'en', 'zh'];
      if (!validLangs.includes(newLang)) {
        throw new Error('Invalid language code: ' + newLang);
      }
      
      // Update current language
      window.langSystem.currentLanguage = newLang;
      
      // Persist user preference
      if (window.localStorage) {
        localStorage.setItem('userPreferredLanguage', newLang);
      }
      
      // Update HTML lang attribute
      document.documentElement.lang = newLang === 'zh' ? 'zh-CN' : newLang;
      
      // Update all elements with data-lang-key attribute
      document.querySelectorAll('[data-lang-key]').forEach(function(elem) {
        const key = elem.getAttribute('data-lang-key');
        const translated = translate(key, newLang);
        if (translated === key) return;
        setElementTranslation(elem, translated);
      });
      
      // Dispatch custom event so other components can react to language change
      if (window.CustomEvent) {
        window.dispatchEvent(new CustomEvent('languageChanged', {
          detail: { language: newLang }
        }));
      }
    });
  };
})();
