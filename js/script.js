'use strict';

/**
 * @fileoverview script.js
 * This file contains all the initialization logic for shared components like the header,
 * footer, and FAB buttons. It is loaded by `loadComponents.js` after the
 * component HTML and core dependencies are ready.
 */

// --- HELPER FUNCTIONS ---

/**
 * Debounces a function to limit the rate at which it gets called.
 * @param {Function} func The function to debounce.
 * @param {number} wait The timeout in milliseconds.
 * @returns {Function} The debounced function.
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// --- INITIALIZATION FUNCTIONS ---
// These functions are exported to the global window scope to be called by the loader.

/**
 * Initializes all interactive functionalities of the Header component.
 * This includes desktop/mobile dropdowns, the mobile menu toggle, and the theme switcher.
 */
function initializeHeader() {
    const header = document.getElementById('navbar');
    if (!header) {
        window.componentLog('Header element with id "navbar" not found for initialization.', 'error');
        return;
    }

    // --- Desktop Dropdown Logic (Hover-based) ---
    header.querySelectorAll('.hidden.md\\:flex .relative').forEach(dropdown => {
        const button = dropdown.querySelector('button');
        const menu = dropdown.querySelector('.absolute');
        if (button && menu) {
            dropdown.addEventListener('mouseenter', () => menu.classList.remove('hidden'));
            dropdown.addEventListener('mouseleave', () => menu.classList.add('hidden'));
        }
    });

    // --- Language Switcher Dropdown (Click-based) ---
    const langToggle = document.getElementById('language-toggle');
    const langDropdown = document.getElementById('language-dropdown');
    if (langToggle && langDropdown) {
        langToggle.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent the document click listener from firing immediately
            langDropdown.classList.toggle('hidden');
        });
    }

    // --- Mobile Menu Toggle ---
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const openIcon = document.getElementById('mobile-menu-icon-open');
    const closeIcon = document.getElementById('mobile-menu-icon-close');
    if (mobileMenuButton && mobileMenu && openIcon && closeIcon) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            openIcon.classList.toggle('hidden');
            closeIcon.classList.toggle('hidden');
        });
    }
    
    // --- Mobile Dropdown Submenus (Click-based) ---
    document.querySelectorAll('.mobile-nav-link-dropdown').forEach(button => {
        button.addEventListener('click', () => {
            const dropdownId = button.getAttribute('data-target');
            const dropdownMenu = document.getElementById(dropdownId);
            if(dropdownMenu) {
                dropdownMenu.classList.toggle('hidden');
                const icon = button.querySelector('i.fa-chevron-down');
                if (icon) {
                    icon.classList.toggle('rotate-180');
                }
            }
        });
    });

    // --- Theme Toggle Logic ---
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const sunIcon = document.getElementById('theme-icon-sun');
        const moonIcon = document.getElementById('theme-icon-moon');
        const htmlEl = document.documentElement;

        themeToggle.addEventListener('click', () => {
            htmlEl.classList.toggle('dark');
            sunIcon.classList.toggle('hidden');
            moonIcon.classList.toggle('hidden');
            localStorage.setItem('theme', htmlEl.classList.contains('dark') ? 'dark' : 'light');
        });
    }
    
    // --- Global Click Listener to Close Dropdowns ---
    document.addEventListener('click', (event) => {
        // Close language dropdown if click is outside
        if (langDropdown && !langDropdown.classList.contains('hidden') && !langToggle.contains(event.target)) {
            langDropdown.classList.add('hidden');
        }
    });

    window.componentLog('Header has been fully initialized.', 'info');
}
window.initializeHeader = initializeHeader;


/**
 * Initializes all Floating Action Buttons, including the main toggle and scroll-to-top.
 * This function preserves the logic from the original `index.html`.
 */
function initializeFabButtons() {
    // --- Main FAB Menu Toggle (from original index.html) ---
    const fabContainer = document.getElementById('fab-container');
    const fabToggle = document.getElementById('fab-toggle');
    if (fabContainer && fabToggle) {
        fabToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            fabContainer.classList.toggle('open');
        });
        window.componentLog('Main FAB menu toggle initialized.', 'info');
    }

    // --- Scroll-to-Top FAB Logic ---
    const scrollToTopBtn = document.getElementById('scroll-to-top-btn');
    if (scrollToTopBtn) {
        const toggleVisibility = () => {
            scrollToTopBtn.classList.toggle('hidden', window.scrollY < 200);
        };
        window.addEventListener('scroll', debounce(toggleVisibility, 150));
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        window.componentLog('Scroll-to-top FAB initialized.', 'info');
    }
}
window.initializeFabButtons = initializeFabButtons;


