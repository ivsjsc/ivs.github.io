/* IVS Academy shared UX runtime. No dependencies; safe for legacy pages. */
(function () {
  'use strict';

  if (window.__IVS_EXPERIENCE_INITIALIZED__) return;
  window.__IVS_EXPERIENCE_INITIALIZED__ = true;

  var html = document.documentElement;
  var path = window.location.pathname.toLowerCase();
  var localeCache = {};

  function isPlaceholderTranslation(value, key) {
    if (value == null || String(value).trim() === '') return true;
    var normalized = String(value).trim();
    if (normalized === key) return true;
    return /^(?:translated\s+|translate\s+|title$|description$|text$|subtitle$|label$|button$|content$)/i.test(normalized);
  }

  function setTranslatedContent(element, translated) {
    if (!element || translated == null) return;
    if (element.tagName === 'META') {
      element.setAttribute('content', translated);
    } else if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      element.placeholder = translated;
    } else if (element.children.length > 0) {
      var textNodes = Array.from(element.childNodes).filter(function (node) {
        return node.nodeType === Node.TEXT_NODE && node.textContent.trim();
      });
      if (textNodes.length) {
        textNodes[0].textContent = ' ' + translated + ' ';
        textNodes.slice(1).forEach(function (node) { node.remove(); });
      } else {
        element.textContent = translated;
      }
    } else {
      element.textContent = translated;
    }

    if (element.hasAttribute('data-lang-aria-label')) {
      element.setAttribute('aria-label', translated);
    }
  }

  async function loadLocale(language) {
    var code = language === 'zh-CN' ? 'zh' : language;
    if (!['vi', 'en', 'zh'].includes(code)) code = 'vi';
    if (localeCache[code]) return localeCache[code];

    var response = await fetch('/lang/' + code + '.json');
    if (!response.ok) throw new Error('Unable to load locale: ' + code);
    localeCache[code] = await response.json();
    return localeCache[code];
  }

  async function applyExperienceLanguage(language) {
    var code = language === 'zh-CN' ? 'zh' : language;
    if (!['vi', 'en', 'zh'].includes(code)) code = 'vi';

    try {
      var translations = await loadLocale(code);
      document.querySelectorAll('[data-lang-key]').forEach(function (element) {
        var key = element.getAttribute('data-lang-key');
        if (!Object.prototype.hasOwnProperty.call(translations, key)) return;
        var translated = translations[key];
        if (isPlaceholderTranslation(translated, key) && typeof window.translate === 'function') {
          translated = window.translate(key, code);
        }
        if (isPlaceholderTranslation(translated, key)) return;
        setTranslatedContent(element, String(translated));
      });

      html.lang = normalizeLanguage(code);
      html.dataset.ivsLanguage = normalizeLanguage(code);

      var status = document.querySelector('.ivs-service-directory__status');
      if (status && translations.ux_services_result_count) {
        status.dataset.resultTemplate = translations.ux_services_result_count;
        status.dataset.resultSingular = translations.ux_services_result_count_one || translations.ux_services_result_count;
      }
      var search = document.getElementById('service-directory-search');
      if (search) search.dispatchEvent(new Event('input'));
    } catch (error) {
      console.warn('[IVS Experience] Translation refresh failed:', error.message);
    }
  }

  function pageFamily() {
    if (/\/(admin|analytics|auth|hello|verified)|\/ai\/server\/static\//.test(path)) return 'system';
    if (/\/webapp(?:\/|$)/.test(path)) return 'app';
    if (/\/games\/|\/apps\/story\/|\/website\//.test(path)) return 'interactive';
    if (/\/pages\/apps\//.test(path)) return 'app';
    if (/\/blogs\/|\/legal\/|news-archive|profile-company|privacy|terms/.test(path)) return 'article';
    if (/gallery|learning-materials|tailieu|teacher-list|teacherlists|ivsapps/.test(path)) return 'directory';
    return 'marketing';
  }

  function currentLanguage() {
    try {
      return localStorage.getItem('userPreferredLanguage') || window.langSystem?.currentLanguage || html.lang || 'vi';
    } catch (_) {
      return window.langSystem?.currentLanguage || html.lang || 'vi';
    }
  }

  function normalizeLanguage(lang) {
    if (lang === 'zh' || lang === 'zh-cn') return 'zh-CN';
    if (lang === 'en') return 'en';
    return 'vi';
  }

  function markCurrentLinks(root) {
    var current = path.replace(/\/index\.html$/, '/').replace(/\/$/, '') || '/';
    root.querySelectorAll('a[href]').forEach(function (link) {
      var raw = link.getAttribute('href');
      if (!raw || raw.charAt(0) === '#' || /^(mailto:|tel:|javascript:)/i.test(raw)) return;
      try {
        var target = new URL(raw, window.location.origin);
        if (target.origin !== window.location.origin) return;
        var targetPath = target.pathname.toLowerCase().replace(/\/index\.html$/, '/').replace(/\/$/, '') || '/';
        if (targetPath === current) link.setAttribute('aria-current', 'page');
      } catch (_) {
        /* Ignore malformed legacy URLs without breaking navigation. */
      }
    });
  }

  function initServiceDirectory() {
    var directory = document.getElementById('service-directory');
    if (!directory) return;

    var input = directory.querySelector('#service-directory-search');
    var groups = Array.from(directory.querySelectorAll('.ivs-service-group'));
    var links = Array.from(directory.querySelectorAll('.ivs-service-link'));
    var empty = directory.querySelector('.ivs-service-directory__empty');
    var status = directory.querySelector('.ivs-service-directory__status');

    if (!input) return;

    function plain(value) {
      return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
    }

    function applyFilter() {
      var query = plain(input.value);
      var visibleCount = 0;

      links.forEach(function (link) {
        var matches = !query || plain(link.textContent + ' ' + (link.dataset.search || '')).includes(query);
        link.hidden = !matches;
        if (matches) visibleCount += 1;
      });

      groups.forEach(function (group) {
        var hasVisibleLinks = group.querySelector('.ivs-service-link:not([hidden])');
        group.hidden = !hasVisibleLinks;
        if (query && hasVisibleLinks) group.open = true;
      });

      if (empty) empty.classList.toggle('is-visible', visibleCount === 0);
      if (status) {
        var template = visibleCount === 1
          ? (status.dataset.resultSingular || status.dataset.resultTemplate || '{count} service')
          : (status.dataset.resultTemplate || '{count} services');
        status.textContent = template.replace('{count}', visibleCount);
      }
    }

    input.addEventListener('input', applyFilter);
    window.addEventListener('languageChanged', function () {
      window.setTimeout(applyFilter, 0);
    });
    applyFilter();
  }

  function ensureMobileActions() {
    var family = html.dataset.ivsFamily;
    if (family !== 'marketing' && family !== 'directory') return;
    if (document.querySelector('.ivs-mobile-actions')) return;

    var bar = document.createElement('nav');
    bar.className = 'ivs-mobile-actions';
    bar.setAttribute('aria-label', 'Quick actions');
    bar.innerHTML = [
      '<a href="/#service-directory"><i class="fas fa-grid-2" aria-hidden="true"></i><span data-lang-key="ux_mobile_services">Dịch vụ</span></a>',
      '<a href="/contact.html"><i class="fas fa-paper-plane" aria-hidden="true"></i><span data-lang-key="ux_mobile_consultation">Đăng ký tư vấn</span></a>'
    ].join('');
    document.body.appendChild(bar);

    var lang = window.langSystem?.currentLanguage || currentLanguage();
    if (typeof window.translate === 'function') {
      bar.querySelectorAll('[data-lang-key]').forEach(function (node) {
        var translated = window.translate(node.dataset.langKey, lang);
        if (translated && translated !== node.dataset.langKey) node.textContent = translated;
      });
    }
  }

  function refreshLanguageUi(lang) {
    var normalized = normalizeLanguage(lang || currentLanguage());
    html.lang = normalized;
    document.documentElement.dataset.ivsLanguage = normalized;

    var directory = document.getElementById('service-directory');
    if (directory) {
      var status = directory.querySelector('.ivs-service-directory__status');
      if (status && typeof window.translate === 'function') {
        var translationLanguage = lang === 'zh-CN' ? 'zh' : lang;
        var translatedTemplate = window.translate('ux_services_result_count', translationLanguage);
        if (translatedTemplate && translatedTemplate !== 'ux_services_result_count') {
          status.dataset.resultTemplate = translatedTemplate;
        }
        var translatedSingular = window.translate('ux_services_result_count_one', translationLanguage);
        if (translatedSingular && translatedSingular !== 'ux_services_result_count_one') {
          status.dataset.resultSingular = translatedSingular;
        }
      }
    }
  }

  function init() {
    html.dataset.ivsExperience = '2026';
    html.dataset.ivsFamily = pageFamily();
    refreshLanguageUi(currentLanguage());
    markCurrentLinks(document);
    initServiceDirectory();
    ensureMobileActions();
    applyExperienceLanguage(currentLanguage());

    if (typeof window.AOS !== 'undefined' && typeof window.AOS.refreshHard === 'function') {
      window.requestAnimationFrame(function () { window.AOS.refreshHard(); });
    }
  }

  window.addEventListener('languageChanged', function (event) {
    var language = event.detail?.language || currentLanguage();
    refreshLanguageUi(language);
    applyExperienceLanguage(language);
  });
  window.addEventListener('translationsLoaded', function () {
    // Saved user preference is authoritative. langSystem starts in Vietnamese
    // before its asynchronous locale load completes, so preferring it here
    // would reset a returning user's selected language on every page load.
    var language = currentLanguage();
    refreshLanguageUi(language);
    applyExperienceLanguage(language);
  });
  window.addEventListener('componentsLoaded', function () {
    markCurrentLinks(document);
    ensureMobileActions();
    applyExperienceLanguage(currentLanguage());
  });

  document.addEventListener('click', function (event) {
    var languageControl = event.target.closest?.('[data-lang]');
    if (!languageControl) return;
    var language = languageControl.getAttribute('data-lang');
    if (!['vi', 'en', 'zh'].includes(language)) return;
    window.setTimeout(function () { applyExperienceLanguage(language); }, 0);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
