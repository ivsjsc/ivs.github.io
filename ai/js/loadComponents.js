/**
 * js/componentLoader.js
 * * Logic trung tâm chịu trách nhiệm tải component (Header, Footer, Fab Container)
 * * Sử dụng IVSHeaderController và IVSFooterController từ file riêng.
 */

'use strict';

// Ensure componentLog and debounce (from utils.js) are available
if (typeof window.componentLog !== 'function') {
    window.componentLog = (msg, level = 'info') => console[level](`[IVS Loader] ${msg}`);
}
if (typeof window.debounce !== 'function') {
    window.debounce = (func) => func;
}

/**
 * Load the shared UX foundation once. This keeps legacy pages on one responsive,
 * accessible baseline without forcing every historical HTML file to be rewritten.
 */
function ensureExperienceFoundation() {
    if (!document.querySelector('link[data-ivs-experience]')) {
        const stylesheet = document.createElement('link');
        stylesheet.rel = 'stylesheet';
        stylesheet.href = '/css/experience.css?v=20260821.6';
        stylesheet.dataset.ivsExperience = '2026';
        document.head.appendChild(stylesheet);
    }

    if (!document.querySelector('script[data-ivs-experience]') && !window.__IVS_EXPERIENCE_INITIALIZED__) {
        const script = document.createElement('script');
        script.src = '/js/experience.js?v=20260821.6';
        script.defer = true;
        script.dataset.ivsExperience = '2026';
        document.head.appendChild(script);
    }
}

function ensureHeaderController() {
    if (window.IVSHeaderController) return Promise.resolve(window.IVSHeaderController);
    if (window.__ivsHeaderControllerPromise) return window.__ivsHeaderControllerPromise;

    window.__ivsHeaderControllerPromise = new Promise((resolve, reject) => {
        const existingScript = document.querySelector('script[src^="/js/headerController.js"]');
        const script = existingScript || document.createElement('script');

        const handleLoad = () => {
            if (window.IVSHeaderController) {
                resolve(window.IVSHeaderController);
            } else {
                reject(new Error('IVSHeaderController did not register after loading'));
            }
        };

        script.addEventListener('load', handleLoad, { once: true });
        script.addEventListener('error', () => reject(new Error('Failed to load IVSHeaderController')), { once: true });

        if (!existingScript) {
            script.src = '/js/headerController.js?v=20260821.7';
            script.defer = true;
            document.head.appendChild(script);
        }
    });

    return window.__ivsHeaderControllerPromise;
}

// =================================================================
// COMPONENT LOADER CORE
// =================================================================

// fetchWithRetry và safeInitController (Code từ mẫu loadComponents.js của bạn)
async function fetchWithRetry(resource, options = {}) {
    const attempts = options.attempts || 3;
    const timeout = options.timeout || 5000;
    
    // keep root-relative component paths (do not rewrite /components/ to relative)

    for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), timeout);
            const resp = await fetch(resource, { signal: controller.signal });
            clearTimeout(id);
            return resp;
        } catch (err) {
            window.componentLog(`fetchWithRetry: attempt ${attempt} for ${resource} failed: ${err.message}`, attempt < attempts ? 'warn' : 'error');
            if (attempt === attempts) throw err;
            const backoff = Math.min(2000 * attempt, 8000);
            const jitter = Math.floor(Math.random() * 300);
            await new Promise(r => setTimeout(r, backoff + jitter));
        }
    }
    throw new Error(`Failed to fetch ${resource} after ${attempts} attempts.`);
}

