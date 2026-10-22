import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
test('80 true answer-shuffle twins removed from normal practice without mutating 214 originals',()=>{
const bank=JSON.parse(fs.readFileSync('exams/eisei-1/questions.json','utf8')).questions;
const audit=JSON.parse(fs.readFileSync('audit/duplicate-80-pairs.json','utf8'));
const context={window:{}};vm.runInNewContext(fs.readFileSync('exams/eisei-1/duplicate-filter.js','utf8'),context);
const removed=Array.from(context.window.EXAM_DUPLICATE_SECOND_INDICES);
assert.equal(bank.length,214);assert.equal(removed.length,80);assert.equal(new Set(removed).size,80);
for(const pair of audit.pairs){const first=Number(pair.firstId.slice(-4))-1,second=Number(pair.secondId.slice(-4))-1;assert.ok(removed.includes(second));assert.ok(!removed.includes(first));assert.deepEqual([...bank[first].choices].sort(),[...bank[second].choices].sort());assert.equal(bank[first].choices[bank[first].answerIndex],bank[second].choices[bank[second].answerIndex]);}
const active=bank.map((_,i)=>i).filter(i=>!removed.includes(i));assert.equal(active.length,134);
const targets={'関係法令（有害）':10,'関係法令（一般）':7,'労働衛生（有害）':10,'労働衛生（一般）':7,'労働生理':10};for(const [category,n] of Object.entries(targets))assert.ok(active.filter(i=>bank[i].category===category).length>=n,category);
});
test('entry points for practice, exam, scheduled review and daily set use active bank',()=>{
const html=fs.readFileSync('index.html','utf8');assert.ok(html.includes('duplicate-filter.js'));assert.ok(html.includes('const ACTIVE_IDS='));
for(const clause of ['const choices=rand(ACTIVE_IDS.filter','return ACTIVE_IDS.filter(i=>state.stats','const fresh=rand(ACTIVE_IDS.filter','for(const i of rand(ACTIVE_IDS))','const remaining=ACTIVE_IDS.filter','let ids=ACTIVE_IDS.filter(i=>DATA[i].cat===c)','let ids=ACTIVE_IDS.filter(i=>selected'])assert.ok(html.includes(clause),clause);
});