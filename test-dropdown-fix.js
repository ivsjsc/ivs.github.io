// Quick test to verify the dropdown fix
const fs = require('fs');
const path = require('path');

console.log('Testing dropdown fix...\n');

// Check header.html for correct structure
const headerPath = path.join(__dirname, 'components', 'header.html');
const headerContent = fs.readFileSync(headerPath, 'utf8');

// Check for correct aria-controls attributes
const buttons = [
    { text: 'Về IVS', id: 'submenu-about' },
    { text: 'Giáo dục', id: 'submenu-services' },
    { text: 'Giải pháp', id: 'submenu-solutions' },
    { text: 'Thư Viện', id: 'submenu-library' }
];

console.log('1. Checking aria-controls attributes in header.html:');
let allCorrect = true;
buttons.forEach(({ text, id }) => {
    const regex = new RegExp(`<button[^>]*aria-controls="${id}"[^>]*>.*${text}`, 'i');
    const found = regex.test(headerContent);
    console.log(`   ${text}: ${found ? '✓' : '✗'} (aria-controls="${id}")`);
    if (!found) allCorrect = false;
});

// Check for corresponding submenu divs
console.log('\n2. Checking submenu div IDs:');
buttons.forEach(({ text, id }) => {
    const regex = new RegExp(`<div[^>]*id="${id}"[^>]*class="mobile-submenu-content"`, 'i');
    const found = regex.test(headerContent);
    console.log(`   ${text}: ${found ? '✓' : '✗'} (div id="${id}")`);
    if (!found) allCorrect = false;
});

// Check CSS for correct selector
const cssPath = path.join(__dirname, 'css', 'styles.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');

console.log('\n3. Checking CSS selector:');
const hasCorrectSelector = cssContent.includes('.mobile-submenu-toggle[aria-expanded="true"] + .mobile-submenu-content');
const hasActiveClass = cssContent.includes('.mobile-submenu-content.active');
console.log(`   Adjacent sibling selector (+): ${hasCorrectSelector ? '✓' : '✗'}`);
console.log(`   Active class support: ${hasActiveClass ? '✓' : '✗'}`);
if (!hasCorrectSelector) allCorrect = false;

// Check headerController.js for aria-controls usage
const jsPath = path.join(__dirname, 'js', 'headerController.js');
const jsContent = fs.readFileSync(jsPath, 'utf8');

console.log('\n4. Checking headerController.js for aria-controls usage:');
const usesAriaControls = jsContent.includes("toggle.getAttribute('aria-controls')");
const usesGetElementById = jsContent.includes("document.getElementById(targetId)");
console.log(`   Uses aria-controls: ${usesAriaControls ? '✓' : '✗'}`);
console.log(`   Uses getElementById: ${usesGetElementById ? '✓' : '✗'}`);
if (!usesAriaControls || !usesGetElementById) allCorrect = false;

// Check script.js for aria-controls usage
const scriptPath = path.join(__dirname, 'js', 'script.js');
const scriptContent = fs.readFileSync(scriptPath, 'utf8');

console.log('\n5. Checking script.js for aria-controls usage:');
const scriptUsesAriaControls = scriptContent.includes("toggleButton.getAttribute('aria-controls')");
const scriptConditional = scriptContent.includes('!window.IVSHeaderController');
console.log(`   Uses aria-controls: ${scriptUsesAriaControls ? '✓' : '✗'}`);
console.log(`   Conditional on IVSHeaderController: ${scriptConditional ? '✓' : '✗'}`);
if (!scriptUsesAriaControls) allCorrect = false;

console.log('\n' + '='.repeat(50));
if (allCorrect) {
    console.log('✓ All checks passed! The fix should work correctly.');
} else {
    console.log('✗ Some checks failed. Review the output above.');
}
console.log('='.repeat(50));