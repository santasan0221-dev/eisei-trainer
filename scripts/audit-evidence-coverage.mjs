import fs from 'node:fs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const manifest=read('audit/evidence-ledger-manifest.json').files;
const questions=read('exams/eisei-1/questions.json').questions;
const bank=new Map(questions.map(q=>[q.id,q]));
if(bank.size!==questions.length)throw Error('Duplicate question IDs');
const records=[];const followups=[];for(const file of manifest){const item=read(file);for(const e of (item.verifiedForReference||item.entries||item.newPrimaryChecks||[]))records.push({...e,ledger:file});for(const e of (item.followUpEvidence||[]))followups.push({...e,ledger:file})}
const seen=new Map();for(const e of records){if(!bank.has(e.id))throw Error('Unknown ID: '+e.id+' ('+e.ledger+')');if(seen.has(e.id))throw Error('Duplicate source entry: '+e.id+' in '+seen.get(e.id)+' and '+e.ledger);seen.set(e.id,e.ledger)}
for(const e of followups){if(!seen.has(e.id))throw Error('Orphan follow-up '+e.id+' in '+e.ledger)}
const remaining=questions.filter(q=>!seen.has(q.id));
const summary={total:questions.length,sourceTracked:seen.size,untracked:remaining.length,followups:followups.length,untrackedByCategory:Object.fromEntries([...new Set(questions.map(q=>q.category))].map(c=>[c,remaining.filter(q=>q.category===c).length])),untrackedQuestions:remaining.map(q=>({id:q.id,category:q.category,question:q.question}))};
if(process.argv.includes('--assert-expected')&&(questions.length!==214||seen.size!==191||remaining.length!==23))throw Error('Unexpected coverage: '+JSON.stringify({total:questions.length,tracked:seen.size,remaining:remaining.length}));
console.log(JSON.stringify(summary,null,2));
