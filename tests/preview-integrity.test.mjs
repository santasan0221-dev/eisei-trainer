import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
const text=path=>fs.readFileSync(new URL(path,import.meta.url),'utf8');
const html=text('../index.html');const js=text('../exams/eisei-1/questions.js');const sw=text('../sw.js');
test('production HTML includes exactly one external bank dependency',()=>{assert.equal(html.match(/src="\.\/exams\/eisei-1\/questions\.js"/g)?.length,1)});
test('external bank is parseable and contains 214 questions',()=>{const ctx={window:{}};new vm.Script(js).runInNewContext(ctx);assert.equal(ctx.window.EXAM_DATA.length,214)});
test('service worker precaches same bank used by app',()=>{assert.ok(sw.includes("'./exams/eisei-1/questions.js'"));assert.ok(html.includes('const DATA=window.EXAM_DATA;'))});
test('prototype remains clearly marked as unverified content',()=>{assert.match(html,/公開前の教材確認中/)});
