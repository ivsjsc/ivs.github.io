/**
 * @fileoverview Single owner for the shared header's mobile drawer and submenu interactions.
 * The component loader calls init() after components/header.html has been injected.
 */

'use strict';

const IVSHeaderController = {
    _ivs_initialized: false,

    cacheDOM() {
        this.header = document.getElementById('ivs-main-header');
        this.mobilePanel = document.getElementById('ivs-mobile-menu-panel');
        this.mobileOpenBtn = document.getElementById('mobile-menu-open-btn');
        this.mobileCloseBtn = document.getElementById('mobile-menu-close-btn');
        this.mobileBackdrop = document.getElementById('ivs-mobile-menu-backdrop');
        this.mobileMenuContainer = document.getElementById('ivs-mobile-menu-container');
        this.mobileMenu = document.getElementById('ivs-mobile-main-nav');
        this.navLinks = document.querySelectorAll(
            'a.desktop-nav-link, .dropdown-item, #ivs-mobile-main-nav a, a.bottom-nav-item'
        );
    },

    resetSubmenus() {
        if (!this.mobileMenu) return;
        this.mobileMenu.querySelectorAll('.mobile-submenu-toggle').forEach(toggle => {
            toggle.setAttribute('aria-expanded', 'false');
        });
    },

    toggleMobileMenu(show) {
        if (!this.mobilePanel || !this.mobileMenuContainer) return;

        const shouldOpen = Boolean(show);
        this.mobileOpenBtn?.setAttribute('aria-expanded', String(shouldOpen));
        this.mobilePanel.setAttribute('aria-hidden', String(!shouldOpen));

        if (shouldOpen) {
            this.resetSubmenus();
            this.mobileMenu.scrollTop = 0;
            this.mobilePanel.classList.remove('hidden');
            document.body.classList.add('menu-open');
            requestAnimationFrame(() => {
                this.mobilePanel.classList.remove('opacity-0');
                this.mobileMenuContainer.classList.remove('translate-x-full');
                this.mobileCloseBtn?.focus();
            });
            return;
        }

        document.body.classList.remove('menu-open');
        this.mobilePanel.classList.add('opacity-0');
        this.mobileMenuContainer.classList.add('translate-x-full');
    },

    finishMobileMenuClose(event) {
        if (event.target !== this.mobileMenuContainer || event.propertyName !== 'transform') return;
        if (this.mobileOpenBtn?.getAttribute('aria-expanded') === 'true') return;

        this.mobilePanel?.classList.add('hidden');
        this.mobileOpenBtn?.focus();
    },

    toggleSubmenu(trigger) {
        const targetId = trigger.getAttribute('aria-controls');
        if (!targetId) return;

        const submenu = document.getElementById(targetId);
        if (!submenu || !this.mobileMenu?.contains(submenu)) return;

        const willOpen = trigger.getAttribute('aria-expanded') !== 'true';
        this.mobileMenu.querySelectorAll('.mobile-submenu-toggle').forEach(otherTrigger => {
            otherTrigger.setAttribute(
                'aria-expanded',
                String(otherTrigger === trigger && willOpen)
            );
        });
    },

    handleMobileMenuClick(event) {
        const trigger = event.target.closest('.mobile-submenu-toggle');
        if (trigger && this.mobileMenu.contains(trigger)) {
            event.preventDefault();
            this.toggleSubmenu(trigger);
            return;
        }

        const link = event.target.closest('a');
        if (!link || !this.mobileMenu.contains(link)) return;
        const href = link.getAttribute('href');
        if (href && href.includes('#')) {
            this.toggleMobileMenu(false);
        }
    },

    updateActiveLinks() {
        const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
        this.navLinks.forEach(link => {
            const linkPath = (link.getAttribute('href') || '').replace(/\/$/, '') || '/';
            link.classList.remove('active');
            if (linkPath === currentPath || (linkPath !== '/' && currentPath.startsWith(linkPath))) {
                link.classList.add('active');
            }
        });
    },

    onScroll() {
        this.header?.classList.toggle('scrolled', window.scrollY > 10);
    },

    bindEvents() {
        this.mobileOpenBtn?.addEventListener('click', event => {
            event.preventDefault();
            this.toggleMobileMenu(true);
        });
        this.mobileCloseBtn?.addEventListener('click', event => {
            event.preventDefault();
            this.toggleMobileMenu(false);
        });
        this.mobileBackdrop?.addEventListener('click', event => {
            if (event.target === this.mobileBackdrop) {
                this.toggleMobileMenu(false);
            }
        });
        this.mobileMenu?.addEventListener('click', event => this.handleMobileMenuClick(event));
        this.mobileMenuContainer?.addEventListener('transitionend', event => this.finishMobileMenuClose(event));

        window.addEventListener('scroll', () => this.onScroll(), { passive: true });
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 768 && this.mobileOpenBtn?.getAttribute('aria-expanded') === 'true') {
                this.toggleMobileMenu(false);
            }
        }, { passive: true });
        document.addEventListener('keydown', event => {
            if (event.key === 'Escape' && this.mobileOpenBtn?.getAttribute('aria-expanded') === 'true') {
                this.toggleMobileMenu(false);
            }
        });
    },

    init() {
        if (this._ivs_initialized) return;

        this.cacheDOM();
        if (!this.header || !this.mobilePanel || !this.mobileMenu) return;

        this.bindEvents();
        this.resetSubmenus();
        this.updateActiveLinks();
        this.onScroll();
        this._ivs_initialized = true;
    }
};

window.IVSHeaderController = IVSHeaderController;

// Supports pages that load the controller after an already-inlined header.
if (document.getElementById('ivs-main-header')) {
    IVSHeaderController.init();
}
