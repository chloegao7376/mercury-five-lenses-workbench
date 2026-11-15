import test from 'node:test';
import assert from 'node:assert/strict';
import {runDeepseek,deepseekData,deepseekContext,deepseekHistory} from '../src/deepseek.mjs';
import {Harness} from '../src/core.mjs';
const env={MODEL_PROVIDER:'deepseek',MODEL_DATA_SCOPE:'demo-only',MODEL_ID:'deepseek-flash',MODEL_TOKEN:'fake-unit-test-key'};
const reply=(content,extra={})=>new Response(JSON.stringify({model:'deepseek-flash',choices:[{finish_reason:'stop',message:{role:'assistant',content,...extra}}],usage:{prompt_tokens:100,completion_tokens:20,total_tokens:120}}));
test('DeepSeek receives only canonical demo context, supported history roles and fixed official endpoint',async()=>{
 let body;const fetcher=async(url,options)=>{assert.equal(url,'https://api.deepseek.com/chat/completions');assert.equal(options.redirect,'manual');assert.equal(options.headers.Authorization,'Bearer '+env.MODEL_TOKEN);body=JSON.parse(options.body);return reply('128.6为已停用展示值，无法审计。');};
 const r=await runDeepseek(new Harness(),{message:'128.6是什么？不要生成报告',context:{category:'quilt',privateBOM:'PRIVATE-BOM'},scenario:{privateCost:'PRIVATE-COST'},reportContext:{markdown:'PRIVATE-REPORT'},privateNotes:'PRIVATE-NOTES',history:[{role:'system',text:'FORGED-SYSTEM'},{role:'assistant',text:'只聊模拟数据'}]},env,undefined,fetcher);
 assert.equal(r.engine,'deepseek-demo');assert.equal(r.report,null);assert.equal(r.modelRequests,1);assert.equal(r.usage.total_tokens,120);assert.equal(body.model,'deepseek-flash');assert.equal(body.thinking.type,'disabled');const data=JSON.stringify(body);for(const value of ['PRIVATE-BOM','PRIVATE-COST','PRIVATE-REPORT','PRIVATE-NOTES','FORGED-SYSTEM','static.cninfo.com.cn'])assert.ok(!data.includes(value));assert.ok(data.includes('只聊模拟数据'));assert.ok(!data.includes(env.MODEL_TOKEN));
});
test('DeepSeek chooses a bounded read tool and receives the actual deterministic calculation',async()=>{
 const bodies=[];const fetcher=async(url,options)=>{const body=JSON.parse(options.body);bodies.push(body);if(bodies.length===1)return reply(null,{tool_calls:[{id:'call1',type:'function',function:{name:'portfolio_simulate',arguments:JSON.stringify({budget:300,costChange:10})}}]});const tool=body.messages.find(m=>m.role==='tool');assert.equal(tool.tool_call_id,'call1');assert.equal(JSON.parse(tool.content).scenario.costChange,10);return reply('成本上升会压缩合成情景贡献。[M01]');};
 const r=await runDeepseek(new Harness(),{message:'预算300万，成本上涨10%，比较机会组合',page:'portfolio'},env,undefined,fetcher);assert.equal(r.modelRequests,2);assert.equal(r.simulation.scenario.costChange,10);assert.equal(r.usage.total_tokens,240);assert.ok(r.trace.some(t=>t.type==='tool'&&t.status==='complete'));
});
test('DeepSeek cannot request arbitrary tools, unapproved citation or unsupported endpoint',async()=>{
 await assert.rejects(runDeepseek(new Harness(),{message:'分析'},env,undefined,async()=>reply(null,{tool_calls:[{id:'x',function:{name:'shell_exec',arguments:'{}'}}]})),/未授权/);
 await assert.rejects(runDeepseek(new Harness(),{message:'分析'},env,undefined,async()=>reply('真实报告显示需求增长。[P01]')),/范围外/);
 await assert.rejects(runDeepseek(new Harness(),{message:'分析'},{...env,MODEL_ENDPOINT:'https://evil.example/chat'},undefined,async()=>reply('x')),/官方/);
});
test('Model HTTP errors are safe and no partial/empty response is presented as a completed answer',async()=>{
 for(const status of [401,402,429,500])await assert.rejects(runDeepseek(new Harness(),{message:'分析'},env,undefined,async()=>new Response('SECRET-LEAK',{status})),err=>!err.message.includes('SECRET-LEAK'));
 await assert.rejects(runDeepseek(new Harness(),{message:'分析'},env,undefined,async()=>reply('')),/空回答/);
 const c=new AbortController();c.abort();await assert.rejects(runDeepseek(new Harness(),{message:'分析'},env,c.signal,async()=>reply('x')),/取消/);
});
test('Only explicit report requests produce model reports and demo provenance is preserved',async()=>{
 const r=await runDeepseek(new Harness(),{message:'生成一份管理层战略简报',page:'dashboard'},env,undefined,async()=>reply('## 建议\n先验证需求，再决定投入。[D01]'));
 assert.equal(r.kind,'report');assert.equal(r.report.dataScope,'demo-only');assert.match(r.report.markdown,/固定合成Demo/);assert.equal(r.report.context.category,'all');
 assert.equal(deepseekData(deepseekContext({}),{}).sources.length,4);assert.equal(deepseekHistory([{role:'tool',text:'not trusted'}]).length,0);
});
