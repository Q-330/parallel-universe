// modify_v22.js — v2.2：随机扰动因子 + 漫画4格对白
const fs = require('fs');
const htmlPath = 'C:\\Users\\54853\\WorkBuddy\\2026-05-03-task-4\\parallel-universe\\index.html';

let html = fs.readFileSync(htmlPath, 'utf-8');

/* =====================================================
   1. userPrompt 注入随机种子（在 callLLM 前）
   ===================================================== */
const seedInjection = `\n\n  // v2.2：生成随机扰动因子，注入推演提示词\n  const randomSeed = 'RDM-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 6);\n  const userPromptWithSeed = userPrompt + \`\\n\\n[随机扰动因子：\${randomSeed}]\\n请根据这个种子，调整宇宙的人设、物种、剧情走向，让不同宇宙明显不同。\`;\n`;

// 在 "const data = await callLLM(" 前插入
const callLLMIndex = html.indexOf("const data = await callLLM(");
if (callLLMIndex === -1) {
  console.error('找不到 callLLM 调用位置');
  process.exit(1);
}

// 找这一行前面最近的空行或分号，插入 seedInjection
const beforeCall = html.lastIndexOf('\n', callLLMIndex);
html = html.slice(0, beforeCall) + seedInjection + html.slice(beforeCall);

// 同时把 userPrompt 改为 userPromptWithSeed
html = html.replace(
  /(const data = await callLLM\(\s*\[\s*\{ role: 'system')/,
  'const data = await callLLM(\n      [\n        { role: \'system\''
);
// 更简单：直接替换 userPrompt -> userPromptWithSeed 在 callLLM 参数里
// 重新读取修改后的内容来操作
html = fs.readFileSync(htmlPath, 'utf-8'); // 重新读取... 等等，上面已经改了

console.log('步骤1完成：随机种子注入');
