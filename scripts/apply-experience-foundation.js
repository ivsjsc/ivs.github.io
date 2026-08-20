/*
 * Idempotently attaches the shared UX foundation to standalone pages that do
 * not use the common component loader. Run from the repository root.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const version = '20260821.6';

const pages = [
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
  'verified/renderer.html'
];

const marker = 'data-ivs-experience="2026"';
const foundation = [
  `  <link rel="stylesheet" href="/css/experience.css?v=${version}" data-ivs-experience="2026">`,
  `  <script src="/js/experience.js?v=${version}" data-ivs-experience="2026" defer></script>`
].join('\n');

let changed = 0;

for (const relative of pages) {
  const absolute = path.resolve(__dirname, '..', relative);
  if (!fs.existsSync(absolute)) {
    throw new Error(`Expected standalone page is missing: ${relative}`);
  }

  const source = fs.readFileSync(absolute, 'utf8');
  if (source.includes(marker)) {
    const refreshed = source
      .replace(/\/css\/experience\.css\?v=[^"']+/g, `/css/experience.css?v=${version}`)
      .replace(/\/js\/experience\.js\?v=[^"']+/g, `/js/experience.js?v=${version}`);
    if (refreshed !== source) {
      fs.writeFileSync(absolute, refreshed, 'utf8');
      changed += 1;
    }
    continue;
  }
  if (!/<\/head>/i.test(source)) {
    throw new Error(`Cannot attach foundation because </head> is missing: ${relative}`);
  }

  const updated = source.replace(/<\/head>/i, `${foundation}\n</head>`);
  fs.writeFileSync(absolute, updated, 'utf8');
  changed += 1;
}

// Refresh the shared component loader URL everywhere so production caches pick
// up the new header, footer, navigation, i18n and experience runtime together.
function collectHtmlFiles(directory, output = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === '.venv' || entry.name === 'dist' || entry.name === 'node_modules' || entry.name === 'webapp-dist') continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) collectHtmlFiles(absolute, output);
    else if (entry.isFile() && entry.name.endsWith('.html')) output.push(absolute);
  }
  return output;
}

let loadersRefreshed = 0;
for (const absolute of collectHtmlFiles(path.resolve(__dirname, '..'))) {
  const source = fs.readFileSync(absolute, 'utf8');
  const refreshed = source.replace(
    /\/(ai\/)?js\/loadComponents\.js(?:\?v=[^"'\s<]+)?/g,
    (match, maintainedPath) => `/${maintainedPath || ''}js/loadComponents.js?v=${version}`
  ).replace(
    /(^|["'(=\s])((?:\.\.\/|\.\/|\/)?js\/language(?:-init)?\.js)(?:\?v=[^"'\s<]+)?/gm,
    (match, prefix, assetPath) => `${prefix}${assetPath}?v=${version}`
  ).replace(
    /(\b(?:src|href)\s*=\s*["'])(?:\.\.\/|\.\/|\/)?css\/(style|styles|tailwind|animations)\.css([^"']*)(["'])/gi,
    (match, prefix, name, suffix, quote) => `${prefix}/css/${name}.css${suffix}${quote}`
  ).replace(
    /(\b(?:src|href)\s*=\s*["'])(?:\.\.\/|\.\/|\/)?js\/(utils|animations|firebase-init|script|headerController|loadComponents|language|language-init)\.js([^"']*)(["'])/gi,
    (match, prefix, name, suffix, quote) => `${prefix}/js/${name}.js${suffix}${quote}`
  ).replace(
    /(\b(?:src|href)\s*=\s*["'])(?:\.\.\/|\.\/|\/)?(?:ai\/)?js\/fabController\.js([^"']*)(["'])/gi,
    (match, prefix, suffix, quote) => `${prefix}/ai/js/fabController.js${suffix}${quote}`
  );
  if (refreshed !== source) {
    fs.writeFileSync(absolute, refreshed, 'utf8');
    loadersRefreshed += 1;
  }
}

console.log(`Experience foundation refreshed on ${changed} standalone page(s); ${loadersRefreshed} loader reference(s) cache-busted.`);