/**
 * Initializes the footer, primarily by setting the current year.
 */
function initializeFooter() {
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
        window.componentLog('Footer initialized.', 'info');
    }
}
window.initializeFooter = initializeFooter;
/**
 * @fileoverview IVS Header Logic - Controls all header, dropdown, and menu interactions.
 * This script should be loaded after the main components (header, footer) are in the DOM.
 */

// Ensure global language system compatibility for header
if (!window.system) {
    window.system = window.langSystem;
}

// Encapsulate all header logic in a single object to avoid global scope pollution.
const IVSHeader = {
    // State properties
    isMobileMenuOpen: false,
    activeDesktopDropdown: null,

    /**
     * Initializes all event listeners and dynamic states for the header.
     * This function should be called once the header component is loaded.
     */
    init() {
        window.componentLog('IVSHeader Initializing...', 'info');
        this.addEventListeners();
        this.updateActiveLinks();
        this.updateLanguageDisplay();
        this.handleHeaderScroll();
    },

    /**
     * Centralized function for adding all necessary event listeners.
     */
    addEventListeners() {
        // --- Mobile Menu Listeners ---
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        const mobileMenuClose = document.getElementById('mobile-menu-close');
        const mobileMenuScrim = document.getElementById('mobile-menu-scrim');
        const bottomNavMenuButton = document.getElementById('bottom-nav-menu-button');

        mobileMenuToggle?.addEventListener('click', () => this.toggleMobileMenu());
        mobileMenuClose?.addEventListener('click', () => this.toggleMobileMenu(false));
        mobileMenuScrim?.addEventListener('click', () => this.toggleMobileMenu(false));
        bottomNavMenuButton?.addEventListener('click', () => this.toggleMobileMenu());

        // --- Mobile Submenu Listeners ---
        // Only bind if IVSHeaderController is not available
        if (!window.IVSHeaderController) {
            document.querySelectorAll('.mobile-submenu-toggle').forEach(button => {
                button.addEventListener('click', (e) => this.toggleMobileSubmenu(e.currentTarget));
            });
        }

        // --- Desktop Dropdown Listeners ---
        document.querySelectorAll('.nav-item').forEach(item => {
            const button = item.querySelector('button');
            if (button) {
                button.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleDesktopDropdown(item);
                });
            }
        });
        
        // --- Language Switcher Listeners ---
        document.querySelectorAll('.lang-option, .lang-option-mobile').forEach(button => {
            button.addEventListener('click', (e) => this.setLanguage(e.currentTarget.dataset.lang));
        });

        // --- Global Listeners ---
        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (this.activeDesktopDropdown && !this.activeDesktopDropdown.contains(e.target)) {
                this.toggleDesktopDropdown(this.activeDesktopDropdown, false);
            }
        });
        
        // Close menus with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.isMobileMenuOpen) this.toggleMobileMenu(false);
                if (this.activeDesktopDropdown) this.toggleDesktopDropdown(this.activeDesktopDropdown, false);
            }
        });
    },

    /**
     * Toggles the mobile menu open or closed.
     * @param {boolean} [forceState] - Force a specific state (true for open, false for close).
     */
    toggleMobileMenu(forceState = !this.isMobileMenuOpen) {
        this.isMobileMenuOpen = forceState;
        const panel = document.getElementById('mobile-menu-panel');
        const scrim = document.getElementById('mobile-menu-scrim');
        const toggleButton = document.getElementById('mobile-menu-toggle');

        if (this.isMobileMenuOpen) {
            scrim.classList.remove('hidden');
            panel.classList.remove('-right-full');
            panel.classList.add('right-0');
            document.body.style.overflow = 'hidden';
            toggleButton.setAttribute('aria-expanded', 'true');
        } else {
            scrim.classList.add('hidden');
            panel.classList.remove('right-0');
            panel.classList.add('-right-full');
            document.body.style.overflow = '';
            toggleButton.setAttribute('aria-expanded', 'false');
        }
    },

    /**
     * Toggles a mobile submenu.
     * @param {HTMLElement} toggleButton - The button that was clicked.
     */
    toggleMobileSubmenu(toggleButton) {
        const targetId = toggleButton.getAttribute('aria-controls');
        const content = document.getElementById(targetId);
        const icon = toggleButton.querySelector('.mobile-submenu-icon');
        if (!content) return;
        const wasActive = content.classList.contains('active');

        // Close all other submenus first
        document.querySelectorAll('.mobile-submenu-content.active').forEach(activeContent => {
            if (activeContent !== content) {
                activeContent.classList.remove('active');
                activeContent.style.maxHeight = null;
                const otherButton = document.querySelector(`.mobile-submenu-toggle[aria-controls="${activeContent.id}"]`);
                const otherIcon = otherButton ? otherButton.querySelector('.mobile-submenu-icon') : null;
                if(otherIcon) otherIcon.style.transform = 'rotate(0deg)';
            }
        });

        // Toggle the clicked one
        if (wasActive) {
            content.classList.remove('active');
            content.style.maxHeight = null;
            if(icon) icon.style.transform = 'rotate(0deg)';
        } else {
            content.classList.add('active');
            content.style.maxHeight = content.scrollHeight + 'px';
            if(icon) icon.style.transform = 'rotate(180deg)';
        }
    },

    /**
     * Toggles a desktop dropdown menu.
     * @param {HTMLElement} navItem - The parent .nav-item element.
     * @param {boolean} [forceState] - Force a specific state.
     */
    toggleDesktopDropdown(navItem, forceState) {
        const isCurrentlyActive = navItem.classList.contains('dropdown-active');
        const shouldBeActive = forceState !== undefined ? forceState : !isCurrentlyActive;
        const button = navItem.querySelector('button');

        // Close any other active dropdown
        if (this.activeDesktopDropdown && this.activeDesktopDropdown !== navItem) {
            this.activeDesktopDropdown.classList.remove('dropdown-active');
             const otherButton = this.activeDesktopDropdown.querySelector('button');
             if(otherButton) otherButton.setAttribute('aria-expanded', 'false');
        }

        // Toggle the target dropdown
        if (shouldBeActive) {
            navItem.classList.add('dropdown-active');
            if(button) button.setAttribute('aria-expanded', 'true');
            this.activeDesktopDropdown = navItem;
        } else {
            navItem.classList.remove('dropdown-active');
            if(button) button.setAttribute('aria-expanded', 'false');
            this.activeDesktopDropdown = null;
        }
    },

    /**
     * Sets the language by calling the global language system.
     * @param {string} lang - The language code ('vi' or 'en').
     */
    setLanguage(lang) {
        // Use the correct language system API
        if (window.langSystem && typeof window.langSystem.setLanguage === 'function') {
            window.langSystem.setLanguage(lang);
        } else {
            window.componentLog('Language system (window.langSystem.setLanguage) not found.', 'warn');
        }
        this.updateLanguageDisplay(lang);
        if (this.activeDesktopDropdown) this.toggleDesktopDropdown(this.activeDesktopDropdown, false);
        if (this.isMobileMenuOpen) this.toggleMobileMenu(false);
    },

    /**
     * Updates the language display in the header.
     * @param {string} [currentLang] - The current language code.
     */
    updateLanguageDisplay(currentLang) {
        let lang = 'vi';
        if (currentLang) {
            lang = currentLang;
        } else if (window.system && typeof window.system.getCurrentLanguage === 'function') {
            lang = window.system.getCurrentLanguage();
        }
        const desktopLangDisplay = document.getElementById('current-lang-desktop');
        if (desktopLangDisplay) {
            desktopLangDisplay.textContent = lang.toUpperCase();
        }
    },

    /**
     * Finds and applies 'active' class to links matching the current page URL.
     */
    updateActiveLinks() {
        const currentPath = window.location.pathname;
        const allLinks = document.querySelectorAll('a.nav-link, a.mobile-nav-link, a.mobile-nav-link-sub, a.bottom-nav-item');

        allLinks.forEach(link => {
            // Perfect match or if it's a parent path (e.g., /solutions for /solutions/tech)
            if (link.getAttribute('href') === currentPath || (link.getAttribute('href') !== '/' && currentPath.startsWith(link.getAttribute('href')))) {
                link.classList.add('active');
                
                // If it's a submenu link, also open the parent submenu
                const parentSubmenuContent = link.closest('.mobile-submenu-content');
                if(parentSubmenuContent) {
                    const toggleButton = parentSubmenuContent.previousElementSibling;
                    this.toggleMobileSubmenu(toggleButton);
                }
            } else {
                link.classList.remove('active');
            }
        });
    },

    /**
     * Adds a subtle shadow to the header when the user scrolls down.
     */
    handleHeaderScroll() {
        const header = document.getElementById('main-header');
        if (!header) return;

        window.addEventListener('scroll', () => {
            if (window.scrollY > 10) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
};

// --- Initialization ---
// The component loader should ensure this runs after the header is in the DOM.
// We can use the callback from loadComponents.js or simply defer this script.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => IVSHeader.init());
} else {
    IVSHeader.init();
}
