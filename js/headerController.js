/**
 * @fileoverview IVSHeaderController: Xử lý toàn bộ logic tương tác của Header.
 * Được gọi bởi loadComponents.js sau khi component header.html được inject.
 * Giả định window.componentLog, window.debounce, window.changeLanguage có sẵn.
 */

'use strict';

const IVSHeaderController = {
    _ivs_initialized: false, 
    
    // Khởi tạo các phần tử DOM
    cacheDOM() {
        this.header = document.getElementById('ivs-main-header');
        this.mobilePanel = document.getElementById('ivs-mobile-menu-panel');
        this.mobileOpenBtn = document.getElementById('mobile-menu-open-btn');
        this.mobileCloseBtn = document.getElementById('mobile-menu-close-btn');
        this.mobileBackdrop = document.getElementById('ivs-mobile-menu-backdrop');
        this.mobileMenuContainer = document.getElementById('ivs-mobile-menu-container');
        this.langToggleButtons = document.querySelectorAll('.lang-toggle-btn');
        this.desktopDropdownToggles = document.querySelectorAll('.desktop-nav-dropdown-toggle');
        this.submenuToggles = document.querySelectorAll('.mobile-submenu-toggle');
        this.navLinks = document.querySelectorAll('a.desktop-nav-link, .dropdown-item, #ivs-mobile-main-nav a, a.bottom-nav-item');
    },

    // Mở/Đóng Mobile Menu
    toggleMobileMenu(show) {
        if (!this.mobilePanel || !this.mobileMenuContainer) return;
        
        if (show) {
            this.mobilePanel.classList.remove('hidden', 'opacity-0');
            document.body.classList.add('menu-open'); 
            if (this.mobileOpenBtn) this.mobileOpenBtn.setAttribute('aria-expanded', 'true');
            
            requestAnimationFrame(() => {
                this.mobileMenuContainer.classList.remove('translate-x-full');
            });

            // Focus management: focus close button when opened
            if (this.mobileCloseBtn) {
                setTimeout(() => this.mobileCloseBtn.focus(), 100);
            }

            // Reset Submenus on open
            this.submenuToggles.forEach(toggle => {
                toggle.setAttribute('aria-expanded', 'false');
                const targetId = toggle.getAttribute('aria-controls');
                const content = document.getElementById(targetId);
                if (content) {
                    content.style.maxHeight = '0px';
                    content.style.opacity = '0';
                    content.classList.remove('submenu-open');
                }
                const icon = toggle.querySelector('i.fa-chevron-down');
                if (icon) icon.style.transform = 'rotate(0deg)';
            });
        } else {
            this.mobilePanel.classList.add('opacity-0');
            this.mobileMenuContainer.classList.add('translate-x-full');
            if (this.mobileOpenBtn) this.mobileOpenBtn.setAttribute('aria-expanded', 'false');
            
            setTimeout(() => {
                this.mobilePanel.classList.add('hidden');
                document.body.classList.remove('menu-open');
                // Return focus to open button
                if (this.mobileOpenBtn) this.mobileOpenBtn.focus();
            }, 400);
        }
    },

    // Mở/Đóng Mobile Submenu
    toggleSubmenu(toggle) {
        const targetId = toggle.getAttribute('aria-controls');
        const content = document.getElementById(targetId);
        const icon = toggle.querySelector('.mobile-submenu-icon');
        if (!content) return;

        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';

        // Accordion behavior: close other open submenus when opening a new one
        if (!isExpanded) {
            this.submenuToggles.forEach(otherToggle => {
                if (otherToggle !== toggle && otherToggle.getAttribute('aria-expanded') === 'true') {
                    const otherTargetId = otherToggle.getAttribute('aria-controls');
                    const otherContent = document.getElementById(otherTargetId);
                    const otherIcon = otherToggle.querySelector('.mobile-submenu-icon');
                    if (otherContent) {
                        otherToggle.setAttribute('aria-expanded', 'false');
                        otherContent.style.maxHeight = '0px';
                        otherContent.style.opacity = '0';
                        otherContent.classList.remove('submenu-open');
                    }
                    if (otherIcon) {
                        otherIcon.style.transform = 'rotate(0deg)';
                    }
                }
            });
        }

        toggle.setAttribute('aria-expanded', !isExpanded);

        if (icon) {
            icon.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
        }

        if (isExpanded) {
            // Đóng submenu
            content.style.maxHeight = '0px';
            content.style.opacity = '0';
            content.classList.remove('submenu-open');
        } else {
            // Mở submenu
            content.classList.add('submenu-open');
            content.style.maxHeight = content.scrollHeight + 'px';
            content.style.opacity = '1';
        }
    },
    
    // Cập nhật trạng thái link Active
    updateActiveLinks() {
        const currentPath = window.location.pathname.replace(/\/$/, "") || "/";
        this.navLinks.forEach(link => {
            const linkPath = (link.getAttribute('href') || "").replace(/\/$/, "") || "/";
            link.classList.remove('active');
            if (linkPath === currentPath) {
                link.classList.add('active');
            } else if (linkPath !== "/" && currentPath.startsWith(linkPath)) {
                link.classList.add('active');
            }
        });
    },

    // Xử lý hiệu ứng Scroll trên Header
    onScroll() {
        if (this.header) {
            this.header.classList.toggle('scrolled', window.scrollY > 10);
        }
    },
    
    // Khởi tạo các sự kiện
    bindEvents() {
        if (typeof window.debounce !== 'function') window.debounce = (f, d) => f; // Fallback
        
        window.addEventListener('scroll', window.debounce(() => this.onScroll(), 50), { passive: true });
        
        // Close mobile menu when screen size becomes desktop size (>= 768px)
        window.addEventListener('resize', window.debounce(() => {
            if (window.innerWidth >= 768) {
                this.toggleMobileMenu(false);
            }
        }, 100));
        
        // Mobile Menu
        if (this.mobileOpenBtn) this.mobileOpenBtn.addEventListener('click', (e) => { e.preventDefault(); this.toggleMobileMenu(true); });
        if (this.mobileCloseBtn) this.mobileCloseBtn.addEventListener('click', (e) => { e.preventDefault(); this.toggleMobileMenu(false); });
        // Handle backdrop click on panel (outside container)
        if (this.mobilePanel) {
            this.mobilePanel.addEventListener('click', (e) => {
                // Only close if clicking directly on the panel, not on the container
                if (this.mobileMenuContainer && this.mobileMenuContainer.contains(e.target)) return;
                this.toggleMobileMenu(false);
            });
        }

        // Mobile Submenu
        this.submenuToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => { e.preventDefault(); this.toggleSubmenu(toggle); });
        });

        // Close menu on anchor link clicks
        const mobileLinks = document.querySelectorAll('#ivs-mobile-main-nav a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                const href = link.getAttribute('href');
                if (href && (href.startsWith('#') || href.includes('#'))) {
                    this.toggleMobileMenu(false);
                }
            });
        });

        // Global Escape key listener
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.mobilePanel && !this.mobilePanel.classList.contains('hidden')) {
                    this.toggleMobileMenu(false);
                }
                // Also close desktop dropdowns
                this.desktopDropdownToggles.forEach(toggle => {
                    const container = toggle.closest('.desktop-dropdown-container');
                    if (container && container.classList.contains('open')) {
                        container.classList.remove('open');
                        toggle.setAttribute('aria-expanded', 'false');
                    }
                });
            }
        });
        
        // Desktop Dropdown
        this.desktopDropdownToggles.forEach(toggle => {
            const container = toggle.closest('.desktop-dropdown-container');
            if (container) {
                toggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const isOpen = container.classList.contains('open');

                    document.querySelectorAll('.desktop-dropdown-container.open').forEach(c => {
                        if (c !== container) {
                            c.classList.remove('open');
                            const btn = c.querySelector('.desktop-nav-dropdown-toggle');
                            if (btn) btn.setAttribute('aria-expanded', 'false');
                        }
                    });

                    container.classList.toggle('open', !isOpen);
                    toggle.setAttribute('aria-expanded', !isOpen);
                });
            }
        });

        // Close Desktop Dropdown on outside click
        document.addEventListener('click', (e) => {
            this.desktopDropdownToggles.forEach(toggle => {
                const container = toggle.closest('.desktop-dropdown-container');
                if (container && container.classList.contains('open') && !container.contains(e.target)) {
                    container.classList.remove('open');
                    toggle.setAttribute('aria-expanded', 'false');
                }
            });
        });
        
        // Language Toggle (Giả định window.changeLanguage từ language.js)
        this.langToggleButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const lang = button.dataset.lang;
                if (lang && typeof window.changeLanguage === 'function') {
                    window.changeLanguage(lang).catch(err => window.componentLog(`Language switch error: ${err.message}`, 'error'));
                }
            });
        });

    },
    
    // Hàm khởi tạo chính
    init() {
        // If already initialized and header exists, nothing to do
        if (this._ivs_initialized && document.getElementById('ivs-main-header')) return;

        // Attempt to cache DOM; if header not present yet, do not mark initialized
        this.cacheDOM();

        if (!this.header) {
            // Header not in DOM yet. Log and exit; a later observer or loader should call init again.
            window.componentLog && window.componentLog("IVSHeaderController: Header not found during init. Will retry when header is available.", "warn");
            return;
        }

        // Bind events and finalize initialization
        this.bindEvents();
        this.updateActiveLinks();
        this.onScroll(); 

        // Đăng ký hàm cập nhật trạng thái nút ngôn ngữ vào Language System (giả định tồn tại)
        if (typeof window.registerLanguageUpdateCallback === 'function') {
            window.registerLanguageUpdateCallback(this.updateLanguageButtonStates.bind(this));
        }

        this._ivs_initialized = true;
        window.componentLog && window.componentLog("IVSHeaderController: Khởi tạo hoàn tất.", "info");
    },
    
    // Hàm này được gọi bởi Language System khi ngôn ngữ thay đổi
    updateLanguageButtonStates(currentLang) {
        if (!this.langToggleButtons) return;
        this.langToggleButtons.forEach(button => {
            button.classList.toggle('active-language', button.dataset.lang === currentLang);
        });
    }
};
window.IVSHeaderController = IVSHeaderController;

// Auto-initialize helper: ensure header controller is initialized when the
// header is present. This covers pages where header HTML is inlined,
// injected dynamically, or loaded via component loader at different times.
(function autoInitHeaderController() {
    function tryInit() {
        try {
            if (!window.IVSHeaderController) return;
            // Only init if header exists and controller wasn't initialized yet
            const headerExists = !!document.getElementById('ivs-main-header');
            if (headerExists && !window.IVSHeaderController._ivs_initialized) {
                window.IVSHeaderController.init();
            }
        } catch (err) {
            console.error('IVSHeaderController auto-init error:', err);
        }
    }

    // Try immediately in case DOM already has the header
    tryInit();

    // Init on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', tryInit);

    // Observe DOM for late injection (e.g. loadComponents.js) and init once when header appears
    const observer = new MutationObserver((mutations, obs) => {
        if (document.getElementById('ivs-main-header')) {
            tryInit();
            obs.disconnect();
        }
    });
    observer.observe(document.documentElement || document, { childList: true, subtree: true });
})();