async function loadAndInject(url, placeholderId) {
    const normalize = (u) => {
        if (typeof u !== 'string') return u;
        // Ensure components are fetched from the site root so pages in subfolders work.
        if (u.startsWith('/components/')) return u; // already root-relative
        if (u.startsWith('components/')) return '/' + u; // make root-relative
        return u;
    };
    const normalizedUrl = normalize(url);
    const placeholder = document.getElementById(placeholderId);
    if (!placeholder) {
        window.componentLog(`Placeholder '${placeholderId}' not found.`, "error");
        return false;
    }
    try {
        if (placeholder.querySelector(`[data-component-src="${normalizedUrl}"]`)) return true; // Already loaded

        const response = await fetchWithRetry(normalizedUrl, { attempts: 3, timeout: 5000 });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const text = await response.text();
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = text;
        const scripts = Array.from(tempDiv.querySelectorAll('script'));
        scripts.forEach(script => script.parentNode?.removeChild(script));
        
        const wrapper = document.createElement('div');
        wrapper.setAttribute('data-component-src', normalizedUrl);
        wrapper.innerHTML = tempDiv.innerHTML;
        placeholder.appendChild(wrapper);

        for (const oldScript of scripts) {
            const newScript = document.createElement('script');
            Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
            if (oldScript.src) {
                newScript.src = oldScript.src;
                await new Promise((resolve, reject) => {
                    newScript.onload = resolve;
                    newScript.onerror = reject;
                    wrapper.appendChild(newScript);
                });
            } else {
                newScript.textContent = oldScript.textContent;
                wrapper.appendChild(newScript);
            }
        }
        return true;
    } catch (error) {
        window.componentLog(`Failed to load ${url}: ${error.message}`, 'error');
        const fallbackHTML = `<div class="p-4 text-center bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 shadow-md">Lỗi tải Component: ${url}</div>`;
        // If placeholder is empty, replace it; if it already has content (e.g. a parent component), append
        if (placeholder) {
            try {
                if (placeholder.children && placeholder.children.length === 0) {
                    placeholder.innerHTML = fallbackHTML;
                } else {
                    // Avoid clobbering existing injected component content
                    placeholder.insertAdjacentHTML('beforeend', fallbackHTML);
                }
            } catch (e) {
                // Last-resort: log but do not throw - we don't want a single missing nested component to break the page
                window.componentLog(`Error while writing fallback HTML for ${url}: ${e.message}`, 'warn');
            }
        }
        return false;
    }
}

async function safeInitController(controller, id) {
    const maxAttempts = 6;
    const baseDelay = 25;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            if (controller && typeof controller.init === 'function') {
                controller.init();
                window.componentLog(`Controller for ${id} initialized.`, 'info');
                return;
            } else {
                window.componentLog(`Controller for ${id} missing init or not provided.`, 'warn');
                return;
            }
        } catch (err) {
            window.componentLog(`safeInitController attempt ${attempt} for ${id} failed: ${err.message}`, attempt < maxAttempts ? 'warn' : 'error');
            await new Promise(r => setTimeout(r, baseDelay * attempt));
        }
    }
    window.componentLog(`safeInitController: Failed to initialize controller for ${id} after ${maxAttempts} attempts.`, 'error');
}


/**
 * Loads common components (header, fab-container, footer) and initializes their controllers.
 */
