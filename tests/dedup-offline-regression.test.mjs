import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
const read=p=>fs.readFileSync(p,'utf8');
test('offline service worker caches every locally referenced startup script',()=>{
 const html=read('index.html'),sw=read('sw.js');
 const localScripts=[...html.matchAll(/<script[^>]+src="(\.\/[^"]+)"/g)].map(m=>m[1]);
 assert.ok(localScripts.length>=2);
 for(const script of localScripts){assert.ok(fs.existsSync(script.slice(2)),script);assert.ok(sw.includes("'"+script+"'"),'missing offline asset: '+script)}
 assert.match(sw,/eisei-trainer-v4/);
});
test('runtime bank and source JSON remain fully synchronized',()=>{
 const source=JSON.parse(read('exams/eisei-1/questions.json')).questions;
 const context={window:{}};vm.runInNewContext(read('exams/eisei-1/questions.js'),context);
 const runtime=Array.from(context.window.EXAM_DATA);
 assert.equal(runtime.length,214);
 for(let i=0;i<source.length;i++){assert.equal(runtime[i].cat,source[i].category);assert.equal(runtime[i].q,source[i].question);assert.equal(runtime[i].a,source[i].answerIndex);assert.deepEqual(Array.from(runtime[i].opts),source[i].choices);assert.equal(runtime[i].why,source[i].explanation)}
});
test('134 active questions support 44-item exam composition and exclude twins',()=>{
 const source=JSON.parse(read('exams/eisei-1/questions.json')).questions;
 const context={window:{}};vm.runInNewContext(read('exams/eisei-1/duplicate-filter.js'),context);
 const excluded=new Set(Array.from(context.window.EXAM_DUPLICATE_SECOND_INDICES));
 const active=source.map((_,i)=>i).filter(i=>!excluded.has(i));
 assert.equal(active.length,134);
 const blocks=[['関係法令（有害）',10],['関係法令（一般）',7],['労働衛生（有害）',10],['労働衛生（一般）',7],['労働生理',10]];
 const selected=blocks.flatMap(([cat,num])=>active.filter(i=>source[i].category===cat).slice(0,num));
 assert.equal(selected.length,44);assert.equal(new Set(selected).size,44);
 assert.ok(selected.every(i=>!excluded.has(i)));
});
