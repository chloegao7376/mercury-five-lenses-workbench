import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';

test('Pages release runs at a project subpath without external app assets or a model key',async()=>{
 const html=await fs.readFile('dist/pages/index.html','utf8');
 assert.match(html,/<meta name="mercury-runtime" content="static-public">/);
 assert.ok(!/<(?:script|link)[^>]+(?:src|href)="\//.test(html));
 assert.doesNotMatch(html,/sk-[A-Za-z0-9]{20,}|(?:ghp_|gho_|github_pat_)[A-Za-z0-9_]{20,}/);
 assert.ok(!html.includes('chatgpt.site'));
 const code=html.match(/<script type="module">([\s\S]*)<\/script>/)[1];
 new vm.Script(code);
 assert.ok(!/^import /m.test(code));
 assert.deepEqual((await fs.readdir('dist/pages')).sort(),['.nojekyll','404.html','index.html']);
 assert.equal(await fs.readFile('dist/pages/404.html','utf8'),html);
});
