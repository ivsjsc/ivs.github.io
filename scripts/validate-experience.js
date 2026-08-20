'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const locales = Object.fromEntries(['vi', 'en', 'zh'].map(language => [
  language,
  JSON.parse(fs.readFileSync(path.join(root, 'lang', `${language}.json`), 'utf8'))
]));

const errors = [];
const warnings = [];
const uiFiles = ['index.html', 'components/header.html', 'components/footer.html'];
const keyPattern = /data-lang-key\s*=\s*["']([^"']+)["']/g;
const placeholderPattern = /^(?:translated\s+|translate\s+|title$|description$|text$|subtitle$|label$|button$|content$)/i;
const uiKeys = new Set();

for (const relative of uiFiles) {
  const source = fs.readFileSync(path.join(root, relative), 'utf8');
  for (const match of source.matchAll(keyPattern)) uiKeys.add(match[1]);
}

for (const key of uiKeys) {
  for (const language of Object.keys(locales)) {
    if (!Object.prototype.hasOwnProperty.call(locales[language], key)) {
      errors.push(`Missing ${language} translation for UI key: ${key}`);
      continue;
    }
    const value = String(locales[language][key] ?? '').trim();
    if (!value) errors.push(`Empty ${language} translation for UI key: ${key}`);
    if (placeholderPattern.test(value)) errors.push(`Placeholder ${language} translation for UI key ${key}: ${value}`);
  }
}

for (const key of Object.keys(locales.vi).filter(key => key.startsWith('ux_') || key.startsWith('home26_'))) {
  for (const language of ['en', 'zh']) {
    if (!Object.prototype.hasOwnProperty.call(locales[language], key)) {
      errors.push(`New experience key ${key} is missing from ${language}.json`);
    }
  }
}

function validateInternalLinks(relative) {
  const source = fs.readFileSync(path.join(root, relative), 'utf8');
  const hrefPattern = /href\s*=\s*["']([^"']+)["']/gi;

  for (const match of source.matchAll(hrefPattern)) {
    const href = match[1].trim();
    if (!href.startsWith('/') || href.startsWith('//')) continue;
    const clean = decodeURI(href.split(/[?#]/)[0]);
    if (!clean || clean === '/') continue;
    const candidate = path.join(root, clean.replace(/^\//, ''));
    const possibilities = [candidate];
    if (!path.extname(candidate)) possibilities.push(`${candidate}.html`, path.join(candidate, 'index.html'));
    if (!possibilities.some(file => fs.existsSync(file))) {
      errors.push(`Broken internal link in ${relative}: ${href}`);
    }
  }
}

uiFiles.forEach(validateInternalLinks);

function collectSourceHtml(directory, output = []) {
  const skipped = new Set(['.git', '.venv', 'dist', 'node_modules', 'webapp-dist']);
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (skipped.has(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) collectSourceHtml(absolute, output);
    else if (entry.isFile() && entry.name.endsWith('.html')) output.push(absolute);
  }
  return output;
}

let validatedStaticAssets = 0;
for (const absolute of collectSourceHtml(root)) {
  const source = fs.readFileSync(absolute, 'utf8');
  const assetPattern = /<(?:script|link)\b[^>]*?\b(?:src|href)\s*=\s*["']([^"']+)["'][^>]*>/gi;
  for (const match of source.matchAll(assetPattern)) {
    const raw = match[1].trim();
    if (!raw || /^(?:https?:|\/\/|data:|#|mailto:|tel:)/i.test(raw) || /[{}$]/.test(raw)) continue;
    const clean = raw.split(/[?#]/)[0];
    if (!/\.(?:css|js|mjs)$/i.test(clean) || clean.startsWith('/__/firebase/')) continue;
    const candidate = clean.startsWith('/')
      ? path.join(root, clean.slice(1))
      : path.resolve(path.dirname(absolute), clean);
    validatedStaticAssets += 1;
    if (!fs.existsSync(candidate)) {
      errors.push(`Broken static asset in ${path.relative(root, absolute)}: ${raw}`);
    }
  }
}

const directFoundationPages = [
  'thank-you.html',
  'ai/server/static/admin-login.html',
  'ai/server/static/admin.html',
  'Pages/index.html',
  'Pages/affiliate/IVS_Proposal_Mockup_3pages.html',
  'Pages/apps/aivy/index.html',
  'Pages/website/website-englishcenter.html',
  'Pages/website/website-gach.html',
  'Pages/website/website-mau01.html',
  'Pages/website/website-nhahangkhachsan.html',
  'Pages/website/website-nhahangkhachsan2.html',
  'Pages/website/website-ta&sua.html',
  'public/404.html',
  'public/index.html',
  'verified/renderer.html',
  'webapp/index.html'
];

for (const relative of directFoundationPages) {
  const source = fs.readFileSync(path.join(root, relative), 'utf8');
  if (!source.includes('data-ivs-experience="2026"')) {
    errors.push(`Standalone page is missing the experience foundation: ${relative}`);
  }
}

const loader = fs.readFileSync(path.join(root, 'ai/js/loadComponents.js'), 'utf8');
if (!loader.includes('ensureExperienceFoundation()')) {
  errors.push('Common component loader does not initialize the experience foundation.');
}

const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
if (!home.includes('id="service-directory"')) errors.push('Homepage service directory is missing.');
if (home.includes('**TeacherMatch**')) errors.push('Homepage still contains unrendered Markdown emphasis.');

if (warnings.length) {
  console.warn(warnings.join('\n'));
}

if (errors.length) {
  console.error(`Experience validation failed with ${errors.length} issue(s):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}

console.log(`Experience validation passed: ${uiKeys.size} shared UI translation keys and ${validatedStaticAssets} static asset references verified.`);
