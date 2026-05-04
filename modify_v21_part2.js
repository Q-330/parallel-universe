/**
 * v2.1 Part 2 - Poster fixes + CSS injection
 * (renderResult already replaced manually)
 */
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'index.html');
let html = fs.readFileSync(FILE, 'utf-8');

let changes = 0;

// Helper: replace first occurrence only
function replaceFirst(haystack, needle, replacement) {
  const idx = haystack.indexOf(needle);
  if (idx === -1) {
    console.log('WARN: not found:', needle.substring(0, 80));
    return { result: haystack, found: false };
  }
  return { result: haystack.substring(0, idx) + replacement + haystack.substring(idx + needle.length), found: true };
}

// ========== 1. Poster: state.bazi.full -> state.userYears年后 ==========
let r = replaceFirst(html,
  '${state.bazi.full}',
  '${state.userYears}年后');
if (r.found) { html = r.result; changes++; console.log('Fixed: bazi.full reference'); }

// ========== 2. Poster: replace cardNames/cardSubs with dynamic version ==========
r = replaceFirst(html,
  "  const cardNames = ['🌌 主宇宙', '💫 潜力宇宙', '⚡ 警示宇宙'];\n  const cardSubs = ['最可能出现的你', '隐藏潜能完全释放', '需要警惕的暗面'];",
  "  const cardColors4 = ['#00D4FF', '#7B61FF', '#FF6B35', '#00E676'];\n  const posterUnis = data.universes.slice(0, 4);\n  const cardSpacing = Math.min(300, Math.floor((H - 280) / 4));");
if (r.found) { html = r.result; changes++; console.log('Fixed: cardNames/cardSubs -> posterUnis'); }

// ========== 3. Poster: replace forEach over cardNames ==========
r = replaceFirst(html,
  '  data.universes.forEach((u, i) => {\n    const y = 220 + i * 340;',
  '  posterUnis.forEach((u, i) => {\n    const y = 220 + i * cardSpacing;');
if (r.found) { html = r.result; changes++; console.log('Fixed: forEach -> posterUnis'); }

// ========== 4. Poster: roundRect dimensions ==========
r = replaceFirst(html,
  '    roundRect(ctx, 40, y, W - 80, 300, 20);',
  '    roundRect(ctx, 40, y, W - 80, cardSpacing - 20, 20);');
if (r.found) { html = r.result; changes++; console.log('Fixed: roundRect height'); }

r = replaceFirst(html,
  '    roundRect(ctx, 40, y, 6, 300, 3);',
  '    roundRect(ctx, 40, y, 6, cardSpacing - 20, 3);');
if (r.found) { html = r.result; changes++; console.log('Fixed: roundRect accent'); }

// ========== 5. Poster: ctx.fillText(cardNames[i] -> u.name ==========
r = replaceFirst(html,
  '    ctx.fillText(cardNames[i], 70, y + 50);',
  '    ctx.fillText(u.name, 70, y + 45);');
if (r.found) { html = r.result; changes++; console.log('Fixed: cardNames[i] -> u.name'); }

// ========== 6. Poster: ctx.fillText(cardSubs[i] -> u.subtitle ==========
r = replaceFirst(html,
  '    ctx.fillText(cardSubs[i], 70, y + 82);',
  '    ctx.fillText(u.subtitle || \'\', 70, y + 73);');
if (r.found) { html = r.result; changes++; console.log('Fixed: cardSubs[i] -> u.subtitle'); }

// ========== 7. Poster: replace all cardColors[i] with cardColors4[i] ==========
const beforeCount = (html.match(/cardColors\[i\]/g) || []).length;
html = html.replace(/cardColors\[i\]/g, 'cardColors4[i]');
const afterCount = (html.match(/cardColors\[i\]/g) || []).length;
if (beforeCount > 0) { changes++; console.log(`Fixed: cardColors[i] -> cardColors4[i] (${beforeCount} occurrences)`); }

// ========== 8. Remove old cardColors declaration ==========
r = replaceFirst(html,
  "const cardColors = ['#00D4FF', '#7B61FF', '#FF6B35'];",
  '');
if (r.found) { html = r.result; changes++; console.log('Removed: old cardColors decl'); }

// ========== 9. Add cardColors4 declaration (if not already present) ==========
if (!html.includes('cardColors4')) {
  // Insert before generatePoster function
  const gpIdx = html.indexOf('function generatePoster()');
  if (gpIdx !== -1) {
    const insertIdx = html.lastIndexOf('\n', gpIdx - 1) + 1;
    const decl = '  const cardColors4 = [\'#00D4FF\', \'#7B61FF\', \'#FF6B35\', \'#00E676\'];\n';
    html = html.substring(0, insertIdx) + decl + html.substring(insertIdx);
    changes++;
    console.log('Added: cardColors4 declaration');
  }
}

// ========== 10. CSS injection ==========
const newCSS = [
  '',
  '/* === v2.1: 4 Universe Tabs + Portrait Styles === */',
  '.universe-tab.active-d { background: linear-gradient(135deg, #00E676, #00C853); color: #000; }',
  '.universe-card.universe-d { border-left: 4px solid #00E676; }',
  '',
  '.portrait-section { text-align: center; margin: 16px 0; }',
  '.portrait-title { color: #8892B0; font-size: 14px; margin-bottom: 10px; }',
  '.portrait-card { width: 160px; height: 192px; margin: 0 auto; border-radius: 16px; overflow: hidden; background: #111827; border: 2px solid rgba(0,230,118,0.2); box-shadow: 0 4px 20px rgba(0,230,118,0.1); transition: transform 0.3s ease; }',
  '.portrait-card:hover { transform: scale(1.05); }',
  '.portrait-caption { color: #6B7394; font-size: 12px; margin-top: 6px; font-style: italic; }',
  '.message-bubble.bubble-d { background: linear-gradient(135deg, rgba(0,230,118,0.15), rgba(0,200,83,0.08)); border-left: 3px solid #00E676; color: #B0F0C0; }',
  '.universe-tabs { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; padding: 10px 0; }',
  '.universe-tab { padding: 8px 12px; border-radius: 20px; font-size: 13px; background: rgba(255,255,255,0.05); color: #8892B0; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; transition: all 0.3s ease; white-space: nowrap; }',
  '.universe-tab:hover { background: rgba(255,255,255,0.1); }',
  ''
].join('\n');

const lastStyleIdx = html.lastIndexOf('</style>');
if (lastStyleIdx !== -1) {
  html = html.substring(0, lastStyleIdx) + newCSS + '\n</style>' + html.substring(lastStyleIdx + '</style>'.length);
  changes++;
  console.log('Injected: v2.1 CSS');
}

// ========== 11. Fix: switchUniverse function may be missing ==========
if (!html.includes('function switchUniverse')) {
  // Add after renderResult
  const renderEndIdx = html.indexOf('// ========== Chat ==========');
  if (renderEndIdx !== -1) {
    const switchFn = `\n\nfunction switchUniverse(idx) {\n  document.querySelectorAll('.universe-tab').forEach((tab, i) => { tab.classList.toggle('active', i === idx); });\n  document.querySelectorAll('.universe-panel').forEach((panel, i) => { panel.classList.toggle('active', i === idx); });\n}\n`;
    html = html.substring(0, renderEndIdx) + switchFn + html.substring(renderEndIdx);
    changes++;
    console.log('Added: switchUniverse function');
  }
}

// Write
fs.writeFileSync(FILE, html, 'utf-8');
console.log('\nDone! Total changes:', changes);
