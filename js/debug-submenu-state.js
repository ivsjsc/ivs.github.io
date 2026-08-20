/**
 * Temporary debugging script to trace aria-expanded state changes
 * on mobile submenu buttons to identify duplicate event handlers
 */

(function debugSubmenuState() {
    console.log('=== DEBUG: Mobile Submenu State Tracer Started ===');
    
    // Monitor all mobile submenu toggle buttons
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'aria-expanded') {
                const target = mutation.target;
                if (target.classList.contains('mobile-submenu-toggle')) {
                    const oldValue = mutation.oldValue;
                    const newValue = target.getAttribute('aria-expanded');
                    const buttonLabel = target.querySelector('span')?.textContent || target.id || 'unknown';
                    const stackTrace = new Error().stack;
                    
                    console.log(`[ARIA-EXPANDED CHANGE] Button: "${buttonLabel}"`);
                    console.log(`  Old value: ${oldValue}`);
                    console.log(`  New value: ${newValue}`);
                    console.log(`  Stack trace:\n${stackTrace}`);
                    console.log('---');
                }
            }
        });
    });
    
    // Start observing when DOM is ready
    function startObserving() {
        const buttons = document.querySelectorAll('.mobile-submenu-toggle');
        console.log(`Found ${buttons.length} mobile submenu toggle buttons`);
        
        buttons.forEach((button, index) => {
            const label = button.querySelector('span')?.textContent || `Button ${index + 1}`;
            console.log(`Button ${index + 1}: "${label}" - aria-controls="${button.getAttribute('aria-controls')}" - aria-expanded="${button.getAttribute('aria-expanded')}"`);
            
            observer.observe(button, {
                attributes: true,
                attributeFilter: ['aria-expanded'],
                attributeOldValue: true
            });
        });
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startObserving);
    } else {
        startObserving();
    }
    
    // Also log all click event listeners on these buttons
    setTimeout(() => {
        console.log('=== Checking for click event listeners ===');
        const buttons = document.querySelectorAll('.mobile-submenu-toggle');
        buttons.forEach((button, index) => {
            const label = button.querySelector('span')?.textContent || `Button ${index + 1}`;
            console.log(`Button "${label}":`);
            
            // Try to get event listeners if Chrome DevTools is available
            if (window.getEventListeners) {
                const listeners = window.getEventListeners(button);
                console.log(`  Click listeners:`, listeners.click ? listeners.click.length : 0);
                if (listeners.click) {
                    listeners.click.forEach((listener, i) => {
                        console.log(`    Listener ${i + 1}:`, listener.listener);
                    });
                }
            } else {
                console.log('  (getEventListeners not available - need Chrome DevTools)');
            }
        });
    }, 2000);
    
    console.log('=== DEBUG: Mobile Submenu State Tracer Ready ===');
    console.log('Click on mobile submenu buttons to see state changes in console');
})();