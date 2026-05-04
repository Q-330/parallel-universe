/**
 * v2.1 - Safe string-based replacement for index.html
 * No template literals in the replacement content itself
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
    console.log('WARN: not found: ' + needle.substring(0, 80));
    return { result: haystack, found: false };
  }
  return { result: haystack.substring(0, idx) + replacement + haystack.substring(idx + needle.length), found: true };
}

// ========== 1. Landing ==========
var r = replaceFirst(html,
  '输入你的生辰八字，回答10道命运选择题',
  '输入你的基本信息，回答10道命运选择题');
if (r.found) { html = r.result; changes++; }

// ========== 2. Loading ==========
r = replaceFirst(html,
  "'正在解析八字命盘...'",
  "'正在解析你的命运密码...'");
if (r.found) { html = r.result; changes++; }

// ========== 3. systemPrompt ==========
// Read from file to avoid template literal issues
var newSystemPrompt = fs.readFileSync(path.join(__dirname, '_system_prompt.txt'), 'utf-8');
r = replaceFirst(html,
  'const systemPrompt = `你是「平行宇宙推演师」，一位融合心理学、性格分析、平行宇宙理论的AI推演大师。',
  newSystemPrompt.trim());
if (r.found) { html = r.result; changes++; console.log('systemPrompt replaced'); }

// ========== 4. userPrompt ==========
var newUserPrompt = fs.readFileSync(path.join(__dirname, '_user_prompt.txt'), 'utf-8');
r = replaceFirst(html,
  'const userPrompt = `## 用户信息',
  newUserPrompt.trim());
if (r.found) { html = r.result; changes++; console.log('userPrompt replaced'); }

// ========== 5. renderResult ==========
var newRender = fs.readFileSync(path.join(__dirname, '_render_result.txt'), 'utf-8');
var rrStart = 'function renderResult(data) {';
var rrIdx = html.indexOf(rrStart);
if (rrIdx === -1) { console.log('ERROR: renderResult not found'); process.exit(1); }

// Find end: look for the pattern "  }, 300);\n}" followed by chat section
var searchFrom = rrIdx + 100;
var rrEndMarker = '  }, 300);';
var rrEndIdx = html.indexOf(rrEndMarker, searchFrom);
while (rrEndIdx !== -1) {
  // Check if next char is } and then chat
  var afterEnd = html.substring(rrEndIdx + rrEndMarker.length, rrEndIdx + rrEndMarker.length + 20);
  if (afterEnd.match(/^\s*\}\s*\n\s*\/\/\s*={5,}.*Chat/)) {
    break;
  }
  rrEndIdx = html.indexOf(rrEndMarker, rrEndIdx + 1);
}

if (rrEndIdx === -1) {
  console.log('ERROR: renderResult end not found');
  process.exit(1);
}

// Include the closing }
var fullEnd = html.indexOf('}', rrEndIdx + rrEndMarker.length);
// Verify this } closes renderResult
var afterClose = html.substring(fullEnd + 1, fullEnd + 50).trim();
if (!afterClose.startsWith('//') && !afterClose.startsWith('function')) {
  // Maybe it's the wrong }
  fullEnd = html.indexOf('\n//', rrEndIdx + rrEndMarker.length);
}

html = html.substring(0, rrIdx) + newRender.trim() + '\n' + html.substring(fullEnd + 1);
changes++;
console.log('renderResult replaced');

// ========== 6. Poster bazi.full ==========
r = replaceFirst(html, '${state.bazi.full}', '${state.userYears}年后');
if (r.found) { html = r.result; changes++; }

// ========== 7. Poster cards ==========
r = replaceFirst(html,
  "  const cardNames = ['🌌 主宇宙', '💫 潜力宇宙', '⚡ 警示宇宙'];\n  const cardSubs = ['最可能出现的你', '隐藏潜能完全释放', '需要警惕的暗面'];",
  "  const cardColors4 = ['#00D4FF', '#7B61FF', '#FF6B35', '#00E676'];\n  const posterUnis = data.universes.slice(0, 4);\n  const cardSpacing = Math.min(300, Math.floor((H - 280) / 4));");
if (r.found) { html = r.result; changes++; }

r = replaceFirst(html,
  '  data.universes.forEach((u, i) => {\n    const y = 220 + i * 340;',
  '  posterUnis.forEach((u, i) => {\n    const y = 220 + i * cardSpacing;');
if (r.found) { html = r.result; changes++; }

r = replaceFirst(html,
  '    roundRect(ctx, 40, y, W - 80, 300, 20);',
  '    roundRect(ctx, 40, y, W - 80, cardSpacing - 20, 20);');
if (r.found) { html = r.result; changes++; }

r = replaceFirst(html,
  '    roundRect(ctx, 40, y, 6, 300, 3);',
  '    roundRect(ctx, 40, y, 6, cardSpacing - 20, 3);');
if (r.found) { html = r.result; changes++; }

r = replaceFirst(html,
  "    ctx.fillText(cardNames[i], 70, y + 50);",
  "    ctx.fillText(u.name, 70, y + 45);");
if (r.found) { html = r.result; changes++; }

r = replaceFirst(html,
  "    ctx.fillText(cardSubs[i], 70, y + 82);",
  "    ctx.fillText(u.subtitle || '', 70, y + 73);");
if (r.found) { html = r.result; changes++; }

// Fix cardColors references in poster
html = html.replace(/ctx\.fillStyle = cardColors\[i\];/g, 'ctx.fillStyle = cardColors4[i];');
changes++;

// Remove old cardColors declaration
r = replaceFirst(html, "const cardColors = ['#00D4FF', '#7B61FF', '#FF6B35'];", '');
if (r.found) { html = r.result; changes++; }

// ========== 8. CSS ==========
var newCSS = [
  '/* === v2.1: 4 Universe Tabs + Portrait Styles === */',
  '.universe-tab.active-d { background: linear-gradient(135deg, #00E676, #00C853); color: #000; }',
  '.universe-card.universe-d { border-left: 4px solid #00E676; }',
  '',
  '.portrait-section { text-align: center; margin: 16px 0; }',
  '.portrait-title { color: #8892B0; font-size: 14px; margin-bottom: 10px; }',
  '.portrait-card { width: 160px; height: 192px; margin: 0 auto; border-radius: 16px; overflow: hidden; background: #111827; border: 2px solid rgba(0,230,118,0.2); box-shadow: 0 4px 20px rgba(0,230,118,0.1); transition: transform 0.3s ease; }',
  '.portrait-card:hover { transform: scale(1.05); }',
  '.portrait-loading { display: flex; align-items: center; justify-content: center; height: 100%; color: #8892B0; font-size: 13px; }',
  '.portrait-caption { color: #6B7394; font-size: 12px; margin-top: 6px; font-style: italic; }',
  '.message-bubble.bubble-d { background: linear-gradient(135deg, rgba(0,230,118,0.15), rgba(0,200,83,0.08)); border-left: 3px solid #00E676; color: #B0F0C0; }',
  '.universe-tabs { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; padding: 10px 0; }',
  '.universe-tab { padding: 8px 12px; border-radius: 20px; font-size: 13px; background: rgba(255,255,255,0.05); color: #8892B0; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; transition: all 0.3s ease; white-space: nowrap; }',
  '.universe-tab:hover { background: rgba(255,255,255,0.1); }',
  ''
].join('\n');

var lastStyleIdx = html.lastIndexOf('</style>');
if (lastStyleIdx !== -1) {
  html = html.substring(0, lastStyleIdx) + newCSS + '</style>' + html.substring(lastStyleIdx + '</style>'.length);
  changes++;
}

// ========== Write ==========
fs.writeFileSync(FILE, html, 'utf-8');
console.log('\nDone! Total changes: ' + changes);
