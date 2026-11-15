import fs from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd();
const read=p=>fs.readFile(path.join(root,p),'utf8');
const model=await read('src/deepseek.mjs'),core=await read('src/core.mjs'),workflow=await read('src/workflow.mjs'),service=await read('src/service.mjs'),review=await read('public/review.js'),worker=await read('src/worker.mjs'),html=await read('public/index.html'),css=await read('public/styles.css'),app=await read('public/app.js');
const strip=text=>text.replace(/^import .*?;\n/gm,'').replace(/^export /gm,'');
const assets={'/index.html':html,'/styles.css':css,'/app.js':app,'/core.mjs':core,'/workflow.mjs':workflow,'/review.js':review};
const combined=strip(core)+'\n'+strip(model)+'\n'+strip(workflow)+'\n'+strip(service)+'\n'+worker.replace(/^import .*?;\n/gm,'').replace('const ASSETS = __ASSET_MAP__;',()=> 'const ASSETS = '+JSON.stringify(assets)+';');
await fs.mkdir(path.join(root,'dist/server'),{recursive:true});
await fs.writeFile(path.join(root,'dist/server/index.js'),combined);
// Optional platform manifest is checkout-local and never required by the public distribution.
try{await fs.access(path.join(root,'.openai/hosting.json'));await fs.mkdir(path.join(root,'dist/.openai'),{recursive:true});await fs.copyFile(path.join(root,'.openai/hosting.json'),path.join(root,'dist/.openai/hosting.json'));}catch(error){if(error.code!=='ENOENT')throw error;}
const inline=strip(core)+'\n'+strip(workflow)+'\n'+strip(review)+'\nconst e=escapeHTML;\n'+app.replace(/^import .*?;\n/gm,'');
const offline=html.replace('<link rel="stylesheet" href="/styles.css">',()=>'<style>'+css+'</style>').replace('<script type="module" src="/app.js"></script>',()=>'<script type="module">'+inline.replace(/<\/script/gi,'<\\/script')+'</script>');
await fs.mkdir(path.join(root,'standalone'),{recursive:true});
await fs.writeFile(path.join(root,'standalone/水星五看工作台.html'),offline);
console.log('Built Worker, embedded assets, and standalone HTML.');
