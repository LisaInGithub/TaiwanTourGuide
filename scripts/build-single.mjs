// 把整個 App 打包成單一 HTML 檔:可直接雙擊開啟,或上傳到任何網頁空間。
// 用法:node scripts/build-single.mjs  → 產生 dist/taiwan-tour-guide.html
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = (p) => readFile(new URL(p, root), 'utf8');

// 依相依順序串接模組,移除 import/export(各模組的頂層名稱不重複)
const order = ['js/data.js', 'js/data-en.js', 'js/i18n.js', 'js/planner.js', 'js/itinerary.js', 'js/guide.js', 'js/ai-guide.js', 'js/geo.js', 'js/phrases.js', 'js/app.js'];
const js = (await Promise.all(order.map(read)))
  .map((src) => src.replace(/^import[\s\S]*?from\s+'[^']+';\n/gm, '').replace(/^export\s+/gm, ''))
  .join('\n')
  .replace(/if \('serviceWorker' in navigator[\s\S]*?\n}\n/, '');

const css = await read('css/style.css');
const icon = Buffer.from(await read('icons/icon.svg')).toString('base64');
const html = await read('index.html');
const bodyStart = html.indexOf('<body>') + '<body>'.length;
const bodyEnd = html.indexOf('<script type="module"');
const body = html.slice(bodyStart, bodyEnd).trim();

const content = `<title>台灣小導遊</title>
<meta name="description" content="台灣小導遊:推薦景點、規劃交通、告訴你哪裡有好吃好玩的。" />
<link rel="icon" href="data:image/svg+xml;base64,${icon}" />
<style>
${css}
</style>
${body}
<script type="module">
${js}
</script>
`;

await mkdir(new URL('dist/', root), { recursive: true });
// 完整版(可雙擊開啟)
await writeFile(new URL('dist/taiwan-tour-guide.html', root),
  `<!doctype html>\n<html lang="zh-Hant-TW">\n<head>\n<meta charset="utf-8" />\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />\n</head>\n<body>\n${content}</body>\n</html>\n`);
// 內容版(給會自動加上 <html>/<head> 外框的平台使用)
if (process.argv.includes('--fragment')) {
  await writeFile(new URL('dist/fragment.html', root), content);
}
console.log('已產生 dist/taiwan-tour-guide.html');
