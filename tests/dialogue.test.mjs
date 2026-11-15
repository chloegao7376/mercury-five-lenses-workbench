import test from 'node:test';
import assert from 'node:assert/strict';
import {Harness,getSignals,getSignalSample,getMetrics,metricDefinition} from '../src/core.mjs';

test('regression: asking what 128.6 means explains the retired constant without repeating a strategy report',async()=>{
 const h=new Harness(),brief=await h.run({message:'生成一份管理层战略决策简报'});
 const result=await h.run({message:'报告中功能床品需求指数128.6代表什么、如何计算？',history:[{role:'user',text:'生成一份管理层战略决策简报'},{role:'assistant',text:brief.answer,reportId:brief.report.id}]});
 assert.equal(result.kind,'answer');assert.equal(result.report,null);assert.match(result.answer,/预设.*常量/);assert.match(result.answer,/无法审计/);assert.match(result.answer,/720 ÷ 2400/);assert.doesNotMatch(result.answer,/## 五看判断/);assert.notEqual(result.answer,brief.answer);
});
test('metric follow-up uses the previous metric and current category/period, and admits missing source inputs',async()=>{
 const h=new Harness(),context={category:'quilt',period:'quarter'};
 const first=await h.run({message:'净收入是多少，如何计算？',context});
 assert.equal(first.metricId,'revenue');assert.match(first.answer,new RegExp(String(getMetrics(context).revenue)));assert.match(first.answer,/无法反查真实订单/);
 const next=await h.run({message:'它的计算口径是什么？',context,history:[{role:'assistant',text:first.answer,metricId:first.metricId}]});
 assert.equal(next.metricId,'revenue');assert.equal(next.report,null);assert.match(next.answer,/被芯 \/ 近一季度/);
 const refunds=await h.run({message:'退款率的分母是什么？'});assert.match(refunds.answer,/没有逐单分子分母/);
});
test('unsupported open questions do not silently become a stock management report',async()=>{
 const result=await new Harness().run({message:'你认为量子计算是什么？'});assert.equal(result.report,null);assert.match(result.answer,/没有连接大语言模型/);assert.match(result.answer,/不能可靠回答/);
});
test('replacement monitoring metrics have denominators and weekly counts reconcile with totals',()=>{
 for(const category of ['all','pillow','quilt']){const a=getSignalSample(category),s=getSignals({category,lens:'industry'}),brand=getSignals({category,lens:'brand'});
  assert.equal(s.series.reduce((x,y)=>x+y,0),a.total);assert.equal(brand.series.reduce((x,y)=>x+y,0),a.brand);
  assert.equal(s.metrics[2][1],Math.round(a.fit/a.total*1000)/10+'%');
  assert.doesNotMatch(JSON.stringify(s.metrics),/需求指数|成本指数|基期/);assert.doesNotMatch(JSON.stringify(brand.metrics),/提及指数/);
 }
 const trend=metricDefinition('trend');assert.match(trend.detail,/不是预算目标/);assert.match(trend.formula,/周序号从0开始/);
});
