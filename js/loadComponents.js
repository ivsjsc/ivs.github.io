/*
 * Compatibility entrypoint for legacy pages.
 * The maintained loader lives at /ai/js/loadComponents.js, while many historic
 * routes still reference /js/loadComponents.js.
 */
(function () {
  'use strict';

  if (window.__IVS_COMPONENT_LOADER_COMPAT__) return;
  window.__IVS_COMPONENT_LOADER_COMPAT__ = true;

  var current = document.currentScript;
  var maintainedLoaderPresent = Array.from(document.scripts).some(function (script) {
    var src = script.getAttribute('src') || '';
    return /(?:^|\/)ai\/js\/loadComponents\.js(?:[?#]|$)/.test(src);
  });

  if (maintainedLoaderPresent) return;

  var script = document.createElement('script');
  script.src = '/ai/js/loadComponents.js?v=20260821.6';
  script.defer = true;
  script.dataset.ivsMaintainedLoader = 'true';
  (current?.parentNode || document.head || document.documentElement).appendChild(script);
})();
