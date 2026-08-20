/**
 * Mobile Dropdown Debug Audit Script
 * Run this in browser console on index.html to perform runtime audit
 */

(function() {
    console.log('%c=== MOBILE DROPDOWN DEBUG AUDIT ===', 'color: #00ff00; font-size: 16px; font-weight: bold;');
    
    // 1. DOM STRUCTURE VERIFICATION
    console.log('%c\n1. DOM STRUCTURE VERIFICATION', 'color: #ffff00; font-size: 14px; font-weight: bold;');
    
    const submenuToggles = document.querySelectorAll('.mobile-submenu-toggle');
    console.log(`Found ${submenuToggles.length} mobile submenu toggles`);
    
    submenuToggles.forEach((toggle, index) => {
        const buttonText = toggle.textContent.trim();
        const nextSibling = toggle.nextElementSibling;
        const ariaControls = toggle.getAttribute('aria-controls');
        const targetExists = ariaControls ? !!document.getElementById(ariaControls) : false;
        
        console.log(`\nToggle ${index + 1}:`);
        console.log(`  Button text: "${buttonText}"`);
        console.log(`  nextElementSibling: ${nextSibling ? nextSibling.tagName + '.' + nextSibling.className : 'null'}`);
        console.log(`  aria-controls: "${ariaControls}"`);
        console.log(`  Target exists: ${targetExists ? 'YES' : 'NO'}`);
    });
    
    // 2. BUTTON SIBLING CHECK
    console.log('%c\n2. BUTTON SIBLING CHECK', 'color: #ffff00; font-size: 14px; font-weight: bold;');
    
    submenuToggles.forEach((toggle, index) => {
        const nextSibling = toggle.nextElementSibling;
        const parent = toggle.parentElement;
        const children = Array.from(parent.children);
        const buttonIndex = children.indexOf(toggle);
        
        console.log(`\nToggle ${index + 1}:`);
        console.log(`  Parent: ${parent.tagName}.${parent.className}`);
        console.log(`  Parent children: ${children.map(c => c.tagName).join(', ')}`);
        console.log(`  Button index in parent: ${buttonIndex}`);
        console.log(`  Next sibling: ${nextSibling ? nextSibling.tagName + '.' + nextSibling.className : 'null'}`);
        console.log(`  Is next sibling a submenu div? ${nextSibling && nextSibling.classList.contains('mobile-submenu-content') ? 'YES' : 'NO'}`);
    });
    
    // 3. EVENT LISTENER ARCHITECTURE
    console.log('%c\n3. EVENT LISTENER ARCHITECTURE', 'color: #ffff00; font-size: 14px; font-weight: bold;');
    
    // Check IVSHeaderController
    if (window.IVSHeaderController) {
        console.log(`IVSHeaderController exists: YES`);
        console.log(`IVSHeaderController initialized: ${window.IVSHeaderController._ivs_initialized ? 'YES' : 'NO'}`);
    } else {
        console.log(`IVSHeaderController exists: NO`);
    }
    
    // Check for direct event listeners
    const hasDirectListeners = submenuToggles.length > 0 && submenuToggles[0].onclick !== null;
    console.log(`Direct onclick handlers: ${hasDirectListeners ? 'YES' : 'NO'}`);
    
    // 4. CSS SELECTOR ANALYSIS
    console.log('%c\n4. CSS SELECTOR ANALYSIS', 'color: #ffff00; font-size: 14px; font-weight: bold;');
    
    // Test the CSS selector that was supposedly broken
    const testToggle = submenuToggles[0];
    if (testToggle) {
        testToggle.setAttribute('aria-expanded', 'true');
        const siblingSelector = testToggle.nextElementSibling;
        console.log(`Testing selector: .mobile-submenu-toggle[aria-expanded="true"] + .mobile-submenu-content`);
        console.log(`Next sibling is .mobile-submenu-content: ${siblingSelector && siblingSelector.classList.contains('mobile-submenu-content') ? 'YES' : 'NO'}`);
        testToggle.setAttribute('aria-expanded', 'false');
    }
    
    // 5. RUNTIME AUDIT FUNCTION
    console.log('%c\n5. RUNTIME AUDIT FUNCTION', 'color: #ffff00; font-size: 14px; font-weight: bold;');
    console.log('Run: auditDropdown("Về IVS") to audit specific dropdown');
    
    window.auditDropdown = function(buttonText) {
        const button = Array.from(document.querySelectorAll('.mobile-submenu-toggle'))
            .find(b => b.textContent.includes(buttonText));
        
        if (!button) {
            console.error(`Button with text "${buttonText}" not found`);
            return;
        }
        
        const submenu = button.nextElementSibling;
        if (!submenu) {
            console.error('No submenu found as next sibling');
            return;
        }
        
        console.log(`%c\n=== AUDITING: "${buttonText}" ===`, 'color: #00ffff; font-size: 14px; font-weight: bold;');
        
        // BEFORE CLICK
        console.log('%cBEFORE CLICK:', 'color: #ff0000; font-weight: bold;');
        console.log('  Button aria-expanded:', button.getAttribute('aria-expanded'));
        console.log('  Button classList:', button.className);
        console.log('  Submenu classList:', submenu.className);
        console.log('  Submenu inline style:', submenu.style.cssText);
        console.log('  Computed display:', getComputedStyle(submenu).display);
        console.log('  Computed visibility:', getComputedStyle(submenu).visibility);
        console.log('  Computed opacity:', getComputedStyle(submenu).opacity);
        console.log('  Computed max-height:', getComputedStyle(submenu).maxHeight);
        console.log('  Computed height:', getComputedStyle(submenu).height);
        console.log('  Computed overflow:', getComputedStyle(submenu).overflow);
        console.log('  Computed pointer-events:', getComputedStyle(submenu).pointerEvents);
        
        // Parent constraints
        const parent = submenu.parentElement;
        console.log('  Parent overflow:', getComputedStyle(parent).overflow);
        console.log('  Parent height:', getComputedStyle(parent).height);
        console.log('  Parent max-height:', getComputedStyle(parent).maxHeight);
        console.log('  Parent display:', getComputedStyle(parent).display);
        
        // CLICK
        console.log('%c\nCLICKING BUTTON...', 'color: #ffff00;');
        button.click();
        
        // AFTER CLICK
        setTimeout(() => {
            console.log('%cAFTER CLICK:', 'color: #00ff00; font-weight: bold;');
            console.log('  Button aria-expanded:', button.getAttribute('aria-expanded'));
            console.log('  Button classList:', button.className);
            console.log('  Submenu classList:', submenu.className);
            console.log('  Submenu inline style:', submenu.style.cssText);
            console.log('  Computed display:', getComputedStyle(submenu).display);
            console.log('  Computed visibility:', getComputedStyle(submenu).visibility);
            console.log('  Computed opacity:', getComputedStyle(submenu).opacity);
            console.log('  Computed max-height:', getComputedStyle(submenu).maxHeight);
            console.log('  Computed height:', getComputedStyle(submenu).height);
            console.log('  Computed overflow:', getComputedStyle(submenu).overflow);
            console.log('  Computed pointer-events:', getComputedStyle(submenu).pointerEvents);
            
            // Parent constraints after
            console.log('  Parent overflow:', getComputedStyle(parent).overflow);
            console.log('  Parent height:', getComputedStyle(parent).height);
            console.log('  Parent max-height:', getComputedStyle(parent).maxHeight);
            console.log('  Parent display:', getComputedStyle(parent).display);
            
            // Check for CSS !important rules
            console.log('%c\nCSS RULES CHECK:', 'color: #ffff00; font-weight: bold;');
            const stylesheets = document.styleSheets;
            let foundImportant = false;
            try {
                for (let sheet of stylesheets) {
                    try {
                        const rules = sheet.cssRules || sheet.rules;
                        for (let rule of rules) {
                            if (rule.selectorText && rule.selectorText.includes('mobile-submenu-content')) {
                                if (rule.cssText.includes('!important')) {
                                    console.log(`  !important rule found: ${rule.selectorText}`);
                                    foundImportant = true;
                                }
                            }
                        }
                    } catch (e) {
                        // CORS restriction
                    }
                }
            } catch (e) {
                console.log('  Cannot access all stylesheets (CORS)');
            }
            if (!foundImportant) {
                console.log('  No !important rules found for mobile-submenu-content');
            }
            
        }, 100);
    };
    
    console.log('%c\n=== AUDIT COMPLETE ===', 'color: #00ff00; font-size: 16px; font-weight: bold;');
    console.log('Next steps:');
    console.log('1. Open mobile menu');
    console.log('2. Run: auditDropdown("Về IVS")');
    
})();