async function loadCommonComponents() {
    if (window.__IVS_components_loadingStarted) return;
    window.__IVS_components_loadingStarted = true;

    ensureExperienceFoundation();

    try {
        await ensureHeaderController();
    } catch (error) {
        window.componentLog(`Header controller unavailable: ${error.message}`, 'error');
    }

    window.componentLog("Initializing component sequence...", "info");
    // Ensure common placeholders exist so components can be injected even on pages
    // that didn't include placeholders explicitly in their HTML.
    if (!document.getElementById('fab-container-placeholder')) {
        const ph = document.createElement('div');
        ph.id = 'fab-container-placeholder';
        document.body.appendChild(ph);
        window.componentLog('Created missing #fab-container-placeholder dynamically.', 'info');
    }
    if (!document.getElementById('ai-assistant-placeholder')) {
        const ph2 = document.createElement('div');
        ph2.id = 'ai-assistant-placeholder';
        document.body.appendChild(ph2);
        window.componentLog('Created missing #ai-assistant-placeholder dynamically.', 'info');
    }
    // Sử dụng đường dẫn Root-Relative Path
    const components = [
        { id: 'header-placeholder', url: '/components/header.html?v=20260821.7', controller: window.IVSHeaderController },
        // Giả định IVSFabController từ fabController.js đã định nghĩa
        { id: 'fab-container-placeholder', url: '/ai/components/fab-container.html?v=20260821.6', controller: window.IVSFabController },
        // Cookie consent component - site-wide privacy / cookie banner
        { id: 'cookie-consent-placeholder', url: '/components/cookie-consent.html', controller: window.IVSCookieConsentController }
    ];

    const footerComponent = { id: 'footer-placeholder', url: '/components/footer.html?v=20260821.6', controller: window.IVSFooterController };

    // Tải Header và FAB trước
    for (const comp of components) {
        if (document.getElementById(comp.id)) {
            const success = await loadAndInject(comp.url, comp.id);
            if (success && comp.controller) {
                await safeInitController(comp.controller, comp.id);
            }
        }
    }

    // Tải fab-assistant trực tiếp vào #fab-container bên trong fab-container.html (nếu có)
    // DISABLED: Only scroll-to-top button remains, fab-assistant is disabled
    /*
    try {
        const fabContainer = document.getElementById('fab-container');
        if (fabContainer) {
            // Only attempt to load the assistant into the actual container to avoid replacing the placeholder
            const assistantSuccess = await loadAndInject('/components/fab-assistant.html', 'fab-container');
            if (assistantSuccess) {
                window.componentLog('fab-assistant loaded into #fab-container', 'info');
                // Try to init FAB controller if available
                if (window.IVSFabController && typeof window.IVSFabController.init === 'function') {
                    await safeInitController(window.IVSFabController, 'fab-container');
                }
            }
        } else {
            window.componentLog('fab-container element not present; skipping fab-assistant automatic load.', 'info');
        }
    } catch (err) {
        window.componentLog('Failed to load fab-assistant: ' + (err && err.message ? err.message : err), 'warn');
    }
    */

    // Ensure the AI assistant window markup is present somewhere in the document.
    // Some pages don't include an explicit placeholder for the assistant; create one
    // and inject the component so IVSAssistant can find its DOM elements and bind events.
    try {
        if (!document.getElementById('ai-assistant-placeholder')) {
            const ph = document.createElement('div');
            ph.id = 'ai-assistant-placeholder';
            // Append near end of body so it's available visually above other elements (fab-topmost ensures stacking)
            document.body.appendChild(ph);
        }
        const aiSuccess = await loadAndInject('/ai/components/ai-assistant.html?v=20260821.6', 'ai-assistant-placeholder');
        if (aiSuccess) {
            window.componentLog('ai-assistant component injected.', 'info');
            // If the assistant class exists, ensure it's initialized now that DOM is present.
            try {
                if (window.IVSAssistant && typeof window.IVSAssistant.init === 'function') {
                    window.IVSAssistant.init();
                    window.componentLog('Existing IVSAssistant.init() called after injection.', 'info');
                } else if (typeof IVSAssistant === 'function') {
                    // Create a new instance if not already present
                    window.IVSAssistant = new IVSAssistant();
                    window.componentLog('IVSAssistant instance created after injection.', 'info');
                }
            } catch (e) {
                window.componentLog('Error initializing IVSAssistant after injection: ' + (e && e.message ? e.message : e), 'warn');
            }
        }
    } catch (err) {
        window.componentLog('Failed to inject ai-assistant component: ' + (err && err.message ? err.message : err), 'warn');
    }

    // Tải Footer sau cùng
    if (document.getElementById(footerComponent.id)) {
        const success = await loadAndInject(footerComponent.url, footerComponent.id);
        if (success && footerComponent.controller) {
            await safeInitController(footerComponent.controller, footerComponent.id);
        }
    }
    
    // Khởi tạo thư viện AOS (Animate On Scroll)
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 700,
            once: true,
            offset: 50,
            easing: 'ease-out-cubic'
        });
    }

    // Thực hiện callback của trang cụ thể
    window.onPageComponentsLoadedCallback?.();

    window.dispatchEvent(new CustomEvent('componentsLoaded', {
        detail: { source: 'loadComponents' }
    }));

    window.componentLog("Component sequence complete.", "info");
}

// Gán hàm loader chính vào biến global mà trang HTML gọi
window.loadComponentsAndInitialize = loadCommonComponents;

// Tự động khởi động khi DOM sẵn sàng, kể cả khi compatibility loader được tải động.
function startComponentLoader() {
    // Defensive: if multiple <script> tags referencing loadComponents.js were accidentally
    // inserted into the page (some pages historically contain both "js/loadComponents.js"
    // and "/js/loadComponents.js"), dedupe them now to avoid double initialization
    // and duplicate network loads. We keep the currently executing script element and
    // remove other script elements that reference loadComponents.js.
    try {
        const currentScript = document.currentScript;
        if (currentScript) {
            const srcMatchers = ['js/loadComponents.js', '/js/loadComponents.js'];
            const allScripts = Array.from(document.getElementsByTagName('script'));
            let removed = 0;
            for (const s of allScripts) {
                try {
                    const src = s.getAttribute && s.getAttribute('src');
                    if (!src) continue;
                    // If this is a different script element referencing the same loader, remove it
                    if (srcMatchers.includes(src) && s !== currentScript) {
                        s.parentNode && s.parentNode.removeChild(s);
                        removed++;
                    }
                } catch (e) {
                    // ignore individual script removal errors
                }
            }
            if (removed > 0) window.componentLog(`Removed ${removed} duplicate loadComponents.js <script> tag(s)`, 'info');
        }
    } catch (e) {
        // Non-fatal; continue to initialization
        window.componentLog(`Dedupe check failed: ${e && e.message ? e.message : e}`, 'warn');
    }

    if (!window.__IVS_components_loadingStarted) {
        loadCommonComponents().catch(err => window.componentLog(`Error during automatic component loading: ${err.message}`, 'error'));
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startComponentLoader, { once: true });
} else {
    startComponentLoader();
}
