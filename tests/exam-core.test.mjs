import test from 'node:test';import assert from 'node:assert/strict';import {storageKey,emptyProgress,loadProgress,saveProgress,validateExam,selectQuestionIds} from '../src/exam-core.mjs';
const memory=()=>{const m=new Map();return {getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v)}};
test('exam storage keys do not collide',()=>assert.notEqual(storageKey('eisei-1'),storageKey('otsu4')));
test('storage roundtrip',()=>{const s=memory();saveProgress(s,'eisei-1',{...emptyProgress(),history:{Q1:{ok:true}}});assert.equal(loadProgress(s,'eisei-1').history.Q1.ok,true);assert.deepEqual(loadProgress(s,'eisei-2').history,{})});
test('corrupt progress falls back',()=>{const s=memory();s.setItem(storageKey('eisei-1'),'{broken');assert.deepEqual(loadProgress(s,'eisei-1'),emptyProgress())});
test('exam bank schema and selection',()=>{const e={id:'sample',name:'sample',questions:[{id:'Q1',question:'?',choices:['A','B'],answerIndex:0}]};assert.equal(validateExam(e),true);assert.deepEqual(selectQuestionIds(e,1),['Q1']);assert.equal(validateExam({...e,questions:[{...e.questions[0],answerIndex:8}]}),false)});
