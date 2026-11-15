import fs from 'node:fs/promises';
import path from 'node:path';

const output=path.resolve('dist/pages');
let html=await fs.readFile('standalone/水星五看工作台.html','utf8');
html=html.replace('<head>','<head><meta name="mercury-runtime" content="static-public">');
html=html.replace('<title>水星 · 五看工作台</title>','<title>水星 · 五看工作台 · 公开演示</title>');
// All app assets are embedded. No origin-root paths, secrets or API dependencies.
await fs.mkdir(output,{recursive:true});
await fs.writeFile(path.join(output,'index.html'),html);
await fs.writeFile(path.join(output,'404.html'),html);
await fs.writeFile(path.join(output,'.nojekyll'),'');
console.log('Built public GitHub Pages demo: dist/pages/index.html (browser-local, no model key).');
