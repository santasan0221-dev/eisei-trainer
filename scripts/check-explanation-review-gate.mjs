import fs from 'node:fs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const bank=read('exams/eisei-1/questions.json');
const proposals=[...read('audit/explanation-proposals-batch1.json').entries,...read('audit/explanation-proposals-batch2.json').entries];
const evidence=[
  ...read('audit/primary-source-checks.json').verifiedForReference,
  ...read('audit/primary-source-checks-batch2.json').entries,
  ...read('audit/primary-source-checks-batch3.json').entries,
  ...read('audit/primary-source-checks-batch4.json').entries,
  ...read('audit/primary-source-checks-batch5.json').entries
];
const firstPass=new Set(evidence.map(x=>x.id));
const allIds=new Set(bank.questions.map(x=>x.id));
const seen=new Set();
for(const p of proposals){if(!allIds.has(p.id)||seen.has(p.id))throw Error('Invalid proposal id '+p.id);seen.add(p.id);if(p.approved!==false)throw Error('Unexpected approval '+p.id)}
for(const e of evidence){if(!seen.has(e.id))throw Error('Evidence lacks proposal '+e.id);if(e.expertApproved!==false)throw Error('Unexpected expert approval '+e.id)}
const lacking=proposals.filter(p=>!firstPass.has(p.id)).map(p=>p.id);
const report={originalQuestions:bank.questions.length,proposals:proposals.length,sourceChecks:firstPass.size,awaitingSourceRecheck:lacking,expertApproved:0,explanationsAppliedToProduction:false};
if(report.proposals!==34||report.sourceChecks!==29||lacking.length!==5)throw Error('Unexpected baseline '+JSON.stringify(report));
fs.mkdirSync('audit-output',{recursive:true});fs.writeFileSync('audit-output/explanation-review-gate.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
